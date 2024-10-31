import {Component, EventEmitter, Inject, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatFormField, MatHint, MatLabel} from "@angular/material/form-field";
import {NgClass, NgForOf, NgIf} from "@angular/common";
import {MatIcon} from "@angular/material/icon";
import {MatOption, MatSelect} from "@angular/material/select";
import {MatSlider, MatSliderThumb} from "@angular/material/slider";
import {MatList, MatListItem, MatListItemAvatar, MatListOption, MatSelectionList} from "@angular/material/list";
import {MatCheckbox} from "@angular/material/checkbox";
import {MatInputModule} from "@angular/material/input";
import {MatButton} from "@angular/material/button";
import {
  MatDatepickerModule,
  MatDatepickerToggle,
  MatDateRangeInput,
  MatDateRangePicker
} from "@angular/material/datepicker";
import { MAT_DATE_LOCALE, provideNativeDateAdapter} from "@angular/material/core";
import {parseFrenchDate} from "../../tools";
//version 1.0 3/3/23

@Component({
  selector: 'app-input',
  standalone:true,
  imports: [
    MatFormField,
    MatHint,
    NgIf,
    MatLabel,
    NgClass,
    MatIcon,
    MatSelect,
    MatInputModule,
    MatOption,
    MatSlider,
    FormsModule,
    MatListOption,
    MatSelectionList,
    MatCheckbox,
    ReactiveFormsModule,
    MatButton,
    NgForOf,
    MatSliderThumb,
    MatDatepickerToggle,
    MatDatepickerModule,
    MatDateRangeInput,
    MatDateRangePicker,
    MatListItem,
    MatList,
    MatListItemAvatar
  ],
  providers: [
      provideNativeDateAdapter(),
      {provide: MAT_DATE_LOCALE, useValue: 'fr-FR'},
  ],
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.scss']
})
export class InputComponent implements OnChanges,OnInit {
  @Input() infobulle:string=""
  @Input() label:string=""
  @Input() color:string="black"

  @Input() label_button:string=""
  @Input() cancel_button:string=""

  @Input() maxlength:string=""
  @Input() width:string="100%"
  @Input() maxwidth:string="100%"
  @Input() color_value="darkgray"
  @Input() size_image="40px"
  @Input() icon_action=""
  @Input() filter=""


  @Input() options:any=[];
  @Input() value_field="";          //Value_field permet de ne mettre dans la value de la liste qu'un seul champ d'un dictionnaire
  @Input() placeholder:string="";


  //voir https://angular.io/guide/two-way-binding
  @Input() value:any;
  valueCtrl=new FormControl()

  @Output() valueChange=new EventEmitter<any>();
  @Output() preview=new EventEmitter<any>();
  @Output() validate=new EventEmitter();
  @Output() action=new EventEmitter();
  @Output() cancel=new EventEmitter();

