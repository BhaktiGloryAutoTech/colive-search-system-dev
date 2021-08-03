import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'bold'
})
export class BoldPipe implements PipeTransform {

  transform(textValue: any):any {
    const regex = new RegExp(/([*])(?:(?=(\\?))\2.)*?\1/g, 'gi');;
    return textValue.replace(regex, (match: string) => `<strong>${match.replace(/\*/g,'')}</strong>`);
  }

}
