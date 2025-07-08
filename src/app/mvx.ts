//Version official 0.994 - 07/07/2025

import {
  Address, BigUIntValue,
  BytesValue, ContractExecuteInput,
  SmartContractTransactionsFactory, TestnetEntrypoint, Token, TokenComputer,
  TokenManagementTransactionsOutcomeParser,
  TokenTransfer,
  Transaction,
  TransactionComputer,
  TransactionOnNetwork,
  TransactionsFactoryConfig, U64Value
} from "@multiversx/sdk-core/out";
import { NativeAuthClient } from "@multiversx/sdk-native-auth-client";
import { UserSigner } from "@multiversx/sdk-wallet";
import { AbiRegistry,SmartContractQuery,SmartContractTransactionsOutcomeParser,DevnetEntrypoint,MainnetEntrypoint} from "@multiversx/sdk-core";
import { ApiNetworkProvider } from "@multiversx/sdk-network-providers";
import {AccountOnNetwork} from "@multiversx/sdk-network-providers/out";
import {ApiService} from "./api.service";
import {UserService} from "./user.service";
import {Octokit} from "@octokit/rest";
import {$$, now, setParams, showMessage} from "../tools";
import {abi, settings} from '../environments/settings';
import {environment} from "../environments/environment";
import {_prompt} from "./prompt/prompt.component";
import {wait_message} from "./hourglass/hourglass.component";

export const DEVNET="https://devnet-api.multiversx.com"
export const TESTNET="https://testnet-api.multiversx.com"
export const MAINNET="https://api.multiversx.com"

export const walletConnectDeepLink = 'https://maiar.page.link/?apn=com.elrond.maiar.wallet&isi=1519405832&ibi=com.elrond.maiar.wallet&link=';

export async function mvx_api(url:string,params:string,api:any,network="devnet"): Promise<any[]> {
  //voir
  //return new Promise((resolve, reject) => {
  network=network.replace("elrond-","")
  let ep=getEntrypoint(network)
  //let domain=ep.networkProvider.url
  return ep.createNetworkProvider().doGetGeneric(url+(params.length>0 ? "?"+params : ""))

  // api._get(domain+"/"+url,params).subscribe({
  //   next :(transactions:any)=>{
  //     resolve(transactions)
  //   },
  //   error:(err:any)=>{
  //     reject(err)
  //   }
  // })
  //})
}

