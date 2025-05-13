import {inject, Injectable} from '@angular/core';
import {Subject} from "rxjs";
import {_ask_for_authent} from "./authent-dialog/authent-dialog.component";
import {getExplorer, query, toAccount, usersigner_from_pem} from "./mvx";
import {$$, showMessage} from "../tools";
import {ApiService} from './api.service';
import {environment} from '../environments/environment';
import {LatLng} from 'leaflet';
import {cartesianToPolar, center_of, distance, Game, polarToCartesian} from './tokenworld';
import {Location} from '@angular/common';
import {DeviceService} from './device.service';
import {Connexion} from '../operation';
import {settings} from '../environments/settings';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  address: string=""
  signature:string=""
  provider: any
  strong: boolean=false

  tokens:any={}
  nfts:any={}       //Balances des NFT et SFT

  location=inject(Location)
  device=inject(DeviceService)
  addr_change = new Subject<string>();

  network:string=settings.network
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
  connexion:Connexion={
    address: false,
    direct_connect: false,
    email: false,
    extension_wallet: true,
    google: false,
    keystore: false,
    nfluent_wallet_connect: false,
    on_device: false,
    private_key: false,
    wallet_connect: true,
    web_wallet: false,
    webcam: false,
    xAlias: false
  }
  preview: boolean = false;
  balance: number=0
  native_token: any;

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
    if(this.address){
      this.idx=Number(await query("get_idx_address",  [this.address],this.get_sc_address(),this.network))
    }
  }

  isConnected(strong=false) : boolean {
    return this.address!="" && (this.provider || !strong)
  }


  logout(strong=false) {
    if(strong){
      localStorage.removeItem("address")
      localStorage.removeItem("pem")
    }
    this.address=""
    this.idx=0
    if(this.provider)this.provider.logout()
    this.provider=null

  }




  geoloc(geolocService:any,marker:L.Marker | null=null,accuracy_limit=10000) : Promise<LatLng> {
    return new Promise(async (resolve, reject) => {
      try{
        $$("Demande de localisation")
        let loc=await geolocService.getCurrentPosition()
        if(loc.coords.accuracy<accuracy_limit){
          this.loc=loc
          $$("GéoLocalisation en ",this.loc)
          $$("Convertion en cartésienne ",polarToCartesian(new LatLng(this.loc.coords.latitude,this.loc.coords.longitude),environment.scale_factor,environment.translate_factor))
          let position=new LatLng(this.loc.coords.latitude,this.loc.coords.longitude)
          if(marker)marker.setLatLng(position)
          resolve(position)
        }else{
          $$("précision insufisante ",loc.coords.accuracy)
          reject("Not enought accuracy")
        }
      }catch (e){
        reject("Geoloc non authorized")
      }
    })
  }




  login(vm: any,subtitle="",pem_file="",strong=false,
        required_balance=0,message_balance="",
        silence_mode=false) {
    return new Promise(async (resolve, reject) => {
      if(!this.address)this.address=localStorage.getItem("address") || ""
      await this.init_idx()

      if(this.isConnected(strong) || silence_mode){
        await this.init_balance(vm.api)

        if(required_balance>0 && this.balance<required_balance)vm.router.navigate(["faucet"],{queryParams:{message:message_balance}})
        if(this.device.isMobile())this.connexion.extension_wallet=false
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

          if(required_balance>0 && this.balance<required_balance)vm.router.navigate(["faucet"],{queryParams:{message:message_balance}})

          resolve(r)
          showMessage(vm,"Identification ok")
        } else {
          try{
            if(this.device.isMobile())this.connexion.extension_wallet=false
            let r:any=await _ask_for_authent(vm,"Authentification",subtitle,this.network,this.connexion)
            await this.authent(r)
            await this.init_idx()
            await this.init_balance(vm.api)

            if(required_balance>0 && this.balance<required_balance)vm.router.navigate(["faucet"],{queryParams:{message:message_balance}})

            resolve(r)
          }catch(e){
            $$("erreur ",e)
            reject(e)
          }
        }
      }
    })
  }

  refresh(){
    return new Promise(async (resolve)=>{
      this.account=await toAccount(this.address,this.network)
      resolve(this.account)
    })
  }

  show_contract() {
    open(getExplorer(this.get_sc_address(),settings.network,"address","explorer"))
  }


  get_domain(){
    if(this.network.indexOf("devnet")>-1)return "https://devnet-api.multiversx.com/"
    if(this.network.indexOf("testnet")>-1)return "https://testnet-api.multiversx.com/"
    return "https://api.multiversx.com/"
  }


  init_balance(api: ApiService,add_nft=false) {
    return new Promise(async (resolve,reject)=>{
      if(!this.address){
        reject("Address not initialize")
      }else{
        await this.refresh()
        let tokens=await api._service("accounts/"+this.address+"/tokens","",this.get_domain())
        let egld_prefix=this.isTestnet() || this.isDevnet() ? "x" : ""
        if(this.account){
          tokens.push({
            identifier:egld_prefix+"EGLD",
            name:egld_prefix+"EGLD",
            type:"FungibleESDT",
            balance:Number(this.account!.balance)
          })
          this.balance=Number(this.account!.balance)/1e18
        }

        for(let t of tokens){
          this.tokens[t.identifier]=t
        }

        if(add_nft){
          for(let nft of await api._service("accounts/"+this.address+"/nfts","",this.get_domain())){
            this.nfts[nft.identifier]=Number(nft.balance)
          }

        }

        resolve(true)
      }
    })
  }



  get_balance(s: string,nft=false) : number {
    if(this.tokens && this.tokens[s]){
      return this.tokens[s].balance/1e18
    }else{
      return 0
    }
  }

  get_sc_address() {
    return settings.contract_addr
  }

  get_default_token(): string {
    return settings.token
  }



  async init_game(game:any){
    if(typeof game!="number") {
      this.game = game
    }else{
      let rc=await this.open_game(game)
      if(rc)this.game=rc
    }
    if(this.game){
      $$("Sélection de la partie ",this.game.title)
      this.center_map=cartesianToPolar(center_of(this.game.ne,this.game.sw))
    }
  }

  get_chain_id(){
    let rc=this.network.indexOf("devnet")>-1 ? "D" : "1"
    $$("Utilisation de la chaine chainid="+rc)
    return rc
  }



  open_game(id:Number) : Promise<Game | null> {
    //si id=0 on retourne le premier game ouvert
    return new Promise(async (resolve) => {
      for (let g of await this.extract_games(true, false)) {
        if (g.id == id || id==0) {
          resolve(g);
        }
      }
      resolve(null);
    })
  }


  extract_games(opened=true,closed=true,user_filter=0,pos=new LatLng(0,0)) : Promise<Game[]> {
    let rc:Game[] = [];
    return new Promise(async (resolve) => {
      let games=await query("games", [],this.get_sc_address(),this.network)
      for (let game of games) {
        if(game.closed && closed || !game.closed && opened) {
          if(user_filter==0 || game.owner==user_filter){
            game.score=pos.lat==0 && pos.lng==0 ? 0 : 10000/distance(pos,cartesianToPolar(center_of(game.ne,game.sw)))
            let ne=cartesianToPolar(game.ne,environment.scale_factor,environment.translate_factor)
            let sw=cartesianToPolar(game.sw,environment.scale_factor,environment.translate_factor)
            game.bbox=ne.lat+","+ne.lng+","+sw.lat+","+sw.lng
            game.min_distance_to_refresh_map=Math.max(distance(ne,sw)/10000,20)
            game.bank=Number(await query("stocks", [game.id],this.get_sc_address(),this.network))
            rc.push(game)
          }
        }
      }

      for(let i=0;i<rc.length;i++){
        let infos=await query("get_game_infos",[rc[i].id],this.get_sc_address(),this.network)
        rc[i].n_players=infos.n_players
        rc[i].n_tokemons=infos.n_tokemons
        rc[i].nfts=[]
        for(let k=0;k<infos.nfts.length;k++){
          rc[i].nfts.push(infos.nfts[k]+"-"+(infos.nonce[k]<10 ? "0"+infos.nonce[k].toString(16) : infos.nonce[k].toString(16)))
        }
        rc[i].previews=[]
      }
      resolve(rc)
    })
  }


  isDevnet() {
    return this.network.indexOf("devnet")>-1
  }

  isMainnet() {
    return !this.isTestnet() && !this.isDevnet()
  }

  isTestnet() {
    return this.network.indexOf("testnet")>-1
  }

  getAccount() {
    try{
      return this.provider.account
    }catch (e:any){
      return this.provider
    }
  }


}
