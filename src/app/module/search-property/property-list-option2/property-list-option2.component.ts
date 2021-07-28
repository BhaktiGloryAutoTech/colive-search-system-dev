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
  propertyList: any = [];
  propertyDetailL: any = [];
  public loading = false;
  numbers: any = [1, 2, 3, 4, 5, 6];
  searchQuery: any;
  meanQuery = "2bhk room in koramangala"
  relatedSuggestion = ['2 bhk for rent in koramanagala 2 bhk for rent in koramanagala', '2 bhk for rent in koramanagala',
    '2 bhk for rent in koramanagala', '2 bhk for rent in koramanagala',
    '2 bhk for rent in koramanagala', '2 bhk for rent in koramanagala',
    '2 bhk for rent in koramanagala', '2 bhk for rent in koramanagala 2 bhk for rent in koramanagala',
    '2 bhk for rent in koramanagala', '2 bhk for rent in koramanagala',]
  searchedPropertyDetail: any=[];
  matchedPropertyList:any=[];
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
    this.loading=true;
    let tempList = [...this.propertyList];
    this.propertyList=[]
    response.matchedProperties.forEach((element: any) => {
      let found=false
      tempList.filter( (item) => {
        if (!found && item.PropertyID == element.propertyID) {
          this.matchedPropertyList = [...this.matchedPropertyList, item]
          found = true;
          return false;
        } else
          return true;
      })
      this.cdr.detectChanges();
    });
    this.loading=false;
  }

  //to get property Details
  getPropertyDetails(response1: any) {
    this.loading=true;
    let counter=0
    response1.matchedProperties.forEach((plist: any, i: any) => {
      let propertyId = {
        propertyId: plist.propertyID
      }
      this.loading = true;
      this.searchService.getPropertyDetail(propertyId).pipe(takeUntil(this.unsubscribe)).subscribe(
        (response: any) => {
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
          counter++;
          if (response1.matchedProperties.length == counter) {
            this.orderItems(response1)
          }
        }, (error: any) => {
          this.loading = false;
        }
      )
    }, (error: any) => {
      counter++;
      if (response1.matchedProperties.length == counter) {
        this.orderItems(response1)
      }
      this.loading = false
    });
    this.propertyList = this.propertyList.map((item: any) => ({
      ...item,
      showMore: false,
    }));
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
    this.loading = true;
    if (this.searchQuery) {
      this.searchedPropertyDetail = [];
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
          this.loading=false;
        }, (error:any) => {
          this.loading=false;
        }
      )
    }
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
