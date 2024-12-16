import {AfterViewInit, Component, inject, OnInit} from '@angular/core';
import {MatExpansionPanel, MatExpansionPanelHeader} from "@angular/material/expansion";
import {MatTab, MatTabGroup} from "@angular/material/tabs";
import {DecimalPipe, NgIf} from "@angular/common";
import {InputComponent} from '../input/input.component';
import {$$, getParams, showError, showMessage} from '../../tools';
import {ActivatedRoute, Router} from '@angular/router';
import {add_icon, cartesianToPolar, center_of, initializeMap, Point3D, polarToCartesian} from '../tokenworld';
import {environment} from '../../environments/environment';
import {MatButton} from '@angular/material/button';
import {Clipboard} from '@angular/cdk/clipboard';
import {MatSnackBar} from '@angular/material/snack-bar';
import {BytesValue, StringType, StringValue, TokenIdentifierValue, TokenTransfer} from '@multiversx/sdk-core/out';
import {UserService} from '../user.service';
import * as L from 'leaflet';
import {send_transaction, send_transaction_with_transfers} from '../mvx';
import {HourglassComponent, wait_message} from '../hourglass/hourglass.component';
import {GeolocService} from '../geoloc.service';
import {LatLng, Marker, point} from 'leaflet';
import {MatDialog} from '@angular/material/dialog';
import {ApiService} from '../api.service';

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
    MatButton,
    HourglassComponent
  ],
  templateUrl: './create-world.component.html',
  styleUrl: './create-world.component.css'
})
export class CreateWorldComponent implements OnInit {
  routes=inject(ActivatedRoute)
  clipboard=inject(Clipboard)
  toast=inject(MatSnackBar)
  user=inject(UserService)
  router=inject(Router)
  geolocService=inject(GeolocService)
  dialog=inject(MatDialog)
  api=inject(ApiService)

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
  lifepoint=1;
  title="Mon titre"
  real: boolean=true
  message: string=""
  show_menu: boolean=false
  dropzone: LatLng=new LatLng(0,0);
  private exit_marker: null | Marker<any>=null
  private entrance_marker: null | Marker<any>=null

  update_zone(){
    this.zone.zoom = this.map.getZoom()
    this.zone.NE = this.map.getBounds().getNorthEast()
    this.zone.SW = this.map.getBounds().getSouthWest()
  }

  add_marker(){

  }

  refresh(){

  }

  async ngOnInit() {
    $$("Appel de onInit")
    this.zone={
      min_visibility:10,
      max_visibility:100,
      min_distance:1,
      max_distance:10,
      n_degrees: 8,
      map:"map",
      zoom:16,
      entrance:new LatLng(0,0),
      exit: new LatLng(0,0),
      center:new LatLng(44,2),
      title:"mon titre"
    }

    let params:any=await getParams(this.routes)

    if(params.hasOwnProperty("zone")) {
      this.zone = params.zone
      $$("Récupération de la zone ",this.zone)
    } else {
      if(await this.user.geoloc(this.geolocService)){
        this.zone.center=new LatLng(this.user.loc.coords.latitude,this.user.loc.coords.longitude)
      }
    }


    $$("Initialisation de la carte avec ",this.zone)
    this.map = L.map('map', {keyboard: true, scrollWheelZoom: true})
    initializeMap(this, this.zone, this.zone.center, "")
      .on("moveend", (event: L.LeafletEvent) => {
        this.update_zone()
      })
      .on("zoomend", (event: L.LeafletEvent) => {
        this.update_zone()
      })
      .on("click", (event: any) => {
        this.dropzone=event.latlng
        this.show_menu=!this.show_menu
      })

    this.map.setView(this.zone.center, this.zone.zoom)
    this.update_zone()
  }


  quit(){
    this.router.navigate( ["games"])
  }


  async create_game() {

    await this.user.login(this,"Authentification required to create a new game","",true)

    $$("Creation d'une partie avec ",this.zone)

    let entrance = this.zone.exit.lng+this.zone.exit.lng!=0  ? polarToCartesian(this.zone.entrance, environment.scale_factor) : new Point3D(0,0,0)
    let exit =  this.zone.exit.lat+this.zone.exit.lat!=0  ? polarToCartesian(this.zone.exit, environment.scale_factor) : new Point3D(0,0,0)
    let ne = polarToCartesian(this.zone.NE, environment.scale_factor)
    let sw = polarToCartesian(this.zone.SW, environment.scale_factor)

    let s = "title: Map de test\nauthor: hhoareau\n"
    s = s + "\nsettings:\n"
    s = s + "\tfee: " + this.fee + "\n"
    s = s + "\tmap: map\n"
    s = s + "\tlimits:\n"
    s = s + "\t\tNE: " + ne.x + "," + ne.y + "," + ne.z + "\n"
    s = s + "\t\tSW: " + sw.x + "," + sw.y + "," + sw.z + "\n"
    s = s + "\tEntrance: " + entrance.x + "," + entrance.y + "," + entrance.z + "\n"
    s = s + "\tExit: " + exit.x + "," + exit.y + "," + exit.z + "\n"
    this.yaml_content=s

    this.args = [
      this.title,
      this.grid,
      this.quota,

      entrance.x, entrance.y, entrance.z,
      exit.x, exit.y, exit.z,
      ne.x, ne.y, ne.z,
      sw.x, sw.y, sw.z,

      this.zone.min_distance, this.zone.max_distance,this.zone.n_degrees,

      "map",
      this.zone.min_visibility,this.zone.max_visibility,
      this.max_player,
      this.turns
    ]

    let tokens=[]

    try {
      wait_message(this,"Your world is building ...")
      tokens.push(TokenTransfer.fungibleFromAmount(this.user.get_default_token(),this.lifepoint,18))
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

  drop_pt(point_type="") {
    if(point_type=="entrance"){
      if(!this.entrance_marker){
        this.entrance_marker=add_icon(this.map,"https://tokemon.f80.fr/assets/icons/flag.png",this.dropzone)
      }else{
        this.zone.entrance=this.dropzone
        this.entrance_marker.setLatLng(this.dropzone)
      }
    }
    if(point_type=="exit"){
      if(!this.exit_marker){
        this.exit_marker=add_icon(this.map,"https://tokemon.f80.fr/assets/icons/flag.png",this.dropzone)
      }else{
        this.zone.exit=this.dropzone
        this.exit_marker.setLatLng(this.dropzone)
      }

    }
    this.show_menu=false
  }
}
