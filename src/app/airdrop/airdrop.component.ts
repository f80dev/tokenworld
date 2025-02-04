import {AfterViewInit, Component, inject, OnInit} from '@angular/core';
import {WalletComponent} from '../wallet/wallet.component';
import {UserService} from '../user.service';
import {InputComponent} from '../input/input.component';
import {NgIf} from '@angular/common';
import {MatButton} from '@angular/material/button';
import {environment} from '../../environments/environment';
import {HourglassComponent, wait_message} from '../hourglass/hourglass.component';
import {TokenTransfer} from '@multiversx/sdk-core/out';
import {send_transaction_with_transfers} from '../mvx';
import {getParams, showError, showMessage} from '../../tools';
import {initializeMap, polarToCartesian} from '../tokenworld';
import {ActivatedRoute, Router} from '@angular/router';
import {LatLng} from 'leaflet';
import * as L from 'leaflet';
import {baseMapURl} from '../map/map.component';
import {MatSnackBar} from '@angular/material/snack-bar';
import {MatDialog} from '@angular/material/dialog';
import {ApiService} from '../api.service';

@Component({
  selector: 'app-airdrop',
  standalone: true,
  imports: [
    WalletComponent,
    InputComponent,
    NgIf,
    MatButton,
    HourglassComponent
  ],
  templateUrl: './airdrop.component.html',
  styleUrl: './airdrop.component.css'
})
export class AirdropComponent implements AfterViewInit {

  max_distance=1000
  private map!: L.Map

  dialog=inject(MatDialog)
  api=inject(ApiService)
  ech: number=1
  routes=inject(ActivatedRoute)
  sel_coin: any;
  user=inject(UserService)
  max_amount: number=1000
  amount_to_drop=1;
  visibility: number=100;
  router=inject(Router)
  toast=inject(MatSnackBar)
  message: string=""


  async ngAfterViewInit() {

    setTimeout(async ()=>{
      await this.user.login(this,"","",true)

      let params:any=await getParams(this.routes)
      this.user.init_game(await this.user.open_game(params.game_id))

      if(this.user.game && this.user.game!.closed){
        showMessage(this,this.user.game.title+" is closed")
        this.router.navigate(["games"])
      }else{
        let pos=new LatLng(params.lat,params.lng)

        initializeMap(this,this.user.game,pos,'https://tokemon.f80.fr/assets/icons/target.png')
      }
    },100)


  }

  update_value($event: any) {
    this.amount_to_drop=$event
  }

  async airdrop() {
    if(this.user.game){
      let pos=polarToCartesian(this.user.center_map,environment.scale_factor,environment.translate_factor)
      let args = [this.user.game.id,pos.x, pos.y,pos.z,Math.round(this.visibility)]

      wait_message(this, "Dropping ...")

      let tokens=[]
      tokens.push(TokenTransfer.fungibleFromAmount(this.sel_coin.identifier,this.amount_to_drop,18))

      try {
        let tx = await send_transaction_with_transfers(this.user.provider,"airdrop",args,this.user,tokens)
        wait_message(this)
      } catch (e) {
        showError(this, e)
        wait_message(this)
      }
      this.quit()
    }else{
      this.router.navigate(["games"])
    }

  }

  quit() {
    this.sel_coin=null
    this.router.navigate(["map"])
  }
}
