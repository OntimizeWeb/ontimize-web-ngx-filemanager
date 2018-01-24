import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { MdDialogRef, MD_DIALOG_DATA } from '@angular/material';

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

  constructor(
    public dialogRef: MdDialogRef<FolderNameDialogComponent>
    // ,
    // @Inject(MD_DIALOG_DATA) data: any
  ) {

  }


}
