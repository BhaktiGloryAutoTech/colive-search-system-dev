import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CommonServiceService {

  constructor() { }

  envUrl(){
    return "https://lenssmartsearch.polynomial.ai/dev/"
  }
}
