import {AfterViewInit, Component, inject, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import { TokenTransfer} from '@multiversx/sdk-core/out';
import {UserService} from '../user.service';
import {ActivatedRoute, Router} from '@angular/router';
import {create_transaction, get_nft, network_config, send_transaction_with_transfers} from '../mvx';
import {NgForOf, NgIf} from '@angular/common';
import {MatIcon} from "@angular/material/icon";
import {MatButton, MatIconButton} from "@angular/material/button";
import {environment} from '../../environments/environment';
import {add_icon, initializeMap, Point3D, polarToCartesian} from '../tokenworld';
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
export class DropComponent implements AfterViewInit {

  lifepoint: number = 0;
  name = "";
  ech: number=1


  api = inject(ApiService)
  routes = inject(ActivatedRoute)
  user = inject(UserService)
  router = inject(Router)
  dialog = inject(MatDialog)
  device = inject(DeviceService)
  toast = inject(MatSnackBar)

  sel_nft: any;
  message: string = ""
  quantity = 1
  max_quantity = 10
  max_pv_loading = 0

  map!: L.Map
  max_distance = 1000;
  nfts: any[] = [];
  visibility = 30
  //Envoi d'un NFT : https://docs.multiversx.com/sdk-and-tools/sdk-js/sdk-js-cookbook-v13#single-nft-transfer
  random_location: boolean = false;
  diffusion = 0
  max_per_user=1


  async ngAfterViewInit() {
    setTimeout(async ()=>{
      let params: any = await getParams(this.routes)
      if(this.user){
        await this.user.login(this, "You must be connected to drop any NFT","",false,0.01,"To drop a tokemon in game you must have some egld")

        this.user.init_game(await this.user.open_game(Number(params.game_id)))
        this.max_per_user = this.user.idx == Number(this.user.game!.owner) ? 100 : (this.user.game?.max_per_user || 1000)

        this.visibility= Math.round((Number(this.user.game!.min_visibility) + Number(this.user.game!.max_visibility)) / 2)/environment.scale_factor
        await this.user.init_balance(this.api)
        this.max_pv_loading = Math.min(this.user.game!.max_pv, this.user.get_balance(this.user.get_default_token()))


        if(params.lat==0 && params.lng==0){
          this.random_location=true;
        }else{
          this.user.center_map = new LatLng(params.lat, params.lng)
          this.map = L.map('map')
          $$("Drop sur les coordonnées ", this.user.center_map)
        }

        if(params.hasOwnProperty("nft")){
          let nft=await get_nft(params.nft,this.api,this.user.network)
          this.diffusion=0
          this.on_select(nft)
        }
      }else{
        this.router.navigate(["games"])
      }
    },50)
  }



  async drop() {
    if (this.user.game) {
      if (this.name.length < 3) {
        showMessage(this, "3 characters required for the name")
        return
      }

      if(!this.update_occurence()){
        showMessage(this, "Bad number of tokemon")
        return
      }

      await this.user.login(this, "You must be connected to drop any NFT", "", true)
      //$$("Authentification ",this.user.provider)

      let pos = polarToCartesian(
        new LatLng(this.user.center_map.lat+environment.offset_lat,this.user.center_map.lng+environment.offset_lng),
        environment.scale_factor, environment.translate_factor
      )

      $$("Ajout d'un tokemon en ", pos)
      //la rue martel se trouve : "lat":48.874360147130226,"lng":2.3535713553428654

      let p1 = new Point3D(0, 0, 0)
      let p2 = new Point3D(0, 0, 0)

      if (this.random_location || this.diffusion > 0) {
        pos = new Point3D(0, 0, 0)
        p1 = pos
        p2 = pos
      }

      if (this.diffusion > 0) {
        let diffusion = this.diffusion / 111320
        p1 = polarToCartesian(
          new LatLng(this.user.center_map.lat + diffusion, this.user.center_map.lng + diffusion),
          environment.scale_factor, environment.translate_factor
        )
        p2 = polarToCartesian(
          new LatLng(this.user.center_map.lat - diffusion, this.user.center_map.lng - diffusion),
          environment.scale_factor, environment.translate_factor
        )
      }

      if(!this.user.game.user_visibility){
        this.visibility= Math.round((Number(this.user.game.min_visibility) + Number(this.user.game.max_visibility)) / 2)
      }

      let args = [this.user.game.id, this.name,this.visibility*environment.scale_factor, pos.x, pos.y, pos.z, p1.x, p1.y, p1.z, p2.x, p2.y, p2.z]
      $$("drop de " + this.name + " de visibilité " + this.user.visibility + " à la position ", pos)
      $$("Zone NE ", p1)
      $$("Zone SW ", p2)
      let token = this.user.network.indexOf("devnet") > -1 ? environment.token["elrond-devnet"] : environment.token["elrond-mainnet"]
      wait_message(this, "Dropping ...")

      let tokens = []
      if (this.lifepoint > 0) {
        tokens.push(TokenTransfer.fungibleFromAmount(token, this.lifepoint * this.quantity, 18))
        $$("Transfert de " + tokens[0].amount + " " + tokens[0].token)
      }
      tokens.push(TokenTransfer.semiFungible(this.sel_nft.identifier, this.sel_nft.nonce, this.quantity))

      try {
        let gas_to_drop = environment.max_gaz //environment.gaz_for_transaction + environment.gaz_by_nft * BigInt(this.quantity);
        if(gas_to_drop>environment.max_gaz){
          showMessage(this,"Quantity is too high for one transaction")
          wait_message(this)
          return
        }
        $$("Gas to transaction ",Number(gas_to_drop))
        $$("Dropping avec les arguments ",args)
        let rc: any = await send_transaction_with_transfers(this.user, "drop", args, tokens, gas_to_drop)

        $$("Resultat du drop ", rc)
        if (rc.returnMessage != "ok") {
          showMessage(this, rc.returnMessage)
        } else {
          showMessage(this, "Tokemons on the map")
          setTimeout(() => {
            debugger
            if(Number(rc.values[0])==1)this.user.zoom=18
            this.quit()
          }, 500)
        }
        wait_message(this)

      } catch (e) {
        showError(this, e)
        wait_message(this)
      }
    }
  }


  quit() {
    this.sel_nft = null
    this.router.navigate(["map"],{queryParams:{lat:this.user.center_map.lat,lng:this.user.center_map.lng,zoom:this.user.zoom}})
  }


  async on_select($event: any) {
    $$("Selection du NFT ",$event)
    this.sel_nft = $event
    this.name = $event.name

    this.max_quantity = Math.min(Number(this.sel_nft.balance), Number(this.max_per_user))

    let pos = this.user.center_map
    if(this.map){
      initializeMap(this, this.user.game, pos, 'https://tokemon.f80.fr/assets/icons/push_pin_blue.svg')
      setTimeout(() => {
        add_icon(this.map,'https://tokemon.f80.fr/assets/icons/target.png',this.user.center_map,"dropping point")
        this.user.visibility = this.user.game!.min_visibility
        this.map.setView(pos, this.user.zoom || 16);
      }, 50)
    }

  }


  convert_pos(content: string): any {
    if (content.split(",").length == 2) {
      let lat = Number(content.split(",")[0])
      let lng = Number(content.split(",")[1])
      return polarToCartesian(
        new LatLng(lat, lng), environment.scale_factor, environment.translate_factor)
    }
  }


  async upload_excel($event: any) {
    let content = atob($event.content)
    let rc = []
    for (let row of content.split("\n")) {
      let _row = row.split(";")
      let id = _row[0]
      let pos = this.convert_pos(_row[1])
      let quantity = Number(_row[2])
      let args = [this.name, Math.round(this.user.visibility), pos.x, pos.y, pos.z]
      let tt = TokenTransfer.semiFungible(id, this.user.nonce, quantity)
      rc.push(await create_transaction("drop_nft", args, this.user, [tt]))
    }
  }


  open_xportal() {
    open(eval_direct_url_xportal(this.user.provider.uri))
  }

  update_occurence() : boolean {
    if(this.user.game){
      if(this.user.idx==this.user.game.owner)return true;
      if(this.quantity<this.user.game.max_per_user && this.quantity<Number(this.sel_nft.balance)){
        return true
      }else{
        showMessage(this,'Quantity is too high')
      }
    }
    return false
  }

  update_nfts($event: any) {
    this.nfts = $event
    if (this.nfts.length == 0 && !this.user.strong) {
      this.user.logout()
      this.user.login(this)
    }
  }

  check_visibility() {
    if(this.user.game){
      if(this.visibility>Number(this.user.game?.max_visibility)/environment.scale_factor || this.visibility<Number(this.user.game?.min_visibility)/environment.scale_factor){
        this.visibility=(Number(this.user.game.min_visibility)+Number(this.user.game.max_visibility))/environment.scale_factor/2
        showMessage(this,"visibility must be set between "+this.user.game?.min_visibility+" and "+this.user.game?.max_visibility+" meters")
      }
    }
  }

  protected readonly environment = environment;

  update_distance() {
    //On ne peut pas lancer loin lorsqu'on est contraint de dropper à côté
    if(this.user.game?.geoloc_to_drop && this.diffusion>10)this.diffusion=10
  }
}
