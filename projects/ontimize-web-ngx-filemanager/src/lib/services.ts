import { ApplicationRef, ComponentFactoryResolver, Injector } from '@angular/core';

import { DomService } from './services/dom.service';
import { FileManagerOntimizeService } from './services/filemanager-ontimize.service';
import { FileManagerS3Service } from './services/filemanager-s3.service';
import { FileManagerStateService } from './services/filemanager-state.service';

export * from './services/filemanager-ontimize.service';
export * from './services/filemanager-state.service';
export * from './services/dom.service';

export function getFileManagerStateServiceProvider(injector) {
  return new FileManagerStateService(injector);
}

export function getDomServiceProvider(componentFactoryResolver: ComponentFactoryResolver, appRef: ApplicationRef, injector: Injector) {
  return new DomService(componentFactoryResolver, appRef, injector);
}


export const OFILEMANAGER_PROVIDERS: any = [{
  provide: 'FileManagerOntimizeService',
  useValue: FileManagerOntimizeService
}, {
  provide: 'FileManagerS3Service',
  useValue: FileManagerS3Service
}, {
  provide: FileManagerStateService,
  useFactory: getFileManagerStateServiceProvider,
  deps: [Injector]
  }, {
    provide: DomService,
    useFactory: getDomServiceProvider,
    deps: [ComponentFactoryResolver, ApplicationRef, Injector]
  }
];
