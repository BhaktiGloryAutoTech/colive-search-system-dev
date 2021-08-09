import { Component, OnInit, OnDestroy, HostListener, ChangeDetectorRef, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { SearchServiceService } from '@services/search-service.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

declare const annyang: any;
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

  voiceActiveSectionDisabled: boolean = true;
  voiceActiveSectionError: boolean = false;
  voiceActiveSectionSuccess: boolean = false;
  voiceActiveSectionListening: boolean = false;
  voiceText: any;

  constructor(private searchService: SearchServiceService,
    private router: Router, private cdr: ChangeDetectorRef,
    private ngZone: NgZone) { }
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
    if (this.voiceText) {
      this.searchQuery = this.voiceText
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
      this.spellCheck(search);
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
    if (event) {
      let searchObj = {
        query: event
      }
      let container: any = document.getElementById('auoComplete');
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
          (this.suggestionList && this.suggestionList.length) ? container?.classList.add('input-search') : container?.classList.remove('input-search');
          setTimeout(() => {
            let itemList: any = document.getElementById('item-list');
            let sbtn: any = document.getElementById('search-button');
            let notFound: any = document.getElementById('not-found');
            if (itemList) {
              sbtn?.classList.add('btn-display')
            } else if (!this.suggestionList || !this.suggestionList.length) {
              sbtn?.classList.remove('btn-display')
            } else {
              sbtn?.classList.add('btn-display')
            }
          }, 10)
          this.cdr.detectChanges();
        }, error => {
          (this.suggestionList && this.suggestionList.length) ? container?.classList.add('input-search') : container?.classList.remove('input-search');
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
      this.spellCheck(search);

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
            this.searchService.fixedQuery.next(response.response.fixedQuery)
            localStorage.setItem("query", JSON.stringify(this.searchQuery))
            localStorage.setItem("fixedQuery", JSON.stringify(response.response.fixedQuery))
            this.getPropertyList(value);
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
  initializeVoiceRecognitionCallback(): void {
    annyang.addCallback('error', (err: any) => {
      if (err.error === 'network') {
        this.voiceText = "Internet is require";
        annyang.abort();
        this.ngZone.run(() => this.voiceActiveSectionSuccess = true);
      } else if (this.voiceText === undefined) {
        this.ngZone.run(() => this.voiceActiveSectionError = true);
        annyang.abort();
      }
    });

    annyang.addCallback('soundstart', (res: any) => {
      this.ngZone.run(() => this.voiceActiveSectionListening = true);
    });

    annyang.addCallback('end', () => {
      if (this.voiceText === undefined) {
        this.ngZone.run(() => this.voiceActiveSectionError = true);
        annyang.abort();
      }
    });

    annyang.addCallback('result', (userSaid: any) => {
      this.ngZone.run(() => this.voiceActiveSectionError = false);

      let queryText: any = userSaid[0];

      annyang.abort();

      this.voiceText = queryText;
      console.log(this.voiceText)
      this.searchQuery = queryText;
      this.cdr.detectChanges();
      this.ngZone.run(() => this.voiceActiveSectionListening = false);
      this.ngZone.run(() => this.voiceActiveSectionSuccess = true);
    });
  }

  startVoiceRecognition(): void {
    this.voiceActiveSectionDisabled = false;
    this.voiceActiveSectionError = false;
    this.voiceActiveSectionSuccess = false;
    this.voiceText = undefined;

    if (annyang) {
      let commands = {
        'demo-annyang': () => { }
      };

      annyang.addCommands(commands);

      this.initializeVoiceRecognitionCallback();

      annyang.start({ autoRestart: false });
    }
  }

  closeVoiceRecognition(): void {

    this.initializeVoiceRecognitionCallback();
    this.voiceActiveSectionDisabled = true;
    this.voiceActiveSectionError = false;
    this.voiceActiveSectionSuccess = false;
    this.voiceActiveSectionListening = false;
    this.searchQuery = this.voiceText;
    this.cdr.detectChanges();

    // annyang.addCallback('result', (userSaid: any) => {
    //   this.ngZone.run(() => this.voiceActiveSectionError = false);

    //   let queryText: any = userSaid[0];
    //   this.searchQuery=queryText;
    //   annyang.abort();

    //   this.voiceText = queryText;

    //   console.log(this.voiceText)
    //   this.ngZone.run(() => this.voiceActiveSectionListening = false);
    //   this.ngZone.run(() => this.voiceActiveSectionSuccess = true);
    // });
    // this.voiceText = undefined;

    // if(annyang){
    //   annyang.abort();
    // }
  }
}
