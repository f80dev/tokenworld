import {Component, inject, OnInit} from '@angular/core';
import {getParams} from '../../tools';
import {ActivatedRoute} from '@angular/router';
import {MatDialog} from '@angular/material/dialog';
import {UserService} from '../user.service';
import {WalletComponent} from '../wallet/wallet.component';
import {send_transaction_with_transfers} from '../mvx';
import {TokenTransfer} from '@multiversx/sdk-core/out';
import {InputComponent} from '../input/input.component';
import {MatButton} from '@angular/material/button';

@Component({
  selector: 'app-refund',
  imports: [
    WalletComponent,
    InputComponent,
    MatButton
  ],
  templateUrl: './refund.component.html',
  standalone: true,
  styleUrl: './refund.component.css'
})
export class RefundComponent implements OnInit{

  routes=inject(ActivatedRoute)
  dialog=inject(MatDialog)
  user=inject(UserService)
  sel_token: any;
  coin: any;
  amount: number = 0;

  async ngOnInit() {
    let params:any=await getParams(this.routes)
    await this.user.login(this,"","",true)
    this.sel_token=params.token
  }

  async sel_coin($event: any) {
    this.coin=$event
  }

  async send() {
    debugger
    let args=[this.sel_token.id]
    let tokens:TokenTransfer[]=[TokenTransfer.fungibleFromAmount(this.coin.identifier,this.amount,18)]
    await send_transaction_with_transfers(this.user,"add_to_bag",args,tokens)
  }
}
