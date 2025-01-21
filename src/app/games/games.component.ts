import {Component, inject, OnInit} from '@angular/core';
import {NgForOf, NgIf} from '@angular/common';
import {UserService} from '../user.service';
import {ActivatedRoute, Router} from '@angular/router';
import {$$, getParams, setParams, showMessage} from '../../tools';
import {MatButton, MatIconButton} from '@angular/material/button';
import {cartesianToPolar, center_of, distance, Game, share_game} from '../tokenworld';
import {MatSnackBar} from '@angular/material/snack-bar';
import {get_nft, send_transaction} from '../mvx';
import {_prompt} from '../prompt/prompt.component';
import {MatDialog} from '@angular/material/dialog';
import {MatIcon} from '@angular/material/icon';
import {Clipboard} from '@angular/cdk/clipboard';
import {environment} from '../../environments/environment';
import {MatExpansionPanel, MatExpansionPanelHeader} from '@angular/material/expansion';
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
    SafePipe
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
  ngNavigatorShareService=inject(NgNavigatorShareService)



  show_closed_games = false;
  show_my_games = false;
  message = "";
  geolocService = inject(GeolocService)
  show_nearest_zone: boolean = false;


  async refresh() {
    let owner_filter = this.show_my_games ? this.user.idx : 0
    let pos=this.show_nearest_zone ? await this.user.geoloc(this.geolocService) : new LatLng(0,0)
    this.games = await this.user.extract_games(true, this.show_closed_games, owner_filter,pos)
    this.games.sort((a, b) => a.score - b.score)
  }


  async ngOnInit() {
    await this.refresh()

    let params: any = await getParams(this.routes)
    $$("Ouverture des parties avec ", params)
    let autoconnect: boolean = (params.autoconnect == "true")

    if (autoconnect) {
      let game_id = params.hasOwnProperty("game") ? Number(params.game) : 0
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
    this.quit()
  }

  see_map(game: any) {
    open("https://www.google.com/maps/@?api=1&map_action=map&bbox="+game.bbox, "maps")
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
    let message = await _prompt(this, "Introduction message", "Catch some NFT around you with this game", "", "text", "Share", "Cancel", false)
    if (message != "") {
      this.clipboard.copy(share_game(game,message))
      this.ngNavigatorShareService.share({
        title: "Join me in "+game.title+" gaming zone",
        text: message,
        url: share_game(game,message)
      })
        .then( (response) => {console.log(response);},()=>{
        })
        .catch( (error) => {
        });
      showMessage(this, "Link in clipboard")
    }

  }

  create_game() {
    this.quit("create")
  }

  async update_only_mygame() {
    await this.user.login(this, "", "", true)
    this.refresh()
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
