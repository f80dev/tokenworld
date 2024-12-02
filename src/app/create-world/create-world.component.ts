import {AfterViewInit, Component, inject} from '@angular/core';
import {MatExpansionPanel, MatExpansionPanelHeader} from "@angular/material/expansion";
import {MatTab, MatTabGroup} from "@angular/material/tabs";
import {DecimalPipe, NgIf} from "@angular/common";
import {InputComponent} from '../input/input.component';
import {getParams} from '../../tools';
import {ActivatedRoute} from '@angular/router';
import {latLonToCartesian} from '../tokenworld';
import {environment} from '../../environments/environment';
import {MatButton} from '@angular/material/button';
import {Clipboard} from '@angular/cdk/clipboard';

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

  grid=20
  quota=20
  fee=5
  zone:any={NE:{lat:0,lng:0},SW:{lat:0,lng:0},entrance:{lat:0,lng:0},exit:{lat:0,lng:0}}
  yaml_content: string=""
  script_content: string=""

  async ngAfterViewInit() {
    this.zone=await getParams(this.routes)
    this.update_yaml()
    debugger
  }

  update_yaml(){
    let ne=latLonToCartesian(this.zone.NE.lat,this.zone.NE.lng,environment.scale_factor)
    let sw=latLonToCartesian(this.zone.SW.lat,this.zone.SW.lng,environment.scale_factor)
    let entrance=latLonToCartesian(this.zone.entrance.lat,this.zone.entrance.lng,environment.scale_factor)
    let exit=latLonToCartesian(this.zone.exit.lat,this.zone.exit.lng,environment.scale_factor)



    let s="title: Map de test\nauthor: hhoareau\n"
    s=s+"\nsettings:\n"
    s=s+"\tfee: "+this.fee+"\n"
    s=s+"\tmap: map"
    s=s+"\tlimits:\n"
    s=s+"\t\tNE: "+ne.x+","+ne.y+","+ne.z+"\n"
    s=s+"\t\tSW: "+sw.x+","+sw.y+","+sw.z+"\n"

    this.yaml_content=s.replaceAll("\n","<br>").replaceAll("\t","&nbsp;")
    this.script_content="mxpy contract deploy --metadata-payable --metadata-not-upgradeable --recall-nonce \\\n" +
      "        --bytecode=./output/tokemonworld.wasm \\\n" +
      "        --pem=./wallet/owner.pem \\\n" +
      "        --gas-limit 70000000 \\\n" +
      "        --proxy $PROXY --chain D \\\n" +
      "        --arguments $FEE $GRID $QUOTA $SCALE_FACTOR $ENTRANCE_X $ENTRANCE_Y $ENTRANCE_Z $EXIT_X $EXIT_Y $EXIT_Z $MOVE_MIN $MOVE_MAX $N_DEGREES $MAP_PATH $WIDTH $HEIGHT $MIN_VISIBILITY $MAX_VISIBILITY $MAX_PLAYERS $TURN \\\n" +
      "        --send \\\n" +
      "        --outfile=./output/deploy-devnet.interaction.json"

    this.script_content=this.script_content
      .replace("$FEE",this.fee.toString())
      .replace("$GRID",this.grid.toString())
      .replace("$QUOTA",this.fee.toString())
      .replace("$SCALE_FACTOR",this.fee.toString())
      .replace("$ENTRANCE_X",entrance.x.toString()).replace("$ENTRANCE_Y",entrance.y.toString()).replace("$ENTRANCE_Z",entrance.z.toString())
      .replace("$EXIT_X",exit.x.toString()).replace("$EXIT_Y",exit.y.toString()).replace("$EXIT_Z",exit.z.toString())
      .replace("$MOVE_MIN",this.zone.min_distance.toString())
      .replace("$MOVE_MAX",this.zone.max_distance.toString())
      .replace("$N_DEGREES",this.zone.n_degrees.toString())
      .replace("$FEE",this.fee.toString())
      .replace("$MAP_PATH",this.zone.map)
      .replace("$WIDTH",this.zone.width.toString())
      .replace("$HEIGHT",this.zone.height.toString())
      .replace("$MIN_VISIBILITY",this.zone.min_visibility.toString())
      .replace("$MAX_VISIBILITY",this.zone.max_visibility.toString())
      .replace("$MAX_PLAYERS",this.zone.max_players.toString())
      .replace("$TURN",this.zone.turn.toString())

  }


  copy(txt: string) {
    this.clipboard.copy(txt)
  }
}
