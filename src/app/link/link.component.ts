import {Component, Input, OnInit} from '@angular/core';
import {environment} from "../../environments/environment";
import {NetworkService} from "../network.service";
import {MatIcon} from "@angular/material/icon";
import {NgIf, SlicePipe} from "@angular/common";
import {$$} from "../../tools";

@Component({
  selector: 'app-link',
  standalone:true,
  imports: [
    MatIcon,NgIf,
    SlicePipe
  ],
  templateUrl: './link.component.html',
  styleUrls: ['./link.component.css']
})
export class LinkComponent implements OnInit {

  @Input() content="";
  @Input() icon="";
  @Input() redirect_server="https://gate.nfluent.io";   //Voir le projet urlshortener
  @Input() network="elrond-devnet";
  @Input() suffix=""
  @Input() _type="address"
  @Input() title=""
  constructor(
    public api:NetworkService
  ) { }

  ngOnInit(): void {
    if(this.title=="")this.title="Explorer "+this.content
  }

  get_explorer(content: string,suffix="") {
    return "https://"+(this.network.indexOf('devnet')>-1 ? "devnet-" : "")+"explorer.elrond.com/"+this._type+"/"+content+suffix;
  }

  short_link() {
      let body = {url: this.content}
      this.api.create_short_link(body).subscribe({
        next: (result:any) => {
          this.content = environment.transfer_page + "?" + result.cid
        },
        error:(err:any)=>{
          $$("Erreur de raccourcis",err)
        }
      })

  }

  open_web() {
    window.open(this.content,"preview")
  }
}
