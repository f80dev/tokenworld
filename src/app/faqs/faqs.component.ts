import {AfterContentInit, Component, Input, OnInit} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {Location, NgFor, NgIf} from "@angular/common";
import {NetworkService} from "../network.service";
import {environment} from "../../environments/environment";
import {getParams} from "../../tools";
import {MatExpansionPanel, MatExpansionPanelHeader} from "@angular/material/expansion";


export interface FAQ {
  title: string
  format: "html" | "text"
  content: string
  index: string
  visible: boolean
}

@Component({
  selector: 'app-faqs',
  standalone:true,
  imports: [
    MatExpansionPanel,NgIf,NgFor,
    MatExpansionPanelHeader
  ],
  templateUrl: './faqs.component.html',
  styleUrls: ['./faqs.component.css']
})
export class FaqsComponent implements AfterContentInit {

  faqs:FAQ[]=[];
  @Input() filter="";
  @Input() title="Questions fréquentes";

  constructor(public network:NetworkService,
              public _location:Location,
              public route:ActivatedRoute) {
  }

  fill_faqs(content:any,params:any={}) {
    this.faqs=[];

    for(let faq of content) {
      if (!params.hasOwnProperty("open") || faq["index"].indexOf(params["open"]) > -1) {
        faq.visible = params.hasOwnProperty("open");

        for(let i=0;i<5;i++){
          faq.title=faq.title.replace("{{appname}}",environment.appname);
          faq.content=faq.content.replace("{{appname}}",environment.appname);
        }

        if(this.filter.length==0 || this.filter.indexOf(faq.index)>-1){
          this.faqs.push(faq);
        }
      }
    }
  }


  async ngAfterContentInit() {
    let params:any=await getParams(this.route)

    if(typeof(environment.faqs)=="string"){
      this.fill_faqs(environment.faqs)
    }else{
      this.network.getfaqs(params.faqs || environment.faqs).subscribe((rc:any)=>{
        this.fill_faqs(rc.content,params)
      })
    }
  }
}
