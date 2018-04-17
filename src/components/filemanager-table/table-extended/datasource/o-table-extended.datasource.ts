
import { OTableDataSource } from 'ontimize-web-ngx';
import { OTableExtendedComponent } from '../o-table-extended.component';

export class OTableExtendedDataSource extends OTableDataSource {

  constructor(protected table: OTableExtendedComponent) {
    super(table);

  }
  protected getSortedData(data: any[]): any[] {
    if (!this._sort.active || this._sort.direction === '') { return data; }
    this._sort.sortables.forEach((value, _key) => {
      this._sort.deregister(value);
    });

    const directories = data.filter(item => { return !!item['directory']; });
    const files = data.filter(item => { return !item['directory']; });

    const sortedDirectories = directories.sort(super.sortFunction.bind(this));
    const sortedFiles = files.sort(super.sortFunction.bind(this));

    return sortedDirectories.concat(sortedFiles);
  }

}
