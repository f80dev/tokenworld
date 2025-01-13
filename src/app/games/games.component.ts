import {Component, inject, OnInit} from '@angular/core';
import {NgForOf, NgIf} from '@angular/common';
import {UserService} from '../user.service';
import {ActivatedRoute, Router} from '@angular/router';
import {$$, getParams, setParams, showMessage} from '../../tools';
import {MatButton, MatIconButton} from '@angular/material/button';
import {cartesianToPolar, center_of} from '../tokenworld';
import {MatSnackBar} from '@angular/material/snack-bar';
import {send_transaction} from '../mvx';
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
    HourglassComponent
  ],
  templateUrl: './games.component.html',
  styleUrl: './games.component.css'
})
export class GamesComponent implements OnInit {
  games: any[]=[];
  user=inject(UserService)
  toast=inject(MatSnackBar)
  routes=inject(ActivatedRoute)
  dialog=inject(MatDialog)
  router=inject(Router)
  clipboard=inject(Clipboard)
  show_closed_games=false;
  show_my_games=false;
  message="";




  async refresh(){
    let owner_filter=this.show_my_games ? this.user.idx : 0
    this.games=await this.user.extract_games(true,this.show_closed_games,owner_filter)
  }


  async ngOnInit() {
    await this.refresh()

    let params:any=await getParams(this.routes)
    $$("Ouverture des parties avec ",params)
    let autoconnect:boolean=(params.autoconnect=="true")
    let game_id=params.hasOwnProperty("game") ? Number(params.game) : 0
    if(game_id>this.games.length)game_id=0

    if(autoconnect){
      if(game_id>0 && this.games[game_id-1].closed){
        game_id=0
        showMessage(this,"This game is closed")
      }

      if(game_id>0){
        this.user.init_game(this.games[game_id-1])
        this.quit()
      }else {
        let i = 0
        while (i < this.games.length && this.games[i].closed) {
          i++
        }

        if(i==this.games.length){
          this.quit("create")
        }else{
          if (this.games[i].closed) {
            this.quit("map")
          } else {
            this.user.init_game(this.games[i])
            this.quit()
          }
        }
      }
    }
  }



  quit(redirect="map"){
    if(this.user.game)localStorage.setItem("selected_game",String(this.user.game.id))
    this.router.navigate([redirect])
  }


  select(game: any) {
    this.user.init_game(game)
    this.quit()
  }

  see_map(game: any) {
    let center=cartesianToPolar(center_of(game.sw,game.ne))
    open("https://maps.google.com/maps/@"+center.lat+","+center.lng+",12z","maps")
  }

  async close_map(game: any) {
    await this.user.login(this,"","",true)
    $$("Fermeture de ",game)
    let args=[game.id]
    wait_message(this,"Closing")
    try{
      let result=await send_transaction(this.user.provider,"close_game",this.user.address,args,this.user.get_sc_address())
    }catch (e:any){

    }
    wait_message(this)
    this.refresh()
  }


  async stacking(game: any) {
    await this.user.login(this,"","",true)
    let max_amount=await _prompt(this,"Max amount per tokemon","","","number","Send","Cancel",false)
    let args=[game.id,Number(max_amount)]
    let result=await send_transaction(this.user.provider,"staking",this.user.address,args,this.user.get_sc_address())
    showMessage(this,"Stacking sended")
  }

  async share_map(game: any) {
    let message=await _prompt(this,"Introduction message","Catch some NFT around you with this game","","text","Share","Cancel",false)
    if(message!=""){
      let params={autoconnect:true,game:game.id,message:message}
      this.clipboard.copy(environment.appli+"/games?"+setParams(params))
      showMessage(this,"Link in clipboard")
    }

  }

  create_game() {
    this.quit("create")
  }

  async update_only_mygame() {
    await this.user.login(this,"","",true)
    this.refresh()
  }
}
