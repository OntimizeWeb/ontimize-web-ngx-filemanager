import { FormControl } from '@angular/forms';

export const FILENAME_REGEXP = /^[0-9a-zA-Z\u00C0-\u00FF\^\&\'\@\{\}\[\]\,\$\=\!\-\#\(\)\.\%\+\~\_ ]*$/;

export function fileNameValidator(control: FormControl) {
  if ((void 0 !== control.value) && FILENAME_REGEXP.test(control.value)) {
    return {};
  }
  return { 'invalidFileName': true };
}
