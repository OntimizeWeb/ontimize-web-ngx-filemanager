import { NgModule } from '@angular/core';

import { OFILEMANAGER_MODULES } from './components';
import { OFILEMANAGER_PROVIDERS } from './services';

/**
 * Exports
 */
export * from './components';
export * from './util';
export * from './services';

@NgModule({
  imports: OFILEMANAGER_MODULES,
  exports: OFILEMANAGER_MODULES,
  providers: OFILEMANAGER_PROVIDERS
})

export class OFileManagerModule { }