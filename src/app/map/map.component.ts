import {AfterViewInit, Component, inject, Input, OnChanges, SimpleChanges} from '@angular/core';
import * as L from 'leaflet';
import {LatLng} from 'leaflet';
import {showMessage} from '../../tools';
import {GeolocService} from '../geoloc.service';
import {environment} from '../../environments/environment';
import {query} from '../mvx';
import {abi} from '../../environments/abi';
import {cartesianToPolar, latLonToCartesian} from '../tokenworld';
import {UserService} from '../user.service';


const baseMapURl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [],
  templateUrl: './map.component.html',
  styleUrl: './map.component.css'
})
export class MapComponent implements OnChanges,AfterViewInit  {

  geolocService=inject(GeolocService)
  user=inject(UserService)
  private map!: L.Map;


  async ngAfterViewInit() {
    try{
      this.user.loc=await this.geolocService.getCurrentPosition()
      this.initializeMap()
      this.setMap()
      this.show()
    }catch (err:any){
      showMessage(this,'Error getting location: ' + err.message)
    }
  }


  private addMarkers() {
    // Add your markers to the map

  }

  ngOnChanges(changes: any): void {
    if(!changes.lat.firstChange)this.setMap();
  }

  private initializeMap() {
    this.map = L.map('map');
    L.tileLayer(baseMapURl).addTo(this.map);
  }


  setMap(): void {
    // Fit the map view to the bounds
    if(this.user.loc){
      this.map.setView(new LatLng(this.user.loc?.coords.latitude,this.user.loc?.coords.longitude),17);

      L.tileLayer(baseMapURl, {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(this.map).redraw();

    }

  }

  async show() {
    let pos=latLonToCartesian(this.user.loc?.coords.latitude,this.user.loc?.coords.longitude)
    let args=["LesBG",pos.x,pos.y,pos.z]
    let contract:string=environment.contract_addr["elrond-devnet"];

    if(this.user.address){
      let nfts=await query("show_nfts",      this.user.address, args, contract, abi);

      let markers:L.Marker[]=[]
      for(let nft of nfts){
        let coords=cartesianToPolar(nft.x,nft.y,nft.z)
        markers.push(
          L.marker([coords.lat, coords.long]), // Amman
        )
      }
      markers.forEach(marker => marker.addTo(this.map));
    }

  }

}
