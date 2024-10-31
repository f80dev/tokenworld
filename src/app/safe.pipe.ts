import { Pipe, PipeTransform } from '@angular/core';
import {DomSanitizer} from "@angular/platform-browser";

@Pipe({
    name: 'safe',
    standalone:true
})
export class SafePipe implements PipeTransform {

    constructor(protected sanitizer: DomSanitizer) {}

    public transform(value: any,param="url"): any {
        if(param=="html")return this.sanitizer.bypassSecurityTrustHtml(value);
        return this.sanitizer.bypassSecurityTrustResourceUrl(value);
    }

}
