import {AfterViewInit, Component, inject, Input, OnChanges, SimpleChanges} from '@angular/core';
import * as L from 'leaflet';

import {Circle, CircleMarker, control, LatLng, LeafletMouseEvent, Marker, TileLayer} from 'leaflet';
import {setParams, showMessage} from '../../tools';
import {GeolocService} from '../geoloc.service';
import {environment} from '../../environments/environment';
import {query} from '../mvx';
import {abi} from '../../environments/abi';
import {cartesianToPolar, latLonToCartesian} from '../tokenworld';
import {UserService} from '../user.service';
import {Router} from '@angular/router';

const baseMapURl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [],
  templateUrl: './map.component.html',
  styleUrl: './map.component.css'
})
export class MapComponent implements OnChanges,AfterViewInit  {

  router=inject(Router)
  geolocService=inject(GeolocService)
  user=inject(UserService)

  private map!: L.Map;
  private markers:L.Marker[]=[]
  center: any;
  private infos: string=""
  private layer: TileLayer | undefined
  private vision: CircleMarker<any> | undefined;
  private target: Marker<any> | undefined;
  private me:  Marker<any> | undefined;



  async ngAfterViewInit() {
    try{
      this.user.loc=await this.geolocService.getCurrentPosition()
      this.initializeMap()
      this.center_to_loc()
      this.add_tokemon_to_markers()
      this.refresh()
    }catch (err:any){
      showMessage(this,'Error getting location: ' + err.message)
    }
  }



  ngOnChanges(changes: any): void {
    if(!changes.lat.firstChange)this.center_to_loc();
  }

  private initializeMap() {
    this.map = L.map('map');
    this.vision = L.circleMarker([this.map.getCenter().lng,this.map.getCenter().lat], {
      color: 'red',fillColor: '#f03',
      fillOpacity: 0.5,radius: 500
    }).addTo(this.map);

    L.tileLayer(baseMapURl).addTo(this.map);

    var meIcon = L.icon({
      iconUrl: 'https://tokemon.f80.fr/assets/icons/person_24dp_5F6368.png',
      iconSize: [38, 38], // size of the icon
      iconAnchor: [19, 19], // point of the icon which will correspond to marker's location
      popupAnchor: [-19, -19] // point from which the popup should open relative to the iconAnchor  
    });

    var targetIcon = L.icon({
      iconUrl: '"https://tokemon.f80.fr/assets/icons/target.png"',
      iconSize: [38, 38], // size of the icon
      iconAnchor: [19, 19], // point of the icon which will correspond to marker's location
      popupAnchor: [-19, -19] // point from which the popup should open relative to the iconAnchor  
    });

    this.target=L.marker([this.map.getCenter().lat, this.map.getCenter().lng],{icon:targetIcon, alt:"me"})
    this.me=L.marker([this.user.loc.coords.latitude, this.user.loc.coords.longitude],{icon:meIcon, alt:"me"})

    this.target.addTo(this.map)
    this.me.addTo(this.map)

    this.map.on("moveend",(event:L.LeafletEvent)=>this.movemap(event));
  }
  


  center_to_loc(): void {
    // Fit the map view to the bounds
    if(this.user.loc){
      this.map.setView(new LatLng(this.user.loc?.coords.latitude,this.user.loc?.coords.longitude),17);
      // L.tileLayer(baseMapURl, {
      //   attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      // }).addTo(this.map).redraw();
    }
  }


  async add_tokemon_to_markers() {
    let pos=latLonToCartesian(this.user.loc?.coords.latitude,this.user.loc?.coords.longitude,environment.scale_factor)
    let args=["LesBG", pos.x,pos.y,pos.z, 10000]

    let contract:string=environment.contract_addr["elrond-devnet"];
    let nfts=await query("show_nfts",this.user.address, args, contract, abi);

    for(let nft of nfts){
      var giftIcon = L.icon({
        iconUrl: 'https://tokemon.f80.fr/assets/icons/pushpin.png',
        shadowSize: [20, 20],
        iconSize: [38, 38], // size of the icon
        iconAnchor: [19, 36], // point of the icon which will correspond to marker's location
        popupAnchor: [-19, -19] // point from which the popup should open relative to the iconAnchor  
      })

      let coords=cartesianToPolar(nft.x,nft.y,nft.z,environment.scale_factor)

      let marker=L.marker([coords.lat, coords.long],{icon:giftIcon, alt:nft})
      marker.on("mouseover",(event)=>{this.mouseover(event)})
      marker.on("dblclick",(event)=>{this.select_nft(event)})

      this.markers.push(marker)
    }
  }


  async select_nft(event: LeafletMouseEvent) {
    let nft=event.target.options.alt
    this.router.navigate(["capture"],{queryParams:{p:setParams(nft,"","")}})
  }

  private mouseover(event: LeafletMouseEvent) {
    let nft=event.target.options.alt
    this.infos=new TextDecoder("utf-8").decode(nft.clan)
  }

  private refresh() {
    this.markers.forEach(marker => marker.addTo(this.map));
    this.layer?.redraw()
  }

  private movemap(event: L.LeafletEvent) {
      this.user.center_map = event.target.getCenter()
      this.add_tokemon_to_markers()
      this.refresh()
  }

}
