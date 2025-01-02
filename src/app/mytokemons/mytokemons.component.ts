import {Component, inject, OnInit} from '@angular/core';
import {Tokemon} from '../tokenworld';
import {UserService} from '../user.service';
import {ApiService} from '../api.service';
import {send_transaction} from '../mvx';
import {NgForOf} from '@angular/common';
import {MatDialog} from '@angular/material/dialog';

@Component({
  selector: 'app-mytokemons',
  standalone: true,
  imports: [
    NgForOf
  ],
  templateUrl: './mytokemons.component.html',
  styleUrl: './mytokemons.component.css'
})
export class MytokemonsComponent implements OnInit {
  async ngOnInit() {
    await this.user.login(this,"","",true)
    let rc:any=await send_transaction(this.user.provider,"show_all_my_nfts",this.user.address,[this.user.game!.id],this.user.get_sc_address())
    for(let item of rc){
      this.tokemons.push(item)
    }
  }

  api=inject(ApiService)
  user=inject(UserService)
  dialog=inject(MatDialog)
  tokemons: Tokemon[] = [];



}
