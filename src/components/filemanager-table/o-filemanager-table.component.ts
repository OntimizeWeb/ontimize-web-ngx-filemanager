
import { Component, ViewEncapsulation, Injector, NgModule, CUSTOM_ELEMENTS_SCHEMA, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OntimizeWebModule, OTableComponent, OSharedModule } from 'ontimize-web-ngx';
import { OTableColumnRendererFileTypeComponent } from './renderers/o-table-column-renderer-filetype.component';

export const DEFAULT_INPUTS_O_FILEMANAGER_TABLE = [
  // parent-keys [string]: parent keys to filter, separated by ';'. Default: no value.
  'parentKeys: parent-keys',
];

export const DEFAULT_OUTPUTS_O_FILEMANAGER_TABLE = [
];

@Component({
  selector: 'o-filemanager-table',
  templateUrl: './o-filemanager-table.component.html',
  styleUrls: ['./o-filemanager-table.component.scss'],
  inputs: DEFAULT_INPUTS_O_FILEMANAGER_TABLE,
  outputs: DEFAULT_OUTPUTS_O_FILEMANAGER_TABLE,
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class.o-filemanager-table]': 'true'
  }
})

export class OFileManagerTableComponent {

  protected parentKeys: string;

  @ViewChild('oTable') oTable: OTableComponent;

  constructor(protected injector: Injector) {
    //
  }

  onTableDoubleClick(item: any) {
    if (item === undefined || !item['isDir'] || !this.oTable) {
      return;
    }
    // this.oTable.queryData
  }

  onFileUpload() {
    console.log('onFileUpload');
  }
}

@NgModule({
  declarations: [
    OFileManagerTableComponent,
    OTableColumnRendererFileTypeComponent
  ],
  imports: [
    CommonModule,
    OntimizeWebModule,
    OSharedModule
  ],
  exports: [OFileManagerTableComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class OFileManagerTableModule {
}
