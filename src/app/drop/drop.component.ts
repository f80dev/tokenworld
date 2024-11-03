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

@Component({
  selector: 'app-drop',
  standalone: true,
    imports: [
        NgForOf,
        MatIcon,
        MatIconButton,
        NgIf
    ],
  templateUrl: './drop.component.html',
  styleUrl: './drop.component.css'
})
export class DropComponent implements AfterViewInit {

  nfts:any[]=[]
  user=inject(UserService)
  router=inject(Router)

  async ngAfterViewInit() {
    if(!this.user.isConnected()){
      this.router.navigate(["login"],{queryParams:{message:"",redirectTo:"drop"}});
    }else{
      let addr=Address.fromBech32(this.user.address)
      let url_network=this.user.network=="elrond-devnet" ? DEVNET : MAINNET;
      const apiNetworkProvider = new ApiNetworkProvider(url_network);

      for(let nft of await apiNetworkProvider.getNonFungibleTokensOfAccount(addr)){
        let prop=nft.attributes.toString("utf-8");
        let metadata="https://ipfs.io/ipfs/"+prop.split("metadata:")[1]
        let image="https://ipfs.io/ipfs/"+prop.split("metadata:")[1].replace(".json",".png")
        this.nfts.push({name:nft.name,collection:nft.collection,id:nft.identifier,metadata:metadata,visual:image})
      }
    }
  }




  //Envoi d'un NFT : https://docs.multiversx.com/sdk-and-tools/sdk-js/sdk-js-cookbook-v13#single-nft-transfer


  async drop(nft: any) {
    let args:any[]=[]
    let contract:string=environment.contract_addr["elrond-devnet"];
    let tx=await send_transaction(this.user.provider,
      "add_tokemon",
      this.user.address,
      args,
      contract,
      nft.id,1,abi);
  }
}
