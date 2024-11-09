import {AfterViewInit, Component, inject, OnInit} from '@angular/core';
import {Address, ApiNetworkProvider} from '@multiversx/sdk-core/out';
import {UserService} from '../user.service';
import {Router} from '@angular/router';

import {DEVNET, MAINNET, send_transaction} from '../mvx';
import {NgForOf, NgIf} from '@angular/common';
import {MatIcon} from "@angular/material/icon";
import {MatButton, MatIconButton} from "@angular/material/button";
import {environment} from '../../environments/environment';
import {abi} from '../../environments/abi';
import {latLonToCartesian} from '../tokenworld';
import {HourglassComponent, wait_message} from '../hourglass/hourglass.component';
import {$$, showError, showMessage} from '../../tools';
import {MatDialog} from '@angular/material/dialog';
import {InputComponent} from '../input/input.component';
import {toNFT} from '../tokemon/tokemon.component';

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
    MatButton
  ],
  templateUrl: './drop.component.html',
  styleUrl: './drop.component.css'
})
export class DropComponent implements AfterViewInit {

  nfts: any[] = []
  user = inject(UserService)
  router = inject(Router)
  dialog=inject(MatDialog)
  sel_nft: any;


  async ngAfterViewInit() {

    if (!this.user.address) {
      this.user.address=localStorage.getItem("address") || ""
      if(!this.user.address)await this.user.login(this)
    }

    let addr = Address.fromBech32(this.user.address)
    const apiNetworkProvider = new ApiNetworkProvider(this.user.network == "elrond-devnet" ? DEVNET : MAINNET);

    for (let nft of await apiNetworkProvider.getNonFungibleTokensOfAccount(addr)) {
      let prop = nft.attributes.toString("utf-8")
      let metadata= "https://ipfs.io/ipfs/" + prop.split("metadata:")[1]
      let _nft=await apiNetworkProvider.getNonFungibleToken(nft.collection,nft.nonce)
      debugger
      this.nfts.push({
        name: nft.name,
        nonce:nft.nonce,
        collection: nft.collection,
        id: nft.identifier,
        identifier:nft.identifier,
        metadata: metadata,
        visual: _nft,
        type:nft.type
      })
    }
  }


  //Envoi d'un NFT : https://docs.multiversx.com/sdk-and-tools/sdk-js/sdk-js-cookbook-v13#single-nft-transfer
  message: string=""
  visibility=10
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
      let args = ["LesBG", this.visibility, pos.x, pos.y, pos.z]
      let contract: string = environment.contract_addr["elrond-devnet"];
      try {
        wait_message(this, "Dropping in progress")
        let tx = await send_transaction(this.user.provider,
          "drop_nft",
          this.user.address,
          args,
          contract,
          nft.collection, nft.nonce, this.quantity, abi, nft.type);
        wait_message(this)
      } catch (e) {
        showError(this, e)
        wait_message(this)
      }
      this.quit()

    }

  }


  select(nft: any) {
    this.sel_nft=nft
  }

  private quit() {
    this.sel_nft=null
    this.router.navigate(["map"])
  }
}
