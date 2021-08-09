import { ChangeDetectorRef, Component, OnInit, OnDestroy, HostListener, AfterViewInit } from '@angular/core';
import { NgbRatingConfig } from '@ng-bootstrap/ng-bootstrap';
import { SearchServiceService } from '@services/search-service.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

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

  constructor(private searchService: SearchServiceService, config: NgbRatingConfig,
    private cdr: ChangeDetectorRef) {
    this.loading = true;
    //subscribing property Id list
    this.searchService.searchedPropertyList.pipe(takeUntil(this.unsubscribe)).subscribe(
      (response) => {
        if (response) {
          this.getPropertyDetails(response);

          //making property Id as one string
          //for matching properties
          // if (response.matchedProperties)
          //   this.propertyDetailsByPropertyIdRequestBody(response.matchedProperties, 'matching');
          // //for trending properties
          // if (response.trendingProperties)
          //   this.propertyDetailsByPropertyIdRequestBody(response.trendingProperties, 'trending');
          // //for similar properties
          // if (response.similarProperties)
          //   this.propertyDetailsByPropertyIdRequestBody(response.similarProperties, 'similar');
        } else {
          const list: any = localStorage.getItem('list');
          this.getPropertyDetails(JSON.parse(list));
          let response = JSON.parse(list)
          //making property Id as one string
          //for matching properties
          // if (response.matchedProperties)
          //   this.propertyDetailsByPropertyIdRequestBody(response.matchedProperties, 'matching');
          // //for trending properties
          // if (response.trendingProperties)
          //   this.propertyDetailsByPropertyIdRequestBody(response.trendingProperties, 'trending');
          // //for similar properties
          // if (response.similarProperties)
          //   this.propertyDetailsByPropertyIdRequestBody(response.similarProperties, 'similar');
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
    } else {
      if (this.searchQuery && suggestionList) {
        container?.classList.add('input-search')
      }
    }
  }

  //to order property according to response rating
  orderItems(response: any, value: any) {
    switch (value) {
      case 'matched':
        this.loading = true;
        this.matchedPropertyList = [];
        let matchTempList = [...this.matchedPropertyListDetails];
        this.matchedPropertyListDetails = []
        response.matchedProperties.forEach((element: any) => {
          let found = false
          matchTempList.filter((item) => {
            if (!found && item.PropertyID == element.propertyID) {
              this.matchedPropertyList = [...this.matchedPropertyList, item]
              found = true;
              return false;
            } else
              return true;
          })
          this.cdr.detectChanges();
        });
        this.loading = false;
        break;

      case 'trending':
        this.loading = true;
        this.trendingPropertyList = [];
        let trendingTempList = [...this.trendingPropertyListDetails];
        this.trendingPropertyListDetails = []
        response.trendingProperties.forEach((element: any) => {
          let found = false
          trendingTempList.filter((item) => {
            if (!found && item.PropertyID == element.propertyID) {
              this.trendingPropertyList = [...this.trendingPropertyList, item]
              found = true;
              return false;
            } else
              return true;
          })
          this.cdr.detectChanges();
        });
        this.loading = false;
        break;

      case 'similar':
        this.loading = true;
        this.similarPropertyList = [];
        let similarTempList = [...this.similarPropertyListDetails];
        this.similarPropertyListDetails = []
        response.similarProperties.forEach((element: any) => {
          let found = false
          similarTempList.filter((item) => {
            if (!found && item.PropertyID == element.propertyID) {
              this.similarPropertyList = [...this.similarPropertyList, item]
              found = true;
              return false;
            } else
              return true;
          })
          this.cdr.detectChanges();
        });
        this.loading = false;
        break;


    }
  }

  //to get property Details
  getPropertyDetails(response1: any) {
    // this.matchedPropertyListDetails = [];
    // this.trendingPropertyListDetails = [];
    // this.similarPropertyListDetails = [];
    this.matchedPropertyList = [];
    this.trendingPropertyList = [];
    this.similarPropertyList = [];
    //for matched properties
    if (response1 && response1.matchedProperties && response1.matchedProperties.length) {
      this.loading = true;
      // let counter = 0;
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


        // let propertyId = {
        //   propertyId: plist.propertyID
        // }
        // this.loading = true;
        // this.searchService.getPropertyDetail(propertyId).pipe(takeUntil(this.unsubscribe)).subscribe(
        //   (response: any) => {
        //     this.loading = true;
        //     if (response && response.Data && response.Data.Property && response.Data.Property.length) {
        //       let itm = response1.matchedProperties.filter((f: any) => f.propertyID == response.Data.Property[0].PropertyID)
        //       if (itm && itm.length) {
        //         let badgeList = []
        //         response.Data.Property[0]['propertyDetails'] = itm[0].propertyInfo;
        //         for (let item of Object.keys(itm[0].labels)) {
        //           if (itm[0].labels[item].exists) {
        //             badgeList.push(itm[0].labels[item].displayValue)
        //           } else {
        //             badgeList.push(item.strike())
        //           }
        //         }
        //         response.Data.Property[0]['badgeList'] = badgeList
        //       }
        //       response.Data.Property[0]['url'] = response.Data.Property[0].ReferUrl.split('=')[1]
        //       this.matchedPropertyListDetails.push(response.Data.Property[0]);
        //     }
        //     counter++;
        //     this.loading = true;
        //     if (response1.matchedProperties.length == counter) {
        //       this.orderItems(response1, 'matched')
        //       this.loading = false;
        //     }
        //   }, (error: any) => {
        //     counter++;
        //     if (response1.matchedProperties.length == counter) {
        //       this.orderItems(response1, 'matched')
        //       this.loading = false;
        //     }

        //   }
        // )
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
      // let counter = 0;
      response1.trendingProperties.forEach((plist: any, i: any) => {
        // let propertyId = {
        //   propertyId: plist.propertyID
        // }
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



        // this.loading = true;
        // this.searchService.getPropertyDetail(propertyId).pipe(takeUntil(this.unsubscribe)).subscribe(
        //   (response: any) => {
        //     if (response && response.Data && response.Data.Property && response.Data.Property.length) {
        //       this.loading = true;
        //       let itm = response1.trendingProperties.filter((f: any) => f.propertyID == response.Data.Property[0].PropertyID)
        //       if (itm && itm.length) {
        //         let badgeList = []
        //         response.Data.Property[0]['propertyDetails'] = itm[0].propertyInfo;
        //         for (let item of Object.keys(itm[0].labels)) {
        //           if (itm[0].labels[item].displayValue) {
        //             badgeList.push(itm[0].labels[item].displayValue)
        //           } else {
        //             badgeList.push(item)
        //           }
        //         }
        //         response.Data.Property[0]['badgeList'] = badgeList
        //       }
        //       response.Data.Property[0]['url'] = response.Data.Property[0].ReferUrl.split('=')[1]
        //       this.trendingPropertyListDetails.push(response.Data.Property[0]);
        //     }
        //     counter++;
        //     if (response1.trendingProperties.length == counter) {
        //       this.orderItems(response1, 'trending')
        //     }
        //   }, (error: any) => {
        //     counter++;
        //     if (response1.trendingProperties.length == counter) {

        //       this.orderItems(response1, 'trending')
        //       this.loading = false;
        //     }

        //   }
        // )
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
      // let counter = 0;
      response1.similarProperties.forEach((plist: any, i: any) => {
        // let propertyId = {
        //   propertyId: plist.propertyID
        // }
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



        // this.loading = true;
        // this.searchService.getPropertyDetail(propertyId).pipe(takeUntil(this.unsubscribe)).subscribe(
        //   (response: any) => {
        //     this.loading = true;
        //     if (response && response.Data && response.Data.Property && response.Data.Property.length) {
        //       let itm = response1.similarProperties.filter((f: any) => f.propertyID == response.Data.Property[0].PropertyID)
        //       if (itm && itm.length) {
        //         let badgeList = []
        //         response.Data.Property[0]['propertyDetails'] = itm[0].propertyInfo;
        //         for (let item of Object.keys(itm[0].labels)) {
        //           if (itm[0].labels[item].displayValue) {
        //             badgeList.push(itm[0].labels[item].displayValue)
        //           } else {
        //             badgeList.push(item)
        //           }
        //         }
        //         response.Data.Property[0]['badgeList'] = badgeList
        //       }
        //       response.Data.Property[0]['url'] = response.Data.Property[0].ReferUrl.split('=')[1]
        //       this.similarPropertyListDetails.push(response.Data.Property[0]);
        //     }
        //     counter++;
        //     if (response1.similarProperties.length == counter) {
        //       this.orderItems(response1, 'similar')
        //     }
        //   }, (error: any) => {
        //     counter++;
        //     if (response1.similarProperties.length == counter) {
        //       this.orderItems(response1, 'similar')
        //       this.loading = false;
        //     }

        //   }
        // )
      });
      this.similarPropertyListDetails = this.similarPropertyListDetails.map((item: any) => ({
        ...item,
        showMore: false,
      }));
      this.loading = false
    }

  }

  //to put prorprty id in one string (request parameter)
  propertyDetailsByPropertyIdRequestBody(value: any, type: any) {
    switch (type) {
      case 'matching':
        value.forEach((element: any, i: any) => {
          // element.propertyID
          if (i != 0) {
            this.matchedPropertyListRequest += ',' + element.propertyID;
          } else {
            this.matchedPropertyListRequest += element.propertyID;
          }
        });
        this.getPropertyDetailsByPropertyIdString(this.matchedPropertyListRequest, 'matching');
        break;

      case 'trending':
        value.forEach((element: any, i: any) => {
          // element.propertyID
          if (i != 0) {
            this.trendingPropertyListRequest += ',' + element.propertyID;
          } else {
            this.trendingPropertyListRequest += element.propertyID;
          }
        });
        this.getPropertyDetailsByPropertyIdString(this.trendingPropertyListRequest, 'trending');
        break;

      case 'similar':
        value.forEach((element: any, i: any) => {
          // element.propertyID
          if (i != 0) {
            this.similarPropertyListRequest += ',' + element.propertyID;
          } else {
            this.similarPropertyListRequest += element.propertyID;
          }
        });
        this.getPropertyDetailsByPropertyIdString(this.similarPropertyListRequest, 'similar');
        break;
    }
  }

  //call multiple property ids as one string property ID request
  getPropertyDetailsByPropertyIdString(requestString: any, type: any) {
    let requestObj = {
      propertyId: requestString,
    }
    // switch (type) {
    //   case 'matching':
    //     this.loading = true;
    //     this.searchService.getPropertyDetailsByString(requestObj).pipe(takeUntil(this.unsubscribe)).subscribe(
    //       (response: any) => {
    //         if (response) {
    //           this.matchedPropertyListDetails = response
    //         }
    //         this.loading = false;
    //       },
    //       error => {
    //         this.loading = false;
    //       }
    //     )
    //     break;

    //   case 'trending':
    //     this.loading = true;
    //     this.searchService.getPropertyDetailsByString(requestObj).pipe(takeUntil(this.unsubscribe)).subscribe(
    //       (response: any) => {
    //         if (response) {
    //           this.trendingPropertyListDetails = response
    //         }
    //         this.loading = false;
    //       },
    //       error => {
    //         this.loading = false;
    //       }
    //     )
    //     break;

    //   case 'trending':
    //     this.loading = true;
    //     this.searchService.getPropertyDetailsByString(requestObj).pipe(takeUntil(this.unsubscribe)).subscribe(
    //       (response: any) => {
    //         if (response) {
    //           this.similarPropertyListDetails = response
    //         }
    //         this.loading = false;
    //       },
    //       error => {
    //         this.loading = false;
    //       }
    //     )
    //     break;
    // }
  }

  selectEvent(event: any) {
    if (event) {
      // this.searchService.trackedClicks(this.visitedPropertyList).subscribe();
      let ele = document.getElementById('auoComplete');
      ele?.classList.remove('input-search')
      this.matchedPropertyList = [];
      this.trendingPropertyList = [];
      this.similarPropertyList = [];
      this.visitedPropertyList = [];
      let search = {
        "query": event.name
      }
      //for spell check
      this.spellCheck(search)
      //get property ids for search query
      this.searchService.searchPropertyFormated(search).pipe(takeUntil(this.unsubscribe)).subscribe(
        (response: any) => {
          if (response) {
            this.searchService.searchedPropertyList.next(response);
            localStorage.setItem("list", JSON.stringify(response))
            this.getPropertyDetails(response)
            //making property Id as one string
            //for matching properties
            // if (response.matchedProperties)
            //   this.propertyDetailsByPropertyIdRequestBody(response.matchedProperties, 'matching');
            // //for trending properties
            // if (response.trendingProperties)
            //   this.propertyDetailsByPropertyIdRequestBody(response.trendingProperties, 'trending');
            // //for similar properties
            // if (response.similarProperties)
            //   this.propertyDetailsByPropertyIdRequestBody(response.similarProperties, 'similar');
          }
          this.loading = false;
        }, (error: any) => {
          this.loading = false;
        }
      )
    }
  }

  //search property
  keyPress(event: any,) {
    this.loading = true;
    if (this.searchQuery && event.keyCode == 13) {
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
        "query": this.searchQuery
      }
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
            //making property Id as one string
            //for matching properties
            // if (response.matchedProperties)
            //   this.propertyDetailsByPropertyIdRequestBody(response.matchedProperties, 'matching');
            // //for trending properties
            // if (response.trendingProperties)
            //   this.propertyDetailsByPropertyIdRequestBody(response.trendingProperties, 'trending');
            // //for similar properties
            // if (response.similarProperties)
            //   this.propertyDetailsByPropertyIdRequestBody(response.similarProperties, 'similar');
          }
          this.loading = false;
        }, (error: any) => {
          this.loading = false;
        }
      )
    } else {
      this.loading = false;
    }
  }

  //get property details
  getPropertyDetailsForSearchQuery(value: any) {
    //get property ids for search query
    this.searchService.searchPropertyFormated(value).pipe(takeUntil(this.unsubscribe)).subscribe(
      (response: any) => {
        if (response) {
          this.searchService.searchedPropertyList.next(response);
          localStorage.setItem("list", JSON.stringify(response))
          this.getPropertyDetails(response)
          //making property Id as one string
          //for matching properties
          // if (response.matchedProperties)
          //   this.propertyDetailsByPropertyIdRequestBody(response.matchedProperties, 'matching');
          // //for trending properties
          // if (response.trendingProperties)
          //   this.propertyDetailsByPropertyIdRequestBody(response.trendingProperties, 'trending');
          // //for similar properties
          // if (response.similarProperties)
          //   this.propertyDetailsByPropertyIdRequestBody(response.similarProperties, 'similar');
        }
        this.loading = false;
      }, (error: any) => {
        this.loading = false;
      }
    )
  }

  changeDidyouMean() {
    this.loading = true;
    this.searchQuery = this.fixedQuery;
    this.spellCorrectedQuery = ''
    localStorage.removeItem('searchQuery')
    localStorage.setItem('query', this.searchQuery)
    let searchObj = {
      'query': this.searchQuery
    }
    //get property ids for search query
    this.searchService.searchPropertyFormated(searchObj).pipe(takeUntil(this.unsubscribe)).subscribe(
      (response: any) => {
        if (response) {

          localStorage.setItem("list", JSON.stringify(response))
          this.getPropertyDetails(response)
          //making property Id as one string
          //for matching properties
          // if (response.matchedProperties)
          //   this.propertyDetailsByPropertyIdRequestBody(response.matchedProperties, 'matching');
          // //for trending properties
          // if (response.trendingProperties)
          //   this.propertyDetailsByPropertyIdRequestBody(response.trendingProperties, 'trending');
          // //for similar properties
          // if (response.similarProperties)
          //   this.propertyDetailsByPropertyIdRequestBody(response.similarProperties, 'similar');
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
    if (event) {
      let searchObj = {
        query: event
      }
      let container: any = document.getElementById('auoComplete');
      let suggest: any = document.getElementById('item-list');
      this.searchService.searchSuggestion(searchObj).pipe(takeUntil(this.unsubscribe)).subscribe(
        (response: any) => {
          this.suggestionList = [];
          if (response && response.response && response.response.propertyLocation) {
            response.response.propertyLocation.forEach((element: any) => {
              this.suggestionList.push({ name: element, type: 'location' })
            });
          }
          if (response && response.response && response.response.propertiesName) {
            response.response.propertiesName.forEach((element: any) => {
              this.suggestionList.push({ name: element.propertyName, type: 'property' })
            });
          }

          (this.suggestionList && this.suggestionList.length) ? container?.classList.add('input-search') : container?.classList.remove('input-search');

        }, error => {
          // suggest ? container.classList.add('input-search') : container.classList.remove('input-search');
        }
      )
      // setTimeout(() => {
      //   let container: any = document.getElementById('auoComplete');
      //   let suggest: any = document.getElementById('item-list');
      //   suggest ? container.classList.add('input-search') : container.classList.remove('input-search');
      // }, 1000)
      this.cdr.detectChanges();
    }

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
      this.searchService.spellCheck(value).pipe(takeUntil(this.unsubscribe)).subscribe(
        (response: any) => {
          if (response && response.response) {
            if (response.response.originalQuery != response.response.formattedString) {
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


}
