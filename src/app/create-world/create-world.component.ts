import {AfterViewInit, Component, inject} from '@angular/core';
import {MatExpansionPanel, MatExpansionPanelHeader} from "@angular/material/expansion";
import {MatTab, MatTabGroup} from "@angular/material/tabs";
import {DecimalPipe, NgIf} from "@angular/common";
import {InputComponent} from '../input/input.component';
import {$$, getParams, showError, showMessage} from '../../tools';
import {ActivatedRoute, Router} from '@angular/router';
import {cartesianToPolar, initializeMap, Point3D, polarToCartesian} from '../tokenworld';
import {environment} from '../../environments/environment';
import {MatButton} from '@angular/material/button';
import {Clipboard} from '@angular/cdk/clipboard';
import {MatSnackBar} from '@angular/material/snack-bar';
import {BytesValue, StringType, StringValue, TokenIdentifierValue, TokenTransfer} from '@multiversx/sdk-core/out';
import {UserService} from '../user.service';
import * as L from 'leaflet';
import {send_transaction_with_transfers} from '../mvx';
import {wait_message} from '../hourglass/hourglass.component';

@Component({
  selector: 'app-create-world',
  standalone: true,
  imports: [
    MatExpansionPanel,
    MatExpansionPanelHeader,
    MatTab,
    MatTabGroup,
    NgIf,
    InputComponent,
    DecimalPipe,
    MatButton
  ],
  templateUrl: './create-world.component.html',
  styleUrl: './create-world.component.css'
})
export class CreateWorldComponent implements AfterViewInit {
  routes=inject(ActivatedRoute)
  clipboard=inject(Clipboard)
  toast=inject(MatSnackBar)
  user=inject(UserService)
  router=inject(Router)

  grid=20
  quota=20
  fee=5
  zone:any
  yaml_content: string=""
  script_content: string=""
  max_player=100
  turns=0
  map!: L.Map
  args: any;
  lifepoint=0;
  title="Mon titre"
  real: boolean=true

  async ngAfterViewInit() {
    let params:any=await getParams(this.routes)
    $$("Récupération de la zone ",this.zone)
    if(params.hasOwnProperty("min_visibility")){
      this.zone=params
    }else{
      this.zone={
        min_visibility:10,
        max_visibility:100,
        min_distance:1,
        max_distance:10,
        n_degrees: 8,
        map:"map",
        title:"mon titre"
      }
    }


    this.update_yaml()

    this.map=L.map('map',{ keyboard:true,scrollWheelZoom:true})
    initializeMap(this,this.user,this.user.center_map,"")
      .on("moveend",(event:L.LeafletEvent)=> {
        this.zone.NE=this.map.getBounds().getNorthEast()
        this.zone.SW=this.map.getBounds().getSouthWest()
      })
      .on("zoomend",(event:L.LeafletEvent)=> {
        this.zone.zoom=this.map.getZoom()
      })
      .on("click",(event:L.LeafletEvent)=> {
        this.zone.entrance=event.target
      })
      .on("dblclick",(event:L.LeafletEvent)=> {
        this.zone.exit=event.target
      })

    this.map.setView(this.zone.center,this.zone.zoom)

  }

  update_yaml(){

    let entrance=polarToCartesian(this.zone.entrance,environment.scale_factor)
    let exit=polarToCartesian(this.zone.exit,environment.scale_factor)
    let ne=polarToCartesian(this.zone.NE,environment.scale_factor)
    let sw=polarToCartesian(this.zone.SW,environment.scale_factor)

    let s="title: Map de test\nauthor: hhoareau\n"
    s=s+"\nsettings:\n"
    s=s+"\tfee: "+this.fee+"\n"
    s=s+"\tmap: map\n"
    s=s+"\tlimits:\n"
    s=s+"\t\tNE: "+ne.x+","+ne.y+","+ne.z+"\n"
    s=s+"\t\tSW: "+sw.x+","+sw.y+","+sw.z+"\n"
    s=s+"\tEntrance: "+entrance.x+","+entrance.y+","+entrance.z+"\n"
    s=s+"\tExit: "+exit.x+","+exit.y+","+exit.z+"\n"


    this.args=[
      this.grid,this.quota,
      entrance.x,entrance.y,entrance.z,exit.x,exit.y,exit.z,
      ne.x,ne.y,ne.z,sw.x,sw.y,sw.z,
      this.zone.min_distance,this.zone.max_distance,this.zone.n_degrees,
      new StringValue("map"),
      this.max_player,this.turns
    ]
  }

  quit(){
    this.router.navigate( ["map"])
  }


  async create_game() {
    let tokens=[]
    if(this.lifepoint>0)tokens.push(TokenTransfer.fungibleFromAmount(this.user.get_default_token(),this.lifepoint,18))
    try {
      let tx = await send_transaction_with_transfers(this.user.provider,"add_game",this.args,this.user,tokens)
      wait_message(this)
    } catch (e) {
      showError(this, e)
      wait_message(this)
    }
    this.quit()
  }

  copy(txt: string) {
    this.clipboard.copy(txt)
    showMessage(this,"Copied")
  }
}
