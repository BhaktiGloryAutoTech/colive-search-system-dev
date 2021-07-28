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
  propertyList: any = [];
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
  constructor(private searchService: SearchServiceService, config: NgbRatingConfig,
    private cdr: ChangeDetectorRef) {
    this.loading = true;
    this.searchService.searchedPropertyList.pipe(takeUntil(this.unsubscribe)).subscribe(
      (response) => {
        if (response) {
          this.getPropertyDetails(response)
          this.loading = false;

        } else {
          const list: any = localStorage.getItem('list');
          this.getPropertyDetails(JSON.parse(list));
          this.loading = false;
        }

      }
    )
    config.max = 5;
    config.readonly = true;
  }

  ngOnDestroy(): void {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  //to order property according to response rating
  orderItems(response: any) {
    this.loading = true;
    let tempList = [...this.propertyList];
    this.propertyList = []
    let orderedList: any = [];
    response.matchedProperties.forEach((element: any) => {
      let found = false
      tempList.filter((item) => {
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
  }

  //get property Detail
  getPropertyDetails(response1: any) {
    this.loading = true;
    let counter = 0;
    response1.matchedProperties.forEach((plist: any, i: any) => {
      let propertyId = {
        propertyId: plist.propertyID
      }
      this.loading = true;
      this.searchService.getPropertyDetail(propertyId).pipe(takeUntil(this.unsubscribe)).subscribe(
        (response: any) => {
          counter++
          if (response && response.Data) {
            let itm = response1.matchedProperties.filter((f: any) => f.propertyID == response.Data.Property[0].PropertyID)
            if (itm && itm.length) {
              let badgeList = []
              response.Data.Property[0]['propertyDetails'] = itm[0].propertyInfo;
              for (let item of Object.keys(itm[0].labels)) {
                badgeList.push(item)
              }
              response.Data.Property[0]['badgeList'] = badgeList
            }
            this.propertyList.push(response.Data.Property[0]);

            this.loading = false;
          } else {
            this.loading = false
          }
          if (response1.matchedProperties.length == counter) {
            this.orderItems(response1)
          }
        }, (error: any) => {
          counter++;
          if (response1.matchedProperties.length == counter) {
            this.orderItems(response1)
          }
          this.loading = false;
        }
      )
    });
    this.propertyList = this.propertyList.map((item: any) => ({
      ...item,
      showMore: false,
    }));
  }
  ngOnInit(): void {
  }


  trimString(text: any, length: any) {
    return text.length > length ? text.substring(0, length) + "..." : text;
  }
}
