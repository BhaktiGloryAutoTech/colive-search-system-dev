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
import { DeviceDetectorService } from 'ngx-device-detector';

export interface IWindow extends Window {
  webkitSpeechRecognition: any;
}
@Component({
  selector: 'app-property-list-option2',
  templateUrl: './property-list-option2.component.html',
  styleUrls: ['./property-list-option2.component.scss'],
})
export class PropertyListOption2Component
  implements OnInit, OnDestroy, AfterViewInit {
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
  hostName: string = ''

  deviceInfo: any = '';
  openType: any = '_blank';
  showMic: any = false
  isMobile = false

  qPropertyId = '';
  showColive = false;
  showNonColive = false;


  constructor(
    private searchService: SearchServiceService,
    config: NgbRatingConfig,
    private cdr: ChangeDetectorRef,
    private activatedRoute: ActivatedRoute,
    private ngxService: NgxUiLoaderService,
    private deviceService: DeviceDetectorService,
    private ngZone: NgZone,
  ) {
    this.deviceInfo = this.deviceService.getDeviceInfo();
    const isDesktopDevice = this.deviceService.isDesktop();
    const isMobile = this.deviceService.isMobile();
    console.log(isDesktopDevice || isMobile); // returns if the app is running on a Desktop or mobile browser.
    if (isDesktopDevice) {
      if (this.deviceInfo.browser == "Chrome") {
        const { webkitSpeechRecognition }: IWindow = <IWindow>(<any>window);
        this.recognition = new webkitSpeechRecognition();
        this.showMic = true;
      } else {
        this.showMic = false;
      }
    } else {
      this.showMic = false;
    }


    //for rating
    config.max = 5;
    config.readonly = true;
    this.activatedRoute.queryParams.subscribe((res: any) => {
      console.log('Query params :-', res);
      if (res?.redirectHost) {
        this.hostName = res?.redirectHost.replace(/^"|"$/g, '');
        console.log('Domain : -', this.hostName);
        let url = this.hostName;
        if (url.substr(url.length - 1) != '/') {
          this.hostName = this.hostName + '/';
        }
      }

      if (res?.isMobile) {
        // String(res?.isMobile).toString() == '1' ? this.openType='_parent' : this.openType='_blank';
        String(res?.isMobile).toString() == '1' ? this.isMobile = true : this.isMobile = false;
      }

      if (res?.sQuery) {
        this.searchQuery = res?.sQuery;
      } else {
        this.searchQuery = 'pgs in marathalli';
      }

      if (res?.pId) {
        this.qPropertyId = res?.pId;
      }

      if (res?.propertyType) {
        switch (res?.propertyType) {
          case '1':
            this.showColive = true;
            console.log(res?.propertyType);
            break;

          case '0':
            this.showNonColive = true;
            console.log(res?.propertyType);
            break;

          case 'all':
            this.showColive = false;
            this.showNonColive = false;
            console.log(res?.propertyType);
            break;
        }
      }

    });
  }



  ngAfterViewInit(): void {
    let container: any = document.getElementById('auoComplete');
    container?.classList.remove('input-search');
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
        if (plist.isPropertyObject) {
          responseObj['metaData'] = plist
          this.searchQuery=plist.propertyName;
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

        if (plist.isPropertyObject) {
          responseObj['metaData'] = plist;
          this.searchQuery=plist.propertyName;
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

        if (plist.isPropertyObject) {
          responseObj['metaData'] = plist;
          this.searchQuery=plist.propertyName;
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
      this.qPropertyId = '';
      if (event.type != 'property') {
        let search = {
          query: event.name,
        };
        //for spell check
        this.spellCheck(search);
      } else {
        this.qPropertyId = event.propertyId;
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
    this.qPropertyId = ''
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
      this.qPropertyId = '';
      let propertyDetail: any;
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
    let searchObj = {
      query: this.searchQuery.name ? this.searchQuery.name : this.searchQuery,
      category: this.qPropertyId ? 'propertyID' : 'direct',
      queryID: this.queryId,
      filters: {
        showColive: this.showColive,
        showNonColive: this.showNonColive
      }
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
                  propertyId: element.propertyID,
                  propertyName: element.propertyName,
                });
              });
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
  trackClicks(propertyId: any, value: string) {
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
    let url = this.hostName.concat(value);
    this.isMobile ? window.open(url, '_parent') : window.open(url, '_blank');
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
              } else {
              }
              this.fixedQuery = response.response.fixedQuery;
            }
            if (response) {
              this.queryId = response.queryID;
              value['queryId'] = this.queryId;
              this.bottomQuerySuggestion(value);
              let obj = {
                query: this.qPropertyId ? this.qPropertyId : value['query'],
                category: this.qPropertyId ? 'propertyID' : 'direct',
                queryID: this.queryId,
                filters: {
                  showColive: this.showColive,
                  showNonColive: this.showNonColive
                }
              };

              this.searchService
                .searchPropertyFormated(obj)
                .pipe(takeUntil(this.unsubscribe))
                .subscribe(
                  (response: any) => {
                    if (response) {
                      this.allPropertyList = [];
                      this.tab = 'matchedProerties';
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
      query: this.qPropertyId ? this.qPropertyId : value,
      category: this.qPropertyId ? 'propertyID' : 'trending',
      queryID: this.queryId,
      filters: {
        showColive: this.showColive,
        showNonColive: this.showNonColive
      }
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
      query: this.qPropertyId ? this.qPropertyId : value,
      category: this.qPropertyId ? 'propertyID' : 'similar',
      queryID: this.queryId,
      filters: {
        showColive: this.showColive,
        showNonColive: this.showNonColive
      }
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
      this.qPropertyId = '';
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

  propertyVisit(value: string) {
    let url = this.hostName.concat(value);
    this.isMobile ? window.open(url, '_parent') : window.open(url, '_blank');
  }

  // //for speech to text
  startService() {
    let container: any = document.getElementById('auoComplete');
    window.SpeechRecognition = this.recognition || window['SpeechRecognition'];
    if ('SpeechRecognition' in window) {
      // speech recognition API supported

      // this.recognition = new window.SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.lang = 'en-US';
      this.recognition.interimResults = true;
      this.recognition.maxAlternatives = 3;

      this.recognition.start();
      this.recognition.onresult = (event: any) => {
        let isFinal = event.results[0].isFinal;
        if (!isFinal) {
          this.ngZone.run(() => {
            this.searchQuery = event.results[0][0].transcript;
            container?.classList.remove('input-search');
          });
        } else if (isFinal) {
          this.ngZone.run(() => {
            this.searchQuery = event.results[0][0].transcript;
            container?.classList.remove('input-search');
            this.recognition.stop();
            let search = {
              query: this.searchQuery,
            };
            this.spellCheck(search);
          });
        }
      };
    } else {
      // speech recognition API not supported
      console.log('speech recognition API not supported!!');
    }
  }

  startStopVoiceRecognition() {
    this.startService();
  }
}
