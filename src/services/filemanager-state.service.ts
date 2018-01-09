import { Injector, Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/share';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
// import { File } from '../core/file.class';

@Injectable()
export class FileManagerStateService {

  protected formParentItem: any;
  protected _stateArray: Array<any>;

  private subject = new Subject<any>();

  constructor(protected injector: Injector) {
  }

  setFormParentItem(parentItem: any) {
    this.formParentItem = parentItem;
    this.stateArray = [];
  }

  restart(index?:number) {
    let state = [];
    if (index !== undefined) {
      state =this._stateArray.slice(0, index + 1);
    }
    this.stateArray = state;
  }

  getFormParentItem(): any {
    return this.formParentItem;
  }

  getAndStoreQueryFilter(queryFilter: any, item: any) {
    const filter = Object.assign({}, this.formParentItem, queryFilter);
    this._stateArray.push({filter : filter, item:item });
    this.stateArray = this._stateArray;
    return filter;
  }

  getStateObservable(): Observable<any> {
    return this.subject.asObservable();
  }

  set stateArray(array : any[]) {
    this._stateArray = array;
    this.subject.next(this._stateArray);
  }
}
