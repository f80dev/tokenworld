import {Component, inject, OnChanges, OnDestroy, OnInit} from '@angular/core';
import * as L from 'leaflet';
import {
  LatLng,
  LatLngBounds, LeafletEvent,
  LeafletMouseEvent,
  Marker, Point, Polyline,
  TileLayer
} from 'leaflet';
import {$$, getParams, setParams, showError, showMessage} from '../../tools';
import {GeolocService} from '../geoloc.service';
import {environment} from '../../environments/environment';
import {
  cartesianToPolar,
  distance,
  initializeMap,
  is_in,
  Point3D,
  polarToCartesian,
} from '../tokenworld';
import {UserService} from '../user.service';
import {ActivatedRoute, Router} from '@angular/router';
import {MatSnackBar} from '@angular/material/snack-bar';
import {MatIcon} from '@angular/material/icon';
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatSlideToggle} from '@angular/material/slide-toggle';
import {_prompt} from '../prompt/prompt.component';
import {FormsModule} from '@angular/forms';
import {NgIf} from '@angular/common';
import {InputComponent} from '../input/input.component';
import {MatSlider, MatSliderThumb} from '@angular/material/slider';
import {MatDialog} from '@angular/material/dialog';
import {Clipboard} from '@angular/cdk/clipboard';
import {ApiService} from '../api.service';
import {get_nft, level, query, send_transaction_with_transfers} from '../mvx';
import {HourglassComponent, wait_message} from '../hourglass/hourglass.component';
import {SwPush} from '@angular/service-worker';

export const baseMapURl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [
    MatIcon,
    MatIconButton,
    MatSlideToggle,
    FormsModule,
    MatButton,
    NgIf,
    InputComponent,
    MatSlider,
    MatSliderThumb,
    HourglassComponent
  ],
  templateUrl: './map.component.html',
  styleUrl: './map.component.css'
})
export class MapComponent implements OnChanges,OnInit,OnDestroy  {
  start_move: LatLng | null=null
  marker_line: Polyline<any, any> | null=null
  private tokemon_to_move: any;

    readonly vapidKeys={"publicKey":"BMRr6rYJ9YOHdq8GKw2QKXAsYC3Em5bdq2jSW8oxgn8WX2i94oStaXLhuse9lMKZ8SFr89P-jyHtyjCBomFG6-k","privateKey":"lz9N-kcIitF2sP3ClgeVwROuxeGY6pAQDCV7X_aeePY"}



  router=inject(Router)
  geolocService=inject(GeolocService)
  user=inject(UserService)
  notificationService=inject(SwPush)
  toast=inject(MatSnackBar)
  dialog=inject(MatDialog)
  clipboard=inject(Clipboard)
  api=inject(ApiService)

  map: L.Map | null = null
  markers:L.Marker[]=[]

  center: any;
  private layer: TileLayer | undefined
  routes=inject(ActivatedRoute)

  map_left=0
  map_top=0
  show_help=false
  selected_marker: L.Marker | null=null
  selected_tokemon: any | null = null
  to_attack: any | null = null
  me_marker: Marker | undefined
  geoloc_autorefresh: any
  message: string=""
  old_pos: LatLng = new LatLng(0,0)
  last_tokemon_list: any[]=[]
  help_message: string=""
  message_counter: number=0;

  ngOnDestroy(): void {
    clearInterval(this.geoloc_autorefresh)
  }


