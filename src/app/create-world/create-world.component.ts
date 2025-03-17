import { Component, inject, OnInit} from '@angular/core';
import {MatAccordion, MatExpansionPanel, MatExpansionPanelHeader} from "@angular/material/expansion";
import {MatTab, MatTabGroup} from "@angular/material/tabs";
import {DecimalPipe, Location, NgIf} from "@angular/common";
import {InputComponent} from '../input/input.component';
import {$$, getParams, showMessage} from '../../tools';
import {ActivatedRoute, Router} from '@angular/router';
import {
  add_icon, distance,
  Game,
  initializeMap,
  Point3D,
  polarToCartesian,
  share_game
} from '../tokenworld';
import {environment} from '../../environments/environment';
import {MatButton} from '@angular/material/button';
import {Clipboard} from '@angular/cdk/clipboard';
import {MatSnackBar} from '@angular/material/snack-bar';
import {TokenTransfer} from '@multiversx/sdk-core/out';
import {UserService} from '../user.service';
import * as L from 'leaflet';
import {level, send_transaction, send_transaction_with_transfers} from '../mvx';
import {HourglassComponent, wait_message} from '../hourglass/hourglass.component';
import {GeolocService} from '../geoloc.service';
import {LatLng, Marker} from 'leaflet';
import {MatDialog} from '@angular/material/dialog';
import {ApiService} from '../api.service';
import {MatSlideToggle} from '@angular/material/slide-toggle';
import {FormsModule} from '@angular/forms';
import {TutoComponent} from '../tuto/tuto.component';
import {MatIcon} from '@angular/material/icon';
import {eval_direct_url_xportal} from '../../crypto';
import {DeviceService} from '../device.service';
import {NgNavigatorShareService} from 'ng-navigator-share';
import {QRCodeComponent} from 'angularx-qrcode';
import {MatLabel} from '@angular/material/form-field';
import {settings} from '../../environments/settings';

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
    HourglassComponent,
    MatSlideToggle,
    FormsModule,
    TutoComponent,
    MatIcon,
    MatAccordion,
    QRCodeComponent,
    MatLabel
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
  location=inject(Location)
  shareService=inject(NgNavigatorShareService)
  dialog=inject(MatDialog)
  api=inject(ApiService)
  device=inject(DeviceService)

  grid=20
  quota=20
  fee=5
  zone:any= {
    entrance:new Point3D(0,0,0),
    exit:new Point3D(0,0,0),
    min_distance: 1,
    max_distance: 10,
    n_degrees: 8,
    map: "map",
    zoom: 16
  }
  yaml_content: string=""
  script_content: string=""
  max_player=100
  turns=0
  map!: L.Map
  args: any;
  lifepoint=0;
  welcome_pack=0;
  title="My Game"
  real: boolean=true
  message: string=""
  dropzone: LatLng=new LatLng(0,0)
  private exit_marker: null | Marker<any>=null
  private entrance_marker: null | Marker<any>=null
  max_visibility=200
  min_visibility=10
  max_distance=100
  min_distance=1
  n_degrees=8
  min_pv: number=0
  max_pv: number=100
  hp_balance=0

  max_per_user: number = 30;
  tokemon_vision: boolean=false;
  to_add=""
   created_game: Game | null=null
  max_to_engage=100;

  update_zone(type_update="move"){
    this.zone.zoom = this.map.getZoom()
    this.zone.ne = this.map.getBounds().getNorthEast()
    this.zone.sw = this.map.getBounds().getSouthWest()
    this.zone.center=this.user.center_map

    if(type_update=="zoom"){
      this.min_distance_for_gps=Math.round(distance(this.zone.ne,this.zone.sw)/30)
      if(this.min_distance_for_gps<50)this.min_distance_for_gps=50
      if(this.min_distance_for_gps>5000)this.min_distance_for_gps=5000
    }

    $$("Mise a jour de la zone ",this.zone)
  }


  async ngOnInit() {

    let params:any=await getParams(this.routes)
    await this.user.login(this,"You must login to the blockchain to create a game","",false)

    this.zone={
      map:"map",
      zoom:params.zoom || this.user.zoom || 14,
      entrance:new Point3D(0,0,0),
      exit: new Point3D(0,0,0),
      center:new LatLng(params.lat || 0,params.lng || 0),
      title:"mon titre"
    }
    $$("Appel de onInit, initialisation de zone ",this.zone)


    if(params.hasOwnProperty("zone")) {
      this.zone = params.zone
      $$("Récupération de la zone ",this.zone)
    }else{
      if(params.hasOwnProperty("lat") && params.hasOwnProperty("lng")){
        this.zone.center=new LatLng(params.lat,params.lng)
      }else{

        $$("La zone n'est pas en parametre, on localise")
        try{
          await this.user.geoloc(this.geolocService,null,10000000)
          this.zone.center=new LatLng(this.user.loc.coords.latitude,this.user.loc.coords.longitude)
        }catch(e:any){
          showMessage(this,e)
          this.zone.center=new LatLng(48,2)
          this.zone.zoom=6
        }
      }
    }

    try{
      await this.user.init_balance(this.api)
      this.hp_balance=this.user.get_balance(this.user.get_default_token())
    }catch(e){
      this.hp_balance=100
    }

    try{
      $$("Initialisation de la carte avec ",this.zone)
      this.map = L.map('map', {keyboard: true, scrollWheelZoom: true})
      initializeMap(this, this.zone, this.zone.center, "");
      if(this.map){
        $$("Positionnement des evenements")
        this.map
          .on("moveend", (event: L.LeafletEvent) => {this.update_zone("move")})
          .on("zoomend", (event: L.LeafletEvent) => {this.update_zone("zoom")})
          .on("click", (event: any) => {
            this.dropzone=event.latlng
            if(this.to_add!=''){this.drop_pt(this.to_add)}
          })
      }
    }catch (e) {
      $$("Error ",e)
    }
    this.map.setView(this.zone.center, this.zone.zoom)
    this.update_zone()
  }



  quit(game:any){
    if(!game){
      this.location.back()
    }else{
      this.user.init_game(game)
      this.router.navigate( ["map"])
    }
  }



  open_xportal() {
    open(eval_direct_url_xportal(this.user.provider.uri))
  }


  async create_game() {
    if(this.max_to_engage<this.max_per_user){
      showMessage(this,"Maximum engagement must be inferior to maximum HP per user")
      return
    }

    await this.user.login(this,"Authentification required to create a new game","",true,0.01)

    $$("Login user ",this.user)

    $$("Creation d'une partie avec ",this.zone)
    $$("Entrance ",this.zone.entrance)
    $$("Exit ",this.zone.exit)

    let entrance = this.zone.entrance && this.zone.entrance.x+this.zone.entrance.y!=0  ? polarToCartesian(this.zone.entrance, environment.scale_factor,environment.translate_factor) : new Point3D(0,0,0)
    let exit =  this.zone.exit && this.zone.exit.y+this.zone.exit.x!=0  ? polarToCartesian(this.zone.exit, environment.scale_factor,environment.translate_factor) : new Point3D(0,0,0)
    let ne = polarToCartesian(this.zone.ne, environment.scale_factor,environment.translate_factor)
    let sw = polarToCartesian(this.zone.sw, environment.scale_factor,environment.translate_factor)

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

      this.min_distance*environment.scale_factor, this.max_distance*environment.scale_factor,this.n_degrees,

      "map",

      this.min_visibility*environment.scale_factor, this.max_visibility*environment.scale_factor,
      this.min_pv,this.max_pv,this.max_per_user,
      this.max_player,
      this.turns,

      this.geoloc_to_catch,
      this.geoloc_to_drop,
      this.tokemon_vision,
      this.user_visibility,

      this.cost_to_move,this.cost_to_fight,
      this.min_distance_for_gps,
      this.max_to_engage,
      this.attacker_part,this.defender_part,

      this.welcome_pack
    ]
    $$("Appel de la fonction avec les arguments ",this.args)

    try {
      wait_message(this,"Your world is under construction  ...")
      let rc:any=await send_transaction(this.user,"add_game",this.args)
      if(rc.returnMessage!="ok"){
        showMessage(this,rc.returnMessage)
        wait_message(this)
      }else{
        let create_game=rc.values[0]
        if(this.lifepoint>0 && create_game){
          wait_message(this,"Initialize HP stock with "+this.lifepoint+" HP from your wallet")
          $$("Transfert de lifepoint "+this.lifepoint)
          let tokens=[TokenTransfer.fungibleFromAmount(this.user.get_default_token(),this.lifepoint,18)]
          rc=await send_transaction_with_transfers(this.user,"fund_game",[create_game.id],tokens)
        }
        wait_message(this)
        this.created_game=create_game
        let result=await share_game(this,this.created_game,"Join my game to find NFT with Tokemon World",false,false)
        this.qrcode=result.shorturl
      }
    } catch (e:any) {
      showMessage(this,e)
      wait_message(this)
    }

  }



  copy(txt: string) {
    this.clipboard.copy(txt)
    showMessage(this,"Copied")
  }



  drop_pt(point_type="") {
    $$("Ajout de "+point_type+" sur ",this.dropzone)
    if(point_type=="entrance"){
      this.zone.entrance=this.dropzone
      if(!this.entrance_marker){
        this.entrance_marker=add_icon(this.map,"./assets/icons/entrance.png",this.dropzone)
      }else{
        this.entrance_marker.setLatLng(this.dropzone)
      }
    }
    if(point_type=="exit"){
      this.zone.exit=this.dropzone
      if(!this.exit_marker){
        this.exit_marker=add_icon(this.map,"./assets/icons/exit.png",this.dropzone)
      }else{
        this.exit_marker.setLatLng(this.dropzone)
      }
    }
    this.to_add=""
  }


  remove_entrance() {
    this.zone.entrance=new Point3D(0,0,0)
    this.entrance_marker?.removeFrom(this.map)
    this.entrance_marker=null
  }

  remove_exit() {
    this.zone.exit=new Point3D(0,0,0)
    this.exit_marker?.removeFrom(this.map)
    this.exit_marker=null
  }


  async recenter() {
    let pos=await this.user.geoloc(this.geolocService)
    this.map.setView(pos,this.user.zoom)
  }

  enter_game(){
    this.quit(this.created_game)
  }

  protected readonly Math = Math;
  cost_to_move: number=0
  cost_to_fight: number=1
  link_to_share: string = "";
  min_distance_for_gps=100
  geoloc_to_drop=false
  geoloc_to_catch=true
  user_visibility: boolean = true
  qrcode=""


  async share() {
    let result=await share_game(this,this.created_game,"Join my game to find NFT with Tokemon World")
  }

  protected readonly level = level;
  attacker_part: number = 25;
  defender_part: number = 50;

  open_game(url: string) {
    open(url,"new_game")
  }

  protected readonly settings = settings;
  max_gift: number=100

  async update_bank($event: any) {
    this.lifepoint=$event
    if(this.lifepoint>0){
      this.max_gift=Math.round($event/50)
      if(this.max_gift<50)this.max_gift=50
      this.welcome_pack=Math.min(this.welcome_pack,this.max_gift)
    }
  }

  async login() {
    await this.user.login(this,"","",true,0,"Connect to set your balance of HP")
    await this.user.init_balance(this.api)
    this.hp_balance=this.user.get_balance(this.user.get_default_token())
  }
}
