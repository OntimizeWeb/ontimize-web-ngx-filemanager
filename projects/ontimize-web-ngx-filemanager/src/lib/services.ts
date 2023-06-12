import { Injector, ComponentFactoryResolver, ApplicationRef } from '@angular/core';
import { FileManagerStateService } from './services/filemanager-state.service';
import { DomService } from './services/dom.service';
import { WorkspaceService } from './services/workspace.service';
import { FileManagerS3Service } from './services/filemanager-s3.service';
import { FileManagerService } from './services/filemanager.service';

export * from './services/filemanager.service';
export * from './services/filemanager-state.service';
export * from './services/dom.service';

export function getFileManagerStateServiceProvider(injector) {
  return new FileManagerStateService(injector);
}

export function getDomServiceProvider(componentFactoryResolver: ComponentFactoryResolver, appRef: ApplicationRef, injector: Injector) {
  return new DomService(componentFactoryResolver, appRef, injector);
}

export function getWorkspaceServiceProvider() {
  return new WorkspaceService();
}

export const OFILEMANAGER_PROVIDERS: any = [{
  provide: 'FileManagerService',
  useValue: FileManagerService
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
}, {
  provide: WorkspaceService,
  useFactory: getWorkspaceServiceProvider,
  deps: []
}];
