import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FilemanagerHomeComponent } from './home/filemanager-home.component';
import { TestingComponent } from './testing/testing.component';


export const FILEMANAGER_MODULE_DECLARATIONS = [
  FilemanagerHomeComponent,
  TestingComponent
];

const routes: Routes = [
  { path: '', component: FilemanagerHomeComponent },
  { path: 'testing', component: TestingComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FilemanagerRoutingModule { }
