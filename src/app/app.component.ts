import {Component, inject, OnInit} from '@angular/core';
import {ActivatedRoute, Router, RouterOutlet} from '@angular/router';
import {MatToolbar} from '@angular/material/toolbar';
import {MatDialog} from '@angular/material/dialog';
import {environment} from "../environments/environment";
import {UserService} from './user.service';
import {getParams, showMessage} from '../tools';
import {MatIcon} from '@angular/material/icon';
import {MatIconButton} from '@angular/material/button';
import {NgIf} from '@angular/common';
import {GeolocService} from './geoloc.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {MapComponent} from './map/map.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MatToolbar, MatIcon, MatIconButton, NgIf, MapComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'tokemonworld';
  router=inject(Router)
  dialog=inject(MatDialog)
  user=inject(UserService)
  routes=inject(ActivatedRoute)
  geolocService=inject(GeolocService)
  toast=inject(MatSnackBar)

  location: { latitude: number; longitude: number }={latitude:0,longitude:0}

  go(route: string) {
    this.router.navigate([route])
  }

  logout() {
    this.user.logout()
  }

  async login() {
    this.user.login(this)
  }

  async ngOnInit() {
    let params:any=await getParams(this.routes)
    if(params.hasOwnProperty("signature")){
      this.user.signature=params.signature
      this.user.address=params.address
    }
    this.user.expert_mode=(localStorage.getItem("expert_mode") || "false")=="true"

    try{
      let position=await this.geolocService.getCurrentPosition()
      this.location = position.coords
      showMessage(this,'Your position is ' + this.location.latitude+","+this.location.longitude)
    }catch (err:any){
      showMessage(this,'Error getting location: ' + err.message)
    }

  }

  protected readonly environment = environment;
}
