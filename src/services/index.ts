import { Injector, ComponentFactoryResolver, ApplicationRef } from '@angular/core';
import { FileManagerService } from './filemanager.service';
import { FileManagerStateService } from './filemanager-state.service';
import { DomService } from './dom.service';

export * from './filemanager.service';
export * from './filemanager-state.service';
export * from './dom.service';

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