  @Input() value_type: "options" | "text" | "time" | "date" | "daterange" | "number" | "memo" | "list" | "listimages" | "boolean" | "images" | "slide" | "slider" = "text";
  @Input() help:string="";
  @Input() help_input: string="";
  @Input() help_button: string="Enregistrez";
  showHelp: boolean=false;
  @Input() cols: number=0;
  @Input() rows: number=0;
  @Input() force_preview: boolean=false;
  @Input() max: number=1e18;
  @Input() min: number=0;
  @Input() step: number=1;
  @Input() multiselect: boolean = false;
  @Input() showClear: boolean=true
  @Input() fontname="mat-body-2"
  @Input() height="auto"
  @Input() unity: string="";
  @Input() init: string="";
  range= new FormGroup({
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null),
  });
  date_control= new FormControl(new Date());


  constructor( @Inject(MAT_DATE_LOCALE) private _locale: string,) {
    this._locale = 'fr';
  }

  on_clear() {
    this.value=null;
    if(this.value_type=="text")this.value="";
    this.valueChange.emit(this.value);
    this.on_validate();
  }

  on_validate() {
    this.validate.emit(this.value);
    this.valueChange.emit(this.value);
  }

  on_key($event: any) {
    if(this.value_type=="options"){
      this.valueChange.emit(this.options);
    }
    if(this.value_type=="daterange"){
      this.valueChange.emit(this.range.value);
    }else{
      if($event.key=='Enter'){
        this.on_validate();
      } else {
        this.valueChange.emit(this.value);
      }

    }


  }

  sel_change($event: any) {
    if($event.hasOwnProperty("options")){
      let values= $event.options
      this.value=values[0].value
    }else {
      if(this.value_type=="slide" || this.value_type=="slider"){
        this.value=$event.value
      } else {
        this.value = $event;
      }

    }

    if(this.value_field==""){
      this.valueChange.emit(this.value);
    } else {
      this.valueChange.emit(this.value[this.value_field]);
    }


  }

  ngOnChanges(changes: SimpleChanges): void {
    if(this.value_type=="daterange"){
      if(changes["value"]){
        let values=changes["value"].currentValue.split(" - ")
        let start=parseFrenchDate(values[0])
        let end=parseFrenchDate(values[1])
        this.range.setValue({start: start, end: end  })
        this.valueChange.emit({start:start,end:end});
      }
    }

    if(this.value_type=="date"){
      if(changes["value"]){
        this.value.setValue(parseFrenchDate(changes["value"].currentValue))
      }
    }

    if(this.value_type=="list" || this.value_type=="listimages" || this.value_type=="images") {
      if(changes["value"]){
        if(this.value_field==""){
          let v=changes["value"].currentValue
          if(typeof(v)=="string")v={label:v,value:v}
          this.valueCtrl.setValue(v)
        }else{
          for(let o of this.options){
            if(o[this.value_field]==changes["value"].currentValue){
              this.valueCtrl.setValue(o)
              break
            }
          }
        }
      }

      if(changes["filter"]){
        let filter=changes["filter"].currentValue
        let options=[]
        for(let option of this.options){
          if(filter=="" || (option && option.label && option.label.indexOf(this.filter)>-1)){
            options.push(option)
          }
        }
        this.options=options
      }


      if(changes["options"]){
        if (typeof (changes["options"].currentValue) == "string") { // @ts-ignore
          changes["options"].currentValue = changes["options"].currentValue.split(",")
        }
        if (changes["options"] && changes["options"].previousValue != changes["options"].currentValue) {
          this.options = [];
          for (let option of changes["options"].currentValue) {
            if (typeof(option) != "object") option = {label: option, value: option};
            if (typeof(option) == "object") {
              option.label = option["label"] || option["name"] || option["caption"] || option["title"];
              // if (this.value_field.length > 0){
              //   option.value=option[this.value_field]
              // }else{
              //   option.value= JSON.parse(JSON.stringify(option))
              // }
            }
            //TODO: a analyser
            this.options.push(option);
          }
        }
      }

    }
  }
  ngOnInit(): void {
    if(typeof(this.options)=="string")this.options=this.options.split(",")
    //if(this.options.length>0 && this.value_type==""){this.value_type="list";}
    if(this.rows>0 && this.cols==0)this.cols=10;
    if(this.value_type=="daterange"){
      this.range== new FormGroup({
        start: new FormControl<Date | null>(parseFrenchDate(this.value.split(" - ")[0])),
        end: new FormControl<Date | null>(parseFrenchDate(this.value.split(" - ")[1])),
      });
    }
  }

  on_cancel() {
    this.cancel.emit();
  }

  direct_change_slider() {
    if(this.value_type=="slider" || this.value_type=="slide"){
      if(this.value>this.max)this.value=this.max;
      if(this.value<this.min)this.value=this.min;
    }

  }

  compareFn(obj1:any,obj2:any){
    let c_obj1=typeof(obj1)=="object" ? JSON.stringify(obj1) : obj1
    let c_obj2=typeof(obj2)=="object" ? JSON.stringify(obj2) : obj2
    //TODO: faire un tri des propriété par ordre alphabétique pour s'assurrer que {a:1,b:2} est égale à {b:2,a:1}
    return c_obj1===c_obj2
  }

  explore(value: any) {
    if(this.force_preview)this.preview.emit(value)
    if(value.startsWith("http")){
      open(value,"Explorer")
    }
  }

  call_action(value: any) {
    this.action.emit(value);
  }
}


