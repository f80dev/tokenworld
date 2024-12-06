import {ApiService} from './api.service';
import {query} from './mvx';
import {UserService} from './user.service';
import {environment} from '../environments/environment';
import {abi} from '../environments/abi';
import * as L from 'leaflet';
import {baseMapURl} from './map/map.component';
import {LatLng, Point} from 'leaflet';

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


export function latLonToCartesian_old(lat:number, lon:number,scale:number=1,radius:number = 6371): {x:number,y:number,z:number} {
  const latRad = degToRad(lat);
  const lonRad = degToRad(lon);

  const x = radius * Math.cos(latRad) * Math.cos(lonRad)*scale;
  const y = radius * Math.cos(latRad) * Math.sin(lonRad)*scale;
  const z = radius * Math.sin(latRad) * scale;

  return { x:Math.round(x), y:Math.round(y), z:Math.round(z) };
}



export function latLonToCartesian(lat:number, lon:number,zoom:number,scale=1,translate=0): L.Point {
  //voir https://leafletjs.com/reference.html#projection

  //let metresPerPixel = 40075016.686 * Math.abs(Math.cos(map.getCenter().lat * Math.PI/180)) / Math.pow(2, map.getZoom()+8);

  let result=L.CRS.Simple.latLngToPoint(new LatLng(lat,lon),zoom)
  result.x=result.x*scale+translate
  result.y=result.y*scale+translate
  return result
}



// export function latLonToCartesian(map:L.Map,lat:number, lon:number,scale:number=1,radius:number = 6371): {x:number,y:number,z:number} {
//   let metresPerPixel = 40075016.686 * Math.abs(Math.cos(map.getCenter().lat * Math.PI/180)) / Math.pow(2, map.getZoom()+8);
//
//   map.project(new LatLng(lat,lon),zoom)
//
//   const latRad = degToRad(lat);
//   const lonRad = degToRad(lon);
//
//   const x = radius * Math.cos(latRad) * Math.cos(lonRad)*scale;
//   const y = radius * Math.cos(latRad) * Math.sin(lonRad)*scale;
//   const z = radius * Math.sin(latRad) * scale;
//
//   return { x:Math.round(x), y:Math.round(y), z:Math.round(z) };
// }


export function cartesianToPolar(x:number, y:number,zoom:number,scale:number=1,translate:number=0) : L.LatLng {
  return L.CRS.Simple.pointToLatLng(new Point(x/scale+translate,y/scale+translate),zoom)
}


//
// export function cartesianToPolar(x:number, y:number,z:number,scale:number=1) {
//   const xx=x/scale
//   const yy=y/scale
//   const zz=z/scale
//   const r = Math.sqrt(xx * xx + yy * yy + zz * zz);
//   const theta = Math.acos(zz / r);
//   const phi = Math.atan2(yy, xx);
//
//   return { lat:90-radToDeg(theta),long:radToDeg(phi), radius:r };
// }


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



export function initializeMap(vm:any,user:UserService,center:LatLng,meIcon='https://tokemon.f80.fr/assets/icons/person_24dp_5F6368.png') {
  if(user.map && user.map.url=="map"){

    L.tileLayer(baseMapURl).addTo(vm.map);
    L.tileLayer(baseMapURl, {attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'})
      .addTo(vm.map).redraw()

    let size=30


    L.marker([center.lat,center.lng],{
      icon:L.icon({
        iconUrl: meIcon,
        iconSize: [size, size], // size of the icon
        iconAnchor: [size/2, size/2], // point of the icon which will correspond to marker's location
      }),
      alt:"me"
    }).addTo(vm.map)

    if(user.map.entrance.x+user.map.entrance.y+user.map.entrance.z!=0){
      let entrance_polar=cartesianToPolar(user.map.entrance.x,user.map.entrance.y,user.map.entrance.z)
      L.marker([center.lat,center.lng],{
        icon:L.icon({
          iconUrl: meIcon,
          iconSize: [size, size], // size of the icon
          iconAnchor: [size/2, size/2], // point of the icon which will correspond to marker's location
        }),
        alt:"Entrance"
      }).addTo(vm.map)
    }


    return vm.map
  } else {
    user.zoom=2
  }

}

