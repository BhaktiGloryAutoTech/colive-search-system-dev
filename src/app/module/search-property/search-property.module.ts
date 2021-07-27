import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SearchPropertyRoutingModule } from './search-property-routing.module';
import { SearchComponent } from './search/search.component';
import { PropertyListComponent } from './property-list/property-list.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { SearchOption2Component } from './search-option2/search-option2.component';
import { PropertyListOption2Component } from './property-list-option2/property-list-option2.component';


@NgModule({
  declarations: [
    SearchComponent,
    PropertyListComponent,
    SearchOption2Component,
    PropertyListOption2Component
  ],
  imports: [
    CommonModule,
    SearchPropertyRoutingModule,
    SharedModule,

  ]
})
export class SearchPropertyModule { }
