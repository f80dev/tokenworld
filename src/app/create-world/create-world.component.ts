import {AfterViewInit, Component, inject} from '@angular/core';
import {MatExpansionPanel, MatExpansionPanelHeader} from "@angular/material/expansion";
import {MatTab, MatTabGroup} from "@angular/material/tabs";
import {DecimalPipe, NgIf} from "@angular/common";
import {InputComponent} from '../input/input.component';
import {$$, getParams, showMessage} from '../../tools';
import {ActivatedRoute} from '@angular/router';
import {cartesianToPolar, initializeMap, Point3D, polarToCartesian} from '../tokenworld';
import {environment} from '../../environments/environment';
import {MatButton} from '@angular/material/button';
import {Clipboard} from '@angular/cdk/clipboard';
import {MatSnackBar} from '@angular/material/snack-bar';
import {BytesValue, StringValue, TokenIdentifierValue} from '@multiversx/sdk-core/out';
import {UserService} from '../user.service';
import * as L from 'leaflet';

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

  grid=20
  quota=20
  fee=5
  zone:any
  yaml_content: string=""
  script_content: string=""
  max_player=100
  turns=0
  map!: L.Map

  async ngAfterViewInit() {
    this.zone=await getParams(this.routes)
    $$("Récupération de la zone ",this.zone)

    this.zone.min_visibility=10
    this.zone.max_visibility=100
    this.zone.min_distance=1
    this.zone.max_distance=10
    this.zone.n_degrees=8
    this.zone.map=BytesValue.fromUTF8("map").toString()
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

    this.yaml_content=s.replaceAll("\n","<br>").replaceAll("\t","&nbsp;")
    this.script_content="mxpy contract deploy --metadata-payable --metadata-not-upgradeable --recall-nonce" +
      "        --bytecode=./output/tokemonworld.wasm" +
      "        --pem=./wallet/owner.pem" +
      "        --gas-limit 70000000" +
      "        --proxy $PROXY --chain D" +
      "        --arguments $FEE $GRID $QUOTA $SCALE_FACTOR $ENTRANCE_X $ENTRANCE_Y $EXIT_X $EXIT_Y $NE_X $NE_Y $SW_X $SW_Y $MOVE_MIN $MOVE_MAX $N_DEGREES $MAP_PATH $MIN_VISIBILITY $MAX_VISIBILITY $MAX_PLAYERS $TURN" +
      "        --send" +
      "        --outfile=./output/deploy-devnet.interaction.json"

    this.script_content=this.script_content
      .replace("$FEE",String(this.fee))
      .replace("$GRID",String(this.grid))
      .replace("$QUOTA",String(this.fee))
      .replace("$SCALE_FACTOR",String(this.fee))

      .replace("$ENTRANCE_X",String(entrance.x)).replace("$ENTRANCE_Y",String(entrance.y)).replace("$ENTRANCE_Z",String(entrance.z))
      .replace("$EXIT_X",String(exit.x)).replace("$EXIT_Y",String(exit.y)).replace("$EXIT_Z",String(exit.z))
      .replace("$NE_X",String(this.zone.NE.x)).replace("$NE_Y",String(this.zone.NE.y)).replace("$NE_Z",String(this.zone.NE.z))
      .replace("$SW_X",String(this.zone.SW.x)).replace("$SW_Y",String(this.zone.SW.y)).replace("$SW_Z",String(this.zone.SW.z))

      .replace("$MOVE_MIN",this.zone.min_distance)
      .replace("$MOVE_MAX",this.zone.max_distance)
      .replace("$N_DEGREES",this.zone.n_degrees)

      .replace("$MAP_PATH",this.zone.map)
      .replace("$MIN_VISIBILITY",this.zone.min_visibility)
      .replace("$MAX_VISIBILITY",this.zone.max_visibility)
      .replace("$MAX_PLAYERS",String(this.max_player))
      .replace("$TURN",String(this.turns))

  }


  copy(txt: string) {
    this.clipboard.copy(txt)
    showMessage(this,"Copied")
  }
}
