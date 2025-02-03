import {Component, inject, OnInit} from '@angular/core';
import {NgForOf, NgIf} from '@angular/common';
import {UserService} from '../user.service';
import {ActivatedRoute, Router} from '@angular/router';
import {$$, getParams, showMessage} from '../../tools';
import {MatButton, MatIconButton} from '@angular/material/button';
import {Game, share_game} from '../tokenworld';
import {MatSnackBar} from '@angular/material/snack-bar';
import {get_nft, send_transaction} from '../mvx';
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
  show_nearest_zone: boolean = false;


  async refresh() {
    let owner_filter = this.show_my_games ? this.user.idx : 0
    let pos=new LatLng(0,0)
    if(this.show_nearest_zone){
      try{
        pos=await this.user.geoloc(this.geolocService)
      }catch (e:any){
        this.show_nearest_zone=false
      }

    }
    this.games = await this.user.extract_games(true, this.show_closed_games, owner_filter,pos)
    this.games.sort((a, b) => a.score - b.score)
  }


  async ngOnInit() {
    await this.refresh()

    let params: any = await getParams(this.routes)
    $$("Ouverture des parties avec ", params)
    let autoconnect: boolean = (params.autoconnect == "true")

    if (autoconnect) {
      let game_id = params.hasOwnProperty("game") ? Number(params.game) : Number(localStorage.getItem("selected_game") || "1")
      let game = await this.user.open_game(game_id)
      if (game) {
        this.user.init_game(game)
        this.quit()
      } else {
        this.quit("create")
      }
    }
  }


  quit(redirect = "map") {
    if (this.user.game) localStorage.setItem("selected_game", String(this.user.game.id))
    this.router.navigate([redirect])
  }


  select(game: any) {
    this.user.init_game(game)
    localStorage.setItem("selected_game", String(this.user.game!.id));
    this.quit()
  }



  async close_map(game: any) {
    await this.user.login(this, "", "", true)
    $$("Fermeture de ", game)
    let args = [game.id]
    wait_message(this, "Closing")
    try {
      let result = await send_transaction(this.user.provider, "close_game", this.user.address, args, this.user.get_sc_address())
    } catch (e: any) {

    }
    wait_message(this)
    this.refresh()
  }


  async stacking(game: any) {
    await this.user.login(this, "", "", true)
    let max_amount = await _prompt(this, "Max amount per tokemon", "", "", "number", "Send", "Cancel", false)
    let args = [game.id, Number(max_amount)]
    let result = await send_transaction(this.user.provider, "staking", this.user.address, args, this.user.get_sc_address())
    showMessage(this, "Stacking sended")
  }

  async share_map(game: any) {
    await share_game(this,game)
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


  async show_nfts(game: Game) {
    if (!game.previews || game.previews.length == 0) {
      for (let identifier of game.nfts) {
        let nft:any=await get_nft(identifier, this.api, this.user.network)
        game.previews.push(nft.media[0].originalUrl)
      }
    } else {
      game.previews = []
    }
  }


}
