import { Component, ElementRef, Injector, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material';

import { fileNameValidator, OFileManagerTranslatePipe } from '../../../../../util';

@Component({
  moduleId: module.id,
  selector: 'folder-name-dialog',
  templateUrl: 'folder-name-dialog.component.html',
  styleUrls: ['folder-name-dialog.component.scss'],
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class.folder-name-dialog]': 'true'
  }
})
export class FolderNameDialogComponent {

  public foldername: string;
  public foldernameFormControl = new FormControl('', [
    Validators.required,
    fileNameValidator
  ]);

  @ViewChild('folderNameRef') inputRef: ElementRef;

  protected translatePipe: OFileManagerTranslatePipe;

  constructor(
    protected injector: Injector,
    public dialogRef: MatDialogRef<FolderNameDialogComponent>
  ) {
    this.translatePipe = new OFileManagerTranslatePipe(this.injector);
  }

  get title(): string {
    return this.translatePipe.transform('EXTENDED_TABLE.NEW_FOLDER_TITLE');
  }

  get folderName(): string {
    return this.translatePipe.transform('name');
  }

  onKeyDown(e: Event): void {
    if (e['keyCode'] === 13) {
      this.submit();
    }
  }

  submit(): void {
    if (!this.foldernameFormControl.invalid) {
      this.dialogRef.close(this.inputRef.nativeElement.value);
    }
  }

}
