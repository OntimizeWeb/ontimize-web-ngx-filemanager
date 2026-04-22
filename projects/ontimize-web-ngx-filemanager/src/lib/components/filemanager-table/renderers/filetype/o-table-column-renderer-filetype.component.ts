import { Component, Injector, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { OBaseTableCellRenderer } from 'ontimize-web-ngx';

@Component({
  selector: 'o-table-column-renderer-filetype',
  templateUrl: './o-table-column-renderer-filetype.component.html',
  standalone: true,
  imports: [CommonModule, MatIconModule]
})

export class OTableColumnRendererFileTypeComponent extends OBaseTableCellRenderer {

  @ViewChild('templateref', { read: TemplateRef }) public templateref: TemplateRef<any>;

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
