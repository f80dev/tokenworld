import {AfterViewInit, Component, inject, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {Address, ApiNetworkProvider, TokenTransfer} from '@multiversx/sdk-core/out';
import {UserService} from '../user.service';
import {Router} from '@angular/router';

import {DEVNET, MAINNET, send_transaction, send_transaction_with_transfers} from '../mvx';
import {NgForOf, NgIf} from '@angular/common';
import {MatIcon} from "@angular/material/icon";
import {MatButton, MatIconButton} from "@angular/material/button";
import {environment} from '../../environments/environment';
import {latLonToCartesian} from '../tokenworld';
import {HourglassComponent, wait_message} from '../hourglass/hourglass.component';
import {$$, showError, showMessage} from '../../tools';
import {MatDialog} from '@angular/material/dialog';
import {InputComponent} from '../input/input.component';
import {WalletComponent} from '../wallet/wallet.component';

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
    WalletComponent
  ],
  templateUrl: './drop.component.html',
  styleUrl: './drop.component.css'
})
export class DropComponent implements AfterViewInit, OnChanges {

  lifepoint: number = 0;
  name="";

  user = inject(UserService)
  router = inject(Router)
  dialog=inject(MatDialog)
  sel_nft: any;

  async ngAfterViewInit() {
    if (!this.user.address) {
      this.user.address=localStorage.getItem("address") || ""
      if(!this.user.address)await this.user.login(this)
    }
  }


  ngOnChanges(changes: SimpleChanges): void {
    if(this.sel_nft)this.name=this.sel_nft.collection
  }



  //Envoi d'un NFT : https://docs.multiversx.com/sdk-and-tools/sdk-js/sdk-js-cookbook-v13#single-nft-transfer
  message: string=""
  quantity=1
  max_quantity=10


  async drop(nft: any) {
    if (!this.user.isConnected()) {await this.user.login(this)}
    if (this.user.center_map) {
      let pos = latLonToCartesian(
        this.user.center_map.lat+environment.offset_lat,
        this.user.center_map.lng+environment.offset_lng,
        environment.scale_factor
      )
      $$("Ajout d'un tokemon en ",this.user.center_map)
      //la rue martel se trouve : "lat":48.874360147130226,"lng":2.3535713553428654
      let args = [this.name, Math.round(this.user.visibility), pos.x, pos.y, pos.z]
      let contract: string = environment.contract_addr["elrond-devnet"];
      try {
        wait_message(this, "Dropping in progress")
        let tokens=[
          TokenTransfer.fungibleFromAmount(environment.token,this.lifepoint,18),
          TokenTransfer.semiFungible(this.sel_nft.nft,this.sel_nft.nonce,this.quantity)
        ]
        let tx = await send_transaction_with_transfers(this.user.provider,"drop_nft",args,this.user,tokens)

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
  }

  protected readonly environment = environment;
}
