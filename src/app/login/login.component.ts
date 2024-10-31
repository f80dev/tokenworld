import {Component, inject, OnInit} from '@angular/core';
import {AuthentComponent} from "../authent/authent.component";
import {Location, NgIf} from "@angular/common";
import {UserService} from "../user.service";
import {get_default_connexion} from "../../operation";
import {ActivatedRoute} from "@angular/router";
import {getParams} from "../../tools";

@Component({
  selector: 'app-login',
  standalone: true,
    imports: [
        AuthentComponent,
        NgIf
    ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {

  user=inject(UserService)
  connexion=get_default_connexion("wallet_connect,extension_wallet,web_wallet,xAlias")
  _location=inject(Location)
  routes=inject(ActivatedRoute)
  message: string=""


  async ngOnInit() {
    this.connexion.web_wallet=true
    let params:any=await getParams(this.routes)
    this.message=params.message || ""
    this.user.addr_change.subscribe(()=>{this._location.back()})
  }
}
