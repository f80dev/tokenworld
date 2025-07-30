import {Component, inject, OnInit} from '@angular/core';
import {NgForOf, NgIf} from '@angular/common';
import {UserService} from '../user.service';
import {ActivatedRoute, Router} from '@angular/router';
import {$$, getParams, showMessage} from '../../tools';
import {MatButton, MatIconButton} from '@angular/material/button';
import {Game} from '../tokenworld';
import {MatSnackBar} from '@angular/material/snack-bar';
import {level, send_transaction_with_transfers} from '../mvx';
import {_prompt} from '../prompt/prompt.component';
import {MatDialog} from '@angular/material/dialog';
import {MatIcon} from '@angular/material/icon';
import {Clipboard} from '@angular/cdk/clipboard';
import {MatAccordion, MatExpansionPanel, MatExpansionPanelHeader} from '@angular/material/expansion';
import {GameComponent} from '../game/game.component';
import {MatSlideToggle} from '@angular/material/slide-toggle';
import {FormsModule} from '@angular/forms';
import {HourglassComponent, wait_message} from '../hourglass/hourglass.component';
import {ApiService} from '../api.service';
import {GeolocService} from '../geoloc.service';
import {LatLng} from 'leaflet';
import {SafePipe} from '../safe.pipe';
import {NgNavigatorShareService} from 'ng-navigator-share';
import {environment} from '../../environments/environment';
import {settings} from '../../environments/settings';
import {encodeCID} from 'ipfs-http-client/pin/remote/utils';

@Component({
  selector: 'app-games',
  standalone: true,
  imports: [
    NgForOf,
    MatButton,
    NgIf,
    MatIcon,
    MatIconButton,
    MatExpansionPanel,
    MatExpansionPanelHeader,
    GameComponent,
    MatSlideToggle,
    FormsModule,
    HourglassComponent,
    SafePipe,
    MatAccordion
  ],
  templateUrl: './games.component.html',
  styleUrl: './games.component.css'
})
export class GamesComponent implements OnInit {
  games: Game[] = [];
  user = inject(UserService)
  toast = inject(MatSnackBar)
  routes = inject(ActivatedRoute)
  dialog = inject(MatDialog)
  router = inject(Router)
  clipboard = inject(Clipboard)
  api = inject(ApiService)
  shareService=inject(NgNavigatorShareService)



  show_closed_games = false;
  show_my_games = false;
  message = "";
  geolocService = inject(GeolocService)
  show_nearest_zone: boolean = true;
  show_with_welcome_pack: boolean = false;


  async refresh() {
    let owner_filter = this.show_my_games ? this.user.idx : 0
    let pos=new LatLng(0,0)

    try{
      pos=await this.user.geoloc(this.geolocService)
    }catch (e:any){
      this.show_nearest_zone=false
    }

    this.games = await this.user.extract_games(true, this.show_closed_games, owner_filter,this.show_with_welcome_pack,pos)
    this.games.sort((a, b) => a.score - b.score)
  }


  async ngOnInit() {
    await this.refresh()

    let params: any = await getParams(this.routes)
    this.user.network=settings.network
    $$("Ouverture des parties avec ", params)
    let autoconnect: boolean = (params.autoconnect == "true")

    if (autoconnect) {
      let game_id = params.hasOwnProperty("game") ? Number(params.game) : Number(localStorage.getItem("selected_game") || "0")
      let game = await this.user.open_game(game_id)
      if (game) {
        await this.user.init_game(game)
        if(this.user.game)this.quit("map",{game:this.user.game.id,autoconnect:true})
      } else {
        this.quit("create")
      }
    }
  }


  quit(redirect = "map",params:any={}) {
    if (this.user.game) localStorage.setItem("selected_game", String(this.user.game.id))
    this.router.navigate([redirect],{queryParams:params})
  }


  async select(game: any) {
    await this.user.init_game(game)
    if(this.user.game){
      localStorage.setItem("selected_game", String(this.user.game!.id));
      this.quit("map",{game:game.id,autoconnect:true})
    }else{
      showMessage(this,"Game selection canceled")
    }

  }



  async close_map(game: any) {
    await this.user.login(this, "", "", true)
    $$("Fermeture de ",game)
    let args = [game.id]
    wait_message(this, "Closing")
    try {
      let result = await send_transaction_with_transfers(this.user, "close_game", args,[],environment.max_gaz)
    } catch (e: any) {
      showMessage(this,e.message)
    }
    wait_message(this)
    this.refresh()
  }


  async stacking(game: any) {
    await this.user.login(this, "", "", true)
    let max_amount = await _prompt(this, "Max amount per tokemon", "", "", "number", "Send", "Cancel", false)
    let args = [game.id, Number(max_amount)]
    let result = await send_transaction_with_transfers(this.user, "staking", args)
    showMessage(this, "Stacking sended")
  }


  create_game() {
    this.quit("create")
  }


  async update_only_mygame() {
    try{
      await this.user.login(this, "", "", true)
      this.refresh()
    }catch (e:any){
      this.show_my_games=false
    }
  }


  async load_hp_stock_from_game(game: Game) {
    //let idx=this.games.indexOf(game)
    //this.games[idx].bank=Number(await this.user.query("stocks",[game.id]))
  }

  async transfer_to_owner(game: Game) {
    wait_message(this,"Transfer all tokemons to owner")
    try{
      let rc:any=await send_transaction_with_transfers(this.user,"restore_to_owners", [game.id,200],[],environment.max_gaz)
      if(rc.returnMessage=="ok"){
        let tokemon_in_game=Number(rc.values[0])
        if(tokemon_in_game>0){
          showMessage(this,"He's staying "+tokemon_in_game+" tokemon in the game")
        }else{
          showMessage(this,"This zone is empty, you can delete them")
        }

      }
    }catch(e:any){
      showMessage(this,e.message)
    }

    wait_message(this)
  }

  protected readonly level = level;

  async login() {
    this.user.logout(true)
    await this.user.login(this,"","",true)
    showMessage(this,"You are connected on "+this.user.network)
  }
}
