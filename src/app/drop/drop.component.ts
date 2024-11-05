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
import {showError, showMessage} from '../../tools';
import {MatDialog} from '@angular/material/dialog';
import {InputComponent} from '../input/input.component';

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
    if (!this.user.isConnected()) {await this.user.login(this)}

    let addr = Address.fromBech32(this.user.address)
    let url_network = this.user.network == "elrond-devnet" ? DEVNET : MAINNET;
    const apiNetworkProvider = new ApiNetworkProvider(url_network);


    for (let nft of await apiNetworkProvider.getNonFungibleTokensOfAccount(addr)) {
      let prop = nft.attributes.toString("utf-8");
      let metadata = "https://ipfs.io/ipfs/" + prop.split("metadata:")[1]
      let image = "https://ipfs.io/ipfs/" + prop.split("metadata:")[1].replace(".json", ".png")

      this.nfts.push({
        name: nft.name,
        nonce:nft.nonce,
        collection: nft.collection,
        id: nft.identifier,
        identifier:nft.identifier,
        metadata: metadata,
        visual: image,
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
    let pos = latLonToCartesian(this.user.loc?.coords.latitude, this.user.loc?.coords.longitude,environment.scale_factor)
    let args = ["LesBG", this.visibility,pos.x,pos.y,pos.z]
    let contract: string = environment.contract_addr["elrond-devnet"];
    try{
      wait_message(this,"Dropping in progress")
      let tx = await send_transaction(this.user.provider,
        "drop_nft",
        this.user.address,
        args,
        contract,
        nft.collection, nft.nonce,this.quantity, abi,nft.type);
      wait_message(this)
    }catch (e){
      showError(this,e)
      wait_message(this)
    }
    this.quit()

  }


  select(nft: any) {
    this.sel_nft=nft
  }

  private quit() {
    this.sel_nft=null
    this.router.navigate(["map"])
  }
}
