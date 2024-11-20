import {Injectable} from '@angular/core';
import {Subject} from "rxjs";
import {_ask_for_authent} from "./authent-dialog/authent-dialog.component";
import {toAccount, usersigner_from_pem} from "./mvx";
import {showMessage} from "../tools";
import {ApiService} from './api.service';
import {environment} from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  address: string=""
  signature:string=""
  provider: any
  strong: boolean=false
  tokens:any={}
  addr_change = new Subject<string>();
  network:string="elrond-devnet"
  balance=0
  params:any
  lang="fr"
  nonce:number=0
  loc:GeolocationPosition={coords: {
      latitude: 0, longitude: 0,
      accuracy: 0,
      altitude: 0,
      altitudeAccuracy: 0,
      heading: 0,
      speed: 0
    }, timestamp: 0}

  expert_mode:boolean=false
  center_map: {lat:number,lng:number} | undefined
  nfts: any[] = [];
  tokemon_selected: any;
  zoom: number=16;
  show_visibility: boolean = false;
  visibility: number = 100
  account: any;

  constructor() { }

  async authent($event: {
    strong: boolean;
    address: string;
    provider: any;
    encrypted: string;
    url_direct_xportal_connect: string
  }) {
    this.address = $event.address
    localStorage.setItem("address",this.address)
    this.account=await toAccount(this.address)
    this.provider = $event.provider
    this.strong=$event.strong
    this.addr_change.next(this.address)
  }

  isConnected() : boolean {
    return this.address!="" && this.provider
  }


  logout() {
    this.address=""
    this.provider=null;
  }


  login(vm: any,subtitle="",pem_file="") {
    return new Promise(async (resolve, reject) => {
      if(this.isConnected()){
        resolve(true)
      }else{
        if(pem_file.length>0){
          let r={
            address:usersigner_from_pem(pem_file).getAddress().bech32(),
            provider:pem_file,
            strong: true,
            encrypted:"",
            url_direct_xportal_connect:""
          }
          this.authent(r)
          await this.init_balance(vm.api)
          resolve(r)
          showMessage(vm,"Identification ok")
        } else {
          try{
            let r:any=await _ask_for_authent(vm,"Authentification",subtitle)
            this.authent(r)
            await this.init_balance(vm.api)
            resolve(r)
          }catch (e){
            reject()
          }
        }


      }

    })
  }


  get_domain(){
    return this.network.indexOf("devnet")>-1 ? "https://devnet-api.multiversx.com/" : "https://api.multiversx.com/"
  }


  init_balance(api: ApiService) {
    return new Promise(async (resolve)=>{
      if(!this.address)throw new Error("Address not initialize")
      this.account=await toAccount(this.address,this.get_domain())

      let tokens=await api._service("accounts/"+this.address+"/tokens","",this.get_domain())
      let egld_prefix=this.network.indexOf("devnet")>-1 ? "x" : ""
      tokens.push({identifier:egld_prefix+"EGLD",name:egld_prefix+"EGLD",balance:this.account.balance})

      for(let t of tokens){
        this.tokens[t.identifier]=t
      }

      resolve(true)
    })
  }


  get_balance(s: string) : number {
    return this.tokens[s].balance/1e18
  }

  get_default_token() {
    return this.network.indexOf("devnet")>-1 ? environment.token["elrond-devnet"] : environment.token["elrond-mainnet"]
  }
}
