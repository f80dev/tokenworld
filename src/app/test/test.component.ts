import {Component, inject, OnInit} from '@angular/core';
import {AuthentComponent} from '../authent/authent.component';
import {ApiService} from '../api.service';
import {cartesianToPolar, latLonToCartesian} from '../tokenworld';

@Component({
  selector: 'app-test',
  standalone: true,
  imports: [
    AuthentComponent
  ],
  templateUrl: './test.component.html',
  styleUrl: './test.component.css'
})
export class TestComponent implements OnInit {

  ngOnInit(): void {
    let lg=10
    let lt=5
    let res=latLonToCartesian(lt,lg,10)
  }



  api=inject(ApiService)
}
