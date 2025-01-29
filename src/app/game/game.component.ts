import {Component, inject, Input} from '@angular/core';
import {Game, share_game} from '../tokenworld';
import {NgIf} from '@angular/common';
import {MatExpansionPanel, MatExpansionPanelHeader} from '@angular/material/expansion';
import {environment} from '../../environments/environment';
import {MatIcon} from "@angular/material/icon";
import {MatButton} from '@angular/material/button';

import {Clipboard} from '@angular/cdk/clipboard';
import {NgNavigatorShareService} from 'ng-navigator-share';
import {MatDialog} from '@angular/material/dialog';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [
    NgIf,
    MatExpansionPanel, MatExpansionPanelHeader, MatIcon, MatButton
  ],
  templateUrl: './game.component.html',
  styleUrl: './game.component.css'
})
export class GameComponent {
  @Input() game:Game | undefined
  protected readonly environment = environment;

  clipboard=inject(Clipboard)
  ngNavigatorShareService=inject(NgNavigatorShareService)
  dialog=inject(MatDialog)

  see_map(game: any) {
    open("https://www.google.com/maps/@?api=1&map_action=map&bbox="+game.bbox, "maps")
  }


  async share_map(game: Game) {
    let result=await share_game(this,game)

  }
}
