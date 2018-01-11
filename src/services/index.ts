import { Injector } from '@angular/core';
import { FileManagerService } from './filemanager.service';
import { FileManagerStateService } from './filemanager-state.service';

export * from './filemanager.service';
export * from './filemanager-state.service';

export function getFileManagerServiceProvider(injector: Injector) {
  return new FileManagerService(injector);
}

export function getFileManagerStateServiceProvider(injector) {
  return new FileManagerStateService(injector);
}

export const OFILEMANAGER_PROVIDERS: any = [{
  provide: 'FileManagerService',
  useFactory: getFileManagerServiceProvider,
  deps: [Injector]
}, {
  provide: FileManagerStateService,
  useFactory: getFileManagerStateServiceProvider,
  deps: [Injector]
}];
