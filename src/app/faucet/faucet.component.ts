import {Component, inject} from '@angular/core';
import {MatButton} from '@angular/material/button';
import {UserService} from '../user.service';
import {ApiService} from '../api.service';
import {addParseSpanInfo} from '@angular/compiler-cli/src/ngtsc/typecheck/src/diagnostics';
import {send_transaction} from '../mvx';

@Component({
  selector: 'app-faucet',
  standalone: true,
  imports: [
    MatButton
  ],
  templateUrl: './faucet.component.html',
  styleUrl: './faucet.component.css'
})
export class FaucetComponent {

  user=inject(UserService)
  api=inject(ApiService)

  async refund() {
    await this.user.login(this,"","",false)
  }
}
