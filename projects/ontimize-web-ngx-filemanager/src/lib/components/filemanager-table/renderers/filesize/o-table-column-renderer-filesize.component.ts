import { Component, Injector, TemplateRef, ViewChild } from '@angular/core';
import { OBaseTableCellRenderer } from 'ontimize-web-ngx';

@Component({
  selector: 'o-table-column-renderer-filesize',
  templateUrl: './o-table-column-renderer-filesize.component.html'
})

export class OTableColumnRendererFileSizeComponent extends OBaseTableCellRenderer {

  @ViewChild('templateref', { read: TemplateRef }) public templateref: TemplateRef<any>;

  private units = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];

  constructor(protected injector: Injector) {
    super(injector);
  }

  transformSize(value: any, precision: number = 2) {
    let parsedValue = parseFloat(value);
    if (isNaN(parsedValue) || !isFinite(parsedValue)) {
      return value;
    }
    let unit = 0;
    while (parsedValue >= 1024) {
      parsedValue /= 1024;
      unit++;
    }
    if (unit === 0) {
      precision = 0;
    }
    return parsedValue.toFixed(+precision) + ' ' + this.units[unit];
  }

}
