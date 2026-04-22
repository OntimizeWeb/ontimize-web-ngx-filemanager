import { AfterViewInit, Component, ElementRef, inject, ViewChild } from '@angular/core';
import { UntypedFormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { OSharedModule } from 'ontimize-web-ngx';

import { FileClass } from '../../../../../util/file.class';
import { fileNameValidator } from '../../../../../util/filename.validator';
import { OFileManagerTranslatePipe } from '../../../../../util/o-filemanager-translate.pipe';

export class ChangeNameDialogData {
  title: string;
  placeholder: string;
  defaultValue?: string;
  fileData?: FileClass;
}

@Component({
  selector: 'change-name-dialog',
  templateUrl: 'change-name-dialog.component.html',
  styleUrls: ['change-name-dialog.component.scss'],
  standalone: true,
  imports: [MatButtonModule, MatDialogModule, MatFormFieldModule, MatInputModule, OFileManagerTranslatePipe, OSharedModule, ReactiveFormsModule],
  host: {
    '[class.change-name-dialog]': 'true'
  }
})
export class ChangeNameDialogComponent implements AfterViewInit {

  public filename: string;
  public filenameFormControl = new UntypedFormControl('', [
    Validators.required,
    fileNameValidator
  ]);

  @ViewChild('inputRef') inputRef: ElementRef;
  protected data: ChangeNameDialogData = inject(MAT_DIALOG_DATA);
  protected translatePipe: OFileManagerTranslatePipe = inject(OFileManagerTranslatePipe);
  public title: string;
  public placeholder: string;

  constructor(public dialogRef: MatDialogRef<ChangeNameDialogData>) {
    this.initialize();
  }

  initialize() {
    this.filename = this.data.defaultValue || this.translatePipe.transform('name');
    this.title = this.translatePipe.transform(this.data.title);
    this.placeholder = this.translatePipe.transform(this.data.placeholder);
  }

  ngAfterViewInit() {
    let lastIndex: number = this.inputRef.nativeElement.value.lastIndexOf('.');
    if (this.data.fileData && this.data.fileData.directory) {
      lastIndex = this.inputRef.nativeElement.value.length;
    }
    this.inputRef.nativeElement.setSelectionRange(0, lastIndex);
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
