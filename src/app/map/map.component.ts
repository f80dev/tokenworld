import {AfterViewInit, Component, inject, OnChanges} from '@angular/core';
import * as L from 'leaflet';
import {
  LatLng,
  LatLngBounds,
  LeafletMouseEvent,
  Marker,
  TileLayer
} from 'leaflet';
import {$$, setParams, showMessage} from '../../tools';
import {GeolocService} from '../geoloc.service';
import {environment} from '../../environments/environment';
import {cartesianToPolar, distance, initializeMap, polarToCartesian} from '../tokenworld';
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
  private markers:L.Marker[]=[]

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




  async add_tokemon_to_markers() {
    return new Promise(async (resolve,reject) => {
      if(this.user.center_map && this.user.game) {
        for(let m of this.markers){
          m.removeFrom(this.map)
        }

        this.markers=[]

        $$("Chargement des tokemon")
        let pos = polarToCartesian(this.user.center_map,environment.scale_factor,environment.translate_factor)
        let args = [this.user.game.id,this.user.address,pos.x, pos.y,pos.z] //environment.scale_factor/1000]

        this.user.nfts = await this.user.query("show_nfts",  args);
        $$("Chargement de " + this.user.nfts.length + " tokemons")

        for (let nft of this.user.nfts) {
          let icon=nft.owner!=this.user.idx ? "https://tokemon.f80.fr/assets/icons/push_pin_blue.svg" : 'https://tokemon.f80.fr/assets/icons/push_pin_red.svg'
          var giftIcon = L.icon({
            iconUrl: icon,
            iconSize: [30, 30],// size of the icon
            iconAnchor: [15, 28], // point of the icon which will correspond to marker's location
          })

          if(this.user.preview){
            let nonce=nft.nonce.toString(16)
            let opt:any=await get_nft(nft.nft+"-"+(nonce.length<2 ? "0"+nonce : nonce),this.api,this.user.network)
            let size=50
            giftIcon = L.icon({
              iconUrl: opt.media[0].thumbnailUrl,
              iconSize: [size, size],// size of the icon
              iconAnchor: [size/2, size/2], // point of the icon which will correspond to marker's location
            })
          }

          let coords = cartesianToPolar(nft.position,environment.scale_factor,environment.translate_factor)

          let marker = L.marker(coords, {icon: giftIcon, alt: nft})
          marker.bindTooltip(nft.name+" ("+nft.pv+" LP)").openTooltip()
          marker.on("mouseover", (event) => {this.mouseover(event)})
          marker.on("dblclick", (event) => {this.select_nft(event)})
          marker.addTo(this.map)

          L.circleMarker(coords,{color: '#474747', fillColor: '#474747', fillOpacity: 0.5, radius: 1}).addTo(this.map);

          this.markers.push(marker)
        }
      }
    })
  }


  async select_nft(event: LeafletMouseEvent) {
    let nft=event.target.options.alt
    this.router.navigate(["capture"],{queryParams:{p:setParams(nft,"","")}})
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
