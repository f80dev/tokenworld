import {Injectable} from '@angular/core';
import {Subject} from "rxjs";
import {_ask_for_authent} from "./authent-dialog/authent-dialog.component";
import {query, toAccount, usersigner_from_pem} from "./mvx";
import {$$, showMessage} from "../tools";
import {ApiService} from './api.service';
import {environment} from '../environments/environment';
import {abi} from '../environments/abi';
import {BigUIntValue, U64Value} from '@multiversx/sdk-core/out';
import {LatLng} from 'leaflet';

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
  center_map: LatLng=new LatLng(0,0)
  nfts: any[] = [];
  tokemon_selected: any;
  zoom: number=16;
  show_visibility: boolean = false;
  visibility: number = 0
  account: any;
  map: any;
  idx:number=0
  sc_address=""
  fee=0;
  zone: any;

  constructor() { }

  async authent($event: {
    strong: boolean;
    address: string;
    provider: any;
    encrypted: string;
    url_direct_xportal_connect: string
  }) {
    this.address = $event.address
    this.idx=Number(await this.query("get_idx_address",  [this.address]))
    localStorage.setItem("address",this.address)
    this.account=await toAccount(this.address)
    this.provider = $event.provider
    this.strong=$event.strong
    this.addr_change.next(this.address)
  }

  isConnected(strong=false) : boolean {
    return this.address!="" && (this.provider || !strong)
  }


  logout() {
    this.address=""
    this.provider=null;
  }




  query(func:string,args:any[]=[],env:any=environment){
    return query(func, args, this.get_domain(), this.sc_address)
  }


  geoloc(geolocService:any){
    return new Promise(async (resolve, reject) => {
      try{
        this.loc=await geolocService.getCurrentPosition()
        $$("Localisation en ",this.loc)
        resolve(true)
      }catch (e){
        reject()
      }
    })
  }




  login(vm: any,subtitle="",pem_file="",strong=false) {
    return new Promise(async (resolve, reject) => {
      if(!this.address)this.address=localStorage.getItem("address") || ""
      if(this.isConnected(strong)){
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
          await this.authent(r)
          await this.init_balance(vm.api)
          resolve(r)
          showMessage(vm,"Identification ok")
        } else {
          try{
            let r:any=await _ask_for_authent(vm,"Authentification",subtitle)
            await this.authent(r)
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

   refresh(){
    return new Promise(async (resolve)=>{
      this.account=await toAccount(this.address,this.get_domain())
      resolve(this.account)
    })
  }


  init_balance(api: ApiService) {
    return new Promise(async (resolve)=>{
      if(!this.address)throw new Error("Address not initialize")
      await this.refresh()

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
    if(this.tokens && this.tokens[s]){
      return this.tokens[s].balance/1e18
    }else{
      return 0
    }
  }

  get_default_token() {
    return this.network.indexOf("devnet")>-1 ? environment.token["elrond-devnet"] : environment.token["elrond-mainnet"]
  }

  init_network(sc_address: string="", network:string="elrond-devnet",env=environment) {
    return new Promise(async (resolve, reject) => {

      if(this.network!=network){
        this.network=network
        this.sc_address=""
      }

      // @ts-ignore
      this.sc_address=sc_address.length>0 ? sc_address : env.contract_addr[network]
      resolve(this.map)
    })
  }

  init_map(){
    return new Promise(async (resolve, reject) => {
      this.map=await this.query("map",[])
      this.map.url=this.map.url.toString()
      this.visibility=this.map.max_visibility
      $$("Initialisation des paramètres de la carte ",this.map)
      resolve(this.map)
    })
  }

}
