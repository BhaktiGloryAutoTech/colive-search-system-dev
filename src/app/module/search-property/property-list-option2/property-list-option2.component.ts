import { ChangeDetectorRef, Component, OnInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { NgbRatingConfig } from '@ng-bootstrap/ng-bootstrap';
import { SearchServiceService } from '@services/search-service.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-property-list-option2',
  templateUrl: './property-list-option2.component.html',
  styleUrls: ['./property-list-option2.component.scss']
})
export class PropertyListOption2Component implements OnInit, OnDestroy {

  unsubscribe = new Subject<void>();
  public tab: string = 'matchedProerties';
  matchedPropertyListDetails: any = [];
  trendingPropertyListDetails: any = [];
  similarPropertyListDetails: any = [];
  public loading = false;
  numbers: any = [1, 2, 3, 4, 5, 6];
  searchQuery: any;
  meanQuery = "2bhk room in koramangala"
  relatedSuggestion = ['2 bhk for rent in koramanagala 2 bhk for rent in koramanagala', '2 bhk for rent in koramanagala',
    '2 bhk for rent in koramanagala', '2 bhk for rent in koramanagala',
    '2 bhk for rent in koramanagala', '2 bhk for rent in koramanagala',
    '2 bhk for rent in koramanagala', '2 bhk for rent in koramanagala 2 bhk for rent in koramanagala',
    '2 bhk for rent in koramanagala', '2 bhk for rent in koramanagala',]
  matchedPropertyList: any = [];
  trendingPropertyList: any = [];
  similarPropertyList: any = [];
  constructor(private searchService: SearchServiceService, config: NgbRatingConfig,
    private cdr: ChangeDetectorRef) {
    this.loading = true;
    //subscribing property Id list
    this.searchService.searchedPropertyList.pipe(takeUntil(this.unsubscribe)).subscribe(
      (response) => {
        if (response) {
          this.getPropertyDetails(response);
        } else {
          const list: any = localStorage.getItem('list');
          this.getPropertyDetails(JSON.parse(list));
        }
      }
    )
    //for rating
    config.max = 5;
    config.readonly = true;
  }

  ngOnDestroy(): void {
    this.unsubscribe.next();
    this.unsubscribe.complete();
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
        console.log("matched property list", this.matchedPropertyList)
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
    this.matchedPropertyListDetails = [];
    this.trendingPropertyListDetails = [];
    this.similarPropertyListDetails = [];

    //for matched properties
    if (response1 && response1.matchedProperties && response1.matchedProperties.length) {
      this.loading = true;
      let counter = 0;
      response1.matchedProperties.forEach((plist: any, i: any) => {
        let propertyId = {
          propertyId: plist.propertyID
        }
        this.loading = true;
        this.searchService.getPropertyDetail(propertyId).pipe(takeUntil(this.unsubscribe)).subscribe(
          (response: any) => {
            this.loading = true;
            if (response && response.Data && response.Data.Property && response.Data.Property.length) {
              let itm = response1.matchedProperties.filter((f: any) => f.propertyID == response.Data.Property[0].PropertyID)
              if (itm && itm.length) {
                let badgeList = []
                response.Data.Property[0]['propertyDetails'] = itm[0].propertyInfo;
                for (let item of Object.keys(itm[0].labels)) {
                  badgeList.push(item)
                }
                response.Data.Property[0]['badgeList'] = badgeList
              }
              response.Data.Property[0]['url'] = response.Data.Property[0].ReferUrl.split('=')[1]
              this.matchedPropertyListDetails.push(response.Data.Property[0]);
            }
            counter++;
            this.loading = true;
            if (response1.matchedProperties.length == counter) {
              this.orderItems(response1, 'matched')
              this.loading = false;
            }
          }, (error: any) => {
            counter++;
            if (response1.matchedProperties.length == counter) {
              this.orderItems(response1, 'matched')
              this.loading = false;
            }

          }
        )
      });
      this.matchedPropertyListDetails = this.matchedPropertyListDetails.map((item: any) => ({
        ...item,
        showMore: false,
      }));
    }
    //for trending properties
    if (response1 && response1.trendingProperties && response1.trendingProperties.length) {
      this.loading = true;
      let counter = 0;
      response1.trendingProperties.forEach((plist: any, i: any) => {
        let propertyId = {
          propertyId: plist.propertyID
        }
        this.loading = true;
        this.searchService.getPropertyDetail(propertyId).pipe(takeUntil(this.unsubscribe)).subscribe(
          (response: any) => {
            if (response && response.Data && response.Data.Property && response.Data.Property.length) {
              this.loading = true;
              let itm = response1.trendingProperties.filter((f: any) => f.propertyID == response.Data.Property[0].PropertyID)
              if (itm && itm.length) {
                let badgeList = []
                response.Data.Property[0]['propertyDetails'] = itm[0].propertyInfo;
                for (let item of Object.keys(itm[0].labels)) {
                  badgeList.push(item)
                }
                response.Data.Property[0]['badgeList'] = badgeList
              }
              response.Data.Property[0]['url'] = response.Data.Property[0].ReferUrl.split('=')[1]
              this.trendingPropertyListDetails.push(response.Data.Property[0]);
            }
            counter++;
            if (response1.trendingProperties.length == counter) {
              this.orderItems(response1, 'trending')
            }
          }, (error: any) => {
            counter++;
            if (response1.trendingProperties.length == counter) {

              this.orderItems(response1, 'trending')
              this.loading = false;
            }

          }
        )
      });
      this.trendingPropertyListDetails = this.trendingPropertyListDetails.map((item: any) => ({
        ...item,
        showMore: false,
      }));
    }
    //for similar properties
    if (response1 && response1.similarProperties && response1.similarProperties.length) {
      this.loading = true;
      let counter = 0;
      response1.similarProperties.forEach((plist: any, i: any) => {
        let propertyId = {
          propertyId: plist.propertyID
        }
        this.loading = true;
        this.searchService.getPropertyDetail(propertyId).pipe(takeUntil(this.unsubscribe)).subscribe(
          (response: any) => {
            this.loading = true;
            if (response && response.Data && response.Data.Property && response.Data.Property.length) {
              let itm = response1.similarProperties.filter((f: any) => f.propertyID == response.Data.Property[0].PropertyID)
              if (itm && itm.length) {
                let badgeList = []
                response.Data.Property[0]['propertyDetails'] = itm[0].propertyInfo;
                for (let item of Object.keys(itm[0].labels)) {
                  badgeList.push(item)
                }
                response.Data.Property[0]['badgeList'] = badgeList
              }
              response.Data.Property[0]['url'] = response.Data.Property[0].ReferUrl.split('=')[1]
              this.similarPropertyListDetails.push(response.Data.Property[0]);
            }
            counter++;
            if (response1.similarProperties.length == counter) {
              this.orderItems(response1, 'similar')
            }
          }, (error: any) => {
            counter++;
            if (response1.similarProperties.length == counter) {
              this.orderItems(response1, 'similar')
              this.loading = false;
            }

          }
        )
      });
      this.similarPropertyListDetails = this.similarPropertyListDetails.map((item: any) => ({
        ...item,
        showMore: false,
      }));
    }

  }
  ngOnInit(): void {

  }
  stringFormatted(value: any) {
    // value.forEach((searchWord:any) =>{
    //   console.log('/'+searchWord+'/g', '<b>'+searchWord+'</b>')
    //   console.log("replaceee",this.meanQuery.replace(/searchWord/g, '<b>'+searchWord+'</b>'));
    //   console.log("replaceee 2222",this.meanQuery.replace("/koramangala/g", "<b>koramangala</b>"));
    // });

    return this.meanQuery.replace(/koramangala/g, "<b>koramangala</b>")
  }

  selectEvent(event: any) {
    console.log("Select event", event)

  }

  keyupevent(event: any) {
    console.log("key up ", event)
  }

  keyPress(event: any) {
    this.loading = true;
    if (this.searchQuery && event.keyCode == 13) {
      this.matchedPropertyList = [];
      this.trendingPropertyList = [];
      this.similarPropertyList = [];
      let search = {
        "query": this.searchQuery
      }
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
      this.loading = false;
    }
    console.log("key pressss", event)
  }

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

}
