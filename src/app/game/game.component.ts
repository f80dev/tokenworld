import {Component, inject, Input} from '@angular/core';
import {Game, share_game} from '../tokenworld';
import {NgForOf, NgIf} from '@angular/common';
import {MatExpansionPanel, MatExpansionPanelHeader} from '@angular/material/expansion';
import {environment} from '../../environments/environment';
import {MatIcon} from "@angular/material/icon";
import {MatButton} from '@angular/material/button';

import {Clipboard} from '@angular/cdk/clipboard';
import {NgNavigatorShareService} from 'ng-navigator-share';
import {MatDialog} from '@angular/material/dialog';
import {get_nft} from '../mvx';
import {ApiService} from '../api.service';
import {UserService} from '../user.service';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [
    NgIf,
    MatExpansionPanel, MatExpansionPanelHeader, MatIcon, MatButton, NgForOf
  ],
  templateUrl: './game.component.html',
  styleUrl: './game.component.css'
})
export class GameComponent {
  @Input() game:Game | undefined
  protected readonly environment = environment;

  clipboard=inject(Clipboard)
  shareService=inject(NgNavigatorShareService)
  dialog=inject(MatDialog)
  api=inject(ApiService)
  user=inject(UserService)

  see_map(game: any) {
    open("https://www.google.com/maps/@?api=1&map_action=map&bbox="+game.bbox, "maps")
  }


  async share_map(game: Game) {
    await share_game(this,game,"Join my game on "+environment.appname)
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
