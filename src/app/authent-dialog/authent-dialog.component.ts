import {Component, inject} from '@angular/core';
import {AuthentComponent} from "../authent/authent.component";
import {NgIf} from "@angular/common";
import {
  MAT_DIALOG_DATA, MatDialogActions,
  MatDialogClose,
  MatDialogContent, MatDialogModule,
  MatDialogRef,
  MatDialogTitle
} from "@angular/material/dialog";
import {$$} from "../../tools";
import {Connexion, get_default_connexion} from "../../operation";
import {MatButton} from "@angular/material/button";

export interface DialogDataModal {
  title:string
  subtitle:string
  connexion:Connexion
  network:string
}

export function _ask_for_authent(vm:any,title="Authentification",subtitle="",
                                 network="elrond-devnet",connexion=get_default_connexion())  {
  //token_id : reference du token utilisable pour le paiement
  return new Promise((resolve, reject) => {
    if(!vm.dialog){$$("!La fenetre n'integre pas MatDialog") }
    vm.dialog.open(AuthentDialogComponent,{
      width: '640px',height:"450px",top:0,left:0,
      data:{
        title:title,
        subtitle:subtitle,
        network:network,
        connexion:connexion
      }
    }).afterClosed().subscribe({
      next:(resp:any) => {
        if(resp) {resolve(resp);} else {resolve(null)}
      },
      error:(err:any)=>{
        reject(err)
      }
    })
  });
}


@Component({
  selector: 'app-authent-dialog',
  standalone: true,
  imports: [
    AuthentComponent,
    NgIf,
    MatDialogModule,
    MatDialogContent,
    MatDialogTitle,
    MatDialogClose,
    MatDialogActions,
    MatButton
  ],
  templateUrl: './authent-dialog.component.html',
  styleUrl: './authent-dialog.component.css'
})
export class AuthentDialogComponent {
  connexion=get_default_connexion();
  data=inject<DialogDataModal>(MAT_DIALOG_DATA)
  dialogRef=inject(MatDialogRef<AuthentDialogComponent>)

  init_provider($event: {
    strong: boolean;
    address: string;
    pem_wallet:any;
    provider: any;
    encrypted: string;
    url_direct_xportal_connect: string
  }) {
    this.dialogRef.close($event);
  }

  cancel() {
    this.dialogRef.close();
  }

}
