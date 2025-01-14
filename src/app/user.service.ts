import {Injectable} from '@angular/core';
import {Subject} from "rxjs";
import {_ask_for_authent} from "./authent-dialog/authent-dialog.component";
import {query, toAccount, usersigner_from_pem} from "./mvx";
import {$$, showMessage} from "../tools";
import {ApiService} from './api.service';
import {environment} from '../environments/environment';
import {LatLng} from 'leaflet';
import {cartesianToPolar, center_of, Game, polarToCartesian} from './tokenworld';

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
  tokemons: any[] = []
  zoom: number=16
  visibility: number = 0
  account: any;
  game: Game | undefined;
  idx:number=0
  fee=0;
  zone: any;
  preview: boolean = false;

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

  async init_idx(){
    this.idx=Number(await this.query("get_idx_address",  [this.address]))
  }

  isConnected(strong=false) : boolean {
    return this.address!="" && (this.provider || !strong)
  }


  logout() {
    this.address=""
    this.idx=0
    this.provider=null;
  }


  query(func:string,args:any[]=[]){
    $$("Appel de la fonction "+func+" avec les arguments ",args)
    let rc=query(func, args, this.get_domain(), this.get_sc_address())
    //$$("Réponse ",rc)
    return rc
  }


  geoloc(geolocService:any,marker:L.Marker | null=null) : Promise<LatLng> {
    return new Promise(async (resolve, reject) => {
      try{
        this.loc=await geolocService.getCurrentPosition()
        $$("GéoLocalisation en ",this.loc)
        $$("Convertion en cartésienne ",polarToCartesian(new LatLng(this.loc.coords.latitude,this.loc.coords.longitude),environment.scale_factor,environment.translate_factor))
        let position=new LatLng(this.loc.coords.latitude,this.loc.coords.longitude)
        if(marker)marker.setLatLng(position)
        resolve(position)
      }catch (e){
        reject()
      }
    })
  }




  login(vm: any,subtitle="",pem_file="",strong=false) {
    return new Promise(async (resolve, reject) => {
      if(!this.address)this.address=localStorage.getItem("address") || ""
      if(this.isConnected(strong)){
        await this.init_idx()
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
          await this.init_idx()
          resolve(r)
          showMessage(vm,"Identification ok")
        } else {
          try{
            let r:any=await _ask_for_authent(vm,"Authentification",subtitle)
            await this.authent(r)
            await this.init_idx()
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

  get_sc_address() {
    if(this.network.indexOf("devnet")>-1){
      return environment.contract_addr["elrond-devnet"]
    }else{
      return environment.contract_addr["elrond-mainnet"]
    }
  }

  get_default_token() {
    return this.network.indexOf("devnet")>-1 ? environment.token["elrond-devnet"] : environment.token["elrond-mainnet"]
  }



  async init_game(game:Game | Number){
    if(game instanceof Game) {
      this.game = game
    }else{
      let rc=await this.open_game(game)
      if(rc)this.game=rc
    }
    if(this.game){
      this.center_map=cartesianToPolar(center_of(this.game!.ne,this.game!.sw))
      $$("Sélection de la partie ",this.game)
    }
  }


  open_game(id:Number) : Promise<Game | null> {
    return new Promise(async (resolve) => {
      for (let g of await this.extract_games(true, false)) {
        if (g.id == id) {
          resolve(g);
        }
      }
      resolve(null);
    })
  }


  extract_games(opened=true,closed=true,user_filter=0) : Promise<Game[]> {
    let rc:Game[] = [];
    return new Promise(async (resolve) => {
      for (let game of await this.query("games", [])) {
        if(game.closed && closed || !game.closed && opened) {
          if(user_filter==0 || game.owner==user_filter){
            rc.push(game)
          }
        }
      }
      resolve(rc)
    })
  }

}
