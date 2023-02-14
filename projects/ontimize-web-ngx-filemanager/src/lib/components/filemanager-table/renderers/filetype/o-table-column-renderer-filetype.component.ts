import { Component, Injector, TemplateRef, ViewChild } from '@angular/core';
import { OBaseTableCellRenderer } from 'ontimize-web-ngx';

@Component({
  selector: 'o-table-column-renderer-filetype',
  templateUrl: './o-table-column-renderer-filetype.component.html'
})

export class OTableColumnRendererFileTypeComponent extends OBaseTableCellRenderer {

  @ViewChild('templateref', { read: TemplateRef, static: false }) public templateref: TemplateRef<any>;

  constructor(protected injector: Injector) {
    super(injector);
  }

  ngOnInit() {
    if (this.table) {
      const oCol = this.table.getOColumn(this.tableColumn.attr);
      oCol.title = undefined;
    }
  }
}
