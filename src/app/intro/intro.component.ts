import {Component, inject, OnInit} from '@angular/core';
import {UserService} from '../user.service';
import {$$, getParams} from '../../tools';
import {ActivatedRoute, Router} from '@angular/router';
import {MatButton} from '@angular/material/button';
import {MatDialog} from '@angular/material/dialog';
import {ApiService} from '../api.service';
import {MatIcon} from '@angular/material/icon';
import {settings} from '../../environments/settings';

@Component({
  selector: 'app-intro',
  imports: [
    MatButton,MatIcon
  ],
  standalone:true,
  templateUrl: './intro.component.html',
  styleUrl: './intro.component.css'
})
export class IntroComponent implements OnInit {
  params: any;

  async ngOnInit() {

    this.params=await getParams(this.routes)
    this.user.network=this.params.network || "elrond-devnet"

    $$("Ouverture de la page intro avec les parametres ",this.params)
    this.message=this.params.message || "With "+settings.appname+" you hide NFTs in a geographic area of ​​your choice and invite your friends to find them."

    $$("Connexion sur le SC ",this.user.get_sc_address())



    if(this.params.hasOwnProperty("signature")){
      this.user.signature=this.params.signature
      this.user.address=this.params.address
    }
  }

  message: string=""

  user=inject(UserService)
  router=inject(Router)
  routes=inject(ActivatedRoute)
  dialog=inject(MatDialog)
  api=inject(ApiService)


  async login() {

    await this.user.login(this)
    localStorage.setItem("address",this.user.address)

    let params:any=await getParams(this.routes)
    if(!params.hasOwnProperty("debug")){
      this.router.navigate(["games"],{queryParams:{autoconnect:true,game:params.game || localStorage.getItem("selected_game")}})
    }
  }

  available_zone() {
    this.router.navigate(["games"],{queryParams:this.params})
  }

  open_about() {
    this.router.navigate(["about"])
  }
}
