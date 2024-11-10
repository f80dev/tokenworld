import {Component, inject, OnInit} from '@angular/core';
import {AuthentComponent} from '../authent/authent.component';
import {ApiService} from '../api.service';
import {cartesianToPolar, latLonToCartesian} from '../tokenworld';
import {WalletComponent} from '../wallet/wallet.component';

@Component({
  selector: 'app-test',
  standalone: true,
  imports: [
    AuthentComponent,
    WalletComponent
  ],
  templateUrl: './test.component.html',
  styleUrl: './test.component.css'
})
export class TestComponent implements OnInit {

  ngOnInit(): void {
    let scale=1000000
    let p=latLonToCartesian(-20,2,scale)
    let res2 = cartesianToPolar(p.x,p.y,p.z,scale)
  }

  api=inject(ApiService)
}
