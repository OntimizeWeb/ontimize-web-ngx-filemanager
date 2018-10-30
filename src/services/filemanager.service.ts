import { Injectable, Injector } from '@angular/core';
import { HttpClient, HttpEventType, HttpHeaders, HttpRequest, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, share } from 'rxjs/operators';
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

  protected manageError(error: any, observer: any) {
    if (error.status === 401) {
      this.redirectLogin(true);
    } else {
      observer.error(error);
    }
  }

  queryFiles(workspaceId: any, kv?: Object, av?: Array<string>): Observable<any> {
    const url = this._urlBase + this.path + '/queryFiles/' + workspaceId;

    const authorizationToken = 'Bearer ' + this._sessionid;
    const headers: HttpHeaders = new HttpHeaders({
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json;charset=UTF-8',
      'Authorization': authorizationToken
    });

    const body = JSON.stringify({
      filter: kv,
      columns: av
    });

    let _innerObserver: any;
    const dataObservable = new Observable(observer => _innerObserver = observer).pipe(share());

    const request = new HttpRequest('POST', url, body, {
      headers: headers
    });

    const self = this;
    this.httpClient
      .request(request)
      .pipe(filter(resp => HttpEventType.Response === resp.type))
      .subscribe((resp: HttpResponse<FileClass>) => {
        if (resp.body) {
          _innerObserver.next(resp.body);
        } else {
          _innerObserver.error(resp);
        }
      }, error => {
        self.manageError(error, _innerObserver);
      }, () => _innerObserver.complete());

    return dataObservable;
  }

  download(workspaceId: any, files: FileClass[]): Observable<any> {
    const file: FileClass = files[0];
    if (files.length > 1 || file.directory) {
      return this.downloadMultiple(workspaceId, files);
    }

    const url = this._urlBase + this.path + '/getFile/' + file.id;

    const authorizationToken = 'Bearer ' + this._sessionid;
    const headers: HttpHeaders = new HttpHeaders({
      'Access-Control-Allow-Origin': '*',
      'Authorization': authorizationToken
    });

    let _innerObserver: any;
    const dataObservable = new Observable(observer => _innerObserver = observer).pipe(share());

    const request = new HttpRequest('GET', url, null, {
      headers: headers,
      reportProgress: true,
      responseType: 'blob'
    });

    const self = this;
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
            self.createDownloadLink(resp['body'], file.name);
            _innerObserver.next(resp);
          } else {
            _innerObserver.error(resp.body);
          }
        }
      }, error => {
        self.manageError(error, _innerObserver);
      }, () => _innerObserver.complete());

    return dataObservable;
  }

  downloadMultiple(workspaceId: any, files: FileClass[]): Observable<any> {
    // Send data to generate zip file
    const url = this._urlBase + this.path + '/getFiles/' + workspaceId;

    const authorizationToken = 'Bearer ' + this._sessionid;
    const headers: HttpHeaders = new HttpHeaders({
      'Access-Control-Allow-Origin': '*',
      'Authorization': authorizationToken
    });

    let _innerObserver: any;
    const dataObservable = new Observable(observer => _innerObserver = observer).pipe(share());

    const request = new HttpRequest('POST', url, files, {
      headers: headers,
      responseType: 'text'
    });

    const self = this;
    const getZipDataSubscription = this.httpClient
      .request(request)
      .pipe(filter(resp => HttpEventType.Response === resp.type))
      .subscribe((resp: HttpResponse<any>) => {
        const body = JSON.parse(resp.body);
        const zipFileName = body.file;

        // Download zip file
        const url = this._urlBase + this.path + '/getZipFile/' + zipFileName.substring(0, zipFileName.lastIndexOf('.'));

        const request = new HttpRequest('GET', url, null, {
          headers: headers,
          reportProgress: true,
          responseType: 'blob'
        });

        const downloadDataSubscription = self.httpClient
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
                self.createDownloadLink(resp['body'], zipFileName);
                _innerObserver.next(resp);
              } else {
                _innerObserver.error(resp);
              }
            }

          }, error => {
            self.manageError(error, _innerObserver);
          }, () => _innerObserver.complete());
        _innerObserver.next({
          subscription: downloadDataSubscription,
          name: zipFileName
        });
      }, error => {
        self.manageError(error, _innerObserver);
      });
    setTimeout(() => {
      _innerObserver.next({
        subscription: getZipDataSubscription
      });
    });
    return dataObservable;
  }

  protected createDownloadLink(body: any, zipFileName: string) {
    const fileURL = URL.createObjectURL(body);
    const a = document.createElement('a');
    a.href = fileURL;
    a.download = zipFileName;
    a.click();
  }

  upload(workspaceId: any, folderId: any, files: any[]): Observable<any> {
    const url = this._urlBase + this.path + '/insertFile/' + workspaceId;
    const authorizationToken = 'Bearer ' + this._sessionid;
    const headers: HttpHeaders = new HttpHeaders({
      'Access-Control-Allow-Origin': '*',
      'Authorization': authorizationToken
    });

    let _innerObserver: any;
    const dataObservable = new Observable(observer => _innerObserver = observer).pipe(share());

    let toUpload: any = new FormData();
    files.forEach(item => {
      item.prepareToUpload();
      item.isUploading = true;
      toUpload.append('name', item.name);
      toUpload.append('file', item.file);
    });

    if (folderId !== undefined) {
      toUpload.append('folderId', folderId);
    }

    const request = new HttpRequest('POST', url, toUpload, {
      headers: headers,
      reportProgress: true
    });

    const self = this;
    let httpSubscription =
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
          self.manageError(error, _innerObserver);
        }, () => _innerObserver.complete());
    files.forEach(item => {
      item._uploadSuscription = httpSubscription;
    });
    return dataObservable;
  }

  deleteFiles(workspaceId: any, files: FileClass[] = []): Observable<any> {
    const url = this._urlBase + this.path + '/deleteFiles/' + workspaceId;

    const authorizationToken = 'Bearer ' + this._sessionid;
    const headers: HttpHeaders = new HttpHeaders({
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json;charset=UTF-8',
      'Authorization': authorizationToken
    });

    const body = JSON.stringify({
      fileList: files
    });

    const request = new HttpRequest('POST', url, body, {
      headers: headers
    });

    let _innerObserver: any;
    const dataObservable = new Observable(observer => _innerObserver = observer).pipe(share());

    const self = this;
    this.httpClient
      .request(request)
      .pipe(filter(resp => HttpEventType.Response === resp.type))
      .subscribe((resp: HttpResponse<any>) => {
        _innerObserver.next(resp);
      }, error => {
        self.manageError(error, _innerObserver);
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
    const dataObservable = new Observable(observer => _innerObserver = observer).pipe(share());

    const self = this;
    this.httpClient
      .request(request)
      .pipe(filter(resp => HttpEventType.Response === resp.type))
      .subscribe((resp: HttpResponse<any>) => {
        _innerObserver.next(resp);
      }, error => {
        self.manageError(error, _innerObserver);
      }, () => _innerObserver.complete());
    return dataObservable;
  }

  changeFileName(name: string, file: FileClass): Observable<any> {
    const url = this._urlBase + this.path + '/fileUpdate';
    const authorizationToken = 'Bearer ' + this._sessionid;
    const headers: HttpHeaders = new HttpHeaders({
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json;charset=UTF-8',
      'Authorization': authorizationToken
    });

    const body = JSON.stringify({
      file: file,
      params: { name: name }
    });

    const request = new HttpRequest('POST', url, body, {
      headers: headers
    });

    let _innerObserver: any;
    const dataObservable = new Observable(observer => _innerObserver = observer).pipe(share());

    const self = this;
    this.httpClient
      .request(request)
      .pipe(filter(resp => HttpEventType.Response === resp.type))
      .subscribe((resp: HttpResponse<any>) => {
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
