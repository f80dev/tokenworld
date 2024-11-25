import {ApiService} from './api.service';
import {query} from './mvx';
import {UserService} from './user.service';
import {environment} from '../environments/environment';
import {abi} from '../environments/abi';
import * as L from 'leaflet';
import {baseMapURl} from './map/map.component';

export class Tokemon {
  id: number = 0;
  name: string = "";
  owner: number = 0;
  nft: string = "";
  nonce: number = 0;
  pv: number = 0;
  x: number = 0;
  y: number = 0;
  z: number = 0;
  mode: number = 0;
  visibility: number = 0;
}

function degToRad(degrees:number):number {
  return degrees * (Math.PI / 180);
}

function radToDeg(radian:number):number {
  return radian * (180/Math.PI);
}

export function latLonToCartesian(lat:number, lon:number,scale:number=1,radius:number = 6371): {x:number,y:number,z:number} {
  const latRad = degToRad(lat);
  const lonRad = degToRad(lon);

  const x = radius * Math.cos(latRad) * Math.cos(lonRad)*scale;
  const y = radius * Math.cos(latRad) * Math.sin(lonRad)*scale;
  const z = radius * Math.sin(latRad) * scale;

  return { x:Math.round(x), y:Math.round(y), z:Math.round(z) };
}


export function cartesianToPolar(x:number, y:number,z:number,scale:number=1) {
  const xx=x/scale
  const yy=y/scale
  const zz=z/scale
  const r = Math.sqrt(xx * xx + yy * yy + zz * zz);
  const theta = Math.acos(zz / r);
  const phi = Math.atan2(yy, xx);

  return { lat:90-radToDeg(theta),long:radToDeg(phi), radius:r };
}


export function distance(lat1:number, lon1:number, lat2:number, lon2:number): number {
  const R = 6371; // Radius of the Earth in kilometers

  const dLat = degToRad(lat2 - lat1);
  const dLon = degToRad(lon2 - lon1);

  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(degToRad(lat1)) * Math.cos(degToRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R*c;
}



export function initializeMap(vm:any,events:string,meIcon='https://tokemon.f80.fr/assets/icons/push_pin_blue.svg') {

  if(vm.user.map.url=="map"){
    L.tileLayer(baseMapURl).addTo(vm.map);
    L.tileLayer(baseMapURl, {attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'})
      .addTo(vm.map).redraw()

    let size=30

    var tokemonIcon = L.icon({
      iconUrl: meIcon,
      iconSize: [size, size], // size of the icon
      iconAnchor: [size/2, size/2], // point of the icon which will correspond to marker's location
    });
    L.marker([vm.user.center_map!.lat, vm.user.center_map!.lng],{icon:tokemonIcon, alt:"me"}).addTo(vm.map)
    vm.map.setView(vm.user.center_map!,vm.user.zoom || 16)

    if(events.indexOf("zoomend")>-1){
      vm.map.on("zoomend",(event:L.LeafletEvent)=>{
        let b=vm.map.getBounds()
        let distance_in_meters=vm.map.distance(b.getNorthWest(),b.getSouthEast())
        let distance_in_pixel=Math.sqrt(300*300+300+300)
        vm.ech=distance_in_pixel/distance_in_meters
        vm.max_distance=distance_in_meters
      })
    }

    if(events.indexOf("zoom")>-1){
      vm.map.on("zoom",(event:L.LeafletEvent)=>{vm.user.zoom=vm.map.getZoom()})
    }

    if(events.indexOf("moveend")>-1){
      vm.map.on("moveend",(event:L.LeafletEvent)=>vm.movemap(event));
    }
  } else {

  }

}

