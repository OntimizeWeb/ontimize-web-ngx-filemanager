import { Component, ElementRef, inject, ViewChild, ViewEncapsulation } from '@angular/core';
import { UntypedFormControl, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { OSharedModule } from 'ontimize-web-ngx';

import { fileNameValidator, OFileManagerTranslatePipe } from '../../../../../util';

@Component({
  selector: 'folder-name-dialog',
  templateUrl: 'folder-name-dialog.component.html',
  styleUrls: ['folder-name-dialog.component.scss'],
  standalone: true,
  imports: [FormsModule, MatButtonModule, MatDialogModule, MatFormFieldModule, MatInputModule, OFileManagerTranslatePipe, OSharedModule, ReactiveFormsModule],
  providers: [OFileManagerTranslatePipe],
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

  public title: string;
  public folderName: string;

  protected translatePipe: OFileManagerTranslatePipe = inject(OFileManagerTranslatePipe);

  constructor(public dialogRef: MatDialogRef<FolderNameDialogComponent>) {
    this.initialize();
  }

  initialize() {
    this.title = this.translatePipe.transform('EXTENDED_TABLE.NEW_FOLDER_TITLE');
    this.folderName = this.translatePipe.transform('name');
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
