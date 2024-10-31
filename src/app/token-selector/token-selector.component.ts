import {AfterViewInit, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {NetworkService} from "../network.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {$$, showError, showMessage} from "../../tools";
import {_prompt} from "../prompt/prompt.component";
import {MatDialog} from "@angular/material/dialog";
import {HourglassComponent, wait_message} from "../hourglass/hourglass.component";
import {MatFormField, MatLabel} from "@angular/material/form-field";
import {MatOption, MatSelect} from "@angular/material/select";
import {MatIcon} from "@angular/material/icon";
import {InputComponent} from "../input/input.component";
import {NgIf} from "@angular/common";
import {LinkComponent} from "../link/link.component";
import {mvx_api} from "../mvx";


const BACKUP_IMG="https://tokenforge.nfluent.io/assets/icons/egld-token-logo.webp"

@Component({
  selector: 'app-token-selector',
  standalone: true,
    imports: [
        HourglassComponent,
        MatFormField,MatLabel,
        MatSelect,
        MatOption, NgIf,
        MatIcon,
        InputComponent, LinkComponent
    ],
  templateUrl: './token-selector.component.html',
  styleUrls: ['./token-selector.component.css']
})
export class TokenSelectorComponent implements OnChanges,OnInit {
  @Input() network:string=""
  @Input() owner:string=""
  @Input() label_change_filter="Modifier le filtre";
  @Input() label_for_owner_filter="";

  @Input() canChangeFilter: boolean=true
  @Input() canCreateMoney: boolean=true
  @Input() type:string="Fungible";
  @Input() size:string="30px";
  @Input() size_selected:string="80px";
  @Input() label_selected:string="Monnaie sélectionnée"
  @Input() refresh_delay:number=0;
  @Input() show_createtoken_button=true;
  @Input() show_balance=true;

  @Input("value") sel_token:any={id:""}
  @Input() with_detail=false

  @Output() valueChange: EventEmitter<any> = new EventEmitter();
  @Output() endSearch: EventEmitter<any> = new EventEmitter();
  @Output() unselect: EventEmitter<any> = new EventEmitter();

  tokens:any[]=[]
  all_tokens:any[]=[]
  @Input() show_detail: boolean=true;
  message: string="";
  handler:any
  @Input("filter") filter_by_name="";
  owner_filter: string="";
  handle: any=0

  options=[{label:'Voir toutes les monnaies',value:'all'},{label:"Les monnaies du propriétaires",value:'owner'}];
  sel_filter=this.options[0]

  constructor(
      public api:NetworkService,
      public toast:MatSnackBar,
      public dialog:MatDialog
  ) {
  }


  ngOnChanges(changes: SimpleChanges): void {
    if(changes["network"] || changes["filter"] || changes["owner"]){
      if(this.label_for_owner_filter=="")this.label_for_owner_filter="Voir les monnaies de "+this.owner.replace(this.owner.substring(7,53)," ... ")
      this.options[1].label=this.label_for_owner_filter
      //if(!changes["owner"] || changes["owner"].currentValue=="")clearInterval(this.handle)
      setTimeout(()=>{this.refresh();},500)
      //this.refresh()
    }

    if(changes["refresh_delay"] && this.handle==0 && changes["refresh_delay"].currentValue>0){
      $$("Mise en place d'une collection des ESDT toute les "+changes["refresh_delay"].currentValue+" secondes")
      this.handle=setInterval(()=>{this.refresh()},changes["refresh_delay"].currentValue*1000)
    }
    if(!this.sel_token){
      this.sel_token={id:""}
    }
    if(typeof(this.sel_token)=="string"){
      this.sel_token={
        "id":this.sel_token,
        image:BACKUP_IMG,
        name:this.sel_token
      }
    }
  }

  ngOnInit() {
    if(this.owner!=''){
      this.owner_filter=this.owner
      this.sel_filter=this.options[1]
    }else{
      this.sel_filter=this.options[0]
      this.owner_filter=""
    }
    this.get_tokens()
  }



  async get_tokens(owner="",limit=6000) : Promise<any[]>{
    if(owner.length>0){
      return mvx_api("accounts/"+owner+"/tokens","type=FungibleESDT",this.api)
    }else{
      //voir
      return mvx_api("tokens","order=desc&sort=marketCap&size=500&type=FungibleESDT",this.api)
    }

    // return new Promise((resolve, reject) => {
    //   if (this.all_tokens.length > 0 && owner=="") {
    //     resolve(this.all_tokens);
    //   } else {
    //     this.api.find_tokens(this.network, owner, "", true, limit).subscribe({
    //       next: (tokens: any[]) => {
    //         if(owner=="")this.all_tokens = tokens;
    //         resolve(tokens)
    //       },
    //       error:()=>{reject()}
    //     });
    //   }
    // })
  }


  async refresh()  {
    if (this.network == "") return

    if (!this.handle || this.refresh_delay == 0) {
      this.message = "Recherche des monnaies " + (this.owner_filter ? " de " + this.owner_filter : "") + " " + (this.filter_by_name ? " dont le nom contient \"" + this.filter_by_name + "\"" : "")
      if (this.network.indexOf("devnet") > -1) this.message = this.message + " (réseau test)"
    }

    wait_message(this,"Recherche des monnaies",false,10000)
    let tokens=[]
    try{
      tokens = await this.get_tokens(this.owner_filter)
    }catch (e){
      showError(this,"Problème de visualisation des tokens")
    }

    wait_message(this)

    this.message = ""
    this.tokens=[]
    for (let t of tokens) {
      t["label"] = t["name"]
      t["image"]="https://tokenforge.nfluent.io/assets/icons/egld-token-logo.webp"

      let tmp=Math.round(100*t["balance"] / (10**t["decimals"]))/100
      let solde=tmp<100000 ? tmp.toString() : (tmp/1000)+"K"
      if (Number(t["balance"]) > 0) t["label"] = t["label"] + (this.show_balance ? " (" + solde + ")" : "")
      if (this.filter_by_name == "" || (t["id"] + t["name"] + t["label"]).toLowerCase().indexOf(this.filter_by_name.toLowerCase()) > -1){
        this.tokens.push(t)
      }
    }
    this.endSearch.emit(this.tokens);
  }


  update_sel($event: any) {
    this.sel_token=$event
    clearInterval(this.handle)
    this.handle=0
    if(this.sel_token.hasOwnProperty("value"))this.sel_token=this.sel_token.value;
    this.valueChange.emit(this.sel_token)
  }


  reset() {
    this.tokens=[]
    this.sel_token={id:""}
    this.refresh();
    this.unselect.emit(true)
  }



  switch_token(evt:any) {
    if(evt.value=="owner"){
      this.owner_filter=this.owner;
    }else{
      this.owner_filter=""
    }
    this.sel_filter=evt
    this.refresh();
  }


  open_create_esdt() {
    showMessage(this,"Depuis le wallet web, choisir la rubrique Create Token puis reporter l'identifiant",6000,()=>{
      open("https://wallet.multiversx.com/issue-token","wallet")
    },"Ouvrir le wallet")
  }


  async open_search_token() {
    let rep:string=await _prompt(this,"Rechercher sur le nom",this.filter_by_name,"","text","Rechercher","Annuler",false)
    if(rep){
      this.filter_by_name=rep
    } else {
      this.filter_by_name=""
    }
    this.refresh()
  }



  reset_filter() {
    this.filter_by_name=""
    this.refresh()
  }
}
