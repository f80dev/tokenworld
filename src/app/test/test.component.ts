import {Component, inject, OnInit} from '@angular/core';
import {AuthentComponent} from '../authent/authent.component';
import {ApiService} from '../api.service';
import {cartesianToPolar, latLonToCartesian} from '../tokenworld';
import {WalletComponent} from '../wallet/wallet.component';
import {environment} from '../../environments/environment';

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
    let fee=environment.fee
    debugger
  }

  api=inject(ApiService)
}
