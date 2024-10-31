import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {$$, get_images_from_banks, setParams, showMessage} from "../../tools";
import {DeviceService} from "../device.service";
import {NgNavigatorShareService} from "ng-navigator-share";
import {MatDialog} from "@angular/material/dialog";
import {NetworkService} from "../network.service";
import {MatExpansionPanel, MatExpansionPanelHeader} from "@angular/material/expansion";
import {InputComponent} from "../input/input.component";
import {NgFor, NgIf} from "@angular/common";
import {MatButton} from "@angular/material/button";
import {Clipboard} from "@angular/cdk/clipboard";
import {MatSnackBar} from "@angular/material/snack-bar";
import {environment} from "../../environments/environment";
import {_prompt} from "../prompt/prompt.component";

export function genlink_to_obj(links:any[]){
  let obj:any={}
  for(let l of links){
    obj[l.name]=l.value;
  }
  return obj
}

@Component({
  selector: 'app-genlink',
  standalone:true,
    imports: [
        MatExpansionPanel, NgIf, NgFor,
        MatExpansionPanelHeader,
        InputComponent, MatButton
    ],

  templateUrl: './genlink.component.html',
  styleUrls: ['./genlink.component.css']
})
export class GenlinkComponent implements OnChanges {

  @Input() properties: any[]=[];
  @Input() domain: string="";
  @Input() title: string="Paramètres";
  url: string="";
  @Input() show_command_panel: boolean = true;
  @Output('update') onupdate: EventEmitter<any>=new EventEmitter();
  @Input() expanded=true;

  constructor(
      public device:DeviceService,
      public dialog:MatDialog,
      public clipboard:Clipboard,
      public api:NetworkService,
      public toast:MatSnackBar,
      public ngShare:NgNavigatorShareService
  ) {

  }

  ngOnChanges(changes: SimpleChanges): void {
    this.create_url()
  }


  save_local(){
    this.create_url();
    localStorage.setItem("config_"+this.domain,JSON.stringify(this.properties))
  }

  load_local(){
    this.properties=JSON.parse(localStorage.getItem("config_"+this.domain) || "{}");
  }

  create_url() {
    let obj:any={}
    for(let p of this.properties){
      if(typeof(p.value)=="object"){
        obj[p.name]=p.value.value
      }else{
        obj[p.name]=p.value
      }
      if(p.type=="list" && !p.hasOwnProperty("value")){
        let idx=this.properties.indexOf(p);
        this.properties[idx].value={label:p.options[0],value:p.options[0]}
      }
    }
    obj["toolbar"]=false;
    $$("Enregistrement des parametres ",obj)
    let prefix=this.domain.endsWith("/") ? "?" : "/?"
    this.url=this.domain+prefix+setParams(obj)
    this.onupdate.emit(obj)
  }

  update_value(p:any,$event: any) {
    p.value=$event;
    this.save_local()
  }

  open_test(mode='web') {
    this.create_url();
    let url=this.url;
    if(mode=="local"){
      url=this.url.split("//")[1]
      if(url.indexOf("/")>-1)url=url.substring(url.indexOf('/'))
      url="http://localhost:4200"+(url.startsWith("/") ? "" : "/")+url
    }
    open(url,"test")
  }



  share_url() {
    this.create_url();
    let obj:any={}
    for(let p of this.properties){
      obj[p.name]=p.value
    }
    this.api.create_short_link({url:this.url}).subscribe((r)=>{
      let url=environment.transfer_page+"/"+r.cid
      this.ngShare.share({
        title:obj["appname"],
        url:url,
        text:obj["claim"]
      })
      this.clipboard.copy(url)
      showMessage(this,"Lien copié")
    })

  }



  async call_picture(prop:any) {
    let images=await get_images_from_banks(this,_prompt,this.api,"",false,1)
    if(images.length>0)prop.value=images[0].image
  }
}
