import {
  Injectable
  // ,
  // Injector
} from '@angular/core';
// import { Http, Headers } from '@angular/http';
// import { Router } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/share';

import {
  OntimizeEEService
  // , Util
} from 'ontimize-web-ngx';
import { File } from '../core/file.class';

@Injectable()
export class FileManagerService extends OntimizeEEService {

  public static DUMMY = true;
  protected querySubscription: Subscription;

  // public query(kv?: Object, av?: Array<string>, entity?: string, sqltypes?: Object): Observable<any> {
  //   let innerObserver: any;
  //   const dataObservable = new Observable(observer =>
  //     innerObserver = observer).share();

  //   if (this.querySubscription) {
  //     this.querySubscription.unsubscribe();
  //   }

  //   this.querySubscription = super.query(kv, av, entity).subscribe(resp => {
  //     innerObserver.next(resp.data);
  //   }, error => {
  //     innerObserver.error(error);
  //   });

  //   return dataObservable;
  // }

  // public queryDummy(kv?: Object, av?: Array<string>, entity?: string, sqltypes?: Object): Observable<any> {
  //   let innerObserver: any;
  //   const dataObservable = new Observable(observer =>
  //     innerObserver = observer).share();

  //   setTimeout(() => {
  //     innerObserver.next(DUMMY_DATA);
  //   }, 500);

  //   return dataObservable;
  // }


  queryDummy(kv?: Object, av?: Array<string>, entity?: string, sqltypes?: Object): Observable<File> {
    // let innerObserver: any;
    // const dataObservable = new Observable(observer =>
    //   innerObserver = observer).share();

    return this.http.get('./assets/data/user_data.json')
      .map((res: any) => res.json());


    // .forEach(item => new File(item))

    // .map((data) =>

    //   new File(data)
    // );
    // .subscribe(resp => {
    //   innerObserver.next(resp);
    // });

    // return dataObservable;
  }

}
