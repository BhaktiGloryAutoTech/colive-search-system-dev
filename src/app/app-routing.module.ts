import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PropertyListOption2Component } from './module/search-property/property-list-option2/property-list-option2.component';
import { SearchOption2Component } from './module/search-property/search-option2/search-option2.component';
import { SearchPropertyModule } from './module/search-property/search-property.module';

const routes: Routes = [
  // {
  //   path: '',
  //   loadChildren: () =>
  //     import('./module/search-property/search-property.module').then(
  //       (m) => m.SearchPropertyModule
  //     ),
  // },
  { path: '', component: SearchOption2Component },
  { path: 'search', component: SearchOption2Component },
  { path: 'smartsearch', component: PropertyListOption2Component },
  { path: '', redirectTo: '', pathMatch: 'full' },
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
