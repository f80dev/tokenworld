import {Component, inject, OnInit} from '@angular/core';
import {MatButton} from '@angular/material/button';
import {UserService} from '../user.service';
import {ApiService} from '../api.service';
import {getParams, showMessage} from '../../tools';
import {ActivatedRoute, Router} from '@angular/router';
import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
  selector: 'app-faucet',
  standalone: true,
  imports: [
    MatButton
  ],
  templateUrl: './faucet.component.html',
  styleUrl: './faucet.component.css'
})
export class FaucetComponent implements OnInit {

  user=inject(UserService)
  api=inject(ApiService)
  routes=inject(ActivatedRoute)
  router=inject(Router)
  message=""
  toast=inject(MatSnackBar)



  async  ngOnInit() {
    setTimeout(async ()=>{
      let params:any=await getParams(this.routes)
      this.message=params.message
      this.user.login(this)
    },50)
  }



  async refund() {
    let url="https://devnet-wallet.multiversx.com/unlock"
    if(this.user.network.indexOf("devnet")==-1)url=url.replace("devnet-","")

    showMessage(this,"Connect to your wallet to buy some egld to pay fee transaction")
    setTimeout(()=>{
      open(url,"faucet")
    },1000)

  }

  cancel() {
    this.router.navigate(["intro"])
  }
}
