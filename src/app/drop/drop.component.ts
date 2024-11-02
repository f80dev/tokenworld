import {AfterViewInit, Component, inject, OnInit} from '@angular/core';
import {Account, Address, ApiNetworkProvider, NonFungibleTokenOfAccountOnNetwork} from '@multiversx/sdk-core/out';
import {UserService} from '../user.service';
import {Router} from '@angular/router';
import {DEVNET, MAINNET} from '../mvx';
import {NgForOf} from '@angular/common';

@Component({
  selector: 'app-drop',
  standalone: true,
  imports: [
    NgForOf
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


}
