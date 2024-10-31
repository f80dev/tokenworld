import {Component, inject, OnInit} from '@angular/core';
import {environment} from "../../environments/environment";
import {MatExpansionPanel, MatExpansionPanelHeader} from "@angular/material/expansion";
import {NgForOf, NgIf} from "@angular/common";
import {ApiService} from "../api.service";
import {MatTab, MatTabGroup} from "@angular/material/tabs";
import {MatButton} from "@angular/material/button";
import {showMessage} from "../../tools";
import {MatDialog} from "@angular/material/dialog";
import {_prompt} from "../prompt/prompt.component";
import {InputComponent} from "../input/input.component";
import {UserService} from "../user.service";
import {get_smartcontract_address} from "../mvx";

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    MatExpansionPanel, MatExpansionPanelHeader,
    NgForOf, MatTabGroup, MatTab, MatButton, InputComponent, NgIf
  ],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent implements OnInit {

  protected readonly environment = environment;
  models: string[]=[];

  api=inject(ApiService)
  dialog=inject(MatDialog)
  user=inject(UserService)

  infos: any;
  sel_model: any;
  options=[{label:"Main network",value:"mainnet"},{label:"Test network",value:"devnet"}]
  sel_network=this.options[1]

  refresh(){
    this.api._get(environment.server+"/models").subscribe((rep:any)=>{
      this.models=rep.models
      this.sel_model=rep.selected
    })
    this.api._get(environment.render_server+"/infos").subscribe((infos:any)=>{
      this.infos=infos
    })
  }

  ngOnInit(): void {
    this.refresh()
  }


  async add_model() {
    let model_to_add=await _prompt(this,"Ajouter un modele","","Donner le nom du modèle (voir sur hugging-face","text","Ajouter","Annuler",false)
    this.api._get(environment.server+"/load_model","model="+model_to_add).subscribe(()=>{
      showMessage(this,"Modele ajouté")
      this.refresh()
    })
  }

  show_contract() {
    let prefix=this.user.network.indexOf("devnet")>-1 ? "devnet-" : ""
    open("https://"+prefix+"explorer.multiversx.com/accounts/"+get_smartcontract_address(environment,this.user),"smartcontract")
  }

  update_network($event: any) {
    this.user.logout()
    this.user.network=$event.value
    this.sel_network=$event
  }

  update_expert_mode($event: any) {
    this.user.expert_mode=$event
    localStorage.setItem("expert_mode",$event ? "true" : "false")
  }
}
