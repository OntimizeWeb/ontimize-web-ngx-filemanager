import { Injector, Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import 'rxjs/add/operator/share';
import 'rxjs/add/operator/map';

@Injectable()
export class FileManagerStateService {

  protected formParentItem: any;
  protected _stateArray: Array<any>;

  private subject = new Subject<any>();

  constructor(protected injector: Injector) { }

  setFormParentItem(parentItem: any) {
    this.formParentItem = parentItem;
    this.stateArray = [];
  }

  restart(index?: number) {
    let state = [];
    if (index !== undefined) {
      state = this._stateArray.slice(0, index + 1);
    }
    this.stateArray = state;
  }

  getFormParentItem(): any {
    return this.formParentItem;
  }

  getAndStoreQueryFilter(queryFilter: any, item: any) {
    const filter = Object.assign({}, queryFilter);
    this.stateArray.push({ filter: filter, item: item });
    return filter;
  }

  getCurrentQueryFilter(): any {
    let result = {};
    if (this.stateArray.length > 0) {
      result = this.stateArray[this.stateArray.length - 1].filter;
    }
    return result;
  }

  getStateObservable(): Observable<any> {
    return this.subject.asObservable();
  }

  set stateArray(array: any[]) {
    this._stateArray = array;
    this.subject.next(this._stateArray);
  }

  get stateArray(): any[] {
    return this._stateArray;
  }

}
