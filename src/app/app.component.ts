import {Component, inject, OnInit} from '@angular/core';
import {ActivatedRoute, Router, RouterOutlet} from '@angular/router';
import {MatToolbar} from '@angular/material/toolbar';
import {MatDialog} from '@angular/material/dialog';
import {environment} from "../environments/environment";
import {UserService} from './user.service';
import {getParams, setParams, showMessage} from '../tools';
import {MatIcon} from '@angular/material/icon';
import {MatButton, MatIconButton} from '@angular/material/button';
import {DecimalPipe, NgIf} from '@angular/common';
import {MatSnackBar} from '@angular/material/snack-bar';
import {MapComponent} from './map/map.component';
import {_prompt} from './prompt/prompt.component';
import {cartesianToPolar, distance} from './tokenworld';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MatToolbar, MatIcon, MatIconButton, NgIf, MapComponent, DecimalPipe, MatButton],
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
    if(this.user.address){
      this.router.navigate(["drop"])
    } else {
      this.router.navigate(["login"],{queryParams:{message:"You must be connected to select the token to drop",redirectTo:"drop"}});
    }

  }

  go_settings() {
    this.router.navigate(["settings"])
  }

  go_admin() {
    this.router.navigate(["admin"])
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
