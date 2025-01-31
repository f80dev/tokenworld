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
import {ApiService} from '../api.service';
import {Point3D, polarToCartesian} from '../tokenworld';

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
  api=inject(ApiService)
  _location=inject(Location)
  chance_to_win: number=1

  dialog=inject(MatDialog)
  routes = inject(ActivatedRoute)
  user = inject(UserService)
  router=inject(Router)
  device=inject(DeviceService)

  message: string=""
  max_engagment: number=100
  pv_to_engage: number=0
  target=new Point3D(0,0,0)



  async ngOnInit() {
    let params:any = await getParams(this.routes)
    this.item=params.item
    this.target=params.target
    // @ts-ignore
    this.lang_pv=environment.dictionnary[this.user.lang || "fr"].pv
  }


  async on_capture() {
    await this.user.login(this,"","",true);

    if(this.user.game){
      try {
        let func_name=this.pv_to_engage>0 ? "capture" : "take"

        let args=func_name=="take" ? [this.user.game.id,Number(this.item.id),this.target.x,this.target.y,this.target.z] : [Number(this.item.id),this.target.x,this.target.y,this.target.z]
        wait_message(this, "Capture in progress")
        let tokens=[]
        if(this.pv_to_engage>0)tokens.push(TokenTransfer.fungibleFromAmount(this.user.get_default_token(),this.pv_to_engage,18))
        let rc:any = await send_transaction_with_transfers(
          this.user.provider,
          func_name,
          args,
          this.user,
          tokens);
        wait_message(this)
        showMessage(this,rc.returnMessage)
      } catch (e){
        wait_message(this);
      }
      showMessage(this,"You are the new owner of this NFT")
      setTimeout(()=>{this.router.navigate(["map"])})
    }

  }

  cancel() {
    this._location.back()
  }

  update_value($event: any) {
    this.pv_to_engage=$event
    this.chance_to_win=1+this.item.pv / this.pv_to_engage
  }

  protected readonly environment = environment;
  lang_pv: string="HP"

  open_xportal() {
    open(eval_direct_url_xportal(this.user.provider.uri))
  }
}
