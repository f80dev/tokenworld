import {Component, Input} from '@angular/core';
import {Game} from '../tokenworld';
import {NgIf} from '@angular/common';
import {MatExpansionPanel, MatExpansionPanelHeader} from '@angular/material/expansion';
import {environment} from '../../environments/environment';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [
    NgIf,
    MatExpansionPanel,MatExpansionPanelHeader
  ],
  templateUrl: './game.component.html',
  styleUrl: './game.component.css'
})
export class GameComponent {
  @Input() game:Game | undefined
  protected readonly environment = environment;
}
