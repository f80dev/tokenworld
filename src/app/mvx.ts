import {
  Address,
  SmartContractTransactionsFactory,
  Token, TokenTransfer, Transaction,
  TransactionsFactoryConfig
} from "@multiversx/sdk-core/out";
import { UserSigner } from "@multiversx/sdk-wallet";
import { QueryRunnerAdapter, SmartContractQueriesController,AbiRegistry,TransactionWatcher,SmartContractTransactionsOutcomeParser, TransactionsConverter   } from "@multiversx/sdk-core";
import { ApiNetworkProvider } from "@multiversx/sdk-network-providers";
import {AccountOnNetwork} from "@multiversx/sdk-network-providers/out";
import {ApiService} from "./api.service";
import {UserService} from "./user.service";
import {Octokit} from "@octokit/rest";
import {now} from "../tools";

export const DEVNET="https://devnet-api.multiversx.com"
export const MAINNET="https://api.multiversx.com"

export async function mvx_api(url:string,params:string,api:any,network="devnet"): Promise<any[]> {
  //voir
  return new Promise((resolve, reject) => {
    if(!network.endsWith("-"))network=network+"-"
    if(url.startsWith("/"))url=url.substring(1)
    api._get("https://"+network+"api.multiversx.com/"+url,params).subscribe({
      next :(transactions:any)=>{
        resolve(transactions)
      },
      error:(err:any)=>{
        reject(err)
      }
    })
  })
}


export function is_image(url:string) {
  if(!url)return false
  for(let ext of ["jpeg","png","webp",'"gif',"jpg"]){
    if(url.indexOf("."+ext)>-1)return true
  }
  return false
}

export function upload_content(content:any,filename="") : Promise<{url:string,filename:string}>{
  return new Promise(async (resolve, reject) => {
    // this.api._post(this.server.domain+"/upload_file","",content,200000000).subscribe({
    //   error:(err:any)=>{
    //     showError(this,err)
    //     reject(err)
    //   },
    //   next:async (ipfs:any)=>{
    //     resolve(ipfs)
    //   },
    // })

    let octokit:Octokit = new Octokit({auth: "hh4271anuxAlA5Z7PHcCQt2ttTpd".replace("hh4271","ghp_8hac4LGPaRuCCA")});
    if(filename=="")filename="prompt_"+now()+".json"
    let obj:any={}
    obj[filename]={content:JSON.stringify(content)}
    try{
      let gist:any=await octokit.gists.create({
        files:obj,
        description:"my gist",
        public: true
      })
      resolve({url:gist.data.files[filename].raw_url,filename:filename})
    }catch (e){
      reject(e)
    }

    //const reponse=await this.octokit.createGi({owner:"f80dev",repo:"promptmarket",branch:"storage"})
  })
}

export async function create_abi(abi_content:any,api:any=null): Promise<AbiRegistry> {
  //voir https://docs.multiversx.com/sdk-and-tools/sdk-js/sdk-js-cookbook-v13/#load-the-abi-from-an-url
  return new Promise(async (resolve, reject) => {
    try{
      if(!api)
        {resolve(AbiRegistry.create(abi_content))}
      else{
        api._get(abi_content, { encoding: "utf8" }).subscribe({
          next:(r:string)=>{resolve(AbiRegistry.create(JSON.parse(r)))}
        })
      }
    }catch (e){
      reject(e)
    }
  })
}

export function get_smartcontract_address(env:any,user:UserService) : string {
  if(!user)return "elrond-devnet"
  return env.contract_addr.hasOwnProperty(user.network) ? env.contract_addr[user.network] || "elrond-devnet" : "elrond-devnet"
}


export function address_from_pem(pemText:string) : string {
  return UserSigner.fromPem(pemText).getAddress().bech32()
}


export function toAddress(addr:string) : Address {
  //voir https://docs.multiversx.com/sdk-and-tools/sdk-js/sdk-js-cookbook-v13/
  return Address.fromBech32(addr)
}

export function toAccount(addr:string,network:string=DEVNET) : Promise<AccountOnNetwork> {
  //voir https://docs.multiversx.com/sdk-and-tools/sdk-js/sdk-js-cookbook-v13/#synchronizing-an-account-object
  return new Promise(async (resolve, reject) => {
    try{
      let r= await new ApiNetworkProvider(network).getAccount(toAddress(addr))
      resolve(r)
    }catch (e) {
      reject(e)
    }
  })

}






export function usersigner_from_pem(pemText:string) : UserSigner {
  return UserSigner.fromPem(pemText)
}


export function get_transactions(api:ApiService,smartcontract_addr:string,abi=null,network="devnet") : Promise<any[]> {
  //voir la documentation https://api.multiversx.com/
  return new Promise(async (resolve, reject) => {
    try{
      let transactions=await mvx_api("/accounts/"+smartcontract_addr+"/transactions","size=200",api,network)
      let rc=[]
      if(abi){
        const converter=new TransactionsConverter()
        const parser=new SmartContractTransactionsOutcomeParser({abi: abi});

        for(let t of transactions){
          t=new Transaction(t)
          const transactionOutcome = converter.transactionOnNetworkToOutcome(t)
          rc.push(parser.parseExecute({ transactionOutcome }))
        }
      }else{
        for(let t of transactions){
          t.data=atob(t.data).split("@")
          rc.push(t)
        }
      }
      resolve(rc)
    }catch (e){
      reject(e)
    }
  })
}


