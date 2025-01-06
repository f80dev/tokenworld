import {AfterViewInit, Component, inject, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {TokenTransfer} from '@multiversx/sdk-core/out';
import {UserService} from '../user.service';
import {ActivatedRoute, Router} from '@angular/router';
import {create_transaction, send_transaction_with_transfers} from '../mvx';
import {NgForOf, NgIf} from '@angular/common';
import {MatIcon} from "@angular/material/icon";
import {MatButton, MatIconButton} from "@angular/material/button";
import {environment} from '../../environments/environment';
import {initializeMap, Point3D, polarToCartesian} from '../tokenworld';
import {HourglassComponent, wait_message} from '../hourglass/hourglass.component';
import {$$, getParams, showError, showMessage} from '../../tools';
import {MatDialog} from '@angular/material/dialog';
import {InputComponent} from '../input/input.component';
import {WalletComponent} from '../wallet/wallet.component';
import {UploadFileComponent} from '../upload-file/upload-file.component';
import {ApiService} from '../api.service';
import {eval_direct_url_xportal} from '../../crypto';
import * as L from 'leaflet';
import {LatLng} from 'leaflet';
import {DeviceService} from '../device.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {MatSlideToggle} from '@angular/material/slide-toggle';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-drop',
  standalone: true,
  imports: [
    NgForOf,
    MatIcon,
    MatIconButton,
    NgIf,
    HourglassComponent,
    InputComponent,
    MatButton,
    WalletComponent,
    UploadFileComponent,
    MatSlideToggle,
    FormsModule
  ],
  templateUrl: './drop.component.html',
  styleUrl: './drop.component.css'
})
export class DropComponent implements AfterViewInit, OnChanges {

  lifepoint: number = 0;
  name="";

  api=inject(ApiService)
  routes=inject(ActivatedRoute)
  user = inject(UserService)
  router = inject(Router)
  dialog=inject(MatDialog)
  device=inject(DeviceService)
  toast=inject(MatSnackBar)

  sel_nft: any;
  message: string=""
  quantity=1
  max_quantity=10
  max_pv_loading=0

  map!: L.Map
  ech: number=1
  max_distance=1000;
  nfts: any[]=[];
  visibility=30

  async ngAfterViewInit() {
    await this.user.init_balance(this.api)
    this.max_pv_loading=Math.min(this.user.game!.max_pv,this.user.get_balance(this.user.get_default_token()))

    let params:any=await getParams(this.routes)
    this.user.center_map=new LatLng(params.lat,params.lng)
    this.map = L.map('map')

    $$("Drop sur les coordonnées ",this.user.center_map)
    await this.user.login(this,"You must be connected to drop any NFT","",false)
  }


  ngOnChanges(changes: SimpleChanges): void {
    if(this.sel_nft)this.name=this.sel_nft.collection
  }

  //Envoi d'un NFT : https://docs.multiversx.com/sdk-and-tools/sdk-js/sdk-js-cookbook-v13#single-nft-transfer
  random_location: boolean = false;
  diffusion=50


