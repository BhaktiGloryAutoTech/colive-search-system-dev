import { ChangeDetectorRef, Component, OnInit, OnDestroy, HostListener, AfterViewInit, NgZone } from '@angular/core';
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
  styleUrls: ['./property-list-option2.component.scss']
})
export class PropertyListOption2Component implements OnInit, OnDestroy, AfterViewInit {

  unsubscribe = new Subject<void>();
  public tab: string = 'matchedProerties';
  matchedPropertyListDetails: any = [];
  trendingPropertyListDetails: any = [];
  similarPropertyListDetails: any = [];
  public loading = false;
  numbers: any = [1, 2, 3, 4, 5, 6];
  searchQuery: any = null;
  meanQuery = "2bhk room in koramangala"
  relatedSuggestion = ['2 bhk for rent in koramanagala 2 bhk for rent in koramanagala', '2 bhk for rent in koramanagala',
    '2 bhk for rent in koramanagala', '2 bhk for rent in koramanagala',
    '2 bhk for rent in koramanagala', '2 bhk for rent in koramanagala',
    '2 bhk for rent in koramanagala', '2 bhk for rent in koramanagala 2 bhk for rent in koramanagala',
    '2 bhk for rent in koramanagala', '2 bhk for rent in koramanagala',]
  matchedPropertyList: any = [];
  trendingPropertyList: any = [];
  similarPropertyList: any = [];

  //to track user clicks
  visitedPropertyList: any = [];

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
  recognition: any
  msg: any;
  bottomSuggesionList: any = [];

  constructor(private searchService: SearchServiceService, config: NgbRatingConfig,
    private cdr: ChangeDetectorRef, private ngZone: NgZone) {
    const { webkitSpeechRecognition }: IWindow = <IWindow><any>window;
    this.recognition = new webkitSpeechRecognition();
    this.loading = true;
    //subscribing property Id list
    this.searchService.searchedPropertyList.pipe(takeUntil(this.unsubscribe)).subscribe(
      (response) => {
        if (response) {
          this.getPropertyDetails(response);
        } else {
          if (localStorage.getItem('list')) {
            const list: any = localStorage.getItem('list');
            this.getPropertyDetails(JSON.parse(list));
          } else {
            if (localStorage.getItem('PropertyDetail')) {
              const property: any = localStorage.getItem('PropertyDetail');
              this.matchedPropertyList.push({ metaData: JSON.parse(property) })
              this.loading = false;
            }
          }
        }
      }
    )
    //subscribing spell formatted Query
    this.searchService.searchQuerySpell.subscribe(
      (response: any) => {
        if (response) {
          this.spellCorrectedQuery = response;
        } else {
          if (localStorage.getItem('searchQuery')) {
            const queery: any = localStorage.getItem('searchQuery')
            if (JSON.parse(queery)) {
              this.spellCorrectedQuery = JSON.parse(queery);
            }
          }
        }
      }
    )
    //subscribing search Query
    this.searchService.searchQuery.subscribe(
      (response: any) => {
        if (response) {
          this.searchQuery = response;
        } else {
          if (localStorage.getItem('query')) {
            const queery: any = localStorage.getItem('query')
            if (JSON.parse(queery)) {
              this.searchQuery = JSON.parse(queery);
            }
          }
        }
        if (this.searchQuery) {
          let OBJ = {
            'query': this.searchQuery.name ? this.searchQuery.name : this.searchQuery
          }
          this.bottomQuerySuggestion(OBJ)
        }
      }
    )
    //subscribing fixed Query
    this.searchService.fixedQuery.subscribe(
      (response: any) => {
        if (response) {
          this.fixedQuery = response;
        } else {
          if (localStorage.getItem('fiexQuery')) {
            const queery: any = localStorage.getItem('fiexQuery')
            if (JSON.parse(queery)) {
              this.fixedQuery = JSON.parse(queery);
            }
          }
        }
      }
    )
    //for rating
    config.max = 5;
    config.readonly = true;
  }

  ngAfterViewInit(): void {
    let container: any = document.getElementById('auoComplete');
    container?.classList.remove('input-search');
  }

  ngOnDestroy(): void {
    this.unsubscribe.next();
    this.unsubscribe.complete();
    // this.searchService.trackedClicks(this.visitedPropertyList).subscribe();
    this.visitedPropertyList = [];
  }

