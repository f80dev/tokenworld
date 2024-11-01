import {Component, inject, OnInit} from '@angular/core';
import {AuthentComponent} from "../authent/authent.component";
import {Location, NgIf} from "@angular/common";
import {UserService} from "../user.service";
import {get_default_connexion} from "../../operation";
import {ActivatedRoute, Router} from "@angular/router";
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
  connexion=get_default_connexion("wallet_connect,extension_wallet")
  _location=inject(Location)
  routes=inject(ActivatedRoute)
  message: string=""
  router=inject(Router)
  private params: any;


  async ngOnInit() {
    this.params=await getParams(this.routes)
    this.user.addr_change.subscribe(()=>{this._location.back()})
  }

  async authent($event: {
    strong: boolean;
    address: string;
    provider: any;
    encrypted: string;
    url_direct_xportal_connect: string
  }) {
    let result=await this.user.authent($event)
    if(this.user.isConnected()){
      if(this.params && this.params.redirectTo)
        this.router.navigate([this.params.redirectTo])
      else
        this._location.back()
    }
  }
}
