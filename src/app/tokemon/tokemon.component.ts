import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  Output,
  SimpleChanges
} from '@angular/core';

import {NgIf} from '@angular/common';
import {ApiService} from '../api.service';
import {MatIcon} from '@angular/material/icon';
import {Clipboard} from '@angular/cdk/clipboard';



export function toNFT(nft:any) : any {

}



@Component({
  selector: 'app-tokemon',
  standalone: true,
  imports: [
    NgIf,
    MatIcon
  ],
  templateUrl: './tokemon.component.html',
  styleUrl: './tokemon.component.css'
})
export class TokemonComponent implements OnChanges {

  clipboard=inject(Clipboard)

  @Input() network="elrond-devnet"
  @Input() item:any
  @Input() size="200px"
  @Output() select = new EventEmitter()
  nft: any
  api=inject(ApiService)
  @Input() label_pv="HP";

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
}
