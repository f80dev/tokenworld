import {Component, inject, OnInit} from '@angular/core';
import {UserService} from '../user.service';
import {$$, getParams} from '../../tools';
import {environment} from '../../environments/environment';
import {ActivatedRoute, Router} from '@angular/router';
import {MatButton} from '@angular/material/button';
import {MatDialog} from '@angular/material/dialog';
import {ApiService} from '../api.service';

@Component({
  selector: 'app-intro',
  imports: [
    MatButton
  ],
  standalone:true,
  templateUrl: './intro.component.html',
  styleUrl: './intro.component.css'
})
export class IntroComponent implements OnInit {

  async ngOnInit() {
    let params:any=await getParams(this.routes)
    $$("Ouverture de l'application avec les parametres ",params)

    this.message=params.message || "With Tokemon World you can hide NFTs in the geographic area of ​​your choice and invite your friends to find them."

    this.user.network=params.network || environment.networks[0].value

    $$("Connexion sur le SC ","https://devnet-explorer.multiversx.com/accounts/"+this.user.get_sc_address())

    if(params.hasOwnProperty("signature")){
      this.user.signature=params.signature
      this.user.address=params.address
    }
    this.user.expert_mode=(localStorage.getItem("expert_mode") || "false")=="true"

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
    this.router.navigate(["games"])
  }
}
