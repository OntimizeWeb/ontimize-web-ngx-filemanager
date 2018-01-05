import { Injector } from '@angular/core';
import { MdIconRegistry } from '@angular/material';
import { FileManagerService } from './filemanager.service';

export * from './filemanager.service';

export function getFileManagerServiceProvider(injector: Injector) {
  return new FileManagerService(injector);
}

export const OFILEMANAGER_PROVIDERS: any = [
  MdIconRegistry,
  {
    provide: FileManagerService,
    useFactory: getFileManagerServiceProvider,
    deps: [Injector]
  }
];
