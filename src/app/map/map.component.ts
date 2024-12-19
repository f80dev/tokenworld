import {AfterViewInit, Component, inject, OnChanges} from '@angular/core';
import * as L from 'leaflet';
import {
  LatLng,
  LatLngBounds,
  LeafletMouseEvent,
  Marker, Point,
  TileLayer
} from 'leaflet';
import {$$, setParams, showMessage} from '../../tools';
import {GeolocService} from '../geoloc.service';
import {environment} from '../../environments/environment';
import {add_icon, cartesianToPolar, distance, initializeMap, Point3D, polarToCartesian} from '../tokenworld';
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
import {abi} from '../../environments/abi';
import {AbiRegistry, Field, Struct, U64Value} from '@multiversx/sdk-core/out';
import {ApiService} from '../api.service';
import {get_nft} from '../mvx';

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
    MatSliderThumb
  ],
  templateUrl: './map.component.html',
  styleUrl: './map.component.css'
})
export class MapComponent implements OnChanges,AfterViewInit  {

  router=inject(Router)
  geolocService=inject(GeolocService)
  user=inject(UserService)
  toast=inject(MatSnackBar)
  dialog=inject(MatDialog)
  clipboard=inject(Clipboard)
  api=inject(ApiService)

  private map!: L.Map
  markers:L.Marker[]=[]

  center: any;
  private layer: TileLayer | undefined
  private me:  Marker<any> | undefined;
  private target:  Marker<any> | undefined;
  map_left=0
  map_top=0


  async init_map(){
    $$("Initialisation de la carte principal")
    let geoloc_position=await this.user.geoloc(this.geolocService)
    $$("Localisation de l'utilisateur en ",geoloc_position)

    this.map=L.map('map',{ keyboard:true,scrollWheelZoom:true})
    let zoom=this.user.zoom || 16

    if(this.user.game){
      let ne=cartesianToPolar(this.user.game.ne,environment.scale_factor,environment.translate_factor)
      let sw=cartesianToPolar(this.user.game.sw,environment.scale_factor,environment.translate_factor)
      L.rectangle(new LatLngBounds(sw,ne)).addTo(this.map);
      //this.map.setMaxBounds(new LatLngBounds(ne,sw))
      $$("Positionnement d'une limite ",{ne:ne,sw:sw})
    }

    initializeMap(this,this.user.game,geoloc_position)
      .on("zoom",(event:L.LeafletEvent)=>{this.user.zoom=this.map.getZoom()})
      .on("moveend",(event:L.LeafletEvent)=>this.movemap(event))
      .on("keypress",(event:L.LeafletKeyboardEvent)=>{
        //https://leafletjs.com/reference.html#keyboardevent
        if(event.originalEvent.key=="c"){
          //let origin=latLonToCartesian(this.map.getBounds().getNorthEast().lat,this.map.getBounds().getNorthEast().lng,this.map.getZoom())
          let pos=polarToCartesian(this.user.center_map,environment.scale_factor,environment.translate_factor)
          this.clipboard.copy(pos.x+","+pos.y)
          showMessage(this,"Position copied")
        }
      })


    this.map.setView(geoloc_position,zoom);

  }


  async ngAfterViewInit() {
    setTimeout(()=>{
      if(this.user && this.user.game)this.init_map()
    },500)
  }


