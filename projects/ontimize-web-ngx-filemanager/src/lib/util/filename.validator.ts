import { UntypedFormControl } from '@angular/forms';

export const FILENAME_REGEXP = /^[0-9a-zA-Z\u00C0-\u00FF\^\&\'\@\{\}\[\]\,\$\=\!\-\#\(\)\.\%\+\~\_\¡\¿\º\ª\·\¬\;\€\`\´\¨ ]*$/;

export function fileNameValidator(control: UntypedFormControl) {
  if ((void 0 !== control.value) && FILENAME_REGEXP.test(control.value)) {
    return {};
  }
  return { 'invalidFileName': true };
}
