import {Component, inject, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {UserService} from '../user.service';
import {MatDialog} from '@angular/material/dialog';
import {WalletComponent} from '../wallet/wallet.component';
import {NgForOf, NgIf} from '@angular/common';
import {ApiService} from '../api.service';
import {get_nft, query, send_transaction_with_transfers} from '../mvx';
import {environment} from '../../environments/environment';
import {cartesianToPolar, Game, Tokemon} from '../tokenworld';
import {MatButton, MatIconButton} from '@angular/material/button';
import {InputComponent} from '../input/input.component';
import {HourglassComponent, wait_message} from '../hourglass/hourglass.component';
import {TokenTransfer} from '@multiversx/sdk-core/out';
import {setParams, showError} from '../../tools';
import {MatIcon} from '@angular/material/icon';
import {MatAccordion, MatExpansionPanel, MatExpansionPanelHeader} from '@angular/material/expansion';
import {MatTab, MatTabGroup, MatTabHeader} from '@angular/material/tabs';
import {settings} from '../../environments/settings';

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
    MatTabHeader,
    MatAccordion
  ],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css'
})
export class SettingsComponent implements OnInit {
  router=inject(Router)
  user=inject(UserService)
  dialog=inject(MatDialog)
  api=inject(ApiService)
  sel_to_reload: any;
  games: Game[] = [];
  max_pv_loading: number=0
  lifepoint: number=1
  message: string=""
  sc_settings: any
  tokemons: Tokemon[] = [];


  async refresh(){
    if(this.user.isConnected(true)){
      this.tokemons=[]
      this.games=await query("games",[],this.user.get_sc_address(),this.user.network)
      let rc:any=await query("show_all_my_nfts",[0,this.user.address],this.user.get_sc_address(),this.user.network)
      for(let tokemon of rc){
        let identifier=tokemon.nft+"-"+(tokemon.nonce<10 ? "0"+tokemon.nonce : tokemon.nonce)
        tokemon.content=await get_nft(identifier,this.api,this.user.network)
        this.tokemons.push(tokemon)
      }

      this.sc_settings=await query("map",[],this.user.get_sc_address(),this.user.network);
    }
  }


  async ngOnInit() {
    await this.user.login(this)
    await this.user.init_balance(this.api)
    this.refresh()
    if(this.user.tokens.hasOwnProperty(this.user.get_default_token())){
      this.max_pv_loading=Number(this.user.tokens[this.user.get_default_token()].balance/1e18)
    }
  }



  open_map(nft: any) {
    let url="http://maps.google.com/maps?z=10&q="+nft.coords.lat+","+nft.coords.long
    open(url,nft.name)
  }




  open_reload(nft: any,coin:any) {
    this.router.navigate(["refund"],
      {queryParams:{p:setParams({token:nft,coin:coin},"","")}})
  }



  async send() {
    wait_message(this, "Reloading ...")
    let tokens=[TokenTransfer.fungibleFromAmount(settings.token,this.lifepoint,18)]
    let args=[this.sel_to_reload.id]
    this.sel_to_reload=null
    try {
      await send_transaction_with_transfers(this.user,"reloading",args,tokens)
      this.refresh()
      wait_message(this)
    } catch (e) {
      showError(this, e)
      wait_message(this)
    }
  }


  on_select($event: any) {
    if(this.user.game){
      let obj={game_id:this.user.game.id,lat:0,lng:0,nft:$event.identifier}
      this.router.navigate(["drop"],{queryParams:{p:setParams(obj,"","")}})
    }
  }

  protected readonly environment = environment;


  async on_open_tokemon_engaged() {
    await this.user.login(this,"","",true)
    this.refresh()
  }

  protected readonly Number = Number;

  open_game(tokemon: Tokemon) {
    this.router.navigate(["games"],{queryParams:{autoconnect:true,game:tokemon.game}})
  }
}
