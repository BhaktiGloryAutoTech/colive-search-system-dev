import { CommonServiceService } from './common-service.service';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SearchServiceService {
  public searchedPropertyList = new BehaviorSubject<any>('');
  public searchQuerySpell = new BehaviorSubject<any>('');
  public searchQuery = new BehaviorSubject<any>('');
  public fixedQuery = new BehaviorSubject<any>('');
  constructor(
    private httpClient: HttpClient,
    private commonServiceService: CommonServiceService
  ) {}

  seachProperty(data: any) {
    return this.httpClient.post(
      this.commonServiceService.envUrl() + 'query',
      data
    );
  }

  searchPropertyFormated(data: any) {
    return this.httpClient.post(
      this.commonServiceService.envUrl() + 'query/v2',
      data
    );
  }

  getPropertyDetail(data: any) {
    return this.httpClient.post(
      this.commonServiceService.envUrl() + 'properties',
      data
    );
  }

  searchSuggestion(data: any) {
    // return this.httpClient.post("http://20.198.82.4:8082/search/suggestion/", data);
    return this.httpClient.post(
      this.commonServiceService.envUrl() + 'search/suggestion/',
      data
    );
  }

  trackedClicks(data: any) {
    return this.httpClient.post(
      this.commonServiceService.envUrl() + 'logs/clicksTracker',
      data
    );
  }

  spellCheck(data: any) {
    // return this.httpClient.post("http://20.198.82.4:8082/search/spellCheck/", data);
    return this.httpClient.post(
      this.commonServiceService.envUrl() + 'search/spellCheck/',
      data
    );
  }

  bottomQuerySuggestion(data: any) {
    return this.httpClient.post(
      this.commonServiceService.envUrl() + 'search/queriesSuggestion/',
      data
    );
  }
}
