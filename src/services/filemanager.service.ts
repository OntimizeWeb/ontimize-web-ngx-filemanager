import { Injectable, Injector } from '@angular/core';
import { HttpClient, HttpEventType, HttpHeaders, HttpRequest, HttpResponse } from '@angular/common/http';
// import { Http, Headers, RequestOptions, RequestMethod } from '@angular/http';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/share';

import { OntimizeEEService } from 'ontimize-web-ngx';

import { FileClass } from '../core/file.class';

@Injectable()
export class FileManagerService extends OntimizeEEService {

  protected httpClient: HttpClient;

  constructor(injector: Injector) {
    super(injector);
    this.httpClient = this.injector.get(HttpClient);
  }

  configureService(config: any): void {
    super.configureService(config);
    if (config.fileManagerPath) {
      this.path = config.fileManagerPath;
    }
  }

  queryFiles(workspaceId: any, kv?: Object, av?: Array<string>): Observable<any> {
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
    let dataObservable = new Observable(observer => _innerObserver = observer).share();

    let request = new HttpRequest('POST', url, body, {
      headers: headers
    });

    let self = this;
    this.httpClient
      .request(request)
      .filter(resp => HttpEventType.Response === resp.type)
      .subscribe((resp: HttpResponse<FileClass>) => {
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

  public download(workspaceId: any, files: FileClass[]): Observable<any> {
    let file: FileClass = files[0];
    if (files.length > 1 || file.directory) {
      return this.downloadMultiple(workspaceId, files);
    }

    let url = this._urlBase + this.path + '/getFile/' + file.id;

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
      reportProgress: true,
      responseType: 'blob'
    });

    let self = this;
    this.httpClient
      .request(request)
      .subscribe((resp) => {
        if (HttpEventType.DownloadProgress === resp.type) {
          // Download progress event received
          let progressData = {
            loaded: resp.loaded
          };
          _innerObserver.next(progressData);
        } else if (HttpEventType.Response === resp.type) {
          // Full response received
          if (resp.body) {
            let fileURL = URL.createObjectURL(resp.body);
            let a = document.createElement('a');
            a.href = fileURL;
            a.download = file.name;
            a.click();
            _innerObserver.next(resp);
          } else {
            _innerObserver.error(resp.body);
          }
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

  public downloadMultiple(workspaceId: any, files: FileClass[]): Observable<any> {
    // Send data to generate zip file
    let url = this._urlBase + this.path + '/getFiles/' + workspaceId;

    let authorizationToken = 'Bearer ' + this._sessionid;
    let headers: HttpHeaders = new HttpHeaders({
      'Access-Control-Allow-Origin': '*',
      'Authorization': authorizationToken
    });

    let _innerObserver: any;
    let dataObservable = new Observable(observer =>
      _innerObserver = observer).share();

    let request = new HttpRequest('POST', url, files, {
      headers: headers,
      responseType: 'text'
    });

    let self = this;
    this.httpClient
      .request(request)
      .filter(resp => HttpEventType.Response === resp.type)
      .subscribe((resp: HttpResponse<any>) => {
        let body = JSON.parse(resp.body);
        let zipFileName = body.file;

        // Download zip file
        let url = this._urlBase + this.path + '/getZipFile/' + zipFileName.substring(0, zipFileName.lastIndexOf('.'));

        let request = new HttpRequest('GET', url, null, {
          headers: headers,
          reportProgress: true,
          responseType: 'blob'
        });

        self.httpClient
          .request(request)
          .subscribe(resp => {
            if (HttpEventType.DownloadProgress === resp.type) {
              // Download progress event received
              const progressData = {
                loaded: resp.loaded
              };
              _innerObserver.next(progressData);
            } else if (HttpEventType.Response === resp.type) {
              // Full response received
              if (resp.body) {
                let fileURL = URL.createObjectURL(resp['body']);
                let a = document.createElement('a');
                a.href = fileURL;
                a.download = zipFileName;
                a.click();
                _innerObserver.next(resp);
              } else {
                _innerObserver.error(resp);
              }
            }
          }, error => {
            if (error.status === 401) {
              self.redirectLogin(true);
            } else {
              _innerObserver.error(error);
            }
          }, () => _innerObserver.complete());
      }, error => {
        if (error.status === 401) {
          self.redirectLogin(true);
        } else {
          _innerObserver.error(error);
        }
      }, () => _innerObserver.complete());

    return dataObservable;
  }

  upload(files: any[], workspaceId: any, folderId: any): Observable<any> {
    const url = this._urlBase + this.path + '/insertFile/' + workspaceId;
    const authorizationToken = 'Bearer ' + this._sessionid;
    const headers: HttpHeaders = new HttpHeaders({
      'Access-Control-Allow-Origin': '*',
      'Authorization': authorizationToken
    });

    let _innerObserver: any;
    const dataObservable = new Observable(observer => _innerObserver = observer).share();

    let toUpload: any = new FormData();
    files.forEach(item => {
      item.prepareToUpload();
      item.isUploading = true;
      toUpload.append('name', item.name);
      toUpload.append('file', item.file);
    });
    if (folderId) {
      toUpload.append('folderId', folderId);
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

  deleteFiles(files: Object[] = [], workspaceId: any, sqltypes?: Object): Observable<any> {
    const url = this._urlBase + this.path + '/deleteFiles/' + workspaceId;

    let authorizationToken = 'Bearer ' + this._sessionid;
    let headers: HttpHeaders = new HttpHeaders({
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json;charset=UTF-8',
      'Authorization': authorizationToken
    });

    let body = JSON.stringify({
      fileList: files,
      sqltypes: sqltypes
    });

    let request = new HttpRequest('POST', url, body, {
      headers: headers
    });

    let _innerObserver: any;
    let dataObservable = new Observable(observer => _innerObserver = observer).share();

    let self = this;
    this.httpClient
      .request(request)
      .filter(resp => HttpEventType.Response === resp.type)
      .subscribe((resp: HttpResponse<File>) => {
        _innerObserver.next(resp);
      }, error => {
        if (error.status === 401) {
          self.redirectLogin(true);
        } else {
          _innerObserver.error(error);
        }
      }, () => _innerObserver.complete());
    return dataObservable;
  }

  insertFolder(workspaceId: any, name: any, kv?: Object): Observable<any> {
    const url = this._urlBase + this.path + '/insertFolder/' + workspaceId + '/' + name;
    const authorizationToken = 'Bearer ' + this._sessionid;
    const headers: HttpHeaders = new HttpHeaders({
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json;charset=UTF-8',
      'Authorization': authorizationToken
    });

    const body = JSON.stringify({
      data: kv
    });

    const request = new HttpRequest('POST', url, body, {
      headers: headers
    });

    let _innerObserver: any;
    const dataObservable = new Observable(observer => _innerObserver = observer).share();

    const self = this;
    this.httpClient
      .request(request)
      .filter(resp => HttpEventType.Response === resp.type)
      .subscribe((resp: HttpResponse<File>) => {
        _innerObserver.next(resp);
      }, error => {
        if (error.status === 401) {
          self.redirectLogin(true);
        } else {
          _innerObserver.error(error);
        }
      }, () => _innerObserver.complete());
    return dataObservable;
  }
}

