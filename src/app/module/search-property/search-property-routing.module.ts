import { SearchOption2Component } from './search-option2/search-option2.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PropertyListComponent } from './property-list/property-list.component';
import { SearchComponent } from './search/search.component';
import { PropertyListOption2Component } from './property-list-option2/property-list-option2.component';

const routes: Routes = [
  { path: '', component: SearchComponent },
  { path: 'property-list', component: PropertyListComponent },
  { path: 'search', component: SearchOption2Component },
  { path: 'property', component: PropertyListOption2Component }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SearchPropertyRoutingModule { }
