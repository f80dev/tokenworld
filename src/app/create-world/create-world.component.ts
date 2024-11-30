import {AfterViewInit, Component, inject} from '@angular/core';
import {MatExpansionPanel, MatExpansionPanelHeader} from "@angular/material/expansion";
import {MatTab, MatTabGroup} from "@angular/material/tabs";
import {DecimalPipe, NgIf} from "@angular/common";
import {InputComponent} from '../input/input.component';
import {getParams} from '../../tools';
import {ActivatedRoute} from '@angular/router';
import {latLonToCartesian} from '../tokenworld';
import {environment} from '../../environments/environment';

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
    DecimalPipe
  ],
  templateUrl: './create-world.component.html',
  styleUrl: './create-world.component.css'
})
export class CreateWorldComponent implements AfterViewInit {
  routes=inject(ActivatedRoute)


  grid=20
  quota=20
  fee=5
  zone:any={NE:{lat:0,lng:0},SW:{lat:0,lng:0}}
  yaml_content: string=""

  async ngAfterViewInit() {
    this.zone=await getParams(this.routes)
    this.update_yaml()
  }

  update_yaml(){
    let ne=latLonToCartesian(this.zone.NE.lat,this.zone.NE.lng,environment.scale_factor)
    let sw=latLonToCartesian(this.zone.SW.lat,this.zone.SW.lng,environment.scale_factor)

    let s="title: Map de test\nauthor: hhoareau\n"
    s=s+"settings:\n"
    s=s+"\tfee: "+this.fee+"\n"
    s=s+"\tmap: map"
    s=s+"\tlimits:\n"
    s=s+"\t\tNE: "+ne.x+","+ne.y+","+ne.z+"\n"
    s=s+"\t\tSW: "+sw.x+","+sw.y+","+sw.z+"\n"

    this.yaml_content=s
  }



}
