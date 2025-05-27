import {Component, inject, Input} from '@angular/core';
import {cartesianToPolar, Game, share_game} from '../tokenworld';
import {DecimalPipe, NgForOf, NgIf} from '@angular/common';
import {MatExpansionPanel, MatExpansionPanelHeader} from '@angular/material/expansion';
import {environment} from '../../environments/environment';
import {MatIcon} from "@angular/material/icon";
import {MatButton} from '@angular/material/button';

import {Clipboard} from '@angular/cdk/clipboard';
import {NgNavigatorShareService} from 'ng-navigator-share';
import {MatDialog} from '@angular/material/dialog';
import {get_nft, getExplorer} from '../mvx';
import {ApiService} from '../api.service';
import {UserService} from '../user.service';
import {settings} from '../../environments/settings';
import {LatLng, Point} from 'leaflet';
import {isLocal} from '../../tools';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [
    NgIf,
    MatExpansionPanel, MatExpansionPanelHeader, MatIcon, MatButton, NgForOf, DecimalPipe
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
    //TODO a corriger
    let url="https://www.google.com/maps/search/?api=1&query=&ll={ne}&spn={dsw}"
    let ne=cartesianToPolar(this.game!.ne)
    let sw=cartesianToPolar(this.game!.sw)
    url=url.replace("{ne}",(ne.lat+","+ne.lng)).replace("{dsw}",(ne.lat-sw.lat)+","+(ne.lng-sw.lng))
    open(url, "maps")
  }


  async share_map(game: Game) {
    await share_game(this,game,"Join my game on "+settings.appname,true,true,!isLocal(window.location.href))
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

  protected readonly settings = settings;

  show_nft_explorer(url: string) {
    open(url,"nft preview")
  }
}
