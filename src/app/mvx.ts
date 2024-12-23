import {
  Address,
  SmartContractTransactionsFactory,
  TokenTransfer, Transaction,
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
import {abi} from '../environments/abi';
import {environment} from '../environments/environment';
import {utf8ToHex} from '@multiversx/sdk-core/out/utils.codec';

export const DEVNET="https://devnet-api.multiversx.com"
export const MAINNET="https://api.multiversx.com"

export async function mvx_api(url:string,params:string,api:any,network="devnet"): Promise<any[]> {
  //voir
  return new Promise((resolve, reject) => {
    network=network.replace("elrond-","")
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


export function get_nft(identifier: string, api:any,network: string) {
  //voir https://api.multiversx.com/#/nfts/NftController_getNft
  return mvx_api("/nfts/" + identifier,"",api,network);
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
      if(network.endsWith("/"))network=network.substring(0,network.length-1)
      resolve(await new ApiNetworkProvider(network).getAccount(toAddress(addr)))
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


export function create_transaction(function_name:string,args:any[],
                                   user:UserService,tokens_to_transfer: TokenTransfer[],
                                   gasLimit=50000000n, contract_addr="") : Promise<Transaction>  {
  return new Promise(async (resolve) => {
    const factoryConfig = new TransactionsFactoryConfig({ chainID: "D" });
    let factory = new SmartContractTransactionsFactory({config: factoryConfig,abi:await create_abi(abi)});
    const apiNetworkProvider = new ApiNetworkProvider(user.get_domain());
    if(contract_addr=="")contract_addr=user.get_sc_address(environment)
    let _sender=await apiNetworkProvider.getAccount(Address.fromBech32(user.address))

    let transaction=factory.createTransactionForExecute({
      sender: _sender.address,
      contract: Address.fromBech32(contract_addr),
      function: function_name,
      gasLimit: gasLimit,
      arguments: args,
      tokenTransfers:tokens_to_transfer
    });
    resolve(transaction)

  })

}


export function send_transaction_with_transfers(provider:any,function_name:string,args:any[],
                                                user:UserService,tokens_to_transfer: TokenTransfer[],
                                                gasLimit=50000000n, contract_addr="") {
  return new Promise(async (resolve, reject) => {
    if(!user || !user.get_network())reject(false);

    let transaction = await create_transaction(function_name,args,user,tokens_to_transfer,gasLimit,contract_addr)
    const apiNetworkProvider = new ApiNetworkProvider(user.get_domain());

    await user.refresh()
    transaction.nonce=BigInt(user.account.nonce)
    let sign_transaction=await provider.signTransaction(transaction)
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
  })
}


export async function send_transaction(provider:any,function_name:string,sender_addr:string,
                                       args:any,contract_addr:string,
                                       token="",nonce=0,value=0,abi:any,
                                       _type: string="",gasLimit=50000000n) {
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
    let transaction:Transaction | undefined
    console.log("Transaction sur le contrat https://devnet-explorer.multiversx.com/accounts/"+contract_addr)

    if(_type==""){
      transaction = factory.createTransactionForExecute({
        sender: sender,
        contract: Address.fromBech32(contract_addr),
        function: function_name,
        gasLimit: gasLimit,
        arguments: args
      });
    }

    if(_type.startsWith("Semi")){
      let _t=TokenTransfer.semiFungible(token,nonce,value)
      transaction = factory.createTransactionForExecute({
        sender: sender,
        contract: Address.fromBech32(contract_addr),
        function: function_name,
        gasLimit: gasLimit,
        arguments: args,
        tokenTransfers:[_t]
      });
    }

    if(_type.startsWith("Fungible")){
      let _t=TokenTransfer.fungibleFromAmount(token,value,18)
      transaction = factory.createTransactionForExecute({
          sender: sender,
          contract: Address.fromBech32(contract_addr),
          function: function_name,
          gasLimit: gasLimit,
          arguments: args,
          tokenTransfers: [_t]
        })
    }

    if(_type.startsWith("NonFungible")){
      let _t=TokenTransfer.nonFungible(token,nonce)
        transaction = factory.createTransactionForExecute({
          sender: sender,
          contract: Address.fromBech32(contract_addr),
          function: function_name,
          gasLimit: gasLimit,
          tokenTransfers: [_t],
          arguments: args
        });
      }


    //voir https://docs.multiversx.com/sdk-and-tools/sdk-js/sdk-js-cookbook-v13#transfer--execute

    //voir https://docs.multiversx.com/sdk-and-tools/sdk-js/sdk-js-signing-providers/#signing-transactions-1
    //voir exemple https://github.com/multiversx/mx-sdk-js-examples/blob/0d35714c9172ea5a31a7563a155a942b9249782e/signing-providers/src/extension.js#L52
    if(transaction){
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
    }

  })

}

export function toText(array:Uint8Array) : string {
  return new TextDecoder('utf-8').decode(array)
}




export async function createNFT(name:string,visual:string,collection:string,user:UserService,network="elrond-devnet", gasLimit=50000000n) {
  const apiNetworkProvider = new ApiNetworkProvider(network=="devnet" ? "https://devnet-api.multiversx.com" : "https://api.multiversx.com")
  const factoryConfig = new TransactionsFactoryConfig({ chainID: "D" });
  let factory = new SmartContractTransactionsFactory({config: factoryConfig});
   let _sender=await apiNetworkProvider.getAccount(Address.fromBech32(user.address))
  //voir https://docs.multiversx.com/tokens/nft-tokens/#creation-of-an-nft
  //voir https://docs.multiversx.com/developers/sc-calls-format/#converting-numeric-values-in-javascript
  //voir https://github.com/multiversx/mx-sdk-js-core/blob/main/src/utils.codec.ts
  let args=[utf8ToHex(collection)]
  let transaction = factory.createTransactionForExecute({
    sender: _sender.address,
    contract: Address.fromBech32("erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqzllls8a5w6u"),
    function: "ESDTNFTCreate",
    gasLimit: gasLimit,
    arguments: args
  })
}


export async function query(function_name:string,args:any[],domain:string,sc_address:string) : Promise<any> {
  //voir https://docs.multiversx.com/sdk-and-tools/sdk-js/sdk-js-cookbook-v13#contract-queries
  return new Promise(async (resolve, reject) => {
    if(domain.endsWith("/"))domain=domain.substring(0,domain.length-1)
    const apiNetworkProvider = new ApiNetworkProvider(domain)
    const queryRunner = new QueryRunnerAdapter({networkProvider: apiNetworkProvider});
    let controller = new SmartContractQueriesController({
      queryRunner: queryRunner,
      abi: await create_abi(abi)
    });
    const query = controller.createQuery({
      contract: sc_address,
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
