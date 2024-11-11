import {Component, inject, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {getParams, showMessage} from '../../tools';
import {MatButton} from '@angular/material/button';
import {TokemonComponent} from '../tokemon/tokemon.component';
import {UserService} from '../user.service';
import {latLonToCartesian} from '../tokenworld';
import {environment} from '../../environments/environment';
import {HourglassComponent, wait_message} from '../hourglass/hourglass.component';
import {send_transaction} from '../mvx';
import {abi} from '../../environments/abi';
import {MatDialog} from '@angular/material/dialog';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-capture',
  standalone: true,
  imports: [
    MatButton,
    TokemonComponent,
    HourglassComponent,
    NgIf
  ],
  templateUrl: './capture.component.html',
  styleUrl: './capture.component.css'
})
export class CaptureComponent implements OnInit {
  item: any;

  async ngOnInit() {
    this.item = await getParams(this.routes)
  }

  dialog=inject(MatDialog)
  routes = inject(ActivatedRoute)
  user = inject(UserService)
  router=inject(Router)
  message: string=""


  async on_capture() {
    if(!this.user.isConnected())await this.user.login(this);

    let args = [Number(this.item.id),1]
    let contract: string = environment.contract_addr["elrond-devnet"];
    try {
      wait_message(this, "Capturing in progress")
      let tx = await send_transaction(this.user.provider,
        "capture",
        this.user.address,
        args,
        contract,
        "", 0, 0, abi);
      wait_message(this)
    } catch (e){
      wait_message(this);
    }

    showMessage(this,"You are the new owner of this NFT")
    setTimeout(()=>{this.router.navigate(["map"])})

  }
}
