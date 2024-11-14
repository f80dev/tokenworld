import {Injectable} from '@angular/core';
import {Subject} from "rxjs";
import {_ask_for_authent} from "./authent-dialog/authent-dialog.component";
import {toAccount, usersigner_from_pem} from "./mvx";
import {showMessage} from "../tools";
import {Account, Address} from "@multiversx/sdk-core/out";
import {ApiService} from './api.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  address: string=""
  signature:string=""
  provider: any
  strong: boolean=false
  tokens:any[]=[]
  addr_change = new Subject<string>();
  network:string="elrond-devnet"
  balance=0
  params:any
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


  async set_balance_and_nonce(esdt:string="egld") {
    let _account=await toAccount(this.address)
    this.balance= _account.balance.toNumber()/1e18
    this.nonce=_account.nonce
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
          this.set_balance_and_nonce("egld")
          resolve(r)
          showMessage(vm,"Identification ok")
        } else {
          try{
            let r:any=await _ask_for_authent(vm,"Authentification",subtitle)
            this.authent(r)
            this.set_balance_and_nonce()
            resolve(r)
          }catch (e){
            reject()
          }
        }


      }

    })
  }

  init_balance(api: ApiService) {
    return new Promise(async (resolve)=>{
      let domain=this.network.indexOf("devnet")>-1 ? "https://devnet-api.multiversx.com/" : "https://api.multiversx.com/"
      let account:any=await api._service("accounts/"+this.address,"",domain)
      this.tokens=await api._service("accounts/"+this.address+"/tokens","",domain)
      this.tokens.push({name:"eGLD",balance:account.balance/1e18})
      resolve(true)
    })
  }
}