  async init_map(){
    $$("Initialisation de la carte principal")
    try{
      this.map=L.map('map',{ keyboard:true,scrollWheelZoom:true})
    }catch (e) {
      showError(this,e)
    }
    $$("Fin d'initialisation de la carte")
    let zoom=16

    if(this.user.game){
      let ne=cartesianToPolar(this.user.game.ne,environment.scale_factor,environment.translate_factor)
      let sw=cartesianToPolar(this.user.game.sw,environment.scale_factor,environment.translate_factor)
      L.rectangle(new LatLngBounds(sw,ne),{fillColor:"grey",color:"grey"}).addTo(this.map!);

      $$("Positionnement d'une limite ",{ne:ne,sw:sw})
      $$("Entrée dans "+this.user.game.title)
    }


    initializeMap(this,this.user.game,this.user.center_map,"./assets/icons/person.png")
    if(this.map){
      this.map
        .on("zoom",(event:L.LeafletEvent)=>{
          this.user.zoom=this.map!.getZoom()
        })
        .on("moveend",(event:L.LeafletEvent)=>this.movemap(event))
        .on("mousemove",(event:L.LeafletEvent)=>this.mousemove(event))
        .on("keypress",(event:L.LeafletKeyboardEvent)=>{
          //https://leafletjs.com/reference.html#keyboardevent
          if(event.originalEvent.key=="c"){
            //let origin=latLonToCartesian(this.map.getBounds().getNorthEast().lat,this.map.getBounds().getNorthEast().lng,this.map.getZoom())
            let pos=polarToCartesian(this.user.center_map,environment.scale_factor,environment.translate_factor)
            this.clipboard.copy(pos.x+","+pos.y)
            showMessage(this,"Position copied")
          }
        })
    }

    if(this.user.game?.geoloc_to_catch){
      $$("La partie utilise la géoloc donc on centre la carte sur la geoloc")
      this.refresh_geoloc()
      this.recenter()
    } else {

      $$("La partie ne repose pas sur la géoloc donc on se positionne sur la derniere position si elle est dans la partie")
      let params:any=await getParams(this.routes)
      if(params.lng && params.lat){
        this.user.center_map=new LatLng(params.lat,params.lng)
      }else{
        this.user.center_map=new LatLng(Number(localStorage.getItem("last_position_lat") || "0"),Number(localStorage.getItem("last_position_lng") || "0"))
      }
      if(params.zoom)zoom=params.zoom

      if(!is_in(this.user.center_map,this.user.game!)) {
        $$("La dernière position n'est pas dans la partie, on recentre sur la partie")
        this.recenter()
      }
    }

    this.map!.setView(this.user.center_map,zoom);
  }



  async refresh_geoloc(){
    if(this.user.game && this.user.game?.geoloc_to_catch){
      try{
        let new_pos=await this.user.geoloc(this.geolocService,this.me_marker,this.user.game!.gps_tolerance)
        let distance_from_last_geoloc=distance(new_pos,this.old_pos)
        if(distance_from_last_geoloc>this.user.game!.min_distance_to_refresh_map){
          $$("Refresh car distance parcouru supérieure à ",this.user.game!.min_distance_to_refresh_map)
          this.old_pos=new_pos
          this.refresh(new_pos)
          this.me_marker!.addTo(this.map!)
        }else{
          $$("Distance depuis la dernière géoloc insuffisante pour un refresh")
        }
      }catch (e:any){
        if(this.old_pos.lat==0 && this.old_pos.lng==0){
          this.remove_markers_from_map()
          this.old_pos=new LatLng(0,0)
        }
        this.help_message="Not enought accuracy to show tokemons around. Activate your GPS"
        this.message_counter=this.message_counter+1
        if(this.message_counter % 10==0)showMessage(this,this.help_message)
        $$("Précision insuffisante")
        this.me_marker!.removeFrom(this.map!)
      }
    }
  }



  async showNotification() {
    navigator.vibrate(1000)

    // let notif=new Notification("New Notification!",{
    //   "data": {
    //     "onActionClick": {
    //       "default": {"operation": "openWindow", "url": "foo"}
    //     }
    //   }
    // })
    // this.notificationService.notificationClicks.subscribe({action:""next})
  }



