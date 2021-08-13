import { Component, OnInit, OnDestroy, HostListener, ChangeDetectorRef, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { SearchServiceService } from '@services/search-service.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
export interface IWindow extends Window {
  webkitSpeechRecognition: any;
}
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

  //for speech
  recognition: any;

  constructor(private searchService: SearchServiceService,
    private router: Router, private cdr: ChangeDetectorRef,
    private ngZone: NgZone) {
    const { webkitSpeechRecognition }: IWindow = <IWindow><any>window;
    this.recognition = new webkitSpeechRecognition();
  }
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
      container?.classList.remove('suggest-border');
      sbtn?.classList.remove('btn-display')
    } else {
      if ((this.searchQuery && this.suggestionList.length) || (this.suggestionList && this.suggestionList.length)) {
        container?.classList.add('input-search');
        container?.classList.add('suggest-border');
        sbtn?.classList.add('btn-display');
      }else{
        container?.classList.remove('input-search');
        container?.classList.remove('suggest-border');
        sbtn?.classList.remove('btn-display');
      }
    }
  }

  selectEvent(event: any) {
    if (event) {
      let ele = document.getElementById('auoComplete');
      ele?.classList.remove('input-search');
      ele?.classList.remove('suggest-border');
      this.loading = true;
      this.propertyDetail = [];
      this.disableButton = true;
      let search = {
        "query": event.query
      }
      if (event.type == 'property') {
        this.spellCheck(search, 'property');
        localStorage.setItem('PropertyDetail', JSON.stringify(event));
        localStorage.removeItem('list')
      } else {
        this.spellCheck(search)
      };
      // this.getPropertyList(search);
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
      this.spellCheck(search);
      // this.getPropertyList(search);

    }
  }

  //get property list
  getPropertyList(search: any) {
    this.loading = true;
    //get property IDs
    this.searchService.searchPropertyFormated(search).pipe(takeUntil(this.unsubscribe)).subscribe(
      (response: any) => {
        let searchData = []
        if (response) {
          searchData = response
          this.searchService.searchedPropertyList.next(searchData);
          localStorage.setItem("list", JSON.stringify(searchData))
          localStorage.removeItem('PropertyDetail')
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

  //suggestion list
  onChangeSearch(event: any) {
    let container: any = document.getElementById('auoComplete');
    let sbtn: any = document.getElementById('search-button');
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
              this.suggestionList.push({ name: element.displayValue, type: 'location', query: element.value })
            });
          }
          if (response && response.response && response.response.propertiesName) {
            response.response.propertiesName.forEach((element: any) => {
              this.suggestionList.push({
                name: element.propertyName, type: 'property', query: element.propertyName, propertyName: element.propertyName,
                propertyLink: element.propertyLink, price: element.price, locationHighlights: element.locationHighlights,
                city: element.city, propertyRating: element.propertyRating, subLocation: element.subLocation,
                tileImageUrl: element.tileImageUrl, topAmenity: element.topAmenity
              })
            });
          }
          if(response && response.response && response.response.autoComplete){
            response.response.autoComplete.forEach((element: any) => {
              this.suggestionList.push({ name: element, type: 'auto', query: element })
            });
          }
          (this.suggestionList && this.suggestionList.length) ? container?.classList.add('input-search') : container?.classList.remove('input-search');
          setTimeout(() => {

            if (this.suggestionList && this.suggestionList.length) {
              container?.classList.add('input-search')
              sbtn?.classList.add('btn-display')
              container?.classList.add('suggest-border')
            } else if (!this.suggestionList || !this.suggestionList.length) {
              sbtn?.classList.remove('btn-display')
              container?.classList.remove('suggest-border')
            }
            else {
              sbtn?.classList.add('btn-display')
              container?.classList.add('suggest-border')
            }
          }, 1)
          this.cdr.detectChanges();
        }, error => {
          (this.suggestionList && this.suggestionList.length) ? container?.classList.add('input-search') : container?.classList.remove('input-search');
        }
      )
    } else {
      if (this.suggestionList && this.suggestionList.length) {
        container?.classList.add('suggest-border')
      }
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
      this.spellCheck(search);

    }
  }


  //for spellCheck
  spellCheck(value: any, property?: any) {
    if (value) {
      this.loading = true;
      this.searchService.spellCheck(value).pipe(takeUntil(this.unsubscribe)).subscribe(
        (response: any) => {
          if (response && response.response) {
            if (String(response.response.originalQuery).toLowerCase() != String(response.response.formattedString).toLowerCase()) {
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
            if (!property) {
              this.getPropertyList(value);
            } else {
              this.disableButton = false;
              this.router.navigate(['/propertyv2'])
            }
          } else {
            this.loading = false;
          }
        },
        error => {
          this.loading = false;
        }
      )
    }
  }


  //for speech to text
  startService() {
    let container: any = document.getElementById('auoComplete');
    window.SpeechRecognition = this.recognition || window['SpeechRecognition'];
    if ('SpeechRecognition' in window) {
      // speech recognition API supported

      // this.recognition = new window.SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.lang = 'en-US';
      this.recognition.interimResults = true;
      this.recognition.maxAlternatives = 3;

      this.recognition.start();
      this.recognition.onresult = (event: any) => {
        let isFinal = event.results[0].isFinal;
        if (!isFinal) {
          this.ngZone.run(() => {
            this.searchQuery = event.results[0][0].transcript;
            container?.classList.remove('input-search');
          });
        } else if (isFinal) {
          this.ngZone.run(() => {
            this.searchQuery = event.results[0][0].transcript;
            container?.classList.remove('input-search');
            this.recognition.stop();
            let search = {
              "query": this.searchQuery
            }
            this.spellCheck(search);
          });
        }
      };
    } else {
      // speech recognition API not supported
      console.log('speech recognition API not supported!!');
    }
  }

  startStopVoiceRecognition() {
    this.startService();
  }


}
