import { Injectable, Injector } from '@angular/core';
import { HttpClient, HttpEventType, HttpHeaders, HttpRequest, HttpResponse } from '@angular/common/http';

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

  public configureService(config: any): void {
    super.configureService(config);
    if (config.fileManagerPath) {
      this.path = config.fileManagerPath;
    }
  }

  public queryFiles(workspaceId: any, kv?: Object, av?: Array<string>): Observable<any> {

    let url = this._urlBase + this.path + '/queryFiles/' + workspaceId;

    let authorizationToken = 'Bearer ' + this._sessionid;
    let headers: HttpHeaders = new HttpHeaders({
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json;charset=UTF-8',
      'Authorization': authorizationToken
    });

    let body = JSON.stringify({
      filter: kv,
      columns: av
    });

    let _innerObserver: any;
    let dataObservable = new Observable(observer =>
      _innerObserver = observer).share();

    let request = new HttpRequest('POST', url, body, {
      headers: headers
    });

    let self = this;
    this.httpClient
      .request(request)
      .filter(resp => HttpEventType.Response === resp.type)
      .subscribe((resp: HttpResponse<File>) => {
        if (resp.body) {
          _innerObserver.next(resp.body);
        } else {
          _innerObserver.error(resp);
        }
      }, error => {
        if (error.status === 401) {
          self.redirectLogin(true);
        } else {
          _innerObserver.error(error);
        }
      }, () => _innerObserver.complete());

    return dataObservable;
  }

  public download(file: File): Observable<any> {

    let url = this._urlBase + this.path + '/getFile/' + file['id'];

    let authorizationToken = 'Bearer ' + this._sessionid;
    let headers: HttpHeaders = new HttpHeaders({
      'Access-Control-Allow-Origin': '*',
      'Authorization': authorizationToken
    });

    let _innerObserver: any;
    let dataObservable = new Observable(observer =>
      _innerObserver = observer).share();

    let request = new HttpRequest('GET', url, null, {
      headers: headers,
      responseType: 'blob'
    });

    let self = this;
    this.httpClient
      .request(request)
      .filter(resp => HttpEventType.Response === resp.type)
      .subscribe((resp: HttpResponse<File>) => {
        if (resp.body) {
          let fileURL = URL.createObjectURL(resp.body);
          let a = document.createElement('a');
          a.href = fileURL;
          a.download = file.name;
          a.click();
          _innerObserver.next(resp);
        } else {
          _innerObserver.error(resp);
        }
      }, error => {
        if (error.status === 401) {
          self.redirectLogin(true);
        } else {
          _innerObserver.error(error);
        }
      }, () => _innerObserver.complete());

    return dataObservable;
  }

  upload(files: any[], entity: string, data?: Object): Observable<any> {

    // TODO: documentId
    const documentId = 1;
    let folderId = 0;

    if (this.isNullOrUndef(folderId)) {
      folderId = 0;
    }

    let url = this._urlBase + this.path + '/insertFile/' + documentId + '/' + folderId;

    let authorizationToken = 'Bearer ' + this._sessionid;
    let headers: HttpHeaders = new HttpHeaders({
      'Access-Control-Allow-Origin': '*',
      'Authorization': authorizationToken
    });

    let _innerObserver: any;
    let dataObservable = new Observable(observer => _innerObserver = observer).share();

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

    const request = new HttpRequest('POST', url, toUpload, {
      headers: headers,
      reportProgress: true
    });

    const self = this;
    this.httpClient
      .request(request)
      .subscribe(resp => {
        if (HttpEventType.UploadProgress === resp.type) {
          // Upload progress event received
          const progressData = {
            loaded: resp.loaded,
            total: resp.total
          };
          _innerObserver.next(progressData);
        } else if (HttpEventType.Response === resp.type) {
          // Full response received
          if (resp.body) {
            _innerObserver.next(resp.body);
          } else {
            _innerObserver.error(resp);
          }
        }
      }, error => {
        console.log(error);
        if (error.status === 401) {
          self.redirectLogin(true);
        } else {
          _innerObserver.error(error);
        }
      }, () => _innerObserver.complete());

    return dataObservable;
  }

}

