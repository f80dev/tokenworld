import { Pipe, PipeTransform } from '@angular/core';


@Pipe({
  name: 'filter',
  standalone:true
})
export class FilterPipe implements PipeTransform {

  transform(items: any[], args: any[]): any {
    if(!items)return null;
    if(items.length==0)return []
    if(args.length==1){
      if(args[0]=="" || args[0]=="*")return items;
      return items.filter(item => item==args[0]);
    }
    else{
      if(args[1]=="" || args[1]=="*")return items;
      // @ts-ignore
      return items.filter((item) => (
          item[args[0]].toString().toLowerCase().includes(args[1].toString().toLowerCase()))
      )
    }
  }

}
