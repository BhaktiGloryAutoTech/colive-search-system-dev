import { SearchOption2Component } from './search-option2/search-option2.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PropertyListOption2Component } from './property-list-option2/property-list-option2.component';

const routes: Routes = [
  { path: '', redirectTo: 'search', pathMatch: 'full' },
  // { path: 'smartsearch', component: PropertyListOption2Component },
  { path: 'smartsearch', component: PropertyListOption2Component },
  { path: 'search', component: SearchOption2Component },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SearchPropertyRoutingModule {}
