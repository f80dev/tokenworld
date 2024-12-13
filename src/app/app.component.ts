import {Component, inject, OnInit} from '@angular/core';
import {ActivatedRoute, Router, RouterOutlet} from '@angular/router';
import {MatToolbar} from '@angular/material/toolbar';
import {MatDialog} from '@angular/material/dialog';
import {environment} from "../environments/environment";
import {UserService} from './user.service';
import {$$, getParams, setParams} from '../tools';
import {MatIcon} from '@angular/material/icon';
import {MatButton, MatIconButton} from '@angular/material/button';
import {DecimalPipe, NgIf} from '@angular/common';
import {MatSnackBar} from '@angular/material/snack-bar';
import {MapComponent} from './map/map.component';
import {MatCheckbox} from '@angular/material/checkbox';
import {MatSlideToggle} from '@angular/material/slide-toggle';
import {FormsModule} from '@angular/forms';
import {InputComponent} from './input/input.component';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MatToolbar, MatIcon, MatIconButton, NgIf, MapComponent, DecimalPipe, MatButton, MatCheckbox, MatSlideToggle, FormsModule, InputComponent],
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
      this.user.network=params.network || environment.networks[0].value
      this.user.address=params.address || localStorage.getItem("address") || ""
      $$("Connexion sur le SC ","https://devnet-explorer.multiversx.com/accounts/"+this.user.get_sc_address())

      if(params.hasOwnProperty("signature")){
        this.user.signature=params.signature
        this.user.address=params.address
      }
      this.user.expert_mode=(localStorage.getItem("expert_mode") || "false")=="true"
      this.router.navigate(["games"],{queryParams:{game_id:params.game}})

  }


  protected readonly environment = environment;


  test() {
   this.router.navigate(["test"])
  }

  open_map() {
    this.router.navigate(["map"])
  }


  go_settings() {
    this.router.navigate(["settings"])
  }

  go_admin() {
    this.router.navigate(["admin"])
  }


  open_build() {
    this.router.navigate(["build"])
  }


  create_world() {
    this.router.navigate(["create"],
      {
        queryParams:{p: setParams({zone:this.user.zone},"","")}
      })
  }

  open_games() {
    this.router.navigate(["games"])
  }
}
