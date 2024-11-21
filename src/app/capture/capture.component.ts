import {Component, inject, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {getParams, showMessage} from '../../tools';
import {MatButton} from '@angular/material/button';
import {TokemonComponent} from '../tokemon/tokemon.component';
import {UserService} from '../user.service';
import {environment} from '../../environments/environment';
import {HourglassComponent, wait_message} from '../hourglass/hourglass.component';
import { send_transaction_with_transfers} from '../mvx';
import {MatDialog} from '@angular/material/dialog';
import {DecimalPipe, Location, NgIf} from '@angular/common';
import {InputComponent} from '../input/input.component';
import {TokenTransfer} from '@multiversx/sdk-core/out';
import {eval_direct_url_xportal} from '../../crypto';
import {DeviceService} from '../device.service';

@Component({
  selector: 'app-capture',
  standalone: true,
  imports: [
    MatButton,
    TokemonComponent,
    HourglassComponent,
    NgIf,
    InputComponent,
    DecimalPipe
  ],
  templateUrl: './capture.component.html',
  styleUrl: './capture.component.css'
})
export class CaptureComponent implements OnInit {
  item: any;
  _location=inject(Location)
  chance_to_win: number=1

  async ngOnInit() {
    this.item = await getParams(this.routes)
    // @ts-ignore
    this.lang_pv=environment.dictionnary[this.user.lang || "fr"].pv
  }

  dialog=inject(MatDialog)
  routes = inject(ActivatedRoute)
  user = inject(UserService)
  router=inject(Router)
  device=inject(DeviceService)

  message: string=""
  max_engagment: number=100
  pv_to_engage: number=0


  async on_capture() {
    if(!this.user.isConnected())await this.user.login(this);

    debugger
    let args = [Number(this.item.id)]
    let contract: string = environment.contract_addr["elrond-devnet"];
    try {
      wait_message(this, "Capturing in progress")
      let tokens=[]
      if(this.pv_to_engage>0)tokens.push(TokenTransfer.fungibleFromAmount(this.user.get_default_token(),this.pv_to_engage,18))
      let tx = await send_transaction_with_transfers(
        this.user.provider,
        this.pv_to_engage>0 ? "capture" : "take",
        args,
        this.user,
        tokens);
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

  update_value($event: any) {
    this.pv_to_engage=$event
    this.chance_to_win=Math.round(this.item.pv / this.pv_to_engage)
  }

  protected readonly environment = environment;
  lang_pv: string="HP"

  open_xportal() {
    open(eval_direct_url_xportal(this.user.provider.uri))
  }
}
