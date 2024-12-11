
import {UserService} from './user.service';
import {environment} from '../environments/environment';
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

export class Point3D {
  x:number=0
  y:number=0
  z:number=0

  constructor(x=0,y=0,z=0) {
    this.x=x
    this.y=y
    this.z=z
  }
}


export class Game {
  id: number=0
  ne=new Point3D()
  sw=new Point3D()
  grid=100
  quota=10
  entrance=new Point3D()
  exit=new Point3D()
  url:string=""
  min_visibility=10
  max_visibility=1000
  max_player=100
  min_distance=10
  max_distance=100
  n_degrees=8
}




function degToRad(degrees:number):number {
  return degrees * (Math.PI / 180);
}


function radToDeg(radian:number):number {
  return radian * (180/Math.PI);
}



export function latLonToCartesian_old(lat:number, lon:number,scale:number=1,radius:number = 6371): Point3D {
  const latRad = degToRad(lat);
  const lonRad = degToRad(lon);

  const x = radius * Math.cos(latRad) * Math.cos(lonRad)*scale;
  const y = radius * Math.cos(latRad) * Math.sin(lonRad)*scale;
  const z = radius * Math.sin(latRad) * scale;

  return new Point3D(Math.round(x), Math.round(y), Math.round(z) );
}



function azimuthalEquidistantProjection(pt:LatLng, lat0=48.8566, lon0 = 2.3522, radius= 6371) {
  // Convert degrees to radians
  const latRad = pt.lat * Math.PI / 180;
  const lonRad = pt.lng * Math.PI / 180;
  const lat0Rad = lat0 * Math.PI / 180;
  const lon0Rad = lon0 * Math.PI / 180;

  // Calculate differences
  const dLon = lonRad - lon0Rad;

  // Calculate great circle distance
  const centralAngle = Math.acos(Math.sin(lat0Rad) * Math.sin(latRad) + Math.cos(lat0Rad) * Math.cos(latRad) * Math.cos(dLon));

  // Azimuthal equidistant projection formulas
  const x = radius * centralAngle * Math.cos(latRad) * Math.sin(dLon);
  const y = radius * centralAngle * (Math.cos(lat0Rad) * Math.sin(latRad) - Math.sin(lat0Rad) * Math.cos(latRad) * Math.cos(dLon));

  return new Point(x,y);
}



export function polarToCartesian(polar:LatLng,scale:number=1,translate=0,radius:number = 6371): Point3D {
  if(!polar)return new Point3D(0,0,0)
  const latRad = degToRad(polar.lat);
  const lonRad = degToRad(polar.lng);

  const x = radius * Math.cos(latRad) * Math.cos(lonRad)*scale;
  const y = radius * Math.cos(latRad) * Math.sin(lonRad)*scale;
  const z = radius * Math.sin(latRad) * scale;

  return new Point3D(Math.round(x)+translate, Math.round(y)+translate, Math.round(z)+translate )
}


export function center_of(pt1:Point3D,pt2:Point3D) : Point3D {
  return new Point3D((pt2.x+pt1.x)/2,(pt2.y+pt1.y)/2,(pt2.z+pt1.z)/2)
}

export function cartesianToPolar(pt:Point3D,scale:number=1,translate=0) : LatLng {
  const xx=pt.x/scale-translate
  const yy=pt.y/scale-translate
  const zz=pt.z/scale-translate
  const r = Math.sqrt(xx * xx + yy * yy + zz * zz);
  const theta = Math.acos(zz / r);
  const phi = Math.atan2(yy, xx);

  return new LatLng(90-radToDeg(theta),radToDeg(phi));
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


export function distance(p1:LatLng, p2:LatLng,R=6371): number {

  const dLat = degToRad(p2.lat - p1.lat);
  const dLon = degToRad(p2.lng- p1.lng);

  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(degToRad(p1.lat)) * Math.cos(degToRad(p2.lat)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R*c*1000;
}



export function initializeMap(vm:any,zone:any,
                              center:LatLng,
                              meIcon='https://tokemon.f80.fr/assets/icons/person_24dp_5F6368.png',
                              entranceIcon="https://tokemon.f80.fr/assets/icons/flag_24dp_5F6368.png",
                              exitIcon="https://tokemon.f80.fr/assets/icons/flag.png") {

  if(vm.map && zone){

    if(zone.url=="map" || zone.url=="")zone.zoom=2;

    L.tileLayer(baseMapURl).addTo(vm.map);
    L.tileLayer(baseMapURl, {attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'})
      .addTo(vm.map).redraw()

    let size=30

    if(meIcon!=""){
      L.marker([center.lat,center.lng],{
        icon:L.icon({
          iconUrl: meIcon,
          iconSize: [size, size], // size of the icon
          iconAnchor: [size/2, size/2], // point of the icon which will correspond to marker's location
        }),
        alt:"me"
      }).addTo(vm.map)
    }


    if(zone.entrance.lat+zone.entrance.lng!=0){
      L.marker(zone.entrance,{
        icon:L.icon({
          iconUrl: entranceIcon,
          iconSize: [size, size], // size of the icon
          iconAnchor: [size/2, size/2], // point of the icon which will correspond to marker's location
        }),
        alt:"Entrance"
      }).addTo(vm.map)
    }

    if(zone.exit.lat+zone.exit.lng!=0){
      L.marker(zone.exit,{
        icon:L.icon({
          iconUrl: exitIcon,
          iconSize: [size, size], // size of the icon
          iconAnchor: [size/2, size/2], // point of the icon which will correspond to marker's location
        }),
        alt:"Exit"
      }).addTo(vm.map)
    }
  }
  return vm.map
}

