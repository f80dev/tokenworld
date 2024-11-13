import {AfterViewInit, Component, inject, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {ApiNetworkProvider} from '@multiversx/sdk-core/out';
import {DEVNET, MAINNET} from '../mvx';
import {UserService} from '../user.service';
import {NgIf} from '@angular/common';
import {ApiService} from '../api.service';



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
export class TokemonComponent implements AfterViewInit {

  async ngAfterViewInit() {
    if(this.item.visual==""){
      setTimeout(async ()=>{
        let nft_id=this.item.nft+"-0"+this.item.nonce.toString(16)
        let nft:any=await this.api._service("nfts/"+nft_id,"","https://devnet-api.multiversx.com/",false)
        this.item.visual=nft.hasOwnProperty("media") ? nft.media[0].hasOwnProperty("thumbnailUrl") ? nft.media[0].thumbnailUrl : nft.media[0].originalUrl : ""
      },50)

    }

  }

  api=inject(ApiService)

  @Input() network="elrond-devnet"
  @Input() item:any
  @Input() size="100px"



}
