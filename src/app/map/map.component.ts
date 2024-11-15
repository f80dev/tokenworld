import {AfterViewInit, Component, inject, Input, OnChanges, SimpleChanges} from '@angular/core';
import * as L from 'leaflet';

import { CircleMarker,  LatLng, LeafletMouseEvent, Marker, TileLayer} from 'leaflet';
import {$$, setParams, showMessage} from '../../tools';
import {GeolocService} from '../geoloc.service';
import {environment} from '../../environments/environment';
import {query} from '../mvx';
import {abi} from '../../environments/abi';
import {cartesianToPolar, distance, latLonToCartesian} from '../tokenworld';
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

const baseMapURl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'

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

  private map!: L.Map;
  private markers:L.Marker[]=[]

  center: any;
  private layer: TileLayer | undefined
  private me:  Marker<any> | undefined;


  async ngAfterViewInit() {
    try{
      await this.initializeMap()
      await this.center_to_loc()
      await this.add_tokemon_to_markers()
    }catch (err:any){
      showMessage(this,'Error getting location: ' + err.message)
    }
  }



  open_drop() {
    let bounds=this.map.getBounds()
    var southWest = bounds.getNorthWest();
    var northEast = bounds.getNorthEast();
    var distance = (this.user.visibility/screen.availWidth)*this.map.distance(southWest, northEast)
    if(this.user.address){
      this.router.navigate(["drop"],{queryParams:{lat:this.user.center_map?.lat,lng:this.user.center_map?.lng,distance:distance}})
    } else {
      this.router.navigate(["login"],{queryParams:{message:"You must be connected to select the token to drop",redirectTo:"drop"}});
    }
  }


  ngOnChanges(changes: any): void {
    if(!changes.lat.firstChange)this.center_to_loc();
  }


  async initializeMap() {
    return new Promise(async (resolve, reject) => {
      this.map = L.map('map');

      L.tileLayer(baseMapURl).addTo(this.map);
      L.tileLayer(baseMapURl, {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(this.map).redraw()

      await this.center_to_loc()

      var meIcon = L.icon({
        iconUrl: 'https://tokemon.f80.fr/assets/icons/person_24dp_5F6368.png',
        iconSize: [38, 38], // size of the icon
        iconAnchor: [-19, -19], // point of the icon which will correspond to marker's location
      });

      this.me=L.marker([this.user.loc.coords.latitude, this.user.loc.coords.longitude],{icon:meIcon, alt:"me"})

      this.me.addTo(this.map)

      this.map.on("moveend",(event:L.LeafletEvent)=>this.movemap(event));
      this.map.on("zoom",(event:L.LeafletEvent)=>{this.user.zoom=this.map.getZoom()})
      resolve(true)
    })

  }



  center_to_loc() {
    return new Promise(async (resolve,reject) => {
      this.user.loc=await this.geolocService.getCurrentPosition()
      let loc=this.user.center_map ? this.user.center_map : {lat:this.user.loc.coords.latitude,lng:this.user.loc.coords.longitude}
      if(loc){
        resolve(this.map.setView(new LatLng(loc.lat,loc.lng),this.user.zoom || 16))
      }else{
        reject()
      }
    })
  }


  async add_tokemon_to_markers() {
    return new Promise(async (resolve,reject) => {
      if(this.user.center_map) {
        this.markers=[]
        $$("Chargement des tokemon")
        let pos = latLonToCartesian(this.user.center_map.lat, this.user.center_map.lng, environment.scale_factor)
        //let pos=latLonToCartesian(this.user.loc?.coords.latitude,this.user.loc?.coords.longitude,environment.scale_factor)
        let args = [pos.x, pos.y, pos.z, environment.scale_factor]

        let contract: string = environment.contract_addr["elrond-devnet"];
        this.user.nfts = await query("show_nfts", this.user.address, args, contract, abi);

        $$("Chargement de " + this.user.nfts.length + " tokemons")
        for (let nft of this.user.nfts) {
          var giftIcon = L.icon({
            iconUrl: 'https://tokemon.f80.fr/assets/icons/pushpin.png',
            iconSize: [30, 30],// size of the icon
            shadowSize: [10, 10],
            iconAnchor: [15, 28], // point of the icon which will correspond to marker's location
          })

          let coords = cartesianToPolar(nft.x, nft.y, nft.z, environment.scale_factor)
          let marker = L.marker([coords.lat, coords.long], {icon: giftIcon, alt: nft})

          marker.bindTooltip(nft.name+" ("+nft.pv+" LP)").openTooltip()
          marker.on("mouseover", (event) => {this.mouseover(event)})
          marker.on("dblclick", (event) => {this.select_nft(event)})

          L.circleMarker([coords.lat, coords.long], {color: '#474747', fillColor: '#474747', fillOpacity: 0.5, radius: 1}).addTo(this.map);

          marker.addTo(this.map)
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
      let dist=distance(center.lat,center.lng,marker.getLatLng().lat,marker.getLatLng().lng)
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
    this.layer?.redraw()
  }


  private movemap(event: any) {
    this.user.center_map = event.target.getCenter()
    $$("Positionnement de la carte sur ",this.user.center_map)
    this.user.tokemon_selected=this.get_closest_tokemon_from(this.user.center_map,environment.seuil_capture)
    this.refresh()
  }


  async moveto() {
    let _default=this.user.center_map ? this.user.center_map.lat+","+this.user.center_map.lng : ""
    let r=await _prompt(this,"Se déplacer loin",_default,"Enter your GPS coordinates","text","Déplacer","Annuler",false)
    if(r){
      this.user.center_map={lat:Number(r.split(",")[0]),lng:Number(r.split(",")[1])}
    }
  }


  open_capture() {
    this.router.navigate(["capture"],{queryParams:{p:setParams(this.user.tokemon_selected,"","")}})
  }


}