  async open_drop() {
    let drop_pos=polarToCartesian(this.user.center_map,environment.scale_factor)
    //voir https://docs.multiversx.com/sdk-and-tools/sdk-js/sdk-js-cookbook-v13#encoding-a-custom-type

    let message=await this.user.query("can_drop",[this.user.game!.id,drop_pos.x,drop_pos.y,drop_pos.z])
    if(message!=''){
      showMessage(this,message)
    }else{
      let bounds=this.map.getBounds()
      var southWest = bounds.getNorthWest();
      var northEast = bounds.getNorthEast();
      var distance = (this.user.visibility/screen.availWidth)*this.map.distance(southWest, northEast)
      if(this.user.address){
        let position=setParams({lat:this.user.center_map?.lat,lng:this.user.center_map?.lng},"","")
        this.router.navigate(["drop"],{queryParams:{p:position}})
      } else {
        this.router.navigate(["login"],{queryParams:{message:"You must be connected to select the token to drop",redirectTo:"drop"}});
      }
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
    marker.addTo(this.map)
    L.circleMarker(coords,{color: '#474747', fillColor: '#474747', fillOpacity: 0.5, radius: 1}).addTo(this.map);
    return marker
  }

  async add_tokemon_to_markers() {
    return new Promise(async (resolve,reject) => {
      if(this.user.center_map && this.user.game) {
        for(let m of this.markers){
          m.removeFrom(this.map)
        }

        this.markers=[]
        let ne=polarToCartesian(this.map.getBounds().getNorthEast(),environment.scale_factor)
        let sw=polarToCartesian(this.map.getBounds().getSouthWest(),environment.scale_factor)

        $$("Chargement des tokemon")
        let pos = polarToCartesian(this.user.center_map,environment.scale_factor,environment.translate_factor)
        let args = [
          this.user.game.id,
          this.user.address,
          pos.x, pos.y,pos.z,
          ne.x,ne.y,ne.z,
          sw.x,sw.y,sw.z
        ] //environment.scale_factor/1000]

        this.user.nfts = await this.user.query("show_nfts",  args);
        $$("Chargement de " + this.user.nfts.length + " tokemons")

        for (let tokemon of this.user.nfts) {
          let icon=(tokemon.owner==this.user.idx ? "https://tokemon.f80.fr/assets/icons/push_pin_blue.svg" : 'https://tokemon.f80.fr/assets/icons/push_pin_red.svg')

          if(this.user.preview){
            let nonce=tokemon.nonce.toString(16)
            let nft_id=tokemon.nft+"-"+(nonce.length<2 ? "0"+nonce : nonce)
            //let nft_id=tokemon.nft
            get_nft(nft_id,this.api,this.user.network).then((opt:any)=>{
              $$("Récupération du nft ",opt)
              this.markers.push(this.add_tokemon_as_marker(opt.media[0].thumbnailUrl,tokemon.position,tokemon.name+" ("+tokemon.pv+" LP)",tokemon,50))
            })
          }else{
            this.markers.push(this.add_tokemon_as_marker(icon,tokemon.position,tokemon.name+" ("+tokemon.pv+" LP)",tokemon,30))
          }

        }
      }
    })
  }


  async select_nft(event: LeafletMouseEvent) {
    let tokemon=event.target.options.alt
    this.router.navigate(["capture"],{queryParams:{p:setParams(tokemon,"","")}})
  }


  private get_closest_tokemon_from(center:any,seuil=0.1) : any {
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
      return _selected_marker.options.alt
    }else{
      return null
    }

  }

  private mouseover(event: LeafletMouseEvent) {
    let nft=event.target.options.alt

  }


  async refresh() {

    this.user.zone={
      NE: this.map.getBounds().getNorthEast(),
      SW: this.map.getBounds().getSouthWest(),
      zoom:this.map.getZoom(),
      center:this.map.getCenter()
    }

    this.add_tokemon_to_markers()
    this.layer?.redraw()
  }


  private movemap(event: any) {
    this.user.center_map = event.target.getCenter()
    $$("Positionnement de la carte sur ",this.user.center_map)
    this.user.tokemon_selected=this.get_closest_tokemon_from(this.user.center_map,environment.seuil_capture)
    //this.target?.setLatLng({lat:this.user.center_map.lat,lng:this.user.center_map.lng})
    this.refresh()
  }


  async moveto() {
    let _default=this.user.center_map ? this.user.center_map.lat+","+this.user.center_map.lng : ""
    let r=await _prompt(this,"Se déplacer loin",_default,"Enter your GPS coordinates","text","Déplacer","Annuler",false)
    if(r){
      this.user.center_map=new LatLng(Number(r.split(",")[0]),Number(r.split(",")[1]))
    }
  }


  open_capture() {
    this.router.navigate(["capture"],{queryParams:{p:setParams(this.user.tokemon_selected,"","")}})
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

  move_tokemon() {

  }



}
