import {Component, Input} from '@angular/core';
import {Game} from '../tokenworld';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [
    NgIf
  ],
  templateUrl: './game.component.html',
  styleUrl: './game.component.css'
})
export class GameComponent {
  @Input() game:Game | undefined
}
