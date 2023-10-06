import { Component, ElementRef, Injector, ViewChild, ViewEncapsulation } from '@angular/core';
import { UntypedFormControl, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

import { fileNameValidator, OFileManagerTranslatePipe } from '../../../../../util';

@Component({
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
  public foldernameFormControl = new UntypedFormControl('', [
    Validators.required,
    fileNameValidator
  ]);

  @ViewChild('folderNameRef') inputRef: ElementRef;

  protected translatePipe: OFileManagerTranslatePipe;
  public title: string;
  public folderName: string;

  constructor(
    protected injector: Injector,
    public dialogRef: MatDialogRef<FolderNameDialogComponent>
  ) {
    this.translatePipe = new OFileManagerTranslatePipe(this.injector);
    this.initialize();
  }

  initialize() {
    this.title = this.translatePipe.transform('EXTENDED_TABLE.NEW_FOLDER_TITLE');
    this.folderName = this.translatePipe.transform('name')
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
