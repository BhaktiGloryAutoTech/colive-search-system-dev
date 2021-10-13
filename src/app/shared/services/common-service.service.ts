import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class CommonServiceService {
  constructor() {}

  envUrl() {
    return "https://lenssmartsearch.polynomial.ai/" // prod
    // return 'https://lenssmartsearch.polynomial.ai/testing/'; // dev
  }
}
