import { HttpResponse } from '@angular/common/http';
import {
  Component,
  OnInit,
  OnDestroy,
  HostListener,
  ChangeDetectorRef,
  NgZone,
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute} from '@angular/router';
import { SearchServiceService } from '@services/search-service.service';
import { DeviceDetectorService } from 'ngx-device-detector';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import {  Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
export interface IWindow extends Window {
  webkitSpeechRecognition: any;
}
@Component({
  selector: 'app-search-option2',
  templateUrl: './search-option2.component.html',
  styleUrls: ['./search-option2.component.scss'],
})
export class SearchOption2Component implements OnInit {
  searchQuery: any = '';
  private unsubscribe = new Subject<void>();
  propertyDetail: any = [];
  public loading = false;
  suggestionList: any = [];
  hideButtonFlag: boolean = false;

  //for speech
  recognition: any;
  showMic = false;

  domain: string = '';

  //query parameters
  isMobile = false;
  isRecommendation = false;
  searchButtonValue = 'Colive Search';
  recommendationURL = 'https://www.colive.com/Trending-Categories/Most-Popular';

  qPropertyId:any=''

  //device and os info
  deviceInfo: any = null;
  constructor(
    private searchService: SearchServiceService,
    private cdr: ChangeDetectorRef,
    private ngxService: NgxUiLoaderService,
    private ngZone: NgZone,
    private activatedRoute: ActivatedRoute,
    private deviceService: DeviceDetectorService,
  ) {

    this.deviceInfo = this.deviceService.getDeviceInfo();
    const isDesktopDevice = this.deviceService.isDesktop();
    const isMobile = this.deviceService.isMobile();
    console.log(this.deviceInfo)
    console.log(isDesktopDevice || isMobile); // returns if the app is running on a Desktop or mobile browser.
    if (isDesktopDevice) {
      if (this.deviceInfo.browser == "Chrome") {
        const { webkitSpeechRecognition }: IWindow = <IWindow>(<any>window);
        this.recognition = new webkitSpeechRecognition();
        this.showMic = true;
      }else{
        this.showMic = false;
      }
    }else{
      this.showMic = false;
    }


    // to show mic in android
    // if (!this.iOS()) {
    //   this.showMic = true;
    // } else {
    //   this.showMic = false;
    // }



    this.activatedRoute.queryParams.subscribe((res: any) => {
      console.log('Query params :-', res);
      if (res?.redirectHost) {
        this.domain = res?.redirectHost.replace(/^"|"$/g, '');
        console.log('Domain : -', this.domain);
      }

      if (res?.isMobile) {
        String(res?.isMobile).toString() == '1' ? this.isMobile = true : this.isMobile = false;
      }
      if (res?.isRecommendation) {
        String(res.isRecommendation).toString() == '1' ? this.isRecommendation = true : this.isRecommendation = false;
      }
      if (res?.buttonText) {
        this.searchButtonValue = res?.buttonText
      }
      if (res?.recommendationUrl) {
        this.recommendationURL = res?.recommendationUrl
      }

    });
  }
  iOS() {
    return (
      [
        'iPad Simulator',
        'iPhone Simulator',
        'iPod Simulator',
        'iPad',
        'iPhone',
        'iPod',
      ].includes(navigator.platform) ||
      // iPad on iOS 13 detection
      (navigator.userAgent.includes('Mac') && 'ontouchend' in document)
    );
  }

  ngOnDestroy(): void {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  ngOnInit(): void {
  }

  myFunction() { }

  @HostListener('click', ['$event.target'])
  onClick(e: any) {
    //for settings...
    let container: any = document.getElementById('auoComplete');
    let sbtn: any = document.getElementById('search-button');
    if (!container.contains(e)) {
      container?.classList.remove('input-search');
      container?.classList.remove('suggest-border');
      sbtn?.classList.remove('btn-display');
    } else {
      if (
        (this.searchQuery && this.suggestionList.length) ||
        (this.suggestionList && this.suggestionList.length)
      ) {
        container?.classList.add('input-search');
        container?.classList.add('suggest-border');
        sbtn?.classList.add('btn-display');
      } else {
        container?.classList.remove('input-search');
        container?.classList.remove('suggest-border');
        sbtn?.classList.remove('btn-display');
      }
    }
  }

  selectEvent(event: any) {
    if (event) {
      let ele = document.getElementById('auoComplete');
      let sbtn: any = document.getElementById('search-button');
      ele?.classList.remove('input-search');
      ele?.classList.remove('suggest-border');
      sbtn?.classList.remove('btn-display');
      this.ngxService.start();
      this.propertyDetail = [];
      this.suggestionList = [];
      let search = {
        query: event.name, //event.query,
      };
      if (event.type == 'property') {
        this.qPropertyId=event.propertyId;
        this.spellCheck(search, 'property');
      } else {
        this.spellCheck(search);
      }
    }
  }
  keyPress(event: any) {
    if (this.searchQuery && event.keyCode == 13) {
      let ele = document.getElementById('auoComplete');
      let sbtn: any = document.getElementById('search-button');
      ele?.classList.remove('input-search');
      ele?.classList.remove('suggest-border');
      sbtn?.classList.remove('btn-display');
      this.ngxService.start();
      this.propertyDetail = [];
      this.suggestionList = [];
      let search = {
        query: this.searchQuery.name ? this.searchQuery.name : this.searchQuery,
      };
      this.spellCheck(search);
    }
  }

  onClearSearchQuery() {
    this.suggestionList = [];
    let container: any = document.getElementById('auoComplete');
    let sbtn: any = document.getElementById('search-button');
    container?.classList.remove('input-search');
    container?.classList.remove('suggest-border');
    sbtn?.classList.remove('btn-display');
  }

  filterTextChanged: Subject<string> = new Subject<string>();

  onFilterTextChanged(filterText: string) {
    if (this.filterTextChanged.observers.length === 0) {
      this.filterTextChanged
        .pipe(debounceTime(500), takeUntil(this.unsubscribe))
        .subscribe((filterQuery) => {
          this.onChangeSearch(filterQuery);
        });
    }
    this.filterTextChanged.next(filterText);
  }

  //suggestion list
  onChangeSearch(event: any) {
    let container: any = document.getElementById('auoComplete');
    let sbtn: any = document.getElementById('search-button');
    if (event) {
      let searchObj = {
        query: event,
      };
      //suggestion list api call

      console.log(searchObj);
      this.searchService
        .searchSuggestion(searchObj)
        .pipe()
        .subscribe(
          (response: any) => {
            this.suggestionList = [];
            if (
              response &&
              response.response &&
              response.response.propertyLocation
            ) {
              response.response.propertyLocation.forEach((element: any) => {
                this.suggestionList.push({
                  name: element.displayValue,
                  type: 'location',
                  query: element.value,
                });
              });
            }
            if (
              response &&
              response.response &&
              response.response.propertiesName
            ) {
              response.response.propertiesName.forEach((element: any) => {
                this.suggestionList.push({
                  name: element.propertyName,
                  type: 'property',
                  query: element.propertyName,
                  propertyId:element.propertyID,
                  propertyName: element.propertyName,
                });
              });
            }
            if (
              response &&
              response.response &&
              response.response.autoComplete
            ) {
              response.response.autoComplete.forEach((element: any) => {
                this.suggestionList.push({
                  name: element,
                  type: 'auto',
                  query: element,
                });
              });
            }
            this.suggestionList && this.suggestionList.length
              ? container?.classList.add('input-search')
              : container?.classList.remove('input-search');
            setTimeout(() => {
              if (this.suggestionList && this.suggestionList.length) {
                container?.classList.add('input-search');
                sbtn?.classList.add('btn-display');
                container?.classList.add('suggest-border');
              } else if (!this.suggestionList || !this.suggestionList.length) {
                sbtn?.classList.remove('btn-display');
                container?.classList.remove('suggest-border');
              } else {
                sbtn?.classList.add('btn-display');
                container?.classList.add('suggest-border');
              }
            }, 1);

            console.log('suggestion list : -', this.suggestionList);
            this.cdr.detectChanges();
          },
          (error) => {
            this.suggestionList && this.suggestionList.length
              ? container?.classList.add('input-search')
              : container?.classList.remove('input-search');
          }
        );
    } else {
      if (this.suggestionList && this.suggestionList.length) {
        container?.classList.add('suggest-border');
      }
    }
  }

  searchFunctionFormat() {
    if (this.searchQuery && this.searchQuery!='' && this.searchQuery!=' ') {
      this.ngxService.start();
      let ele = document.getElementById('auoComplete');
      ele?.classList.remove('input-search');
      this.propertyDetail = [];
      let search = {
        query: this.searchQuery,
      };
      this.spellCheck(search);
    }
  }

  //for spellCheck
  spellCheck(value: any, property?: any) {
    if (value) {
      this.ngxService.start();
      if (!property) {
        let qparam= '?sQuery=';
        let host=this.domain
        let addedParam= host.concat(qparam)
        let final=addedParam.concat(value?.query ? value?.query : this.searchQuery.name)
        if(this.qPropertyId){
          let qPIdParam='&pId=';
          let qPropertyParam=qPIdParam.concat(this.qPropertyId);
          final=final.concat(qPropertyParam);
          this.qPropertyId=''
        }
        if (this.isMobile) {
          window.open(final,'_parent');
        } else {
          window.open(final, '_blank');
        }
      } else {
        let qparam= '?sQuery=';
        let host=this.domain
        let addedParam= host.concat(qparam)
        let final=addedParam.concat(value?.query ? value?.query : this.searchQuery.name)
        if(this.qPropertyId){
          let qPIdParam='&pId=';
          let qPropertyParam=qPIdParam.concat(this.qPropertyId);
          final=final.concat(qPropertyParam);
          this.qPropertyId=''
        }
        if (this.isMobile) {
          window.open(final,'_parent');
        } else {
          window.open(final, '_blank');
        }
      }
      this.ngxService.stop();
    }
  }

  recommendationRediret() {
    if (this.isMobile) {
      console.log("inside Mobile");
      window.open(this.recommendationURL, '_parent');
    } else {
      window.open(this.recommendationURL, '_blank');
    }
  }

  // //for speech to text
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
              query: this.searchQuery,
            };
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
