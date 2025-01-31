import {AfterViewInit, Component, inject, OnInit} from '@angular/core';
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
import {ApiService} from './api.service';


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
  api=inject(ApiService)


  logout() {
    this.user.logout()
  }



  async login() {
    await this.user.login(this,"","",true)
    localStorage.setItem("address",this.user.address)
    this.show_intro=false
  }



  async ngOnInit() {
    this.user.expert_mode=(localStorage.getItem("expert_mode") || "false")=="true"
    this.user.network=environment.networks[0].value
  }


  protected readonly environment = environment;
  show_intro=true
  message: string=""


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



  create_world() {
    this.router.navigate(["create"],
      {
        queryParams:{p: setParams({zone:this.user.zone},"","")}
      })
  }

  open_games() {
    this.router.navigate(["games"],{queryParams:{autoconnect:false}})
  }

  go_mytokemons() {
    this.router.navigate(["mytokemons"])
  }
}