  ngOnInit(): void {
    //get QueryId
    if (localStorage.getItem('queryId')) {
      let qid: any = localStorage.getItem('queryId');
      this.queryId = JSON.parse(qid);
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
      if (this.searchQuery && this.suggestionList.length) {
        container?.classList.add('input-search')
        container?.classList.add('suggest-border');
      } else if (this.suggestionList && this.suggestionList.length) {
        container?.classList.add('input-search')
        container?.classList.add('suggest-border');
      }
      else {
        container?.classList.remove('input-search')
        container?.classList.remove('suggest-border');
      }
    }
  }

  //to get property Details
  getPropertyDetails(response1: any) {
    this.matchedPropertyList = [];
    this.trendingPropertyList = [];
    this.similarPropertyList = [];
    //for matched properties
    if (response1 && response1.matchedProperties && response1.matchedProperties.length) {
      this.loading = true;
      response1.matchedProperties.forEach((plist: any, i: any) => {
        let responseObj: any = {}
        let badgeList = [];
        //add Property Id
        if (plist.propertyID) {
          responseObj['PropertyID'] = plist.propertyID
        }
        //add property Info (labels and location)
        if (plist.propertyInfo) {
          responseObj['propertyDetails'] = plist.propertyInfo;
        }
        if (plist.labels) {
          for (let item of Object.keys(plist.labels)) {
            if (plist.labels[item].exists) {
              badgeList.push(plist.labels[item].displayValue)
            } else {
              badgeList.push(item.strike())
            }
          }
          responseObj['badgeList'] = badgeList;
        }
        //add property Details (name , description , price ,etc..)
        if (plist.metaData) {
          responseObj['metaData'] = plist.metaData;
        }
        //push matched property detail
        if (responseObj) {
          this.matchedPropertyList.push(responseObj)
        }
      });
      this.matchedPropertyListDetails = this.matchedPropertyListDetails.map((item: any) => ({
        ...item,
        showMore: false,
      }));
      this.loading = false;
    }


    //for trending properties
    if (response1 && response1.trendingProperties && response1.trendingProperties.length) {
      this.loading = true;
      response1.trendingProperties.forEach((plist: any, i: any) => {
        let responseObj: any = {}
        let badgeList = [];
        //add Property Id
        if (plist.propertyID) {
          responseObj['PropertyID'] = plist.propertyID
        }

        //add property Info (labels and location)
        if (plist.propertyInfo) {
          responseObj['propertyDetails'] = plist.propertyInfo;
        }
        if (plist.labels) {
          for (let item of Object.keys(plist.labels)) {
            if (plist.labels[item].exists) {
              badgeList.push(plist.labels[item].displayValue)
            } else {
              badgeList.push(item.strike())
            }
          }
          responseObj['badgeList'] = badgeList;
        }

        //add property Details (name , description , price ,etc..)
        if (plist.metaData) {
          responseObj['metaData'] = plist.metaData;
        }

        //push matched property detail
        if (responseObj) {
          this.trendingPropertyList.push(responseObj)
        }
      });
      this.trendingPropertyListDetails = this.trendingPropertyListDetails.map((item: any) => ({
        ...item,
        showMore: false,
      }));
      this.loading = false;
    }

    //for similar properties
    if (response1 && response1.similarProperties && response1.similarProperties.length) {
      this.loading = true;
      response1.similarProperties.forEach((plist: any, i: any) => {
        let responseObj: any = {}
        let badgeList = [];
        //add Property Id
        if (plist.propertyID) {
          responseObj['PropertyID'] = plist.propertyID
        }

        //add property Info (labels and location)
        if (plist.propertyInfo) {
          responseObj['propertyDetails'] = plist.propertyInfo;
        }
        if (plist.labels) {
          for (let item of Object.keys(plist.labels)) {
            if (plist.labels[item].exists) {
              badgeList.push(plist.labels[item].displayValue)
            } else {
              badgeList.push(item.strike())
            }
          }
          responseObj['badgeList'] = badgeList;
        }

        //add property Details (name , description , price ,etc..)
        if (plist.metaData) {
          responseObj['metaData'] = plist.metaData;
        }

        //push matched property detail
        if (responseObj) {
          this.similarPropertyList.push(responseObj)
        }
      });
      this.similarPropertyListDetails = this.similarPropertyListDetails.map((item: any) => ({
        ...item,
        showMore: false,
      }));
      this.loading = false
    }

  }

