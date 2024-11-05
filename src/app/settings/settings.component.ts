import {Component, inject, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {UserService} from '../user.service';
import {MatDialog} from '@angular/material/dialog';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css'
})
export class SettingsComponent implements OnInit {
  router=inject(Router)
  user=inject(UserService)
  dialog=inject(MatDialog)


  ngOnInit(): void {
        if(!this.user.isConnected())this.user.login(this)
    }

}
