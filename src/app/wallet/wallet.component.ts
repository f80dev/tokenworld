import {Component, EventEmitter, inject, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {NgForOf, NgIf} from "@angular/common";
import {ApiService} from '../api.service';
import {TokemonComponent} from '../tokemon/tokemon.component';

@Component({
  selector: 'app-wallet',
  standalone: true,
  imports: [
    NgForOf,
    NgIf,
    TokemonComponent
  ],
  templateUrl: './wallet.component.html',
  styleUrl: './wallet.component.css'
})
export class WalletComponent implements OnChanges {
  api=inject(ApiService)

  nfts: any[] = []
  @Input() address=""
  @Input() network="elrond-devnet"
  @Output() selectChanged = new EventEmitter()
  @Input() size="200px"
  @Input() message: string=""

  async refresh(){
    //let addr = Address.fromBech32(this.address)
    //const apiNetworkProvider = new ApiNetworkProvider(this.network == "elrond-devnet" ? DEVNET : MAINNET);
    this.nfts=[]
    for (let nft of await this.api._service("accounts/"+this.address+"/nfts","","https://devnet-api.multiversx.com/")) {
      let prop = nft.attributes.toString("utf-8")
      let tags=prop.split(";metadata:")[0].replace("tags:" ,"")
      let visual=nft.hasOwnProperty("media") ? nft.media[0].hasOwnProperty("thumbnailUrl") ? nft.media[0].thumbnailUrl : nft.media[0].originalUrl : ""
      let cid=prop.split("metadata:")[1]
      nft.visual=visual
      nft.metadata=await this.api._service("ipfs/"+cid,"","https://ipfs.io/",false)
      nft.tags=tags
      this.nfts.push(nft)
    }
  }

  select(nft: any) {
    this.selectChanged.emit(nft)
  }


  ngOnChanges(changes: SimpleChanges): void {
    if(changes.hasOwnProperty("address"))this.refresh()
  }

}
