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
    let sbtn: any = document.getElementById('search-button');
    if (!container.contains(e)) {
      container?.classList.remove('input-search');
      sbtn?.classList.remove('btn-display')
    } else {
      if (this.searchQuery) {
        container?.classList.add('input-search')
      }
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
      this.getPropertyList(search);
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
      this.getPropertyList(search);

    }
  }

  //get property list
  getPropertyList(search: any) {
    this.loading = true;
    //spell check
    this.searchService.spellCheck(search).pipe(takeUntil(this.unsubscribe)).subscribe(
      (response: any) => {
        if (response && response.response) {
          if (response.response.originalQuery != response.response.formattedString) {
            this.searchService.searchQuerySpell.next(response.response.formattedString);
            localStorage.setItem('searchQuery', JSON.stringify(response.response.formattedString))
          } else {
            this.searchService.searchQuerySpell.next('');
            localStorage.setItem('searchQuery', JSON.stringify(''))
          }
          this.searchService.searchQuery.next(this.searchQuery);
          this.searchService.fixedQuery.next(response.response.fixedQuery)
          localStorage.setItem("query", JSON.stringify(this.searchQuery))
          localStorage.setItem("fixedQuery", JSON.stringify(response.response.fixedQuery))
          let searchObj = {
            query: this.searchQuery
          }
          //get property IDs
          this.searchService.searchPropertyFormated(searchObj).pipe(takeUntil(this.unsubscribe)).subscribe(
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
        } else {
          this.loading = false;
        }
      },
      error => {
        this.loading = false;
      }
    )
  }

  //suggestion list
  onChangeSearch(event: any) {
    if (event) {
      let searchObj = {
        query: event
      }
      //suggestion list api call
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
      this.getPropertyList(search);
    }
  }


  //for spellCheck
  spellCheck(value: any) {
    if (value) {
      this.loading = true;
      this.searchService.spellCheck(value).pipe(takeUntil(this.unsubscribe)).subscribe(
        (response: any) => {
          if (response && response.response) {
            if (response.response.originalQuery != response.response.formattedString) {
              this.searchService.searchQuerySpell.next(response.response.formattedString);
              localStorage.setItem('searchQuery', JSON.stringify(response.response.formattedString))
            } else {
              this.searchService.searchQuerySpell.next('');
              localStorage.setItem('searchQuery', JSON.stringify(''))
            }
            this.searchService.searchQuery.next(this.searchQuery);
            localStorage.setItem("query", JSON.stringify(this.searchQuery))
          }
          this.loading = false;
        },
        error => {
          this.loading = false;
        }
      )
    }
  }
}