  async ngOnInit() {
    this.user.login(this,"","",false,0,"",true)
    if(this.user && this.user.game){
      setTimeout(async ()=>{
        await this.init_map()
        this.refresh_geoloc()
      },500)
      this.geoloc_autorefresh=setInterval(async ()=>{this.refresh_geoloc()},environment.geoloc_interval)
    }else{
      $$("user n'a pas sélectionné de map ",this.user)
      this.router.navigate(["games"],{queryParams:{autoconnect:false}})
    }
  }


  async open_drop() {
    let drop_pos=polarToCartesian(this.user.center_map,environment.scale_factor,environment.translate_factor)

    //voir https://docs.multiversx.com/sdk-and-tools/sdk-js/sdk-js-cookbook-v13#encoding-a-custom-type
    if(this.user.game?.geoloc_to_drop && this.user.idx!=this.user.game.owner){
      try{
        this.user.center_map=await this.user.geoloc(this.geolocService,this.me_marker,this.user.game.gps_tolerance)
        this.map?.setView(this.user.center_map,this.user.zoom)
      }catch (e) {
        $$("Impossible de drop par manque de précision du GPS")
        showMessage(this,"Localisation failed, drop cancel")
        return
      }
    }

    let message=await query("can_drop",[this.user.game!.id,drop_pos.x,drop_pos.y,drop_pos.z],this.user.get_sc_address(),this.user.network)
    if(message!='' && this.user.game!.owner!=this.user.idx){
      showMessage(this,message)
    }else{
      let bounds=this.map!.getBounds()
      let southWest = bounds.getNorthWest();
      let northEast = bounds.getNorthEast();
      //var distance = (this.user.visibility/screen.availWidth)*this.map!.distance(southWest, northEast)
      let position=setParams({lat:this.user.center_map?.lat,lng:this.user.center_map?.lng,game_id:this.user.game!.id},"","")
      setTimeout(()=>{
        this.router.navigate(["drop"],{queryParams:{p:position}})
      },200)

    }
  }


  ngOnChanges(changes: any): void {
    //if(!changes.lat.firstChange)this.map.setView(this.user.loc,this.user.zoom || 16);;
  }




  add_tokemon_as_marker(uri:string,position:Point3D,label:string,alt:any,size=50){
    let giftIcon = L.icon({
      iconUrl: uri,
      iconSize: [size, size],// size of the icon
      iconAnchor: [size/2, size/2], // point of the icon which will correspond to marker's location
    })
    let coords = cartesianToPolar(position,environment.scale_factor,environment.translate_factor)

    let marker = L.marker(coords, {icon: giftIcon, alt:alt})
    marker.bindTooltip(label).openTooltip()
    marker.on("mouseover", (event) => {this.mouseover(event)})
    marker.on("dblclick", (event) => {this.open_nft(event)})
    marker.on("click", (event) => {this.select_nft(event)})
    marker.addTo(this.map!)
    return marker
  }



  remove_markers_from_map() {
    $$("Suppression des marker de la map")
    for(let m of this.markers){
      m.removeFrom(this.map!)
    }
  }