export function network_config(network="") : Promise<any> {
  let prefix=network.indexOf("devnet")>-1 ? "devnet-" : ""
  const apiNetworkProvider = new ApiNetworkProvider("https://"+prefix+"api.multiversx.com", { clientName: "multiversx-your-client-name" });
  let rc=apiNetworkProvider.getNetworkConfig();
  return rc
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



export async function create_abi(abi_content:any,api:any=null,endpoint:any=null): Promise<AbiRegistry> {
  //voir https://docs.multiversx.com/sdk-and-tools/sdk-js/sdk-js-cookbook-v13/#load-the-abi-from-an-url
  return new Promise(async (resolve, reject) => {
    try{
      if(!api) {
        let rc=AbiRegistry.create(abi_content)
        //if(endpoint)rc.endpoints=endpoint
        resolve(rc)
      }
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



export function toAccount(addr:string,network:string="elrond-devnet") : Promise<AccountOnNetwork> {
  //voir https://docs.multiversx.com/sdk-and-tools/sdk-js/sdk-js-cookbook-v13/#synchronizing-an-account-object
  return new Promise(async (resolve, reject) => {
    try{
      network=network.indexOf("devnet")>-1 ? DEVNET : (network.indexOf("testnet")>-1 ? TESTNET : MAINNET)
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
      const entrypoint = network.indexOf("devnet")>-1 ? new DevnetEntrypoint() : new MainnetEntrypoint()
      let transactions=await mvx_api("/accounts/"+smartcontract_addr+"/transactions","size=200",api,network)
      let rc=[]
      if(abi){
        const converter=new TransactionComputer()
        const parser=new SmartContractTransactionsOutcomeParser({abi: abi});

        for(let t of transactions){
          const transactionOnNetwork:any = await entrypoint.getTransaction(t.hash);
          rc.push(parser.parseExecute(transactionOnNetwork))
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




export function getExplorer(addr = "", network = "elrond-devnet",service="accounts", tools = "xspotlight",suffixe=""): string {
  let prefixe= network.indexOf("devnet") > -1 ? "devnet" : (network.indexOf("testnet") > -1 ? "testnet" : "")
  if(prefixe!=""){
    if(tools=="explorer"){
      tools="explorer.multiversx"
      prefixe=prefixe+"-"
    }else{
      prefixe=prefixe+"."
    }
  }
  return "https://" + prefixe  + tools+".com/" + service+"/"+addr+suffixe;
}


//voir https://docs.multiversx.com/sdk-and-tools/sdk-js/sdk-js-cookbook-v14#creating-transactions
export function create_transaction(function_name:string,args:any[],
                                   user:UserService,tokens_to_transfer: TokenTransfer[],
                                   contract_addr="",abi:any={},gasLimit=50000000n,cost=0) : Promise<Transaction>  {

  return new Promise(async (resolve) => {
    const entrypoint = getEntrypoint(user.network)

    if(contract_addr=="")contract_addr=user.get_sc_address()
    let nonce=await entrypoint.recallAccountNonce(Address.newFromBech32(user.address))

    let option:ContractExecuteInput={
      contract: Address.newFromBech32(contract_addr),
      function: function_name,
      gasLimit: gasLimit,
      arguments: args,
      nativeTransferAmount:BigInt(Math.round(cost*1e18)),
    }
    if(tokens_to_transfer.length>0){
      option.tokenTransfers=tokens_to_transfer
    }

    let transaction
    let ctrl=entrypoint.createSmartContractController(await create_abi(abi))
    if(!user.provider){
      //voir https://docs.multiversx.com/sdk-and-tools/sdk-js/sdk-js-cookbook-v14/#calling-a-smart-contract-using-the-controller
      transaction=await ctrl.createTransactionForExecute(user.getAccount(),nonce,option)
    }else{
      //https://docs.multiversx.com/sdk-and-tools/sdk-js/sdk-js-cookbook-v14/#calling-a-smart-contract-using-the-factory
      let chain_id=get_chain_id(user)
      let fact=new SmartContractTransactionsFactory({
        config:new TransactionsFactoryConfig({chainID:chain_id}),
        abi: await create_abi(abi)
      })
      transaction=fact.createTransactionForExecute(Address.newFromBech32(user.address),option)
      transaction.nonce=nonce
      transaction=await user.provider.signTransaction(transaction)
    }
    resolve(transaction)

  })
}




export function level(lv=1) : boolean {
  return settings.ihm_level>=lv
}



//ExecuteTransaction
export function execute_transaction(transaction:Transaction,user:UserService,function_name:string) : Promise<{ values: any[]; returnCode: string; returnMessage: string}> {
  return new Promise(async (resolve, reject) => {
    let transactionOnNetwork:TransactionOnNetwork | undefined=undefined
    try{
      const entrypoint = getEntrypoint(user.network)
      //voir https://docs.multiversx.com/sdk-and-tools/sdk-js/sdk-js-cookbook-v13/#parsing-transaction-outcome-1
      let hash=await entrypoint.sendTransaction(transaction)
      transactionOnNetwork = await entrypoint.awaitCompletedTransaction(hash)

      if(transactionOnNetwork.smartContractResults.length==0)transactionOnNetwork = await entrypoint.awaitCompletedTransaction(hash)
    } catch (e:any) {
      $$("Execution failed ",e.message)
      reject(e.message)
    }

    if(transactionOnNetwork){
      try{
        const _abi=await create_abi(abi)
        const parser = new SmartContractTransactionsOutcomeParser({abi:_abi})
        let result=parser.parseExecute({transactionOnNetwork:transactionOnNetwork,function:function_name})

        if(result.returnCode!="ok" && result.returnCode!=""){
          reject({message:result.returnMessage,code:result.returnCode})
        }else{
          $$("Resultat transaction ",result)
          resolve(result)
        }
      }catch (e:any) {
        if(transactionOnNetwork.isCompleted){

          let rc=[]
          for(let result of transactionOnNetwork.smartContractResults){
            rc.push(atob(result.data.toString()))
          }
          resolve({values:rc,returnCode:"ok",returnMessage:"error"})
        } else {
          reject(e.message)
        }
      }
    }
  })
}



export function send_transaction_with_transfers(user:UserService,function_name:string,args:any[],
                                                tokens_to_transfer: TokenTransfer[]=[],
                                                gasLimit=50000000n, contract_addr="") {
  return new Promise(async (resolve, reject) => {
    if(!user || !user.network)reject(false);

    $$("Appel de "+function_name+" avec les arguments "+args.join(" , "))
    if(tokens_to_transfer.length>0)$$(" ... avec transfert de token")
    let transaction = await create_transaction(function_name,args,user,tokens_to_transfer,contract_addr,abi,gasLimit)

    await user.refresh()

    try{
      resolve(await execute_transaction(transaction,user,function_name))
    }catch (e){
      reject(e)
    }

  })
}


export function toText(array:Uint8Array) : string {
  return new TextDecoder('utf-8').decode(array)
}


export async function signTransaction(t:Transaction,user:UserService) : Promise<Transaction>  {
  return await user.provider.signTransaction(t)
}


export async function get_sc_balance(addr:string,network:string)  {
  let acc=await getEntrypoint(network).createNetworkProvider().getAccount(Address.newFromBech32(addr))
  let rc=Number(acc.balance)/1e18
  return rc
}


export async function set_roles_to_collection(collection_id:string, user:UserService,type_collection:string="SFT",burn=false,update=false) {
  //voir https://docs.multiversx.com/tokens/nft-tokens/
  //
  debugger
  const entrypoint=getEntrypoint(user.network)
  let factory = entrypoint.createTokenManagementTransactionsFactory();

  $$("Affectation des roles sur la collection "+collection_id+" de type "+type_collection)
  let setRoleTransaction=factory.createTransactionForSettingSpecialRoleOnNonFungibleToken( Address.fromBech32(user.address),{
    addRoleNFTAddURI: update,
    addRoleNFTUpdateAttributes: update,
    user: Address.newFromBech32(user.address),
    tokenIdentifier: collection_id,
    addRoleESDTTransferRole: false,
    addRoleNFTBurn: burn,
    addRoleNFTCreate: true,
    addRoleESDTModifyCreator:update
  })
  if(type_collection=="SFT" || type_collection.startsWith("Semi")){
    setRoleTransaction=factory.createTransactionForSettingSpecialRoleOnSemiFungibleToken(Address.fromBech32(user.address),{
      user: Address.newFromBech32(user.address),
      tokenIdentifier: collection_id,
      addRoleESDTTransferRole: update,
      addRoleNFTAddQuantity: true,
      addRoleNFTBurn: burn,
      addRoleNFTCreate: true,
    })
  }

  user.refresh()
  setRoleTransaction.nonce=await entrypoint.recallAccountNonce(Address.newFromBech32(user.address))
  let transactionOnNetwork=await entrypoint.awaitCompletedTransaction(await entrypoint.sendTransaction(await signTransaction(setRoleTransaction,user)))
  let rc=new TokenManagementTransactionsOutcomeParser().parseSetSpecialRole(transactionOnNetwork)

  return rc[0]
}


export async function create_collection(name:string,user:UserService,vm:any=null,collection_type="SFT") {
  //exemple : issueSemiFungible@546f6b656d6f6e@544f4b454d4f4e
  //puis appel de setSpecialRole@544f4b454d4f4e2d346561303466@15432c1a00ea0f72466e099db66e6059d4becc9bb9eed17f3db817f29a0fc26b@45534454526f6c654e4654437265617465@45534454526f6c654e46544164645175616e74697479

  if(vm)vm.message="Collection building phase"
  const entrypoint=getEntrypoint(user.network)
  let factory = entrypoint.createTokenManagementTransactionsFactory()

  let option={
    name: name,
    tokenName:name,
    tokenTicker:name.replace(" ","").toUpperCase().substring(0,10),
    canAddSpecialRoles: true,
    canChangeOwner: true,
    canFreeze: false,
    canPause: false,
    canTransferNFTCreateRole: true,
    canUpgrade: false,
    canWipe: true,
  }

  let transaction=collection_type=="SFT"
    ? factory.createTransactionForIssuingSemiFungible(Address.newFromBech32(user.address),{...option})
    : factory.createTransactionForIssuingNonFungible(Address.newFromBech32(user.address),{...option})

  transaction.nonce=await entrypoint.recallAccountNonce(Address.newFromBech32(user.address))
  let transactionOnNetwork=await entrypoint.awaitCompletedTransaction(await entrypoint.sendTransaction(await signTransaction(transaction,user)))
  let parser = collection_type=="SFT"
    ? new TokenManagementTransactionsOutcomeParser().parseIssueSemiFungible(transactionOnNetwork)
    : new TokenManagementTransactionsOutcomeParser().parseIssueNonFungible(transactionOnNetwork)

  return {result:parser,collection_id:parser[0].tokenIdentifier}
}


export function view_account_on_gallery(user:UserService,explorer=environment.account_viewer) {
  let url=explorer.replace("%address%",user.address)
  if(!user.isDevnet())url=url.replace("devnet.","").replace("devnet-","")
  open(url,"Gallery")
}



export async function get_collections(user:UserService,api:ApiService) {
  //voir https://devnet-api.multiversx.com/#/accounts/AccountController_getAccountCollectionsWithRoles
  let domain=user.get_domain()
  let rc: any=await api._service("accounts/"+user.address+"/roles/collections","",domain)
  return rc
}



export async function get_nfts(user:UserService,api:ApiService) : Promise<any[]> {
  //Récupére l'ensemble des NFTs d'un user avec la balance
  let prefix=(user.isDevnet() ? "devnet-" : (user.isTestnet() ? "testnet-" : ""))
  let nfts=await api._service(
    "accounts/"+user.address+"/nfts","",
    "https://"+prefix+"api.multiversx.com/")

  nfts.reverse()
  return nfts
}


export async function decode_metadata(nfts:any[],api:ApiService) : Promise<any[]> {
//Permet de décoder les metadata des API
  let rc=[]
  for (let nft of nfts) {
    if(!nft.metadata){
      let prop = atob(nft.attributes)
      let tags=prop.split(";metadata:")[0].replace("tags:" ,"")
      let cid=prop.split("metadata:")[1]
      if(!nft.hasOwnProperty("metadata")){nft.metadata=await api._service("ipfs/"+cid,"","https://ipfs.io/",false)}
      nft.tags=tags
    }
    nft.visual=nft.hasOwnProperty("media") ? nft.media[0].originalUrl : ""
    //nft.visual=nft.media[0].originalUrl
    rc.push(nft)
  }
  return rc
}


export function view_nft(user:UserService,identifier:string,explorer=environment.nft_viewer) {
  let url=explorer.replace("%identifier%",identifier)
  if(user.isMainnet())url=url.replace("devnet.","")
  if(user.isTestnet())url=url.replace("devnet.","testnet.")
  open(url,"Gallery")
}

export function getEntrypoint(network:string){
  if(network.indexOf("devnet")>-1)return new DevnetEntrypoint()
  if(network.indexOf("testnet")>-1)return new TestnetEntrypoint()
  return new MainnetEntrypoint()
}

//buildNFT transaction
export async function makeNFTTransaction(identifier:string,name:string,visual:string,user:UserService,
                                         quantity=1,royalties=0,uris:string[]=[],metadata="",metadata_url="",hash="")   {
  //Voir https://docs.multiversx.com/tokens/nft-tokens/#creation-of-an-nft

  //Creation depuis le wallet Mvx : ESDTNFTCreate@SFT-55f2b5@@Londres@2500@QmNq8Kb8J2Aq3fqWu8jRHEvUvyAEwrHt8DSrqAhAWStiDE@tags:;metadata:QmaoTy3G7Cpb72czvs384qFQUqWeWBdTs5grHk311AassH@https://ipfs.io/ipfs/QmNq8Kb8J2Aq3fqWu8jRHEvUvyAEwrHt8DSrqAhAWStiDE

  $$("Construction de "+name+" sur la collection "+identifier+" en quantite "+quantity)
  const entrypoint=getEntrypoint(user.network)
  //if(metadata_url.length>0)uris.unshift(metadata_url)
  if(uris.length==0 || uris[0]!=visual)uris.unshift(visual)
  if(metadata=="")metadata=JSON.stringify({description:""})

  let factory = entrypoint.createTokenManagementTransactionsFactory()

  let transaction=factory.createTransactionForCreatingNFT(
    Address.newFromBech32(user.address),
    {
      attributes: new TextEncoder().encode(metadata),
      hash: hash,
      initialQuantity: BigInt(quantity),
      name: name,
      royalties: Math.round(royalties*100),
      tokenIdentifier: identifier,
      uris: uris
    })
  transaction.gasLimit=environment.max_gaz

  transaction.nonce=await entrypoint.recallAccountNonce(Address.newFromBech32(user.address))
  transaction=await signTransaction(transaction,user)
  const transactionOnNetwork =await entrypoint.awaitCompletedTransaction(await entrypoint.sendTransaction(transaction))

  let results:any = new TokenManagementTransactionsOutcomeParser().parseNftCreate(transactionOnNetwork)

  let rc=results[0]
  if(rc.hasOwnProperty("tokenIdentifier")){
    let nonce=rc.nonce.toString(16).toLowerCase()
    if(nonce.length==1)nonce="0"+nonce
    return rc.tokenIdentifier+"-"+nonce
  }else{
    return "error"
  }

}


//voir https://docs.multiversx.com/sdk-and-tools/sdk-js/sdk-js-cookbook-v14#smart-contract-queries
export async function query(function_name:string,args:any[],sc_address:string,network="devnet") : Promise<any> {
  return new Promise(async (resolve, reject) => {
    const entrypoint = getEntrypoint(network)
    const controller = entrypoint.createSmartContractController(await create_abi(abi));
    const query = controller.createQuery({
      contract: Address.newFromBech32(sc_address),
      function: function_name,
      arguments: args,
    })

    try {
      const queryResponse=await controller.runQuery(query)
      const response=await controller.parseQueryResponse(queryResponse)
      resolve(response[0])
    } catch (e:any) {
      reject(e.message.split(":")[1])
    }
  })
}


export async function share_token(user:UserService,collection:string,nonce:number,amount=1,nb_user=1,cost=0.001,decimals=0) {
  let opt:any={identifier:collection}
  if(nonce)opt.nonce=BigInt(nonce)

  let total_amount=BigInt(Math.round(amount*Number(nb_user)))
  let token=new TokenTransfer({
    token:new Token(opt),
    amount:total_amount
  })
  $$("Amount of "+collection+" transfered "+Number(token.amount))
  $$("Egld transfered "+Number(cost*nb_user))

  try{
    //let value=new U64Value(Math.round(amount))
    let value=new BigUIntValue(Math.round(amount))
    let t=await create_transaction("upload",[value], user,[token],user.get_sc_address(),abi,4078541n,cost*nb_user)
    //let t_signed=await signTransaction(t,user)
    let rc=await execute_transaction(t,user,"upload")
    return rc
  }catch (e:any){
    $$("Erreur ",e)
  }
  return null
}



export async function init_user_for_web_wallet(user:UserService,addr:string,signature:string,network:string ){
  //voir https://docs.multiversx.com/sdk-and-tools/sdk-js/sdk-js-signing-providers/#wallet-login-and-logout
  const nativeAuthClient = new NativeAuthClient({apiUrl:user.get_domain()});
  user.address=addr
  user.signature=signature
  return nativeAuthClient.getToken(addr, localStorage.getItem("nativeAuthInitialPart") || "", signature);
}




export async function get_nft(identifier: string, api:any,network: string) {
  //voir https://api.multiversx.com/#/nfts/NftController_getNft
  let rc:any=await mvx_api("nfts/" + identifier,"",api,network)
  return rc
}


export async function get_token(identifier: string, api:any,network: string) {
  //voir https://api.multiversx.com/#/nfts/NftController_getNft
  let rc:any= await mvx_api("tokens/" + identifier,"",api,network)
  return rc
}


export async function share_token_wallet(vm:any,token: any,cost=0.0003,str_amount="",nb_user=1) : Promise<{url:string,amount:number} | null> {

  //Permet le partage d'un token
  //vm doit contenir MatDialog, user
  let max=token.type.startsWith("Fungible") ? token.balance/(10**token.decimals) : token.balance

  if(str_amount==""){
    if((token.type.indexOf("SemiFungible")>-1 || token.type.startsWith("Fungible")) && Number(token.balance)>1){
      str_amount=await _prompt(vm,
        "Amount to share","1",
        "between 1 and "+max,"number","ok","annuler",false)
    }
  }

  if(!str_amount || Number(str_amount)==0)return null
  let amount=Number(str_amount)
  if(token.type.startsWith("Fungible")){
    amount=amount*(10**token.decimals)
    token.collection=token.identifier
    max=max*(10**token.decimals)
  }

  if(amount*Number(nb_user)>max){
    showMessage(vm,"You have not enought token to send this amount")
    return null
  }

  if(!vm.user.isConnected(true)){
    let addr=vm.user.address
    await vm.user.login(vm,"","",true)
    if(vm.user.address!=addr){
      showMessage(vm,"You change the address since last login")
      vm.user.logout()
      return null
    }
  }
  if(vm.user.isConnected(true)){
    let url=""
    try{
      wait_message(vm,"Sharing link building")
      let id =""

      let rc=await share_token(vm.user,token.collection,token.nonce,amount,nb_user,cost)
      if(rc && rc.returnMessage=="ok"){
        id=Number(rc.values[0]).toString(16)
      }else{
        showMessage(vm,"Transfer fail, retry")
        wait_message(vm)
      }

      $$("Id du vault "+id)
      url=environment.share_appli+"?p="+setParams({vault:id,hash:"hash"+id},"","")
      if(vm.user.isTestnet())url=url.replace("devnet.","testnet.")
      if(vm.user.isMainnet())url=url.replace("devnet.","")

      $$("url de partage "+url)
      return {url:url,amount:Number(amount)}

    }catch (e:any){
      $$("Error ",e)
    }
    wait_message(vm)
  }

  return null
}


export function get_chain_id(user:UserService) {
  if(user.isMainnet())return "1"
  if(user.isDevnet())return "D"
  return "T"
}




export async function deploy(user:UserService,code:BytesValue) {
  const factoryConfig = new TransactionsFactoryConfig({ chainID:get_chain_id(user) });
  let factory = new SmartContractTransactionsFactory({
    config: factoryConfig,
    abi: await create_abi(abi)
  });
  let args = [10];

  const deployTransaction = factory.createTransactionForDeploy(Address.fromBech32(user.address),{
    bytecode: code.valueOf(),
    gasLimit: 6000000n,
    arguments: args
  });
  //deployTransaction.nonce = deployer.getNonceThenIncrement();

}


