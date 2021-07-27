import { CommonServiceService } from './common-service.service';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SearchServiceService {

  public searchedPropertyList = new BehaviorSubject<any>('');
  constructor(private httpClient: HttpClient,private commonServiceService:CommonServiceService) { }

  seachProperty(data:any){
    return this.httpClient.post(this.commonServiceService.envUrl()+"query",data)
  }

  getPropertyDetail(data:any){
    return this.httpClient.post(this.commonServiceService.envUrl()+"properties",data)
  }
}
