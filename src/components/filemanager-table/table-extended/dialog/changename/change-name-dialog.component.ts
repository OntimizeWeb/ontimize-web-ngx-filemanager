import { AfterViewInit, Component, ElementRef, Injector, ViewChild } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MdDialogRef, MD_DIALOG_DATA } from '@angular/material';

import { OFileManagerTranslatePipe } from '../../../../../core/o-filemanager-translate.pipe';
import { FileClass } from '../../../../../core';

export class ChangeNameDialogData {
  title: string;
  placeholder: string;
  defaultValue?: string;
  fileData?: FileClass;
}

export const FILENAME_REGEXP = /^[0-9a-zA-Z\^\&\'\@\{\}\[\]\,\$\=\!\-\#\(\)\.\%\+\~\_ ]*$/;

export function fileNameValidator(control: FormControl) {
  if ((void 0 !== control.value) && FILENAME_REGEXP.test(control.value)) {
    return {};
  }
  return { 'invalidFileName': true };
}

@Component({
  selector: 'change-name-dialog',
  templateUrl: 'change-name-dialog.component.html',
  styleUrls: ['change-name-dialog.component.scss'],
  host: {
    '[class.change-name-dialog]': 'true'
  }
})
export class ChangeNameDialogComponent implements AfterViewInit {

  public filename: string;
  public filenameFormControl = new FormControl('', [
    Validators.required,
    fileNameValidator
  ]);

  @ViewChild('inputRef') inputRef: ElementRef;
  protected data: ChangeNameDialogData;
  protected translatePipe: OFileManagerTranslatePipe;

  constructor(
    protected injector: Injector,
    public dialogRef: MdDialogRef<ChangeNameDialogData>
  ) {
    this.translatePipe = new OFileManagerTranslatePipe(this.injector);
    this.data = this.injector.get(MD_DIALOG_DATA);
    this.filename = this.defaultValue;
  }

  ngAfterViewInit() {
    let lastIndex: number = this.inputRef.nativeElement.value.lastIndexOf('.');
    if (this.data.fileData && this.data.fileData.directory) {
      lastIndex = this.inputRef.nativeElement.value.length;
    }
    this.inputRef.nativeElement.setSelectionRange(0, lastIndex);
  }

  get title(): string {
    return this.translatePipe.transform(this.data.title);
  }

  get placeholder(): string {
    return this.translatePipe.transform(this.data.placeholder);
  }

  get defaultValue(): string {
    return this.data.defaultValue;
  }

  onKeyDown(e: Event): void {
    if (e['keyCode'] === 13) {
      this.submit();
    }
  }

  submit(): void {
    if (!this.filenameFormControl.invalid) {
      this.dialogRef.close(this.inputRef.nativeElement.value);
    }
  }

}