  async drop() {
    if(this.user.game){
      if(this.name.length<3){
        showMessage(this,"3 characters required for the name")
        return
      }
      this.visibility=Math.max(this.visibility,Number(this.user.game.min_visibility))
      this.visibility=Math.min(this.visibility,Number(this.user.game.max_visibility))

      await this.user.login(this,"You must be connected to drop any NFT","",true)
      //$$("Authentification ",this.user.provider)

      let pos = polarToCartesian(this.user.center_map,environment.scale_factor,environment.translate_factor)
      $$("Ajout d'un tokemon en ",pos)
      //la rue martel se trouve : "lat":48.874360147130226,"lng":2.3535713553428654

      let p1=new Point3D(0,0,0)
      let p2=new Point3D(0,0,0)

      if(this.random_location || this.diffusion>0){
        pos=new Point3D(0,0,0)
        p1=pos //new Point3D(this.user.game.ne.x,this.user.game.ne.y,this.user.game.ne.z)
        p2=pos //new Point3D(this.user.game.sw.x,this.user.game.sw.y,this.user.game.sw.z)
      }

      if(this.diffusion>0){
        let diffusion=this.diffusion/111320
        p1=polarToCartesian(
          new LatLng(this.user.center_map.lat+diffusion,this.user.center_map.lng+diffusion),
          environment.scale_factor,environment.translate_factor
        )
        p2=polarToCartesian(
          new LatLng(this.user.center_map.lat-diffusion,this.user.center_map.lng-diffusion),
          environment.scale_factor,environment.translate_factor
        )
      }

      let args = [this.user.game.id,this.name, this.visibility, pos.x, pos.y,pos.z,p1.x,p1.y,p1.z,p2.x,p2.y,p2.z]
      $$("drop de "+this.name+" de visibilité "+this.user.visibility+" à la position ",pos)
      $$("Zone NE ",p1)
      $$("Zone SW ",p2)
      let token=this.user.network.indexOf("devnet")>-1 ? environment.token["elrond-devnet"] : environment.token["elrond-mainnet"]
      wait_message(this, "Dropping ...")

      let tokens=[]
      if(this.lifepoint>0){
        tokens.push(TokenTransfer.fungibleFromAmount(token,this.lifepoint*this.quantity,18))
        $$("Transfert de "+tokens[0].amount+" "+tokens[0].token)
      }
      tokens.push(TokenTransfer.semiFungible(this.sel_nft.identifier,this.sel_nft.nonce,this.quantity))

      try {
        let rc :any= await send_transaction_with_transfers(this.user.provider,"drop",args,this.user,tokens,environment.gaz_limit)
        $$("Resultat du drop ",rc)
        if(rc.returnMessage!="ok"){
          showMessage(this,rc.returnMessage)
        }else{
          showMessage(this,"Tokemons on the map")
          setTimeout(()=>{this.quit()},500)
        }
        wait_message(this)

      } catch (e) {
        showError(this, e)
        wait_message(this)
      }
    }
  }


  quit() {
    this.sel_nft=null
    this.router.navigate(["map"])
  }


  on_select($event: any) {
    $$("Selection du NFT ",$event)
    this.sel_nft=$event
    this.name=$event.name
    let max_per_user= this.user.idx==this.user.game!.owner ? 200 : (this.user.game?.max_per_user || 1000)
    this.max_quantity=Math.min(this.sel_nft.balance,max_per_user)

    let pos=this.user.center_map
    initializeMap(this,this.user.game,pos,'https://tokemon.f80.fr/assets/icons/push_pin_blue.svg')
      .on("zoomend",(event:L.LeafletEvent)=>{
        // let b=this.map.getBounds()
        // let distance_in_meters=this.map.distance(b.getNorthWest(),b.getSouthEast())
        // let distance_in_pixel=Math.sqrt(300*300+300+300)
        // this.ech=distance_in_meters!=0 ? distance_in_pixel/distance_in_meters : 1
        // this.max_distance=distance_in_meters
      })
    setTimeout(()=>{
      this.user.visibility=this.user.game!.min_visibility
      this.map.setView(pos,this.user.zoom || 16);
    },50)
  }


  convert_pos(content:string) : any {
    if(content.split(",").length==2){
      let lat=Number(content.split(",")[0])
      let lng=Number(content.split(",")[1])
      return polarToCartesian(
        new LatLng(lat,lng),environment.scale_factor,environment.translate_factor)
    }
  }


  async upload_excel($event: any) {
    let content=atob($event.content)
    let rc=[]
    for(let row of content.split("\n")){
      let _row=row.split(";")
      let id=_row[0]
      let pos=this.convert_pos(_row[1])
      let quantity=Number(_row[2])
      let args= [this.name, Math.round(this.user.visibility), pos.x, pos.y, pos.z]
      let tt=TokenTransfer.semiFungible(id,this.user.nonce,quantity)
      rc.push(await create_transaction("drop_nft",args,this.user,[tt]))
    }
  }


  open_xportal() {
    open(eval_direct_url_xportal(this.user.provider.uri))
  }

  update_nfts($event: any) {
    this.nfts=$event
    if(this.nfts.length==0 && !this.user.strong){
      this.user.logout()
      this.user.login(this)
    }
  }
}
