import { Component, Injector, ViewChild, TemplateRef } from '@angular/core';
import { OBaseTableCellRenderer } from 'ontimize-web-ngx';

@Component({
  selector: 'o-table-column-renderer-filetype',
  templateUrl: './o-table-column-renderer-filetype.component.html'
})

export class OTableColumnRendererFileTypeComponent extends OBaseTableCellRenderer {

  @ViewChild('templateref', { read: TemplateRef }) public templateref: TemplateRef<any>;

  constructor(protected injector: Injector) {
    super(injector);
    this.initialize();
  }

}
