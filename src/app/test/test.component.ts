import {Component, inject, OnInit} from '@angular/core';
import {AuthentComponent} from '../authent/authent.component';
import {ApiService} from '../api.service';
import {WalletComponent} from '../wallet/wallet.component';
import * as L from 'leaflet';
import {UserService} from '../user.service';
import {MatButton} from '@angular/material/button';
import {InputComponent} from '../input/input.component';
import {network_config} from '../mvx';
import {$$} from '../../tools';



@Component({
  selector: 'app-test',
  standalone: true,
  imports: [
    AuthentComponent,
    WalletComponent,
    MatButton,
    InputComponent
  ],
  templateUrl: './test.component.html',
  styleUrl: './test.component.css'
})
export class TestComponent implements OnInit {


  user=inject(UserService)







  async ngOnInit() {
    this.user.network="devnet"
    let config=await network_config()
    $$("Config ",config)
  }

  api=inject(ApiService)
}
