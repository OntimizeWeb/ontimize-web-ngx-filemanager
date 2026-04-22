import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { OSharedModule } from 'ontimize-web-ngx';

import { FileClass } from '../../../../../util/file.class';
import { OFileManagerTranslatePipe } from '../../../../../util/o-filemanager-translate.pipe';

export class CopyDialogData {
  title: string;
  placeholder: string;
  defaultValue?: string;
  fileData?: FileClass;
}

@Component({
  selector: 'copy-dialog',
  templateUrl: 'copy-dialog.component.html',
  standalone: true,
  imports: [FormsModule, MatButtonModule, MatDialogModule, MatFormFieldModule, MatInputModule, OFileManagerTranslatePipe, OSharedModule],
  host: {
    '[class.copy-dialog]': 'true'
  }
})
export class CopyDialogComponent {

  @ViewChild('inputRef', { static: false }) inputRef: ElementRef;
  public foldername: string;
  public title: string;
  public placeholder: string;
  protected data: CopyDialogData = inject(MAT_DIALOG_DATA);
  protected translatePipe: OFileManagerTranslatePipe = inject(OFileManagerTranslatePipe);

  constructor(public dialogRef: MatDialogRef<CopyDialogComponent>) {
    this.initialize();
  }

  initialize() {
    this.foldername = this.data.defaultValue || this.translatePipe.transform('name');
    this.title = this.translatePipe.transform(this.data.title);
    this.placeholder = this.translatePipe.transform(this.data.placeholder);
  }


  onKeyDown(e: Event): void {
    if (e['keyCode'] === 13) {
      this.submit();
    }
  }

  submit(): void {
    this.dialogRef.close(this.inputRef.nativeElement.value);
  }

}
