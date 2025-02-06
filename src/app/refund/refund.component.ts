import {Component, inject, OnInit} from '@angular/core';
import {$$, getParams, showMessage} from '../../tools';
import {ActivatedRoute, Router} from '@angular/router';
import {MatDialog} from '@angular/material/dialog';
import {UserService} from '../user.service';
import {WalletComponent} from '../wallet/wallet.component';
import {send_transaction_with_transfers} from '../mvx';
import {TokenTransfer} from '@multiversx/sdk-core/out';
import {InputComponent} from '../input/input.component';
import {MatButton} from '@angular/material/button';
import {Location, NgIf} from '@angular/common';
import {ApiService} from '../api.service';
import {HourglassComponent, wait_message} from '../hourglass/hourglass.component';

@Component({
  selector: 'app-refund',
  imports: [
    WalletComponent,
    InputComponent,
    MatButton,
    NgIf,
    HourglassComponent
  ],
  templateUrl: './refund.component.html',
  standalone: true,
  styleUrl: './refund.component.css'
})
export class RefundComponent implements OnInit{

  routes=inject(ActivatedRoute)
  dialog=inject(MatDialog)
  user=inject(UserService)
  api=inject(ApiService)
  location=inject(Location)
  router=inject(Router)

  sel_token: any=null
  coin: any=null
  amount: number = 0;
  type_control: any="slide"
  message: string=""

  async ngOnInit() {
    this.user.login(this)
    await this.user.init_balance(this.api)

    let params:any=await getParams(this.routes)
    this.sel_token=params.token
    debugger
    if(params.hasOwnProperty("coin")){
      this.sel_coin(this.user.tokens[params.coin])
    }
  }

  async sel_coin($event: any) {
    this.coin=$event
    if(Number(this.coin.balance/1e18)>1000)this.type_control="number"
  }

  async send() {
    await this.user.login(this,"","",true,0.01,"")
    let args=[this.sel_token.id]
    let tokens:TokenTransfer[]=[TokenTransfer.fungibleFromAmount(this.coin.identifier,this.amount,18)]
    wait_message(this,"Loading your tokemon")
    try{
      await send_transaction_with_transfers(
        this.user,
        this.coin.identifier==this.user.get_default_token() ? "reloading" : "add_to_bag",
        args,
        tokens)
      wait_message(this)
      showMessage(this,"Your tokemon is loaded")
      this.quit()
    }catch (e){
      $$("erreur de loading")
    }
    wait_message(this)
  }

  cancel() {
    this.coin=null
  }

  quit() {
    this.router.navigate(["map"])
  }
}
