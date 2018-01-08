import { Injector, Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/share';
// import { File } from '../core/file.class';

@Injectable()
export class FileManagerStateService {

  protected formParentItem: any;
  protected stateArray: any[];

  constructor(protected injector: Injector) {
  }

  setFormParentItem(parentItem: any) {
    this.formParentItem = parentItem;
    this.stateArray = [];
    this.stateArray.push(parentItem);
  }

  getFormParentItem(): any {
    return this.formParentItem;
  }

  getAndStoreQueryFilter(queryFilter: any) {
    const filter = Object.assign({}, this.formParentItem, queryFilter);
    this.stateArray.push(filter);
    return filter;
  }
}
