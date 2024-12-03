import {AfterViewInit, Component, inject, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {TokenTransfer} from '@multiversx/sdk-core/out';
import {UserService} from '../user.service';
import {ActivatedRoute, Router} from '@angular/router';
import {create_transaction, send_transaction_with_transfers} from '../mvx';
import {NgForOf, NgIf} from '@angular/common';
import {MatIcon} from "@angular/material/icon";
import {MatButton, MatIconButton} from "@angular/material/button";
import {environment} from '../../environments/environment';
import {initializeMap, latLonToCartesian} from '../tokenworld';
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
    UploadFileComponent
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

  sel_nft: any;
  message: string=""
  quantity=1
  max_quantity=10
  max_pv_loading=0
  map!: L.Map
  ech: number=1
  max_distance=1000;

  async ngAfterViewInit() {
    this.max_pv_loading=Math.round(this.user.get_balance(this.user.get_default_token()))

    let params:any=await getParams(this.routes)
    this.map = L.map('map')

    this.user.center_map=new LatLng(params.lat,params.lng)

    $$("Drop sur les coordonnées ",this.user.center_map)
    await this.user.login(this,"You must be connected to drop any NFT","",false)
  }


  ngOnChanges(changes: SimpleChanges): void {
    if(this.sel_nft)this.name=this.sel_nft.collection
  }


  //Envoi d'un NFT : https://docs.multiversx.com/sdk-and-tools/sdk-js/sdk-js-cookbook-v13#single-nft-transfer
  nfts: any[]=[];

  async drop(nft: any) {

    this.user.visibility=this.user.map.min_visibility

    await this.user.login(this,"You must be connected to drop any NFT","",true)
    $$("Authentification ",this.user.provider)

    let center:any=await getParams(this.routes) || {}
    if(!center.lat && !center.lng) {center=this.user.center_map}
    if (center) {
      let pos = latLonToCartesian(
        Number(center.lat)+environment.offset_lat,
        Number(center.lng)+environment.offset_lng,
        environment.scale_factor
      )
      $$("Ajout d'un tokemon en ",center)
      //la rue martel se trouve : "lat":48.874360147130226,"lng":2.3535713553428654
      let args = [this.name, Math.round(this.user.visibility), pos.x, pos.y, pos.z]
      let token=this.user.network.indexOf("devnet")>-1 ? environment.token["elrond-devnet"] : environment.token["elrond-mainnet"]
      wait_message(this, "Dropping ...")

      let tokens=[]
      if(this.lifepoint>0)tokens.push(TokenTransfer.fungibleFromAmount(token,this.lifepoint,18))
      tokens.push(TokenTransfer.semiFungible(this.sel_nft.identifier,this.sel_nft.nonce,this.quantity))

      try {
        let tx = await send_transaction_with_transfers(this.user.provider,"drop",args,this.user,tokens)
        wait_message(this)
      } catch (e) {
        showError(this, e)
        wait_message(this)
      }
      this.quit()
    }
  }


  quit() {
    this.sel_nft=null
    this.router.navigate(["map"])
  }


  on_select($event: any) {
    this.sel_nft=$event
    this.name=$event.name
    this.max_quantity=this.sel_nft.balance
    setTimeout(()=> {
      initializeMap(this,this.user,this.user.center_map,'https://tokemon.f80.fr/assets/icons/push_pin_blue.svg')
        .on("zoomend",(event:L.LeafletEvent)=>{
          let b=this.map.getBounds()
          let distance_in_meters=this.map.distance(b.getNorthWest(),b.getSouthEast())
          let distance_in_pixel=Math.sqrt(300*300+300+300)
          this.ech=distance_in_pixel/distance_in_meters
          this.max_distance=distance_in_meters
        })
      this.map.setView(new LatLng(this.user.center_map.lat,this.user.center_map.lng),this.user.zoom || 16);
    },200)
  }

  convert_pos(content:string) : any {
    if(content.split(",").length==2){
      let lat=Number(content.split(",")[0])
      let lng=Number(content.split(",")[1])
      return latLonToCartesian(lat,lng,environment.scale_factor)
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
