import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
// import * as loader from './json/loader.json';
// import * as loader from './json/loader.json'
import { PagenotfoundComponent } from '@common-components/pagenotfound/pagenotfound.component';
import { AutocompleteLibModule } from 'angular-ng-autocomplete';
import { HttpClientModule } from '@angular/common/http';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgCircleProgressModule } from 'ng-circle-progress';
import { NgxLoadingModule } from 'ngx-loading';
import { BoldPipe } from './pipes/bold.pipe';
import { NgxUiLoaderModule } from 'ngx-ui-loader';
// let loader: any = require('./json/loader.json');

// const PIPES = [];
// const COMPONENTS = [];
const FORMS = [
  ReactiveFormsModule,
  FormsModule,
];

@NgModule({
  declarations: [PagenotfoundComponent, BoldPipe],
  imports: [
    CommonModule,
    NgxUiLoaderModule,
    ...FORMS,
    AutocompleteLibModule,
    HttpClientModule,
    NgSelectModule,
    NgbModule,
    NgCircleProgressModule.forRoot({
      radius:10
    }),
    NgxLoadingModule.forRoot({}),
  ],
  exports: [
    CommonModule,
    NgxUiLoaderModule,
    AutocompleteLibModule,
    HttpClientModule,
    NgSelectModule,
    NgbModule,
    NgCircleProgressModule,
    NgxLoadingModule,
    BoldPipe,
    // ...PIPES,
    // ...COMPONENTS,
    ...FORMS,
  ],
})

export class SharedModule { }
