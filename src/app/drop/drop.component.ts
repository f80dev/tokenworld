import {AfterViewInit, Component, inject, OnInit} from '@angular/core';
import {Address, ApiNetworkProvider} from '@multiversx/sdk-core/out';
import {UserService} from '../user.service';
import {Router} from '@angular/router';

import {DEVNET, MAINNET, send_transaction} from '../mvx';
import {NgForOf, NgIf} from '@angular/common';
import {MatIcon} from "@angular/material/icon";
import {MatIconButton} from "@angular/material/button";
import {environment} from '../../environments/environment';
import {abi} from '../../environments/abi';
import {latLonToCartesian} from '../tokenworld';
import {HourglassComponent, wait_message} from '../hourglass/hourglass.component';
import {showMessage} from '../../tools';
import {MatDialog} from '@angular/material/dialog';

@Component({
  selector: 'app-drop',
  standalone: true,
  imports: [
    NgForOf,
    MatIcon,
    MatIconButton,
    NgIf,
    HourglassComponent
  ],
  templateUrl: './drop.component.html',
  styleUrl: './drop.component.css'
})
export class DropComponent implements AfterViewInit {

  nfts: any[] = []
  user = inject(UserService)
  router = inject(Router)
  dialog=inject(MatDialog)


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
        metadata: metadata,
        visual: image
      })
    }

  }


  //Envoi d'un NFT : https://docs.multiversx.com/sdk-and-tools/sdk-js/sdk-js-cookbook-v13#single-nft-transfer
  message: string=""



  async drop(nft: any) {
    if(this.user.isConnected()){
      let pos = latLonToCartesian(this.user.loc?.coords.latitude, this.user.loc?.coords.longitude)
      let args = ["LesBG", 10000, Math.trunc(pos.x*environment.scale_factor), Math.trunc(pos.y*environment.scale_factor), Math.trunc(pos.z*environment.scale_factor)]
      let contract: string = environment.contract_addr["elrond-devnet"];
      wait_message(this,"Dropping in progress")
      let tx = await send_transaction(this.user.provider,
        "drop_nft",
        this.user.address,
        args,
        contract,
        nft.collection, nft.nonce,1, abi);
      wait_message(this)
      this.router.navigate(["map"])
    }else{
      this.user.login(this)
    }

  }


}
