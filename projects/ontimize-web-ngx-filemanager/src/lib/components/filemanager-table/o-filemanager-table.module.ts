import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { OntimizeWebModule, OSharedModule } from 'ontimize-web-ngx';

import { OFileManagerTranslateModule } from '../../util/o-filemanager-translate.pipe';
import { OFileInputExtendedModule } from '../file-input/o-file-input-extended.component';
import { DownloadProgressComponent } from '../status/download/download-progress.component';
import { UploadProgressComponent } from '../status/upload/upload-progress.component';
import { OFileManagerTableComponent } from './o-filemanager-table.component';
import { OTableColumnRendererFileSizeComponent } from './renderers/filesize/o-table-column-renderer-filesize.component';
import { OTableColumnRendererFileTypeComponent } from './renderers/filetype/o-table-column-renderer-filetype.component';
import { ChangeNameDialogComponent } from './table-extended/dialog/changename/change-name-dialog.component';
import { OTableExtendedModule } from './table-extended/o-table-extended.component';
import { CopyDialogComponent } from './table-extended/dialog/copy/copy-dialog.component';

@NgModule({
  declarations: [
    OFileManagerTableComponent,
    OTableColumnRendererFileTypeComponent,
    OTableColumnRendererFileSizeComponent,
    ChangeNameDialogComponent,
    CopyDialogComponent,
    UploadProgressComponent,
    DownloadProgressComponent
  ],
  imports: [
    CommonModule,
    OntimizeWebModule,
    OSharedModule,
    OTableExtendedModule,
    OFileInputExtendedModule,
    OFileManagerTranslateModule
  ],
  entryComponents: [
    ChangeNameDialogComponent,
    CopyDialogComponent,
    UploadProgressComponent,
    DownloadProgressComponent
  ],
  exports: [OFileManagerTableComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class OFileManagerTableModule {
}
