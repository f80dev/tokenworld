import {Component, EventEmitter, inject, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {DecimalPipe, NgForOf, NgIf} from "@angular/common";
import {ApiService} from '../api.service';
import {TokemonComponent} from '../tokemon/tokemon.component';
import {MatButton} from '@angular/material/button';
import {UserService} from '../user.service';
import {environment} from '../../environments/environment';

@Component({
  selector: 'app-wallet',
  standalone: true,
  imports: [
    NgForOf,
    NgIf,
    TokemonComponent,
    DecimalPipe,
    MatButton
  ],
  templateUrl: './wallet.component.html',
  styleUrl: './wallet.component.css'
})
export class WalletComponent implements OnChanges {
  api=inject(ApiService)
  user=inject(UserService)

  @Input() nft_market=environment.nft_market
  nfts: any[] = []
  @Input() address=""
  @Input() show="coin,nft"
  @Input() network="elrond-devnet"
  @Output() selectChanged = new EventEmitter()
  @Input() size="200px"
  @Input() message: string=""
  account: any;
  @Input() selected=false;
  tokens: string[] = [];

  async refresh(){
    this.nfts=[]
    if(this.show.indexOf("nft")>-1){
      for (let nft of await this.api._service("accounts/"+this.address+"/nfts","","https://devnet-api.multiversx.com/")) {
        let prop = nft.attributes.toString("utf-8")
        let tags=prop.split(";metadata:")[0].replace("tags:" ,"")

        nft.visual=nft.hasOwnProperty("media") ? nft.media[0].hasOwnProperty("thumbnailUrl") ? nft.media[0].thumbnailUrl : nft.media[0].originalUrl : ""

        let cid=prop.split("metadata:")[1]
        if(!nft.hasOwnProperty("metadata")){nft.metadata=await this.api._service("ipfs/"+cid,"","https://ipfs.io/",false)}
        nft.tags=tags
        this.nfts.push(nft)
      }
    }

    if(this.show.indexOf("coin")>-1){
      await this.user.init_balance(this.api)
      this.tokens=Object.keys(this.user.tokens)
    }

  }


  select(nft: any) {
    this.selectChanged.emit(nft)
  }


  ngOnChanges(changes: SimpleChanges): void {
    if(changes.hasOwnProperty("address")){
      this.nft_market=this.nft_market+changes["address"].currentValue
      this.refresh()
    }
  }

  select_esdt($event:any) {
    this.selectChanged.emit($event)
  }
}
