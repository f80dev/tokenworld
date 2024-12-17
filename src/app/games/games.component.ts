import {Component, inject, OnInit} from '@angular/core';
import {NgForOf} from '@angular/common';
import {UserService} from '../user.service';
import {ActivatedRoute, Router} from '@angular/router';
import {$$, getParams, showMessage} from '../../tools';
import {MatButton} from '@angular/material/button';
import {cartesianToPolar, center_of} from '../tokenworld';
import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
  selector: 'app-games',
  standalone: true,
  imports: [
    NgForOf,
    MatButton
  ],
  templateUrl: './games.component.html',
  styleUrl: './games.component.css'
})
export class GamesComponent implements OnInit {
  games: any;
  user=inject(UserService)
  toast=inject(MatSnackBar)
  routes=inject(ActivatedRoute)
  router=inject(Router)
  private selected_game: number=0;

  async ngOnInit() {
    let params:any=await getParams(this.routes)
    this.games=[]
    let id=1 //le premier element d'un VecMapper commence à 1
    for(let game of await this.user.query("games",[])){
      game["id"]=id
      this.games.push(game)
      id=id+1
    }
    if(this.games.length==0){
      $$("Aucune partie disponible")
      this.quit("create")
    }else{
      if(this.games.length==1) {
        $$("une seule partie disponible donc on la sélectionne")
        this.user.init_game(this.games[0])
        this.quit()
      }else{
        if(params.hasOwnProperty("game")){
          if(Number(params.game)>this.games.length)params.game=1
          this.user.init_game(this.games[Number(params.game)-1])
          this.quit()
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
}
