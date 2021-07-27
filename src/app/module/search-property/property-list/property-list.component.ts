import { takeUntil } from 'rxjs/operators';
import { Offers } from './../../../shared/models/popertyList-filter';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { SearchServiceService } from '@services/search-service.service';
import { NgbRatingConfig } from '@ng-bootstrap/ng-bootstrap';
import { Subject } from 'rxjs';
import { ItemsList } from '@ng-select/ng-select/lib/items-list';

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
  constructor(private searchService: SearchServiceService, config: NgbRatingConfig) {
    this.loading = true;
    this.searchService.searchedPropertyList.pipe(takeUntil(this.unsubscribe)).subscribe(
      (response) => {
        if (response && response.length) {
          this.getPropertyDetails(response)
          this.loading = false;
        } else {
          const list: any = localStorage.getItem('list');
          this.getPropertyDetails(JSON.parse(list));
          this.loading = false;
        }
        console.log(this.propertyList)
      }
    )
    config.max = 5;
    config.readonly = true;
  }

  ngOnDestroy(): void {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  getPropertyDetails(response1: any) {
    response1.forEach((plist: any, i: any) => {
      let propertyId = {
        propertyId: plist.propertyId
      }
      this.loading = true;
      this.searchService.getPropertyDetail(propertyId).pipe(takeUntil(this.unsubscribe)).subscribe(
        (response: any) => {
          if (response && response.Data) {
            console.log(response.Data);
            let itm = response1.filter((f: any) => f.propertyId == response.Data.Property[0].PropertyID)
            if (itm && itm.length) {
              let badgeList = []
              response.Data.Property[0]['propertyDetails'] = itm[0].propertyData;
              for (let item of Object.keys(itm[0].propertyData)) {
                if (item != 'distance' && item != 'totalMatch') {
                  badgeList.push(item)
                }
              }
              response.Data.Property[0]['badgeList'] = badgeList
            }
            this.propertyList.push(response.Data.Property[0]);
            this.loading = false;
          } else {
            this.loading = false
          }
        }, (error: any) => {
          this.loading = false;
        }
      )
    }, (error: any) => {
      this.loading = false
    });
    this.propertyList = this.propertyList.map((item: any) => ({
      ...item,
      showMore: false,
    }));
    console.log("property Detail", this.propertyList)
  }
  ngOnInit(): void {

  }

  trimString(text: any, length: any) {
    return text.length > length ? text.substring(0, length) + "..." : text;
  }
}