  selectEvent(event: any) {
    if (event) {
      // this.searchService.trackedClicks(this.visitedPropertyList).subscribe();
      let ele = document.getElementById('auoComplete');
      ele?.classList.remove('input-search')
      ele?.classList.remove('suggest-border');
      this.matchedPropertyList = [];
      this.trendingPropertyList = [];
      this.similarPropertyList = [];
      this.visitedPropertyList = [];
      this.searchQuery = event.name;
      if (event.type != 'property') {
        let search = {
          "query": event.name
        }
        //for bottom suggestion list
        this.bottomQuerySuggestion(search)
        //for spell check
        this.spellCheck(search)
        //get property ids for search query
        this.searchService.searchPropertyFormated(search).pipe(takeUntil(this.unsubscribe)).subscribe(
          (response: any) => {
            if (response) {
              this.searchService.searchedPropertyList.next(response);
              localStorage.setItem("list", JSON.stringify(response))
              this.getPropertyDetails(response)
            }
            this.loading = false;
          }, (error: any) => {
            this.loading = false;
          }
        )
      } else {
        localStorage.removeItem('list')
        localStorage.setItem('PropertyDetail', JSON.stringify(event))
        this.matchedPropertyList.push({ metaData: event })
        this.loading = false;
      }
    }
  }

  //search property
  keyPress(event: any,) {
    if (this.searchQuery && event.keyCode == 13) {
      this.loading = true;
      // this.searchQuery = this.fixedQuery;
      // this.spellCorrectedQuery = ''
      // this.searchService.trackedClicks(this.visitedPropertyList).subscribe();
      let ele = document.getElementById('auoComplete');
      ele?.classList.remove('input-search')
      this.matchedPropertyList = [];
      this.visitedPropertyList = [];
      this.trendingPropertyList = [];
      this.similarPropertyList = [];
      let search = {
        "query": this.searchQuery.name ? this.searchQuery.name : this.searchQuery
      }
      //for bottom suggestion list
      this.bottomQuerySuggestion(search)
      //for spell check
      this.spellCheck(search)
      this.loading = true;
      //get property ids for search query
      this.searchService.searchPropertyFormated(search).pipe(takeUntil(this.unsubscribe)).subscribe(
        (response: any) => {
          if (response) {
            this.queryId = response.queryID;
            localStorage.setItem('queryId', JSON.stringify(response.queryID))
            localStorage.setItem("list", JSON.stringify(response))
            this.getPropertyDetails(response)
          }
          this.loading = false;
        }, (error: any) => {
          this.loading = false;
        }
      )
    }
  }

  changeDidyouMean() {
    this.loading = true;
    this.searchQuery = this.fixedQuery;
    this.spellCorrectedQuery = ''
    localStorage.removeItem('searchQuery')
    localStorage.setItem('query', this.searchQuery)
    let searchObj = {
      'query': this.searchQuery.name ? this.searchQuery.name : this.searchQuery
    }
    //get property ids for search query
    this.searchService.searchPropertyFormated(searchObj).pipe(takeUntil(this.unsubscribe)).subscribe(
      (response: any) => {
        if (response) {

          localStorage.setItem("list", JSON.stringify(response))
          this.getPropertyDetails(response)
        }
        this.loading = false;
      }, (error: any) => {
        this.loading = false;
      }
    )
  }

  //tring string ex.discription
  trimString(text: any, length: any) {
    return text.length > length ? text.substring(0, length) + "..." : text;
  }

  nextPagination(i: any) {
    this.numbers = []
    for (let j = i; j <= i + 5; j++) {
      this.numbers.push(j)
    }
    this.cdr.detectChanges();
  }

