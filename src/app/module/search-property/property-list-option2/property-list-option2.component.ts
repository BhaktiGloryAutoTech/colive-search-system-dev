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
export class PropertyListOption2Component implements OnInit,OnDestroy {

  unsubscribe = new Subject<void>();
  public tab: string = 'matchedProerties';
  propertyList: any = [];
  propertyDetailL: any = [];
  public loading = false;
  numbers:any=[1,2,3,4,5,6]

  constructor(private searchService: SearchServiceService, config: NgbRatingConfig,
    private cdr: ChangeDetectorRef)
  {
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

  nextPagination(i:any){
    this.numbers=[]
    for(let j=i;j<=i+5;j++){
      this.numbers.push(j)
    }
    this.cdr.detectChanges();
    console.log(this.numbers)
  }

}
