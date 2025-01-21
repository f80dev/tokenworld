import {AfterViewInit, Component, inject, OnChanges, OnDestroy, OnInit} from '@angular/core';
import * as L from 'leaflet';
import {
  LatLng,
  LatLngBounds, LeafletEvent,
  LeafletMouseEvent,
  Marker, Point, Polyline,
  TileLayer
} from 'leaflet';
import {$$, setParams, showError, showMessage} from '../../tools';
import {GeolocService} from '../geoloc.service';
import {environment} from '../../environments/environment';
import {cartesianToPolar, center_of, distance, initializeMap, Point3D, polarToCartesian, Tokemon} from '../tokenworld';
import {UserService} from '../user.service';
import {Router} from '@angular/router';
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
import {get_nft, send_transaction} from '../mvx';
import {HourglassComponent, wait_message} from '../hourglass/hourglass.component';

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

  router=inject(Router)
  geolocService=inject(GeolocService)
  user=inject(UserService)
  toast=inject(MatSnackBar)
  dialog=inject(MatDialog)
  clipboard=inject(Clipboard)
  api=inject(ApiService)

  map: L.Map | null = null
  markers:L.Marker[]=[]

  center: any;
  private layer: TileLayer | undefined

  map_left=0
  map_top=0
  selected_marker: L.Marker | null=null
  selected_tokemon: any | null = null
  to_attack: any | null = null
  me_marker: Marker | undefined
  geoloc_autorefresh: any
  message: string=""

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

      //this.map.setMaxBounds(new LatLngBounds(ne,sw))
      $$("Positionnement d'une limite ",{ne:ne,sw:sw})
      showMessage(this,"Welcome in the "+this.user.game.title)
    }

    initializeMap(this,this.user.game)

    if(this.map){
      this.map
        .on("zoom",(event:L.LeafletEvent)=>{this.user.zoom=this.map!.getZoom()})
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

    if(this.user.game?.use_geoloc){
      await this.user.geoloc(this.geolocService,this.me_marker)
      this.user.center_map=new LatLng(this.user.loc.coords.latitude,this.user.loc.coords.longitude)
    } else {
      this.user.center_map=
        localStorage.getItem("last_position_lat")
          ? new LatLng(Number(localStorage.getItem("last_position_lat") || "0"),Number(localStorage.getItem("last_position_lng") || "0"))
          : cartesianToPolar(center_of(this.user.game!.ne,this.user.game!.sw))
    }

    this.map!.setView(this.user.center_map,zoom);
  }


  async ngOnInit() {
    this.user.login(this)
    if(this.user && this.user.game){
      setTimeout(async ()=>{await this.init_map()},500)
      this.geoloc_autorefresh=setInterval(()=>{
        this.user.geoloc(this.geolocService,this.me_marker)
      },30000)
    }else{
      $$("user n'a pas sélectionné de map ",this.user)
      this.router.navigate(["games"],{queryParams:{autoconnect:true}})
    }
  }


  async open_drop() {
    let drop_pos=polarToCartesian(this.user.center_map,environment.scale_factor,environment.translate_factor)
    //voir https://docs.multiversx.com/sdk-and-tools/sdk-js/sdk-js-cookbook-v13#encoding-a-custom-type

    let message=await this.user.query("can_drop",[this.user.game!.id,drop_pos.x,drop_pos.y,drop_pos.z])
    if(message!=''){
      showMessage(this,message)
    }else{
      let bounds=this.map!.getBounds()
      var southWest = bounds.getNorthWest();
      var northEast = bounds.getNorthEast();
      var distance = (this.user.visibility/screen.availWidth)*this.map!.distance(southWest, northEast)
      let position=setParams({lat:this.user.center_map?.lat,lng:this.user.center_map?.lng,game_id:this.user.game!.id},"","")
      this.router.navigate(["drop"],{queryParams:{p:position}})
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
    marker.on("dblclick", (event) => {this.select_nft(event)})
    marker.addTo(this.map!)
    return marker
  }



  remove_markers_from_map() {
    $$("Suppression des marker de la map")
    for(let m of this.markers){
      m.removeFrom(this.map!)
    }
  }


  async add_tokemon_to_markers() {
    return new Promise(async (resolve,reject) => {

      if(this.user.center_map && this.user.game) {

        this.remove_markers_from_map()
        this.markers=[]

        let pos = polarToCartesian(this.user.center_map,environment.scale_factor,environment.translate_factor)
        if(this.user.game.use_geoloc)pos=polarToCartesian(await this.user.geoloc(this.geolocService),environment.scale_factor,environment.translate_factor)
        $$("Evaluation de la position de reference ",pos)

        if(this.user.game.tokemon_view){
          let args = [this.user.game.id,this.user.address]
          $$("Chargement des tokemons vu par les tokemons de l'utilisateur ",args)
          this.user.tokemons = await this.user.query("show_tokemon_by_tokemon",  args);
        }else{
          let args = [this.user.game.id, pos.x, pos.y,pos.z]
          $$("Chargement des tokemons autour de la position de reference ",args)
          this.user.tokemons = await this.user.query("show_nfts",  args);
        }

        $$("Chargement de " + this.user.tokemons.length + " tokemons")
        $$("Liste des tokemons ",this.user.tokemons)

        for (let tokemon of this.user.tokemons) {
          let icon=(tokemon.owner==this.user.idx ? "https://tokemon.f80.fr/assets/icons/push_pin_blue.svg" : 'https://tokemon.f80.fr/assets/icons/push_pin_red.svg')

          if(this.user.preview){
            let nonce=tokemon.nonce.toString(16)
            let nft_id=tokemon.nft+"-"+(nonce.length<2 ? "0"+nonce : nonce)

            get_nft(nft_id,this.api,this.user.network).then((opt:any)=>{
              $$("Récupération du nft ",opt)
              this.markers.push(this.add_tokemon_as_marker(opt.media[0].originalUrl,tokemon.position,tokemon.name+" ("+Number(tokemon.pv)+" LP)",tokemon,50))
            })
          }else{
            this.markers.push(this.add_tokemon_as_marker(icon,tokemon.position,tokemon.name+" ("+tokemon.pv+" LP)",tokemon,30))
          }
        }
      }
    })
  }


  async select_nft(event: LeafletMouseEvent) {
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


  async refresh() {
    if(this.map){
      this.user.zone={
        NE: this.map.getBounds().getNorthEast(),
        SW: this.map.getBounds().getSouthWest(),
        entrance:new Point3D(0,0,0),
        exit: new Point3D(0,0,0),
        zoom:this.map.getZoom(),
        center:this.map.getCenter()
      }
      this.add_tokemon_to_markers()
      this.layer?.redraw()
    }

  }


  private movemap(event: any) {
    if(event)this.user.center_map = event.target.getCenter()
    $$("Positionnement de la carte sur ",this.user.center_map)

    this.selected_marker=this.get_closest_tokemon_from(this.user.center_map,environment.seuil_capture)
    this.selected_tokemon=this.selected_marker?.options.alt
    $$("Selection du tokemon ",this.selected_tokemon)

    localStorage.setItem("last_position_lat",String(this.user.center_map.lat))
    localStorage.setItem("last_position_lng",String(this.user.center_map.lng))
    this.refresh()
  }


  async recenter() {
    if(!this.user.game?.use_geoloc){
      showMessage(this,"Map on the gaming zone")
      let zone=this.user.game
      let ne=cartesianToPolar(zone!.ne,environment.scale_factor,environment.translate_factor)
      let sw=cartesianToPolar(zone!.sw,environment.scale_factor,environment.translate_factor)

      let center_lat=(ne.lat+sw.lat)/2
      let center_lng=(ne.lng+sw.lng)/2
      this.user.center_map=new L.LatLng(center_lat,center_lng)
    }
    else
    {
      showMessage(this,"Center of the map on your location")
      this.user.center_map=await this.user.geoloc(this.geolocService)
    }
    this.map!.setView(this.user.center_map,this.map!.getZoom())
    this.movemap(null)
  }


  async moveto() {
    try{
      let r="0"
      if(!this.user.game?.use_geoloc){
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
    this.router.navigate(["capture"],{queryParams:{p:setParams(this.selected_tokemon,"","")}})
  }


  open_airdrop() {
    let obj={lat:this.user.center_map?.lat,lng:this.user.center_map?.lng}
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
        let rc:any=await send_transaction(this.user.provider,"move_tokemon",this.user.address,args,this.user.get_sc_address())
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
        let results:any=await send_transaction(
        this.user.provider,"show_all_my_nfts",
        this.user.address,[this.user.game.id],this.user.get_sc_address())
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

  async fight() {
    if(!this.to_attack){
      this.to_attack=this.selected_tokemon
    }else{
      await this.user.login(this,"Login required to fight","",true);
      let args=[this.user.game!.id,this.to_attack.id,this.selected_tokemon.id]
      try{
        wait_message(this,"Fight ...")
        let rc=await send_transaction(this.user.provider,"fight",this.user.address,args,this.user.get_sc_address())
        this.refresh()
      }catch(e:any){

      }
      wait_message(this)
      this.to_attack=null
    }
  }

}