  async add_tokemon_to_markers(center:LatLng) {
    return new Promise(async (resolve,reject) => {

      if(this.user.game) {

        this.remove_markers_from_map()
        this.markers=[]

        let pos = polarToCartesian(center,environment.scale_factor,environment.translate_factor)
        $$("Evaluation de la position de reference ",pos)

        if(this.user.game.tokemon_view){
          let args = [this.user.game.id,this.user.address]
          $$("Chargement des tokemons vu par les tokemons de l'utilisateur ",args)
          this.user.tokemons = await query("show_tokemon_by_tokemon",  args,this.user.get_sc_address(),this.user.network);
          if(this.user.tokemons.length==0)this.help_message="Drop some tokemons to see other tokemons"
        }else{
          let args = [this.user.game.id, pos.x, pos.y,pos.z]
          $$("Chargement des tokemons autour de la position de reference ",args)
          this.user.tokemons = await query("show_nfts",  args,this.user.get_sc_address(),this.user.network);
          if(this.user.tokemons.length==0){
            this.help_message=this.user.game.geoloc_to_catch ? "Move to find some tokemons in the games" : "Move the target to find some tokemons"
          }
        }

        if(this.user.tokemons.length>this.last_tokemon_list.length){
          this.showNotification()
        }
        this.last_tokemon_list=this.user.tokemons

        $$("Chargement de " + this.user.tokemons.length + " tokemons")
        $$("Liste des tokemons ",this.user.tokemons)

        for (let tokemon of this.user.tokemons) {
          tokemon.name=new TextDecoder().decode(tokemon.name)
          let icon=(tokemon.owner==this.user.idx ? "./assets/icons/push_pin_blue.svg" : './assets/icons/push_pin_red.svg')

          if(this.user.preview){
            let nonce=tokemon.nonce.toString(16)
            let nft_id=tokemon.nft+"-"+(nonce.length<2 ? "0"+nonce : nonce)

            let opt:any=await get_nft(nft_id,this.api,this.user.network)
            $$("Récupération du nft ",opt)
            this.markers.push(this.add_tokemon_as_marker(opt.media[0].originalUrl,tokemon.position,tokemon.name+" ("+Number(tokemon.pv)+" LP)",tokemon,50))
          }else{
            this.markers.push(this.add_tokemon_as_marker(icon,tokemon.position,tokemon.name+" ("+tokemon.pv+" LP)",tokemon,30))
          }
        }
      }
    })
  }




  async select_nft(event: any) {
    this.map!.setView(event.latlng)
  }


  private get_closest_tokemon_from(center:any,seuil=0.1) : L.Marker | null {
    let d_min=1e18
    let _selected_marker:L.Marker | undefined
    for(let marker of this.markers){
      let dist=distance(center,marker.getLatLng())
      if(dist<d_min){
        _selected_marker=marker
        d_min=dist
      }
    }
    $$("Plus proche "+d_min)
    if(d_min<seuil && _selected_marker){
      return _selected_marker
    }else{
      return null
    }

  }

  private mouseover(event: LeafletMouseEvent) {
    let nft=event.target.options.alt
  }


  async refresh(center: LatLng | null=null) {
    if(this.map){
      $$("Refresh de la carte sur ",center)
      if(!center){center=this.map.getCenter();}
      this.user.zone={
        ne: this.map.getBounds().getNorthEast(),
        sw: this.map.getBounds().getSouthWest(),
        entrance:new Point3D(0,0,0),
        exit: new Point3D(0,0,0),
        zoom:this.map.getZoom(),
        center:center
      }
      await this.add_tokemon_to_markers(center)
      this.layer?.redraw()
    }

  }


  private movemap(event: any) {
    if(event){
      this.user.center_map = event.target.getCenter()
      $$("Positionnement de la carte sur ",this.user.center_map)
    }

    this.selected_marker=this.get_closest_tokemon_from(this.user.center_map,environment.seuil_capture)
    this.selected_tokemon=this.selected_marker?.options.alt
    $$("Selection du tokemon ",this.selected_tokemon)

    localStorage.setItem("last_position_lat",String(this.user.center_map.lat))
    localStorage.setItem("last_position_lng",String(this.user.center_map.lng))

    if(!this.user.game?.geoloc_to_catch)this.refresh(this.user.center_map)
  }


  center_in_the_game_zone(){
    showMessage(this,"Center in the middle of the game zone")
    let zone=this.user.game
    let ne=cartesianToPolar(zone!.ne,environment.scale_factor,environment.translate_factor)
    let sw=cartesianToPolar(zone!.sw,environment.scale_factor,environment.translate_factor)

    let center_lat=(ne.lat+sw.lat)/2
    let center_lng=(ne.lng+sw.lng)/2
    this.user.center_map=new L.LatLng(center_lat,center_lng)
  }



