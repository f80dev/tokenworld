import {Component, EventEmitter, inject, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {DecimalPipe, NgForOf, NgIf} from "@angular/common";
import {ApiService} from '../api.service';
import {TokemonComponent} from '../tokemon/tokemon.component';
import {MatButton} from '@angular/material/button';

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

  nfts: any[] = []
  @Input() address=""
  @Input() network="elrond-devnet"
  @Output() selectChanged = new EventEmitter()
  @Input() size="200px"
  @Input() message: string=""
  tokens: any[]=[];
  account: any;
  @Input() selected=false;

  async refresh(){
    //let addr = Address.fromBech32(this.address)
    //const apiNetworkProvider = new ApiNetworkProvider(this.network == "elrond-devnet" ? DEVNET : MAINNET);

    this.account=await this.api._service("accounts/"+this.address,"","https://devnet-api.multiversx.com/")
    this.tokens=await this.api._service("accounts/"+this.address+"/tokens","","https://devnet-api.multiversx.com/")
    this.tokens.push({name:"eGLD",balance:this.account.balance/1e18})

    this.nfts=[]
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

  select(nft: any) {
    this.selectChanged.emit(nft)
  }


  ngOnChanges(changes: SimpleChanges): void {
    if(changes.hasOwnProperty("address"))this.refresh()
  }

  select_esdt($event:any) {
    this.selectChanged.emit($event)
  }
}
