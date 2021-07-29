import { SearchOption2Component } from './search-option2/search-option2.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PropertyListComponent } from './property-list/property-list.component';
import { SearchComponent } from './search/search.component';
import { PropertyListOption2Component } from './property-list-option2/property-list-option2.component';

const routes: Routes = [
  { path: "", redirectTo: "searchv1", pathMatch: "full" },
  { path: 'searchv1', component: SearchComponent },
  { path: 'propertyv1', component: PropertyListComponent },
  { path: 'searchv2', component: SearchOption2Component },
  { path: 'propertyv2', component: PropertyListOption2Component }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SearchPropertyRoutingModule { }
