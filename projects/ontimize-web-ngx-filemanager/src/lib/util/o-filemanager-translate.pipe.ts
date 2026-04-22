import { inject, ModuleWithProviders, NgModule, Pipe, PipeTransform } from '@angular/core';
import { OTranslateService } from 'ontimize-web-ngx';
import * as CORE_TRANSLATIONS from '../i18n/i18n';

@Pipe({
  name: 'oFileManagerTranslate',
  pure: false,
  standalone: true
})
export class OFileManagerTranslatePipe implements PipeTransform {

  protected translateService: OTranslateService = inject(OTranslateService);

  transform(text: string): string {
    let textTranslated = undefined;
    let bundle = CORE_TRANSLATIONS.MAP[this.translateService.getCurrentLang()];
    if (bundle && bundle[text]) {
      textTranslated = bundle[text];
    } else {
      textTranslated = this.translateService.get(text);
    }
    return textTranslated;
  }

}

@NgModule({
  imports: [OFileManagerTranslatePipe],
  exports: [OFileManagerTranslatePipe]
})
export class OFileManagerTranslateModule {
  static forRoot(): ModuleWithProviders<OFileManagerTranslateModule> {
    return {
      ngModule: OFileManagerTranslateModule,
      providers: []
    };
  }
}
