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
  nft: any
  api=inject(ApiService)
  @Input() label_pv="HP";
  size_box: string="200px"

  ngOnInit(): void {
    this.size_box=Math.round(Number(this.width.replace("px",""))*1.5) + "px"
  }


  async ngOnChanges(changes: SimpleChanges) {
    if(changes.hasOwnProperty("item")){
      let nft_id=this.item.hasOwnProperty("nft") ? this.item.nft+"-0"+this.item.nonce.toString(16) : this.item.identifier
      this.nft=await this.api._service("nfts/"+nft_id,"","https://devnet-api.multiversx.com/",false)
    }
  }


  copy_ref() {
    this.clipboard.copy(this.item.nft || this.item.identifier)
  }

  on_select() {
    this.select.emit({item:this.item,nft:this.nft})
  }

  open_coin(coin:any) {
    let url="https://devnet-explorer.multiversx.com/tokens/"+coin
    if(!this.user.isDevnet())url=url.replace("devnet-","")
    open(url,"Explorer")
  }
}
