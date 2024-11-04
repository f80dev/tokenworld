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
  toast=inject(MatSnackBar)

  go(route: string) {
    this.router.navigate([route])
  }

  logout() {
    this.user.logout()
  }

  async login() {
    await this.user.login(this)
    localStorage.setItem("address",this.user.address)
  }

  async ngOnInit() {
    let params:any=await getParams(this.routes)
    if(params.hasOwnProperty("signature")){
      this.user.signature=params.signature
      this.user.address=params.address
    }
    this.user.expert_mode=(localStorage.getItem("expert_mode") || "false")=="true"
    this.user.address=localStorage.getItem("address") || ""
  }

  protected readonly environment = environment;

  test() {
   this.router.navigate(["test"])
  }

  open_map() {
    this.router.navigate(["map"])
  }

  open_drop() {
    if(!this.user.isConnected()){
      this.router.navigate(["login"],{queryParams:{message:"You must be connected to select the token to drop",redirectTo:"drop"}});
    }
    this.router.navigate(["drop"])
  }
}
