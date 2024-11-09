import {Component, inject, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {ApiNetworkProvider} from '@multiversx/sdk-core/out';
import {DEVNET, MAINNET} from '../mvx';
import {UserService} from '../user.service';
import {NgIf} from '@angular/common';



export function toNFT(nft:any) : any {

}



@Component({
  selector: 'app-tokemon',
  standalone: true,
  imports: [
    NgIf
  ],
  templateUrl: './tokemon.component.html',
  styleUrl: './tokemon.component.css'
})
export class TokemonComponent implements OnChanges {

  user=inject(UserService)
  @Input() network="elrond-devnet"
  @Input() item:any
  nft:any

  async ngOnChanges(changes: any) {
    if(changes.hasOwnProperty("item") && changes.item.currentValue){
      const apiNetworkProvider = new ApiNetworkProvider(this.network == "elrond-devnet" ? DEVNET : MAINNET);
      this.nft=await apiNetworkProvider.getNonFungibleToken(this.item.nft,Number(this.item.nonce))
      this.nft=toNFT(this.nft)
      this.item.label=this.item.clan.toString("utf-8")
    }
  }


}
