import {Component, inject} from '@angular/core';
import {AuthentComponent} from '../authent/authent.component';
import {ApiService} from '../api.service';

@Component({
  selector: 'app-test',
  standalone: true,
  imports: [
    AuthentComponent
  ],
  templateUrl: './test.component.html',
  styleUrl: './test.component.css'
})
export class TestComponent {
  api=inject(ApiService)
}
