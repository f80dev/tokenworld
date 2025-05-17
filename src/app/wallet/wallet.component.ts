import {Component, EventEmitter, inject, Input, OnChanges, OnDestroy, Output, SimpleChanges} from '@angular/core';
import {DecimalPipe, NgForOf, NgIf} from "@angular/common";
import {ApiService} from '../api.service';
import {TokemonComponent} from '../tokemon/tokemon.component';
import {MatButton, MatIconButton} from '@angular/material/button';
import {UserService} from '../user.service';
import {environment} from '../../environments/environment';
import {MatIcon} from '@angular/material/icon';
import {settings} from '../../environments/settings';
import {get_nfts, getEntrypoint} from '../mvx';
import {$$, isLocal} from '../../tools';

@Component({
  selector: 'app-wallet',
  standalone: true,
  imports: [
    NgForOf,
    NgIf,
    TokemonComponent,
    DecimalPipe,
    MatButton,
    MatIconButton,
    MatIcon
  ],
  templateUrl: './wallet.component.html',
  styleUrl: './wallet.component.css'
})
export class WalletComponent implements OnChanges,OnDestroy {
  api=inject(ApiService)

  @Input() nft_builder=""
  nfts: any[] = []

  @Input() show : "coin" | "nft" | "coin,nft" ="coin,nft"
  @Input() strong_token=""
  @Input() user: UserService | null=null
  @Output() selectChanged = new EventEmitter()
  @Output() onCancel = new EventEmitter()
  @Output() listChanged = new EventEmitter()

  @Input() width="150px"
  @Input() height="200px"

  @Input() message: string=""
  account: any;
  @Input() selected=false;
  tokens: string[] = [];
  hwnd: any;
  hTimer: any;


  ngOnDestroy(): void {
    clearInterval(this.hTimer)
  }


  async refresh(){
    this.nfts=[]
    if(this.show.indexOf("nft")>-1 && this.user){
      for (let nft of await get_nfts(this.user,this.api)) {
        let prop = nft.attributes ? nft.attributes.toString("utf-8") : ""
        let tags=prop.split(";metadata:")[0].replace("tags:" ,"")

        nft.visual=nft.hasOwnProperty("media") ? nft.media[0].hasOwnProperty("thumbnailUrl") ? nft.media[0].thumbnailUrl : nft.media[0].originalUrl : ""

        let cid=prop.split("metadata:")[1]
        if(!nft.hasOwnProperty("metadata")){nft.metadata=await this.api._service("ipfs/"+cid,"","https://ipfs.io/",false)}
        nft.tags=tags
        nft.balance=Number(nft.balance)
        this.nfts.push(nft)
      }
      this.nfts.reverse()
      this.listChanged.emit(this.nfts)
    }

    if(this.show.indexOf("coin")>-1 && this.user){
      await this.user.init_balance(this.api)
      this.tokens=Object.keys(this.user.tokens)
    }
  }


  select(nft: any) {
    this.selectChanged.emit(nft)
  }


  ngOnChanges(changes: SimpleChanges): void {
    this.refresh()
  }



  select_esdt($event:any) {
    $event.balance=Number($event.balance)
    this.selectChanged.emit($event)
  }


  cancel() {
    this.onCancel.emit()
  }

  create_coin() {
    let url="https://devnet.usewarp.to/create-token"
    if(this.user){
      if(this.user.network.indexOf("devnet")==-1)url=url.replace("devnet.","")
      if(this.user.network.indexOf("testnet")>-1)url=url.replace("devnet.","testnet.")
      open(url,"ESDT Creator")
    }
  }



  new_nft() {
    if(this.user){
      let url=settings.nft_builder+this.user.address+"&action=close"
      if(window.location.href.indexOf("localhost")>-1)url=url.replace(settings.nft_builder,"https://localhost:4200/?address=")
      $$("Ouverture de la fenetre de creation de NFT")
      this.hwnd=open(url,"nft_builder")
      window.addEventListener('message', (event) => {
        $$("Réception du message ",event)
        if(event.origin.startsWith(url.substring(0,20))){
          this.hwnd.close()
          clearInterval(this.hTimer)
          this.refresh()
        }
      })
    }
  }
}
