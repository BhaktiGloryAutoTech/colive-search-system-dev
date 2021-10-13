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
  }
  onChangeSearch(event: any) {
  }

  onFocused(event: any) {
  }
  myFunction() {}

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
              // localStorage.setItem('list', JSON.stringify(searchData));
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
              // localStorage.setItem('list', JSON.stringify(searchData));
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
