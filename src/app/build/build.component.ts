import { Component } from '@angular/core';
import {UploadFileComponent} from '../upload-file/upload-file.component';
import {HourglassComponent} from '../hourglass/hourglass.component';
import {NgIf} from '@angular/common';
import {InputComponent} from '../input/input.component';

@Component({
  selector: 'app-build',
  standalone: true,
  imports: [
    UploadFileComponent,
    HourglassComponent,
    NgIf,
    InputComponent
  ],
  templateUrl: './build.component.html',
  styleUrl: './build.component.css'
})
export class BuildComponent {
  message: string=""
  name=""

  onFileSelected($event: any) {

  }
}
