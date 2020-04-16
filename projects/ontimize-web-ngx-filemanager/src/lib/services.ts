import { Injector, ComponentFactoryResolver, ApplicationRef } from '@angular/core';
import { FileManagerService } from './services/filemanager.service';
import { FileManagerStateService } from './services/filemanager-state.service';
import { DomService } from './services/dom.service';

export * from './services/filemanager.service';
export * from './services/filemanager-state.service';
export * from './services/dom.service';

export function getFileManagerServiceProvider(injector: Injector) {
  return new FileManagerService(injector);
}

export function getFileManagerStateServiceProvider(injector) {
  return new FileManagerStateService(injector);
}

export function getDomServiceProvider(componentFactoryResolver: ComponentFactoryResolver, appRef: ApplicationRef, injector: Injector) {
  return new DomService(componentFactoryResolver, appRef, injector);
}

export const OFILEMANAGER_PROVIDERS: any = [{
  provide: 'FileManagerService',
  useFactory: getFileManagerServiceProvider,
  deps: [Injector]
}, {
  provide: FileManagerStateService,
  useFactory: getFileManagerStateServiceProvider,
  deps: [Injector]
}, {
  provide: DomService,
  useFactory: getDomServiceProvider,
  deps: [ComponentFactoryResolver, ApplicationRef, Injector]
}];
