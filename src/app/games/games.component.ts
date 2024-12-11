import {Component, inject, OnInit} from '@angular/core';
import {NgForOf} from '@angular/common';
import {ApiService} from '../api.service';
import {UserService} from '../user.service';
import {environment} from '../../environments/environment';
import {ActivatedRoute, Router} from '@angular/router';
import {$$, getParams} from '../../tools';

@Component({
  selector: 'app-games',
  standalone: true,
  imports: [
    NgForOf
  ],
  templateUrl: './games.component.html',
  styleUrl: './games.component.css'
})
export class GamesComponent implements OnInit {
  games: any;
  user=inject(UserService)
  routes=inject(ActivatedRoute)
  router=inject(Router)

  async ngOnInit() {
    let params:any=await getParams(this.routes)
    this.games=await this.user.query("games",[])
    if(this.games.length==0){
      $$("No game available")
      this.router.navigate(["create"])
    }else{
      if(params.hasOwnProperty("game")){
        this.user.init_game(this.games[Number(params.game)])
        this.quit()
      }
    }

  }

  quit(){
    this.router.navigate(["map"])
  }

}
