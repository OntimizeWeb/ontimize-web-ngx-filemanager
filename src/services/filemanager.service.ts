import { Injector, Injectable } from '@angular/core'; import { HttpRequest, HttpHeaders, HttpClient, HttpEventType } from '@angular/common/http';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/share';

import { OntimizeEEService } from 'ontimize-web-ngx';
import { File } from '../core/file.class';

@Injectable()
export class FileManagerService extends OntimizeEEService {

  protected httpClient: HttpClient;

  constructor(injector: Injector) {
    super(injector);
    this.httpClient = this.injector.get(HttpClient);
  }

  public upload(files: any[], entity: string, data?: Object): Observable<any> {
    const url = this._urlBase + this.path + '/' + entity;

    const authorizationToken = 'Bearer ' + this._sessionid;
    const headers: HttpHeaders = new HttpHeaders({
      'Access-Control-Allow-Origin': '*',
      'Authorization': authorizationToken
    });

    let _innerObserver: any;
    const dataObservable = new Observable(observer => _innerObserver = observer).share();

    let toUpload: any;
    toUpload = new FormData();
    files.forEach(item => {
      item.prepareToUpload();
      item.isUploading = true;
      toUpload.append('name', item.name);
      toUpload.append('file', item.file);
    });
    if (data) {
      toUpload.append('data', JSON.stringify(data));
    }

    const LOOPS = 500;
    let i = 0;
    const intervalId = setInterval(function () {
      i++;
      const progressData = {
        loaded: i * 10,
        total: LOOPS * 10
      };
      _innerObserver.next(progressData);
      if (i === LOOPS) {
        clearInterval(intervalId);
      }
    }, 10);

    setTimeout(() => {
      _innerObserver.next({
        code: 0
      });
    }, (LOOPS + 5) * 10);

    // const request = new HttpRequest('POST', url, toUpload, {
    //   headers: headers,
    //   reportProgress: true
    // });

    // const self = this;
    // this.httpClient.request(request).subscribe(resp => {
    //   if (HttpEventType.UploadProgress === resp.type) {
    //     // Upload progress event received
    //     const progressData = {
    //       loaded: resp.loaded,
    //       total: resp.total
    //     };
    //     _innerObserver.next(progressData);
    //   } else if (HttpEventType.Response === resp.type) {
    //     // Full response received
    //     if (resp.body) {
    //       if (resp.body['code'] === 3) {
    //         self.redirectLogin(true);
    //       } else if (resp.body['code'] === 1) {
    //         _innerObserver.error(resp.body['message']);
    //       } else if (resp.body['code'] === 0) {
    //         // RESPONSE
    //         _innerObserver.next(resp.body);
    //       } else {
    //         // Unknow state -> error
    //         _innerObserver.error('Service unavailable');
    //       }
    //     } else {
    //       _innerObserver.next(resp.body);
    //     }
    //   }
    // }, error => {
    //   console.log(error);
    //   if (error.status === 401) {
    //     self.redirectLogin(true);
    //   } else {
    //     _innerObserver.error(error);
    //   }
    // },
    //   () => _innerObserver.complete());

    return dataObservable;
  }


  queryFiles(kv?: any, av?: Array<string>, entity?: string, sqltypes?: Object): Observable<any> {// : Observable<File> {

    const self = this;
    let innerObserver: any;
    const dataObservable = new Observable(observer =>
      innerObserver = observer).share();

    this.http.get('./assets/data/files_data.json')
      .map(response => response.json())
      .subscribe(resp => {
        const filteredUserData = resp.filter(i => i['USER_ID'] === kv['USER_ID'])[0] || [];
        if (!kv.hasOwnProperty('PARENT')) {
          innerObserver.next(filteredUserData['FILES'] || []);
        } else {
          const filteredByParent = this.searchFolderById(filteredUserData['FILES'], kv['PARENT']);
          if (filteredByParent) {
            innerObserver.next(filteredByParent['FILES'] || []);
          } else {
            innerObserver.next([]);
          }
        }
      }, error => {
        if (error.status === 401) {
          self.redirectLogin(true);
        } else {
          innerObserver.error(error);
        }
      },
      () => innerObserver.complete());
    return dataObservable;
  }

  private searchFolderById(array: Array<any>, id: any) {
    let result = undefined;
    let searchArr = array || [];
    for (let i = 0, len = searchArr.length; i < len; i++) {
      if (searchArr[i]['id'] === id) {
        return searchArr[i];
      } else if (searchArr[i]['isDir']) {
        return this.searchFolderById(searchArr[i]['FILES'], id);
      }
    }
    return result;
  }

}

