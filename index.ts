import { NgModule } from '@angular/core';
import { OFILEMANAGER_MODULES } from './src/components';
import { OFILEMANAGER_PROVIDERS } from './src/services';

/**
 * Exports
 */
export * from './src/components';
export * from './src/core';
export * from './src/services';

@NgModule({
  imports: OFILEMANAGER_MODULES,
  exports: OFILEMANAGER_MODULES,
  providers: OFILEMANAGER_PROVIDERS
})
export class OFileManagerModule {
}
