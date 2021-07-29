import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [

  { path: "", loadChildren: () => import("./module/search-property/search-property.module").then(m => m.SearchPropertyModule) },
  { path: "", redirectTo: "", pathMatch: "full" },
  { path: "**", redirectTo: "" },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
