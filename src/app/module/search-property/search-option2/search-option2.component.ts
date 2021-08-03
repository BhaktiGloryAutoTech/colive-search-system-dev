import { Component, OnInit, OnDestroy, HostListener, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { SearchServiceService } from '@services/search-service.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-search-option2',
  templateUrl: './search-option2.component.html',
  styleUrls: ['./search-option2.component.scss']
})
export class SearchOption2Component implements OnInit {
  searchQuery: any = '';
  disableButton: boolean = false;
  private unsubscribe = new Subject<void>();
  propertyDetail: any = [];
  public loading = false;
  suggestionList: any = [];
  hideButtonFlag: boolean = false;

  constructor(private searchService: SearchServiceService,
    private router: Router, private cdr: ChangeDetectorRef) { }
  ngOnDestroy(): void {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  ngOnInit(): void {
  }



  myFunction() {

  }

  @HostListener('click', ['$event.target'])
  onClick(e: any) {
    //for settings...
    let container: any = document.getElementById('auoComplete');
    // let itemList: any = document.getElementById('item-list');
    let sbtn: any = document.getElementById('search-button');
    // let notFound: any = document.getElementById('not-found');
    // var img = document.getElementById('auoComplete');
    if (!container.contains(e)) {
      container?.classList.remove('input-search');
      sbtn?.classList.remove('btn-display')
    } else {
      if (this.searchQuery) {
        container?.classList.add('input-search')
      }
    }
  }

  searchFunction() {
    this.loading = true;
    if (this.searchQuery) {
      this.propertyDetail = [];
      this.disableButton = true;
      let search = {
        "query": this.searchQuery
      }
      this.searchService.seachProperty(search).pipe(takeUntil(this.unsubscribe)).subscribe(
        (response: any) => {
          let searchData = []
          if (response && response.data && response.data.length) {
            searchData = response.data
            this.searchService.searchedPropertyList.next(searchData);
            localStorage.setItem("list", JSON.stringify(searchData))
            this.router.navigate(['/propertyv2'])
            // response.data.forEach((plist: any, i: any) => {
            //   let propertyId = {
            //     propertyId: plist.propertyId
            //   }
            //   this.loading = true;
            //   this.searchService.getPropertyDetail(propertyId).pipe(takeUntil(this.unsubscribe)).subscribe(
            //     (response: any) => {

            //       if (response && response.Data) {
            //         console.log(response.Data);
            //         this.propertyDetail.push(response.Data.Property[0]);
            //         if (searchData.length == i + 1) {
            //           console.log("propertyList", this.propertyDetail)
            //           this.searchService.searchedPropertyList.next(this.propertyDetail);
            //           localStorage.setItem("list", JSON.stringify(this.propertyDetail))
            //           this.router.navigate(['search/property-list'])
            //           this.disableButton = false
            //           this.loading=false;
            //         }
            //       } else {
            //         this.loading = false
            //       }
            //     }, (error: any) => {
            //       this.loading = false;
            //     }
            //   )
            // }, (error: any) => {
            //   this.loading = false
            // });
          }
          this.loading = false;
        }, (error: any) => {
          this.disableButton = false;
        }
      )
    }
  }

  selectEvent(event: any) {
    if (event) {
      let ele = document.getElementById('auoComplete');
      ele?.classList.remove('input-search')
      this.loading = true;
      this.propertyDetail = [];
      this.disableButton = true;
      let search = {
        "query": event.name
      }
      this.searchService.searchPropertyFormated(search).pipe(takeUntil(this.unsubscribe)).subscribe(
        (response: any) => {
          let searchData = []
          if (response) {
            searchData = response
            this.searchService.searchedPropertyList.next(searchData);
            localStorage.setItem("list", JSON.stringify(searchData))
            this.disableButton = false;
            this.router.navigate(['/propertyv2'])
          }
          this.loading = false;
        }, (error: any) => {
          this.loading = false;
          this.disableButton = false;
        }
      )
    }
  }
  keyPress(event: any) {
    if (this.searchQuery && event.keyCode == 13) {
      let ele = document.getElementById('auoComplete');
      ele?.classList.remove('input-search')
      this.loading = true;
      this.propertyDetail = [];
      this.disableButton = true;
      let search = {
        "query": this.searchQuery.name ? this.searchQuery.name : this.searchQuery
      }
      this.searchService.searchPropertyFormated(search).pipe(takeUntil(this.unsubscribe)).subscribe(
        (response: any) => {
          let searchData = []
          if (response) {
            searchData = response
            this.searchService.searchedPropertyList.next(searchData);
            localStorage.setItem("list", JSON.stringify(searchData))
            this.disableButton = false;
            this.router.navigate(['/propertyv2'])
          }
          this.loading = false;
        }, (error: any) => {
          this.loading = false;
          this.disableButton = false;
        }
      )
    }
  }

  onChangeSearch(event: any) {
    if (event) {


      let searchObj = {
        query: event
      }
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
          setTimeout(() => {
            let itemList: any = document.getElementById('item-list');
            let sbtn: any = document.getElementById('search-button');
            let notFound: any = document.getElementById('not-found');
            if (itemList) {
              sbtn?.classList.add('btn-display')
            } else if (notFound) {
              sbtn?.classList.remove('btn-display')
            } else {
              sbtn?.classList.add('btn-display')
            }
          }, 10)
          this.cdr.detectChanges();
        }
      )
    }

  }

  searchFunctionFormat() {
    this.loading = true;
    if (this.searchQuery) {
      let ele = document.getElementById('auoComplete');
      ele?.classList.remove('input-search')
      this.propertyDetail = [];
      this.disableButton = true;
      let search = {
        "query": this.searchQuery
      }
      this.searchService.searchPropertyFormated(search).pipe(takeUntil(this.unsubscribe)).subscribe(
        (response: any) => {
          let searchData = []
          if (response) {
            searchData = response
            this.searchService.searchedPropertyList.next(searchData);
            localStorage.setItem("list", JSON.stringify(searchData))
            this.disableButton = false;
            this.router.navigate(['/propertyv2'])
          }
          this.loading = false;
        }, (error: any) => {
          this.loading = false;
          this.disableButton = false;
        }
      )
    }
  }
}
