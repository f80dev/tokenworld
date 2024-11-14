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
export class TokemonComponent implements OnChanges {

  @Input() network="elrond-devnet"
  @Input() item:any
  @Input() size="100px"
  nft: any
  api=inject(ApiService)

  async ngOnChanges(changes: SimpleChanges) {
    if(changes.hasOwnProperty("item")){
      let nft_id=this.item.hasOwnProperty("nft") ? this.item.nft+"-0"+this.item.nonce.toString(16) : this.item.identifier
      this.nft=await this.api._service("nfts/"+nft_id,"","https://devnet-api.multiversx.com/",false)
    }
  }




}
