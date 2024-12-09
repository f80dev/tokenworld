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
import {getParams, showError} from '../../tools';
import {initializeMap, polarToCartesian} from '../tokenworld';
import {ActivatedRoute, Router} from '@angular/router';
import {LatLng} from 'leaflet';
import * as L from 'leaflet';
import {baseMapURl} from '../map/map.component';

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


  ech: number=1
  routes=inject(ActivatedRoute)
  sel_coin: any;
  user=inject(UserService)
  max_amount: number=1000
  amount_to_drop=1;
  visibility: number=100;
  router=inject(Router)
  message: string=""



  async ngAfterViewInit() {
    let params:any=await getParams(this.routes)
    this.user.center_map=new LatLng(params.lat,params.lng)
    setTimeout(()=>{initializeMap(this,this.user,this.user.center_map)},200)
    await this.user.login(this)
  }

  update_value($event: any) {
    this.amount_to_drop=$event
  }

  async airdrop() {
    let pos=polarToCartesian(this.user.center_map,environment.scale_factor,environment.translate_factor)
    let args = [pos.x, pos.y,Math.round(this.visibility)]

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
  }

  quit() {
    this.sel_coin=null
    this.router.navigate(["map"])
  }
}