  //search suggestion list
  onChangeSearch(event: any) {
    let container: any = document.getElementById('auoComplete');
    if (event) {
      let searchObj = {
        query: event
      }
      this.searchService.searchSuggestion(searchObj).pipe(takeUntil(this.unsubscribe)).subscribe(
        (response: any) => {
          this.suggestionList = [];
          if (response && response.response && response.response.propertyLocation) {
            response.response.propertyLocation.forEach((element: any) => {
              this.suggestionList.push({ name: element.displayValue, type: 'location', query: element.value })
            });
          }
          if (response && response.response && response.response.propertiesName) {
            response.response.propertiesName.forEach((element: any) => {
              this.suggestionList.push({
                name: element.propertyName, type: 'property', query: element.propertyName,
                propertyName: element.propertyName, propertyLink: element.propertyLink, price: element.price,
                locationHighlights: element.locationHighlights, city: element.city,
                propertyRating: element.propertyRating, subLocation: element.subLocation,
                tileImageUrl: element.tileImageUrl, topAmenity: element.topAmenity
              })
            });
          }
          if (response && response.response && response.response.autoComplete) {
            response.response.autoComplete.forEach((element: any) => {
              this.suggestionList.push({ name: element, type: 'auto', query: element })
            });
          }
          (this.suggestionList && this.suggestionList.length) ? container?.classList.add('input-search') : container?.classList.remove('input-search');

        }, error => {
          // suggest ? container.classList.add('input-search') : container.classList.remove('input-search');
        }
      )

      this.cdr.detectChanges();
    }

    setTimeout(() => {
      if (this.suggestionList && this.suggestionList.length) {
        container?.classList.add('input-search')
        container?.classList.add('suggest-border')
      } else {
        container?.classList.remove('input-search');
        container?.classList.remove('suggest-border')
      }
    }, 10)

  }

  //tracks clicks of user
  trackClicks(propertyId: any) {
    let timeStamp = new Date()
    this.visitedPropertyList.push({ 'PropertyID': propertyId, 'queryID': this.queryId, 'timeStamp': timeStamp.toString() });
  }

  //for spellCheck
  spellCheck(value: any) {
    if (value) {
      this.loading = true;
      this.spellCorrectedQuery = ''
      this.searchService.spellCheck(value).pipe(takeUntil(this.unsubscribe)).subscribe(
        (response: any) => {
          if (response && response.response) {
            if (String(response.response.originalQuery).toLowerCase() != String(response.response.formattedString).toLowerCase()) {
              this.spellCorrectedQuery = response.response.formattedString
              localStorage.setItem('searchQuery', JSON.stringify(response.response.formattedString))
            } else {
              localStorage.setItem('searchQuery', JSON.stringify(''))
            }
            this.fixedQuery = response.response.fixedQuery
            localStorage.setItem("query", JSON.stringify(this.searchQuery))
            localStorage.setItem("fixedQuery", JSON.stringify(response.response.fixedQuery))
          }
        },
        error => {
          this.loading = false;
        }
      )
    }
  }



  //searchBottomQuery
  searchBottomSuggestionQuery(search: any) {
    if (search) {
      this.loading = true;
      this.matchedPropertyList = [];
      this.visitedPropertyList = [];
      this.trendingPropertyList = [];
      this.similarPropertyList = [];
      let value = {
        'query': search
      }
      //for bottom suggestion
      this.bottomQuerySuggestion(value)
      //get property ids for search query
      this.searchService.searchPropertyFormated(value).pipe(takeUntil(this.unsubscribe)).subscribe(
        (response: any) => {
          if (response) {
            this.spellCorrectedQuery = '';
            localStorage.setItem('query', JSON.stringify(search));
            localStorage.removeItem('searchQuery')
            this.queryId = response.queryID;
            localStorage.setItem('queryId', JSON.stringify(response.queryID))
            this.searchService.searchedPropertyList.next(response);
            localStorage.setItem("list", JSON.stringify(response))
            this.getPropertyDetails(response)
          }
          this.loading = false;
        }, (error: any) => {
          this.loading = false;
        }
      )
    }
  }

  //bottomquery suggetion list
  bottomQuerySuggestion(search: any) {
    this.bottomSuggesionList = []
    this.searchService.bottomQuerySuggestion(search).pipe(takeUntil(this.unsubscribe)).subscribe(
      (response: any) => {
        if (response && response.response && response.response.length) {
          this.bottomSuggesionList = response.response;
        }
      }
    )
  }

  //for speech to text
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
              "query": this.searchQuery
            }
            this.spellCheck(search);
            this.matchedPropertyList = [];
            this.visitedPropertyList = [];
            this.trendingPropertyList = [];
            this.similarPropertyList = [];
            this.searchService.searchPropertyFormated(search).pipe(takeUntil(this.unsubscribe)).subscribe(
              (response: any) => {
                if (response) {
                  this.queryId = response.queryID;
                  localStorage.setItem('queryId', JSON.stringify(response.queryID))
                  localStorage.setItem("list", JSON.stringify(response))
                  this.getPropertyDetails(response)
                }
                this.loading = false;
              }, (error: any) => {
                this.loading = false;
              }
            )
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

  // PG near sadhashiv nagar
}
