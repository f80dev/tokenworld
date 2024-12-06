import {Component, inject, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {UserService} from '../user.service';
import {MatDialog} from '@angular/material/dialog';
import {WalletComponent} from '../wallet/wallet.component';
import {NgForOf, NgIf} from '@angular/common';
import {ApiService} from '../api.service';
import {get_nft, query, send_transaction_with_transfers} from '../mvx';
import {abi} from '../../environments/abi';
import {environment} from '../../environments/environment';
import {cartesianToPolar, Tokemon} from '../tokenworld';
import {MatButton, MatIconButton} from '@angular/material/button';
import {InputComponent} from '../input/input.component';
import {HourglassComponent, wait_message} from '../hourglass/hourglass.component';
import {TokenTransfer} from '@multiversx/sdk-core/out';
import {showError} from '../../tools';
import {MatIcon} from '@angular/material/icon';
import {MatExpansionPanel, MatExpansionPanelHeader} from '@angular/material/expansion';
import {MatTab, MatTabGroup, MatTabHeader} from '@angular/material/tabs';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    WalletComponent,
    NgForOf,
    MatButton,
    NgIf,
    InputComponent,
    HourglassComponent,
    MatIcon,
    MatIconButton,
    MatExpansionPanel,
    MatExpansionPanelHeader,
    MatTabGroup,
    MatTab,
    MatTabHeader
  ],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css'
})
export class SettingsComponent implements OnInit {
  router=inject(Router)
  user=inject(UserService)
  dialog=inject(MatDialog)
  tokemons:any[]=[]

  api=inject(ApiService)
  sel_to_reload: any;
  max_pv_loading: number=0
  lifepoint: number=1
  message: string=""
  sc_settings: any


  async refresh(){
    this.tokemons=[]
    let idx=Number(await this.user.query("get_idx_address",[this.user.address]))

    let id=0
    for(let tokemon of await this.user.query("tokemons",[])){
      id++
      tokemon.coords=cartesianToPolar(tokemon.x,tokemon.y,1,environment.scale_factor)
      tokemon.id=id
      let identifier=tokemon.nft+"-"+(tokemon.nonce<10 ? "0"+tokemon.nonce : tokemon.nonce)
      tokemon.content=await get_nft(identifier,this.api,this.user.network)
      if(tokemon.owner==idx)this.tokemons.push(tokemon)
    }
    this.sc_settings=await this.user.query("map");
  }


  async ngOnInit() {
    if(!this.user.isConnected())await this.user.login(this)
    this.refresh();
    this.max_pv_loading=Math.round(this.user.get_balance(this.user.get_default_token()))
    }




  open_map(nft: any) {
    let url="http://maps.google.com/maps?z=10&q="+nft.coords.lat+","+nft.coords.long
    open(url,nft.name)
  }


  open_reload(nft: any) {
    this.sel_to_reload=nft
  }



  async send() {
    wait_message(this, "Dropping ...")
    let token=this.user.network.indexOf("devnet")>-1 ? environment.token["elrond-devnet"] : environment.token["elrond-mainnet"]
    let tokens=[TokenTransfer.fungibleFromAmount(token,this.lifepoint,18)]
    let args=[this.sel_to_reload.id]
    this.sel_to_reload=null
    try {
      await send_transaction_with_transfers(this.user.provider,"reloading",args,this.user,tokens)
      this.refresh()
      wait_message(this)
    } catch (e) {
      showError(this, e)
      wait_message(this)
    }
  }
}
