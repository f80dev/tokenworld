import {Component, Input} from '@angular/core';
import {Game} from '../tokenworld';
import {NgIf} from '@angular/common';
import {MatExpansionPanel, MatExpansionPanelHeader} from '@angular/material/expansion';
import {environment} from '../../environments/environment';
import {MatIcon} from "@angular/material/icon";
import {MatButton} from '@angular/material/button';

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


  see_map(game: any) {
    open("https://www.google.com/maps/@?api=1&map_action=map&bbox="+game.bbox, "maps")
  }


}
