import {Component, inject, OnInit} from '@angular/core';
import {AuthentComponent} from '../authent/authent.component';
import {ApiService} from '../api.service';
import {WalletComponent} from '../wallet/wallet.component';
import * as L from 'leaflet';
import {UserService} from '../user.service';



@Component({
  selector: 'app-test',
  standalone: true,
  imports: [
    AuthentComponent,
    WalletComponent
  ],
  templateUrl: './test.component.html',
  styleUrl: './test.component.css'
})
export class TestComponent implements OnInit {

  private map!: L.Map
  private user=inject(UserService)







  ngOnInit(): void {
    // setTimeout(()=>{
    //
    //   proj4.defs("EPSG:4326", "+proj=longlat +datum=WGS84 +no_defs");
    //   let system=L.CRS.EPSG3395
    //
    //
    //   //this.map=L.map('map',{crs:system, keyboard:true,scrollWheelZoom:true})
    //   let pos=new LatLng(43.8662,2.36763)
    //   let pos2=new LatLng(20.8661,2.36763)
    //
    //   // initializeMap(this,this.user,pos)
    //   // this.map.setView(pos,10)
    //
    //   let p1=polarToCartesian(pos.lat,pos.lng,1,environment.scale_factor,0,system)
    //   let p2=polarToCartesian(pos2.lat,pos2.lng,1,environment.scale_factor,0,system)
    //   $$("p1 cart arrondi ",p1)
    //   $$("p2 cart arrondi ",p2)
    //
    //   let d_polar=system.distance(pos,pos2)  //distance(pos,pos2)
    //   let d_polar_js=distance(pos,pos2)  //distance(pos,pos2)
    //
    //   let d_cart=Math.sqrt(((p1.x-p2.x)*(p1.x-p2.x)+(p1.y-p2.y)*(p1.y-p2.y))/(environment.scale_factor*environment.scale_factor))
    //   $$("Distance en cartesienne ",d_cart)
    //   $$("Distance en polaire depuis leaflet ",d_polar)
    //   $$("Distance en polaire javascript ",d_polar_js)
    //   $$("Marge erreur",100*Math.abs(d_cart-d_polar_js)/d_polar_js)
    //
    //
    //   let p1_tr=cartesianToPolar(p1.x,p1.y,0,environment.scale_factor,0,system)
    //   let p2_tr=cartesianToPolar(p2.x,p2.y,0,environment.scale_factor,0,system)
    //   $$("coords polar ",p1_tr)
    //   $$("coords polar ",p2_tr)
    //
    //   $$("Distance entre le projeté 1 et le retour de projection ",distance(pos,p1_tr))
    //   $$("Distance entre le projeté 2 et le retour de projection ",distance(pos2,p2_tr))
    //
    //
    // })

  }

  api=inject(ApiService)
}