  async recenter() {
    $$("Recentrage")
    if(this.user.game?.geoloc_to_catch || is_in(this.user.center_map,this.user.game!)){
      this.center_in_the_game_zone()
    }else{
      showMessage(this,"Center of the map on your location")
      await this.refresh_geoloc()
      if(this.user.loc!.coords.latitude+this.user.loc!.coords.longitude!=0){
        this.user.center_map=new LatLng(this.user.loc!.coords.latitude,this.user.loc!.coords.longitude)
      }else{
        this.center_in_the_game_zone()
      }
    }
    this.map!.setView(this.user.center_map,this.user.zoom)
    this.movemap(null)
  }



  async moveto() {
    try{
      let r="0"
      if(!this.user.game?.geoloc_to_catch){
        let _default=this.user.center_map ? this.user.center_map.lat+","+this.user.center_map.lng : ""
        r=await _prompt(this,"Se déplacer loin",_default,"Enter your GPS coordinates","text","Déplacer","Annuler",false)
      }
      if(r=="0"){
        this.user.center_map=await this.user.geoloc(this.geolocService)
      }else{
        this.user.center_map=new LatLng(Number(r.split(",")[0]),Number(r.split(",")[1]))
      }
      this.map!.setView(this.user.center_map)
      this.movemap({target:this.user.center_map})
    }catch (e){
    }

  }


  open_capture() {
    let target=polarToCartesian(this.user.center_map,environment.scale_factor,environment.translate_factor)
    this.router.navigate(["capture"],{queryParams:{p:setParams({
          item:this.selected_tokemon,
          target:target,
          game:this.user.game!.id,
        },"","")}})
  }



  open_airdrop() {
    let obj={game_id:this.user.game!.id,lat:this.user.center_map?.lat,lng:this.user.center_map?.lng}
    this.router.navigate(["airdrop"],{queryParams:{p:setParams(obj,"","")}})
  }



  zoom_out() {
    if(this.user.zoom<17)this.user.zoom=this.user.zoom+1;
  }

  zoom_in() {
    if(this.user.zoom>0)this.user.zoom=this.user.zoom-1;
  }

  async move_tokemon() {
    if(!this.start_move){
      this.tokemon_to_move=this.selected_tokemon
      this.start_move=this.selected_marker!.getLatLng()
    }else{
      await this.user.login(this,"","",true)
      $$("Execution du deplacement")
      let pos=polarToCartesian(this.user.center_map,environment.scale_factor,environment.translate_factor)
      let args=[this.user.game!.id,this.tokemon_to_move.id,pos.x,pos.y,pos.z,false]
      try{
        wait_message(this,"Moving ...")
        let rc:any=await send_transaction_with_transfers(this.user,"move_tokemon",args)
        showMessage(this,rc.returnMessage)
        this.refresh()
        wait_message(this)
      }catch (e:any) {
        wait_message(this)
        showMessage(this,e.returnMessage)
      }

      this.start_move=null
      this.tokemon_to_move=null
      this.marker_line?.removeFrom(this.map!)
      this.marker_line==null
    }

  }


  async show_my_tokemon() {
    await this.user.login(this,"Se connecter pour voir l'ensemble des tokemons","",true)
    if(this.user.game){
        let results:any=await send_transaction_with_transfers(
        this.user,"show_all_my_nfts",[this.user.game.id])
        $$("Récupération de ",results.length)
    }
  }

  private mousemove(event: LeafletEvent) {
    if(this.start_move){
      if(!this.marker_line && this.map){
        this.marker_line=L.polyline([this.start_move,this.user.center_map],{color:'black'}).addTo(this.map!)
      }else{
        this.marker_line!.setLatLngs([this.start_move,this.user.center_map])
      }

    }
  }


  protected readonly level = level;

  open_nft(event: LeafletMouseEvent) {
    debugger
    this.map!.setView(event.latlng)
    this.open_capture()
  }
}
