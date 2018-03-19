import { Component, ViewEncapsulation, Injector } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { OFileManagerTranslatePipe } from '../../../../core/o-filemanager-translate.pipe';

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


}
