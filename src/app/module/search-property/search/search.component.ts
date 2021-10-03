import { Router } from '@angular/router';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { SearchServiceService } from '@services/search-service.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
})
export class SearchComponent implements OnInit, OnDestroy {
  searchQuery: any;
  disableButton: boolean = false;
  private unsubscribe = new Subject<void>();
  propertyDetail: any = [];
  public loading = false;
  constructor(
    private searchService: SearchServiceService,
    private router: Router
  ) {}
  ngOnDestroy(): void {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  ngOnInit(): void {}

  selectEvent(event: any) {
    console.log('select event', event);
  }
  onChangeSearch(event: any) {
    console.log('on change search', event);
  }

  onFocused(event: any) {
    console.log('on focus', event);
  }
  myFunction() {}
  // searchFunction() {
  //   console.log("search query", this.searchQuery)
  //   this.loading = true;
  //   if (this.searchQuery) {
  //     this.propertyDetail = [];
  //     this.disableButton = true;
  //     let search = {
  //       "query": this.searchQuery
  //     }
  //     this.searchService.seachProperty(search).pipe(takeUntil(this.unsubscribe)).subscribe(
  //       (response: any) => {
  //         let searchData = []
  //         if (response && response.data && response.data.length) {
  //           console.log(response.data);
  //           searchData = response.data
  //           this.searchService.searchedPropertyList.next(searchData);
  //           localStorage.setItem("list", JSON.stringify(searchData))
  //           this.router.navigate(['search/property-list'])
  //           // response.data.forEach((plist: any, i: any) => {
  //           //   let propertyId = {
  //           //     propertyId: plist.propertyId
  //           //   }
  //           //   this.loading = true;
  //           //   this.searchService.getPropertyDetail(propertyId).pipe(takeUntil(this.unsubscribe)).subscribe(
  //           //     (response: any) => {

  //           //       if (response && response.Data) {
  //           //         console.log(response.Data);
  //           //         this.propertyDetail.push(response.Data.Property[0]);
  //           //         if (searchData.length == i + 1) {
  //           //           console.log("propertyList", this.propertyDetail)
  //           //           this.searchService.searchedPropertyList.next(this.propertyDetail);
  //           //           localStorage.setItem("list", JSON.stringify(this.propertyDetail))
  //           //           this.router.navigate(['search/property-list'])
  //           //           this.disableButton = false
  //           //           this.loading=false;
  //           //         }
  //           //       } else {
  //           //         this.loading = false
  //           //       }
  //           //     }, (error: any) => {
  //           //       this.loading = false;
  //           //     }
  //           //   )
  //           // }, (error: any) => {
  //           //   this.loading = false
  //           // });
  //         }
  //         this.loading = false;
  //       }, error => {
  //         this.disableButton = false;
  //       }
  //     )
  //   }
  // }

  keyPress(event: any) {
    if (this.searchQuery && event.keyCode == 13) {
      this.loading = true;
      this.propertyDetail = [];
      this.disableButton = true;
      let search = {
        query: this.searchQuery,
      };
      this.searchService
        .searchPropertyFormated(search)
        .pipe(takeUntil(this.unsubscribe))
        .subscribe(
          (response: any) => {
            let searchData = [];
            if (response) {
              searchData = response;
              this.searchService.searchedPropertyList.next(searchData);
              localStorage.setItem('list', JSON.stringify(searchData));
              this.disableButton = false;
              this.router.navigate(['/propertyv1']);
            }
            this.loading = false;
          },
          (error: any) => {
            this.loading = false;
            this.disableButton = false;
          }
        );
    }
  }

  searchFunctionFormat() {
    this.loading = true;
    if (this.searchQuery) {
      this.propertyDetail = [];
      this.disableButton = true;
      let search = {
        query: this.searchQuery,
      };
      this.searchService
        .searchPropertyFormated(search)
        .pipe(takeUntil(this.unsubscribe))
        .subscribe(
          (response: any) => {
            let searchData = [];
            if (response) {
              searchData = response;
              this.searchService.searchedPropertyList.next(searchData);
              localStorage.setItem('list', JSON.stringify(searchData));
              this.disableButton = false;
              this.router.navigate(['/propertyv1']);
            }
            this.loading = false;
          },
          (error: any) => {
            this.loading = false;
            this.disableButton = false;
          }
        );
    }
  }
}
