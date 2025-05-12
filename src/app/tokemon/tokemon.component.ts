import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnChanges, OnInit,
  Output,
  SimpleChanges
} from '@angular/core';

import {DecimalPipe, NgForOf, NgIf} from '@angular/common';
import {ApiService} from '../api.service';
import {MatIcon} from '@angular/material/icon';
import {Clipboard} from '@angular/cdk/clipboard';
import {UserService} from '../user.service';
import {get_nft} from '../mvx';


export function toNFT(nft:any) : any {

}


@Component({
  selector: 'app-tokemon',
  standalone: true,
  imports: [
    NgIf,
    MatIcon,
    NgForOf,
    DecimalPipe
  ],
  templateUrl: './tokemon.component.html',
  styleUrl: './tokemon.component.css'
})
export class TokemonComponent implements OnChanges,OnInit {

  clipboard=inject(Clipboard)
  user=inject(UserService)

  @Input() network="elrond-devnet"
  @Input() item:any
  @Input() bags:any[]=[]
  @Input() height="300px"
  @Input() width="200px"
  @Output() select = new EventEmitter()
  tokemon: any
  api=inject(ApiService)
  @Input() label_pv="HP";
  size_box: string="200px"

  ngOnInit(): void {
    this.size_box=Math.round(Number(this.width.replace("px",""))*1.5) + "px"
  }


  async ngOnChanges(changes: any) {
    if(changes.hasOwnProperty("item")){
      this.tokemon=changes.item.currentValue
      if(typeof(this.tokemon.nft)=="string"){
        let identifier=this.tokemon.nft+"-"+(this.tokemon.nonce<15 ? "0"+this.tokemon.nonce.toString(16) : this.tokemon.nonce.toString(16))
        this.tokemon.nft=await get_nft(identifier,this.api,this.network)
      }
      // this.nft.balance=await this.user.get_balance(nft_id)

    }
  }


  copy_ref() {
    this.clipboard.copy(this.item.nft || this.item.identifier)
  }

  on_select() {
    this.select.emit({item:this.item,nft:this.tokemon})
  }

  open_coin(coin:any) {
    let url="https://devnet-explorer.multiversx.com/tokens/"+coin
    if(!this.user.isDevnet())url=url.replace("devnet-","")
    open(url,"Explorer")
  }

  open_nft() {
    let url="https://devnet.xspotlight.com/nfts/"+this.tokemon.identifier
    if(!this.user.isDevnet())url=url.replace("devnet.","")
    open(url,"Spotlight")
  }
}
