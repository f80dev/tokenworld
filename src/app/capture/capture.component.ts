import {Component, inject, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {getParams, showMessage} from '../../tools';
import {MatButton} from '@angular/material/button';
import {TokemonComponent} from '../tokemon/tokemon.component';
import {UserService} from '../user.service';
import {environment} from '../../environments/environment';
import {HourglassComponent, wait_message} from '../hourglass/hourglass.component';
import {send_transaction} from '../mvx';
import {abi} from '../../environments/abi';
import {MatDialog} from '@angular/material/dialog';
import {Location, NgIf} from '@angular/common';
import {InputComponent} from '../input/input.component';

@Component({
  selector: 'app-capture',
  standalone: true,
  imports: [
    MatButton,
    TokemonComponent,
    HourglassComponent,
    NgIf,
    InputComponent
  ],
  templateUrl: './capture.component.html',
  styleUrl: './capture.component.css'
})
export class CaptureComponent implements OnInit {
  item: any;
  _location=inject(Location)

  async ngOnInit() {
    this.item = await getParams(this.routes)
  }

  dialog=inject(MatDialog)
  routes = inject(ActivatedRoute)
  user = inject(UserService)
  router=inject(Router)
  message: string=""
  max_engagment: number=100;
  pv_to_engage: any=1;


  async on_capture() {
    if(!this.user.isConnected())await this.user.login(this);

    let args = [Number(this.item.id)]
    let contract: string = environment.contract_addr["elrond-devnet"];
    try {
      wait_message(this, "Capturing in progress")
      let tx = await send_transaction(this.user.provider,
        "capture",
        this.user.address,
        args,
        contract,
        environment.token, 0, this.pv_to_engage, abi);
      wait_message(this)
      debugger
    } catch (e){
      wait_message(this);
    }

    showMessage(this,"You are the new owner of this NFT")
    setTimeout(()=>{this.router.navigate(["map"])})

  }

  cancel() {
    this._location.back()
  }
}
