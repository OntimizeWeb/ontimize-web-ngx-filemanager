import { Component, ElementRef, Injector, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

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
  styleUrls: ['copy-dialog.component.scss'],
  host: {
    '[class.copy-dialog]': 'true'
  }
})
export class CopyDialogComponent {

  @ViewChild('inputRef', { static: false }) inputRef: ElementRef;
  public foldername: string;
  protected data: CopyDialogData;
  protected translatePipe: OFileManagerTranslatePipe;

  constructor(
    protected injector: Injector,
    public dialogRef: MatDialogRef<CopyDialogComponent>
  ) {
    this.translatePipe = new OFileManagerTranslatePipe(this.injector);
    this.data = this.injector.get(MAT_DIALOG_DATA);
    this.foldername = this.defaultValue;
  }

  get title(): string {
    return this.translatePipe.transform( this.data.title );
  }

  get folderName(): string {
    return this.translatePipe.transform('name');
  }

  get placeholder(): string {
    return this.translatePipe.transform( this.data.placeholder );
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
    this.dialogRef.close(this.inputRef.nativeElement.value);
  }

}
