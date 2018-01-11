import { NgModule, Injector } from '@angular/core';
import { OntimizeWebModule } from 'ontimize-web-ngx';
import { OFileManagerModule } from 'ontimize-web-ngx-filemanager';

import { SharedModule } from '../../shared/shared.module';
import { FilemanagerRoutingModule, FILEMANAGER_MODULE_DECLARATIONS } from './filemanager-routing.module';

import { OFileManagerTableModule } from './testing/table/o-filemanager-table.component';
import { FileManagerStateService2 } from './testing/table/filemanager-state.service';
import { FileManagerService } from './testing/table/filemanager.service';

export function getFileManagerServiceProvider(injector) {
  return new FileManagerService(injector);
}

export function getFileManagerStateServiceProvider(injector) {
  return new FileManagerStateService2(injector);
}

export const customProviders: any = [
  { provide: 'FileManagerService2', useFactory: getFileManagerServiceProvider, deps: [Injector] },
  { provide: 'FileManagerStateService2', useFactory: getFileManagerStateServiceProvider, deps: [Injector] }
];


@NgModule({
  imports: [
    SharedModule,
    OntimizeWebModule,
    FilemanagerRoutingModule,
    OFileManagerModule,
    OFileManagerTableModule
  ],
  declarations: FILEMANAGER_MODULE_DECLARATIONS,
  providers: customProviders
})
export class FilemanagerModule { }
