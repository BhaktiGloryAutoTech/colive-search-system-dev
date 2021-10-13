import { takeUntil } from 'rxjs/operators';
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { SearchServiceService } from '@services/search-service.service';
import { NgbRatingConfig } from '@ng-bootstrap/ng-bootstrap';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-property-list',
  templateUrl: './property-list.component.html',
  styleUrls: ['./property-list.component.scss']
})
export class PropertyListComponent implements OnInit, OnDestroy {
  unsubscribe = new Subject<void>();
  public tab: string = 'matchedProerties';
  matchedPropertyListDetails: any = [];
  trendingPropertyListDetails: any = [];
  similarPropertyListDetails: any = [];
  propertyDetailL: any = [];
  public loading = false;
  offers = [
    { id: 0, name: '10% off or more', value: false },
    { id: 1, name: '20% off or more', value: false }
  ];
  customterRatings = [
    { id: 0, name: 4, value: false },
    { id: 1, name: 3, value: false },
    { id: 2, name: 2, value: false },
    { id: 3, name: 1, value: false }
  ];
  monthlyRent = [
    { id: 0, name: 'Any', value: false },
    { id: 1, name: '<₹ 8000', value: false },
    { id: 2, name: '< 8000', value: false },
    { id: 3, name: '<₹ 8000', value: false },
  ];
  sharingType = [
    { id: 0, name: 'Any', value: false },
    { id: 0, name: 'Couple', value: false },
    { id: 0, name: 'Single', value: false },
    { id: 0, name: 'Double', value: false }
  ];
  city = [
    { id: 0, name: 'Bangalore', value: false },
    { id: 1, name: 'Chennai', value: false },
    { id: 2, name: 'Hyderabad', value: false },
    { id: 3, name: 'Pune', value: false },
    { id: 4, name: 'Indore', value: false },
  ]
  location = [
    { id: 0, name: 'Bangalore', value: false },
    { id: 1, name: 'Chennai', value: false },
    { id: 2, name: 'Hyderabad', value: false },
    { id: 3, name: 'Pune', value: false },
    { id: 4, name: 'Indore', value: false },
  ]
  amenities = [
    { id: 0, name: 'Any', value: false },
    { id: 1, name: 'AC', value: false },
    { id: 2, name: 'Wifi', value: false },
    { id: 3, name: 'Food', value: false },
  ]
  matchedPropertyList: any = [];
  trendingPropertyList: any = [];
  similarPropertyList: any = [];
  constructor(private searchService: SearchServiceService, config: NgbRatingConfig,
    private cdr: ChangeDetectorRef) {
    this.loading = true;
    this.searchService.searchedPropertyList.pipe(takeUntil(this.unsubscribe)).subscribe(
      (response) => {
        if (response) {
          this.getPropertyDetails(response)
          this.loading = false;

        } else {
          // const list: any = localStorage.getItem('list');
          // this.getPropertyDetails(JSON.parse(list));
          this.loading = false;
        }

      }
    )
    //for star rating
    config.max = 5;
    config.readonly = true;
  }

  ngOnDestroy(): void {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  //to order property according to response rating
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
            }
          }, (error: any) => {
            counter++;
            if (response1.matchedProperties.length == counter) {
              this.loading = false;
              this.orderItems(response1, 'matched')
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
              this.loading = false;
              this.orderItems(response1, 'trending')
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
            }
            this.loading = false;
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


  trimString(text: any, length: any) {
    return text.length > length ? text.substring(0, length) + "..." : text;
  }
}