export async function send_transaction(provider:any,function_name:string,sender_addr:string,
                                       args:any,contract_addr:string,
                                       token="",value=0,abi:any,gasLimit=50000000n) {
  //envoi d'une transaction


  return new Promise(async (resolve, reject) => {

    let signer:any=null
    if(!provider){
      reject("Impossible de determiner l'envoyeur")
    }

    let user_signer=null
    if(typeof(provider)=="object" && provider.hasOwnProperty("file")){provider=atob(provider.file.split("base64,")[1])}
    if(typeof(provider)=="string"){
      user_signer=UserSigner.fromPem(provider)
      sender_addr=user_signer.getAddress().bech32()
    }


    const factoryConfig = new TransactionsFactoryConfig({ chainID: "D" });
    let factory = new SmartContractTransactionsFactory({
      config: factoryConfig,
      abi:await create_abi(abi)
    });
    //voir https://github.com/multiversx/mx-sdk-js-web-wallet-provider/blob/main/src/walletProvider.ts
    const apiNetworkProvider = new ApiNetworkProvider(DEVNET);

    //voir https://docs.multiversx.com/sdk-and-tools/sdk-js/sdk-js-cookbook-v13#signing-objects

    let sender=Address.fromBech32(sender_addr);
    let _sender=await apiNetworkProvider.getAccount(sender)

    // const pemText = await promises.readFile("../wallet/user1.pem", { encoding: "utf8" });
    // let signer = UserSigner.fromPem(pemText);

    // voir l'exemple https://docs.multiversx.com/sdk-and-tools/sdk-js/sdk-js-cookbook-v13#perform-a-contract-deployment


    //voir https://multiversx.github.io/mx-sdk-js-core/v13/classes/TokenTransfer.html

    let token_transfer=null
    let transaction:Transaction;
    console.log("Transaction sur le contrat https://devnet-explorer.multiversx.com/accounts/"+contract_addr)
    if(token.length>0){
      transaction = factory.createTransactionForExecute({
        sender: sender,
        contract: Address.fromBech32(contract_addr),
        function: function_name,
        gasLimit: gasLimit,
        nativeTransferAmount:0n,
        arguments: args,
        tokenTransfers:[new TokenTransfer({token: new Token({identifier: token}),amount: BigInt(value*1e18)})]
      });
    }else{
        transaction = factory.createTransactionForExecute({
          sender: sender,
          contract: Address.fromBech32(contract_addr),
          function: function_name,
          gasLimit: gasLimit,
          nativeTransferAmount:BigInt(value*1e18),
          arguments: args
        });
    }


    //voir https://docs.multiversx.com/sdk-and-tools/sdk-js/sdk-js-cookbook-v13#transfer--execute

    //voir https://docs.multiversx.com/sdk-and-tools/sdk-js/sdk-js-signing-providers/#signing-transactions-1
    //voir exemple https://github.com/multiversx/mx-sdk-js-examples/blob/0d35714c9172ea5a31a7563a155a942b9249782e/signing-providers/src/extension.js#L52
    transaction.nonce=BigInt(_sender.nonce)

    let sign_transaction
    if(!user_signer){
      sign_transaction=await provider.signTransaction(transaction)
    }else{
      transaction.signature=await user_signer.sign(transaction.serializeForSigning())
      sign_transaction=transaction
    }


    //voir https://docs.multiversx.com/sdk-and-tools/sdk-js/sdk-js-cookbook-v13#creating-network-providers
    //const proxyNetworkProvider = new ProxyNetworkProvider("https://devnet-gateway.multiversx.com");


    //Voir https://docs.multiversx.com/sdk-and-tools/sdk-js/sdk-js-cookbook-v13#broadcast-using-a-network-provider
    //const txHash = await proxyNetworkProvider.sendTransaction(transaction);
    try{
      let hash=await apiNetworkProvider.sendTransaction(sign_transaction)

      const watcherUsingApi = new TransactionWatcher(apiNetworkProvider);
      const transactionOnNetworkUsingApi = await watcherUsingApi.awaitCompleted(hash);

      const converter = new TransactionsConverter();
      const parser = new SmartContractTransactionsOutcomeParser();

      const transactionOutcome = converter.transactionOnNetworkToOutcome(transactionOnNetworkUsingApi);
      const parsedOutcome = parser.parseDeploy({ transactionOutcome });

      resolve(parsedOutcome)
    } catch (e) {
      console.log(e)
      reject(e)
    }

    //Attente du résultat
    //const watcherUsingApi = new TransactionWatcher(apiNetworkProvider);
    // const transactionOnNetworkUsingProxy  = await watcherUsingApi.awaitCompleted(txHash);
    //
    // const converter = new TransactionsConverter();
    // const parser = new SmartContractTransactionsOutcomeParser();
    //
    // const transactionOutcome = converter.transactionOnNetworkToOutcome(transactionOnNetworkUsingProxy);
    // const parsedOutcome = parser.parseDeploy({ transactionOutcome });


  })

}


export async function query(function_name:string,sender_addr:string,args:any[],contract_addr:string,abi:any,network="devnet") : Promise<any[]> {
  //voir https://docs.multiversx.com/sdk-and-tools/sdk-js/sdk-js-cookbook-v13#contract-queries
  return new Promise(async (resolve, reject) => {
    const apiNetworkProvider = new ApiNetworkProvider(network=="devnet" ? "https://devnet-api.multiversx.com" : "https://api.multiversx.com")
    const queryRunner = new QueryRunnerAdapter({networkProvider: apiNetworkProvider});
    let controller = new SmartContractQueriesController({
      queryRunner: queryRunner,
      abi: await create_abi(abi)
    });
    const query = controller.createQuery({
      contract: contract_addr,
      function: function_name,
      arguments: args,
    });
    try{
      const response = await controller.runQuery(query);
      let jsonResponse=controller.parseQueryResponse(response)
      resolve(jsonResponse[0])
    }catch (e){
      reject(e)
    }

  })

}
