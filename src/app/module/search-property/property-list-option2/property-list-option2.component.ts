import { NgxUiLoaderModule, NgxUiLoaderService } from 'ngx-ui-loader';
import {
  ChangeDetectorRef,
  Component,
  OnInit,
  OnDestroy,
  HostListener,
  AfterViewInit,
  NgZone,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgbRatingConfig } from '@ng-bootstrap/ng-bootstrap';
import { SearchServiceService } from '@services/search-service.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

export interface IWindow extends Window {
  webkitSpeechRecognition: any;
}
@Component({
  selector: 'app-property-list-option2',
  templateUrl: './property-list-option2.component.html',
  styleUrls: ['./property-list-option2.component.scss'],
})
export class PropertyListOption2Component
  implements OnInit, OnDestroy, AfterViewInit
{
  unsubscribe = new Subject<void>();
  public tab: string = 'matchedProerties';
  matchedPropertyListDetails: any = [];
  trendingPropertyListDetails: any = [];
  similarPropertyListDetails: any = [];
  public loading = false;
  numbers: any = [1, 2, 3, 4, 5, 6];
  searchQuery: any = null;
  matchedPropertyList: any = [];
  trendingPropertyList: any = [];
  similarPropertyList: any = [];
  allPropertyList: any = [];

  //to track user clicks
  visitedPropertyList: any = [];
  trackClicksObj: any = {};

  //for request
  matchedPropertyListRequest: any = '';
  trendingPropertyListRequest: any = '';
  similarPropertyListRequest: any = '';
  suggestionList: any = [];
  //for spell corrected
  spellCorrectedQuery: any;

  //fixed spell
  fixedQuery: any;

  //query ID to treck clicks of user for query
  queryId: any;
  recognition: any;
  msg: any;
  bottomSuggesionList: any = [];

  constructor(
    private searchService: SearchServiceService,
    config: NgbRatingConfig,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
    private activatedRoute: ActivatedRoute,
    private ngxService: NgxUiLoaderService
  ) {
    const { webkitSpeechRecognition }: IWindow = <IWindow>(<any>window);
    this.recognition = new webkitSpeechRecognition();
    //for rating
    config.max = 5;
    config.readonly = true;
    let queryString = localStorage.getItem('queryString');
    console.log('QuerySTring in constructor : - ', queryString);
    if (queryString) {
      this.searchQuery = queryString;
    } else {
      this.searchQuery = 'pgs in marathalli';
      localStorage.setItem('queryString', this.searchQuery);
    }

    // this.activatedRoute?.queryParams.subscribe((res: any) => {
    //   console.log(res);
    //   console.log('Window location', window.location);
    //   if (res?.q) {
    //     this.searchQuery = res?.q;
    //   }
    // });
  }

  ngAfterViewInit(): void {
    let container: any = document.getElementById('auoComplete');
    container?.classList.remove('input-search');
    this.ngxService.start();
    // this.searchQuery = this.activatedRoute.snapshot.paramMap.get('id');
    let queryString = localStorage.getItem('queryString');
    console.log('QuerySTring in afterViewInit : - ', queryString);
    if (queryString) {
      this.searchQuery = queryString;
    } else {
      this.searchQuery = 'pgs in marathalli';
      localStorage.setItem('queryString', this.searchQuery);
    }
    console.log('Search String : -- ', this.searchQuery);
    if (!this.searchQuery) {
      this.searchService.searchQuery.subscribe((response: any) => {
        if (response) {
          this.searchQuery = response;
        } else {
          if (localStorage.getItem('query')) {
            const queery: any = localStorage.getItem('query');
            if (JSON.parse(queery)) {
              this.searchQuery = JSON.parse(queery);
            }
          }
        }
      });
    }
    // if (localStorage.getItem('queryId')) {
    //   let qId: any = localStorage.getItem('queryId');
    //   let QID: any = JSON.parse(qId);
    //   if (QID) {
    //     this.queryId = QID
    //   }
    // }
    if (localStorage.getItem('PropertyDetail')) {
      let obj: any = {};
      this.matchedPropertyList = [];
      let propertyDetail: any = localStorage.getItem('PropertyDetail');
      let propertyDetails: any = JSON.parse(propertyDetail);
      obj['metaData'] = propertyDetails;
      obj['propertyDetails'] = propertyDetails;
      this.matchedPropertyList[0] = obj;
      let ele = document.getElementById('auoComplete');
      ele?.classList.remove('input-search');
      ele?.classList.remove('suggest-border');
      this.ngxService.stop();
    } else {
      let ele = document.getElementById('auoComplete');
      ele?.classList.remove('input-search');
      ele?.classList.remove('suggest-border');
      this.matchedPropertyList = [];
      this.visitedPropertyList = [];
      this.trendingPropertyList = [];
      this.similarPropertyList = [];
      this.suggestionList = [];
      let search = {
        query: this.searchQuery.name ? this.searchQuery.name : this.searchQuery,
      };
      //for spell check
      this.spellCheck(search);
    }
    //get QueryId
    // if (localStorage.getItem('queryId')) {
    //   let qid: any = localStorage.getItem('queryId');
    //   if (qid) {
    //     this.queryId = JSON.parse(qid);
    //   }
    // }
  }

  ngOnDestroy(): void {
    this.unsubscribe.next();
    this.unsubscribe.complete();
    this.trackClicksObj['queryID']
      ? this.searchService.trackedClicks(this.trackClicksObj).subscribe()
      : '';
    this.visitedPropertyList = [];
    this.allPropertyList = [];
    this.trackClicksObj = {};
  }

  ngOnInit(): void {
    let queryString = localStorage.getItem('queryString');
    console.log('QuerySTring in onInit : - ', queryString);
    if (queryString) {
      this.searchQuery = queryString;
    } else {
      this.searchQuery = 'pgs in marathalli';
      localStorage.setItem('queryString', this.searchQuery);
    }
  }

  @HostListener('click', ['$event.target'])
  onClick(e: any) {
    let container: any = document.getElementById('auoComplete');
    let suggestionList: any = document.getElementById('item-list');
    if (!container.contains(e)) {
      container?.classList.remove('input-search');
      container?.classList.remove('suggest-border');
    } else {
      if (
        (this.searchQuery && this.suggestionList.length) ||
        (this.suggestionList && this.suggestionList.length)
      ) {
        container?.classList.add('input-search');
        container?.classList.add('suggest-border');
      } else {
        container?.classList.remove('input-search');
        container?.classList.remove('suggest-border');
      }
    }
  }

  //to get property Details
  getPropertyDetails(response1: any) {
    //for matched properties
    if (
      response1 &&
      response1.matchedProperties &&
      response1.matchedProperties.length
    ) {
      this.matchedPropertyList = [];
      this.ngxService.start();
      response1.matchedProperties.forEach((plist: any, i: any) => {
        let responseObj: any = {};
        let badgeList = [];
        //add Property Id
        if (plist.propertyID) {
          responseObj['PropertyID'] = plist.propertyID;
        }
        //add property Info (labels and location)
        if (plist.propertyInfo) {
          responseObj['propertyDetails'] = plist.propertyInfo;
        }
        if (plist.labels) {
          for (let item of Object.keys(plist.labels)) {
            if (plist.labels[item].exists) {
              badgeList.push(plist.labels[item].displayValue);
            } else {
              badgeList.push(item.strike());
            }
          }
          responseObj['badgeList'] = badgeList;
        }
        responseObj['labels'] = plist.labels;
        responseObj['type'] = 'MATCHED';
        //add property Details (name , description , price ,etc..)
        if (plist.metaData) {
          responseObj['metaData'] = plist.metaData;
        }
        //push matched property detail
        if (responseObj) {
          this.matchedPropertyList.push(responseObj);
        }
      });
      this.matchedPropertyListDetails = this.matchedPropertyListDetails.map(
        (item: any) => ({
          ...item,
          showMore: false,
        })
      );
      this.ngxService.stop();
    }

    //for trending properties
    if (
      response1 &&
      response1.trendingProperties &&
      response1.trendingProperties.length
    ) {
      this.trendingPropertyList = [];
      response1.trendingProperties.forEach((plist: any, i: any) => {
        let responseObj: any = {};
        let badgeList = [];
        //add Property Id
        if (plist.propertyID) {
          responseObj['PropertyID'] = plist.propertyID;
        }

        //add property Info (labels and location)
        if (plist.propertyInfo) {
          responseObj['propertyDetails'] = plist.propertyInfo;
        }
        if (plist.labels) {
          for (let item of Object.keys(plist.labels)) {
            if (plist.labels[item].exists) {
              badgeList.push(plist.labels[item].displayValue);
            } else {
              badgeList.push(item.strike());
            }
          }
          responseObj['badgeList'] = badgeList;
        }
        responseObj['labels'] = plist.labels;
        responseObj['type'] = 'TRENDING';
        //add property Details (name , description , price ,etc..)
        if (plist.metaData) {
          responseObj['metaData'] = plist.metaData;
        }

        //push matched property detail
        if (responseObj) {
          this.trendingPropertyList.push(responseObj);
        }
      });
      this.trendingPropertyListDetails = this.trendingPropertyListDetails.map(
        (item: any) => ({
          ...item,
          showMore: false,
        })
      );
    }

    //for similar properties
    if (
      response1 &&
      response1.similarProperties &&
      response1.similarProperties.length
    ) {
      this.similarPropertyList = [];
      response1.similarProperties.forEach((plist: any, i: any) => {
        let responseObj: any = {};
        let badgeList = [];
        //add Property Id
        if (plist.propertyID) {
          responseObj['PropertyID'] = plist.propertyID;
        }

        //add property Info (labels and location)
        if (plist.propertyInfo) {
          responseObj['propertyDetails'] = plist.propertyInfo;
        }
        if (plist.labels) {
          for (let item of Object.keys(plist.labels)) {
            if (plist.labels[item].exists) {
              badgeList.push(plist.labels[item].displayValue);
            } else {
              badgeList.push(item.strike());
            }
          }
          responseObj['badgeList'] = badgeList;
        }
        responseObj['labels'] = plist.labels;
        responseObj['type'] = 'SIMILAR';
        //add property Details (name , description , price ,etc..)
        if (plist.metaData) {
          responseObj['metaData'] = plist.metaData;
        }

        //push matched property detail
        if (responseObj) {
          this.similarPropertyList.push(responseObj);
        }
      });
      this.similarPropertyListDetails = this.similarPropertyListDetails.map(
        (item: any) => ({
          ...item,
          showMore: false,
        })
      );
    }
  }

  selectEvent(event: any) {
    if (event) {
      let trackFlag = false;
      if (this.trackClicksObj['queryID']) {
        this.searchService.trackedClicks(this.trackClicksObj).subscribe();
        trackFlag = true;
      }
      trackFlag ? (this.trackClicksObj = {}) : '';
      let ele = document.getElementById('auoComplete');
      ele?.classList.remove('input-search');
      ele?.classList.remove('suggest-border');
      this.matchedPropertyList = [];
      this.trendingPropertyList = [];
      this.similarPropertyList = [];
      this.visitedPropertyList = [];
      this.allPropertyList = [];
      this.suggestionList = [];
      this.searchQuery = event.name;
      if (event.type != 'property') {
        let search = {
          query: event.name,
        };
        localStorage.setItem('query', event.name);
        //for spell check
        this.spellCheck(search);
      } else {
        localStorage.setItem('PropertyDetail', JSON.stringify(event));
        this.matchedPropertyList.push({ metaData: event });
        this.ngxService.stop();
      }
    }
  }

  onClearSearchQuery() {
    this.suggestionList = [];
    let container: any = document.getElementById('auoComplete');
    container?.classList.remove('input-search');
    container?.classList.remove('suggest-border');
  }

  //search property
  keyPress(event: any) {
    if (this.searchQuery && event.keyCode == 13) {
      this.ngxService.start();
      let trackFlag = false;
      if (this.trackClicksObj['queryID']) {
        this.searchService.trackedClicks(this.trackClicksObj).subscribe();
        trackFlag = true;
      }
      trackFlag ? (this.trackClicksObj = {}) : '';
      let ele = document.getElementById('auoComplete');
      ele?.classList.remove('input-search');
      ele?.classList.remove('suggest-border');
      this.matchedPropertyList = [];
      this.visitedPropertyList = [];
      this.allPropertyList = [];
      this.trendingPropertyList = [];
      this.similarPropertyList = [];
      this.suggestionList = [];
      this.trackClicksObj;
      localStorage.setItem(
        'query',
        this.searchQuery.name ? this.searchQuery.name : this.searchQuery
      );
      let propertyList: any;
      let propertyDetail: any;
      if (localStorage.getItem('propertyDetailList')) {
        propertyList = localStorage.getItem('propertyDetailList');
        propertyDetail = JSON.parse(propertyList);
      }
      let property;
      if (propertyDetail && propertyDetail.length) {
        property = propertyDetail.filter(
          (x: any) =>
            x.propertyName.toLowerCase() ===
            (this.searchQuery.name
              ? this.searchQuery.name
              : this.searchQuery
            ).toLowerCase()
        );
      }
      if (property && property.length) {
        this.spellCorrectedQuery = '';
        let obj: any = {};
        obj['metaData'] = property[0];
        obj['propertyDetails'] = property[0];
        this.matchedPropertyList[0] = obj;
        this.ngxService.stop();
      } else {
        let search = {
          query: this.searchQuery.name
            ? this.searchQuery.name
            : this.searchQuery,
        };
        //for spell check
        this.spellCheck(search);
      }
    }
  }

  changeDidyouMean() {
    this.ngxService.start();
    this.searchQuery = this.fixedQuery;
    this.spellCorrectedQuery = '';
    localStorage.removeItem('searchQuery');
    localStorage.setItem('query', this.searchQuery);
    let searchObj = {
      query: this.searchQuery.name ? this.searchQuery.name : this.searchQuery,
      category: 'direct',
      queryID: this.queryId,
    };
    //get property ids for search query
    this.searchService
      .searchPropertyFormated(searchObj)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(
        (response: any) => {
          if (response) {
            this.tab = 'matchedProerties';
            this.getPropertyDetails(response);
            this.getTrendingProperties(searchObj['query']);
          }
          this.ngxService.stop();
        },
        (error: any) => {
          this.ngxService.stop();
        }
      );
  }

  //tring string ex.discription
  trimString(text: any, length: any) {
    return text.length > length ? text.substring(0, length) + '...' : text;
  }

  nextPagination(i: any) {
    this.numbers = [];
    for (let j = i; j <= i + 5; j++) {
      this.numbers.push(j);
    }
    this.cdr.detectChanges();
  }

  //search suggestion list
  onChangeSearch(event: any) {
    let container: any = document.getElementById('auoComplete');
    if (event) {
      let searchObj = {
        query: event,
      };
      this.searchService
        .searchSuggestion(searchObj)
        .pipe(takeUntil(this.unsubscribe))
        .subscribe(
          (response: any) => {
            this.suggestionList = [];
            if (
              response &&
              response.response &&
              response.response.propertyLocation
            ) {
              response.response.propertyLocation.forEach((element: any) => {
                this.suggestionList.push({
                  name: element.displayValue,
                  type: 'location',
                  query: element.value,
                });
              });
            }
            if (
              response &&
              response.response &&
              response.response.propertiesName
            ) {
              response.response.propertiesName.forEach((element: any) => {
                this.suggestionList.push({
                  name: element.propertyName,
                  type: 'property',
                  query: element.propertyName,
                  propertyName: element.propertyName,
                  propertyLink: element.propertyLink,
                  price: element.price,
                  locationHighlights: element.locationHighlights,
                  city: element.city,
                  propertyRating: element.propertyRating,
                  subLocation: element.subLocation,
                  tileImageUrl: element.tileImageUrl,
                  topAmenity: element.topAmenity,
                });
              });
              localStorage.setItem(
                'propertyDetailList',
                JSON.stringify(response.response.propertiesName)
              );
            }
            if (
              response &&
              response.response &&
              response.response.autoComplete
            ) {
              response.response.autoComplete.forEach((element: any) => {
                this.suggestionList.push({
                  name: element,
                  type: 'auto',
                  query: element,
                });
              });
            }
            this.suggestionList && this.suggestionList.length
              ? container?.classList.add('input-search')
              : container?.classList.remove('input-search');
          },
          (error) => {
            // suggest ? container.classList.add('input-search') : container.classList.remove('input-search');
          }
        );

      this.cdr.detectChanges();
    }

    setTimeout(() => {
      if (this.suggestionList && this.suggestionList.length) {
        container?.classList.add('input-search');
        container?.classList.add('suggest-border');
      } else {
        container?.classList.remove('input-search');
        container?.classList.remove('suggest-border');
      }
    }, 2);
  }

  //tracks clicks of user
  trackClicks(propertyId: any) {
    let timeStamp = new Date();
    let labels = {};
    let type = '';
    let itm = this.allPropertyList.filter(
      (x: any) => x.PropertyID == propertyId
    );
    if (itm) {
      itm.forEach((element: any) => {
        labels = element.labels;
        type = element.type;
        this.visitedPropertyList.push({
          propertyID: propertyId ? propertyId : '',
          type: type ? type : '',
          labels: labels ? labels : '',
          timeStamp: timeStamp.toString(),
        });
      });
    } else {
      this.visitedPropertyList.push({
        propertyID: propertyId ? propertyId : '',
        type: type ? type : '',
        labels: labels ? labels : '',
        timeStamp: timeStamp.toString(),
      });
    }
    this.trackClicksObj['queryID'] = this.queryId;
    this.trackClicksObj['clicks'] = this.visitedPropertyList;
  }

  //for spellCheck
  spellCheck(value: any) {
    if (value) {
      this.ngxService.start();
      this.spellCorrectedQuery = '';
      this.searchService
        .spellCheck(value)
        .pipe(takeUntil(this.unsubscribe))
        .subscribe(
          (response: any) => {
            if (response && response.response) {
              if (
                String(response.response.originalQuery).toLowerCase() !=
                String(response.response.formattedString).toLowerCase()
              ) {
                this.spellCorrectedQuery = response.response.formattedString;
                localStorage.setItem(
                  'searchQuery',
                  JSON.stringify(response.response.formattedString)
                );
              } else {
                localStorage.setItem('searchQuery', JSON.stringify(''));
              }
              this.fixedQuery = response.response.fixedQuery;
              localStorage.setItem('query', JSON.stringify(this.searchQuery));
              localStorage.setItem(
                'fixedQuery',
                JSON.stringify(response.response.fixedQuery)
              );
            }
            if (response) {
              localStorage.setItem('queryId', JSON.stringify(response.queryID));
              this.queryId = response.queryID;
              value['queryId'] = this.queryId;
              this.bottomQuerySuggestion(value);
              let obj = {
                query: value['query'],
                category: 'direct',
                queryID: this.queryId,
              };

              this.searchService
                .searchPropertyFormated(obj)
                .pipe(takeUntil(this.unsubscribe))
                .subscribe(
                  (response: any) => {
                    if (response) {
                      this.allPropertyList = [];
                      this.tab = 'matchedProerties';
                      // this.queryId = response.queryID;
                      // localStorage.setItem('queryId', JSON.stringify(response.queryID))
                      localStorage.removeItem('PropertyDetail');
                      this.getPropertyDetails(response);
                      this.getTrendingProperties(value['query']);
                    }
                  },
                  (error: any) => {
                    this.getTrendingProperties(value['query']);
                    this.ngxService.stop();
                  }
                );
            }
          },
          (error) => {
            this.ngxService.stop();
          }
        );
    }
  }

  getTrendingProperties(value: any) {
    let obj = {
      query: value,
      category: 'trending',
      queryID: this.queryId,
    };
    this.searchService
      .searchPropertyFormated(obj)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(
        (response: any) => {
          this.allPropertyList = [];
          this.getPropertyDetails(response);
          this.getSimilarProperties(value);
        },
        (error: any) => {
          this.getSimilarProperties(value);
          this.ngxService.stop();
        }
      );
  }

  getSimilarProperties(value: any) {
    let obj = {
      query: value,
      category: 'similar',
      queryID: this.queryId,
    };
    this.searchService
      .searchPropertyFormated(obj)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(
        (response: any) => {
          this.allPropertyList = [];
          this.getPropertyDetails(response);
          this.allPropertyList = [...this.allPropertyList].concat(
            this.matchedPropertyList,
            this.trendingPropertyList,
            this.similarPropertyList
          );
        },
        (error: any) => {
          this.ngxService.stop();
        }
      );
  }

  //searchBottomQuery
  searchBottomSuggestionQuery(search: any) {
    if (search) {
      this.ngxService.start();
      let trackFlag = false;
      if (this.trackClicksObj['queryID']) {
        this.searchService.trackedClicks(this.trackClicksObj).subscribe();
        trackFlag = true;
      }
      trackFlag ? (this.trackClicksObj = {}) : '';
      this.matchedPropertyList = [];
      this.visitedPropertyList = [];
      this.trendingPropertyList = [];
      this.similarPropertyList = [];
      this.allPropertyList = [];
      this.suggestionList = [];
      let value = {
        query: search,
        queryID: this.queryId,
      };
      this.searchQuery = search;
      //for bottom suggestion
      this.bottomQuerySuggestion(value);
      let obj = {
        query: search,
        category: 'direct',
        queryID: this.queryId,
      };
      //get property ids for search query
      this.searchService
        .searchPropertyFormated(obj)
        .pipe(takeUntil(this.unsubscribe))
        .subscribe(
          (response: any) => {
            if (response) {
              this.tab = 'matchedProerties';
              this.spellCorrectedQuery = '';
              localStorage.setItem('query', JSON.stringify(search));
              localStorage.removeItem('searchQuery');
              // this.queryId = response.queryID;
              // localStorage.setItem('queryId', JSON.stringify(response.queryID))
              this.searchService.searchedPropertyList.next(response);
              this.getPropertyDetails(response);
              this.getTrendingProperties(obj['query']);
            }
            this.ngxService.stop();
          },
          (error: any) => {
            this.ngxService.stop();
          }
        );
    }
  }

  //bottomquery suggetion list
  bottomQuerySuggestion(search: any) {
    this.bottomSuggesionList = [];
    this.searchService
      .bottomQuerySuggestion(search)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe((response: any) => {
        if (response && response.response && response.response.length) {
          this.bottomSuggesionList = response.response;
        }
      });
  }

  // //for speech to text
  // startService() {
  //   let container: any = document.getElementById('auoComplete');
  //   window.SpeechRecognition = this.recognition || window['SpeechRecognition'];
  //   if ('SpeechRecognition' in window) {
  //     // speech recognition API supported

  //     // this.recognition = new window.SpeechRecognition();
  //     this.recognition.continuous = true;
  //     this.recognition.lang = 'en-US';
  //     this.recognition.interimResults = true;
  //     this.recognition.maxAlternatives = 3;

  //     this.recognition.start();
  //     this.recognition.onresult = (event: any) => {
  //       let isFinal = event.results[0].isFinal;
  //       if (!isFinal) {
  //         this.ngZone.run(() => {
  //           this.searchQuery = event.results[0][0].transcript;
  //           container?.classList.remove('input-search');
  //         });
  //       } else if (isFinal) {
  //         this.ngZone.run(() => {
  //           this.searchQuery = event.results[0][0].transcript;
  //           container?.classList.remove('input-search');
  //           this.recognition.stop();
  //           let search = {
  //             "query": this.searchQuery
  //           }
  //           this.spellCheck(search);
  //           this.matchedPropertyList = [];
  //           this.visitedPropertyList = [];
  //           this.trendingPropertyList = [];
  //           this.similarPropertyList = [];
  //           this.searchService.searchPropertyFormated(search).pipe(takeUntil(this.unsubscribe)).subscribe(
  //             (response: any) => {
  //               if (response) {
  //                 this.queryId = response.queryID;
  //                 localStorage.setItem('queryId', JSON.stringify(response.queryID))
  //                 this.getPropertyDetails(response)
  //               }
  //               this.ngxService.stop();
  //             }, (error: any) => {
  //               this.ngxService.stop();
  //             }
  //           )
  //         });
  //       }
  //     };
  //   } else {
  //     // speech recognition API not supported
  //     console.log('speech recognition API not supported!!');
  //   }
  // }

  // startStopVoiceRecognition() {
  //   this.startService();
  // }

  // PG near sadhashiv nagar
}
