import {Component, inject, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {getParams, showMessage} from '../../tools';
import {MatButton} from '@angular/material/button';
import {TokemonComponent} from '../tokemon/tokemon.component';
import {UserService} from '../user.service';
import {environment} from '../../environments/environment';
import {HourglassComponent, wait_message} from '../hourglass/hourglass.component';
import {send_transaction, send_transaction_with_transfers} from '../mvx';
import {abi} from '../../environments/abi';
import {MatDialog} from '@angular/material/dialog';
import {Location, NgIf} from '@angular/common';
import {InputComponent} from '../input/input.component';
import {TokenTransfer} from '@multiversx/sdk-core/out';

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
  max_engagment: number=100
  pv_to_engage: any=0


  async on_capture() {
    if(!this.user.isConnected())await this.user.login(this);

    let args = [Number(this.item.id)]
    let contract: string = environment.contract_addr["elrond-devnet"];
    try {
      wait_message(this, "Capturing in progress")
      let tokens=[]
      if(this.pv_to_engage>0)tokens.push(TokenTransfer.fungibleFromAmount(environment.token,this.pv_to_engage,18))
      let tx = await send_transaction_with_transfers(this.user.provider,"capture",args,this.user,tokens);
      wait_message(this)
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
