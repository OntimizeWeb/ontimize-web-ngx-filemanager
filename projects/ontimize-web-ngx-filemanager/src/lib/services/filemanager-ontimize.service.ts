import { HttpClient, HttpEventType, HttpHeaders, HttpRequest, HttpResponse } from '@angular/common/http';
import { Injectable, Injector } from '@angular/core';
import { OntimizeEEService } from 'ontimize-web-ngx';
import { Observable } from 'rxjs';
import { filter, share } from 'rxjs/operators';

import { OntimizeDMSServiceResponseAdapter } from '../adapters/filemanager-dms-response.adapter';
import { IFileManagerService } from '../interfaces/filemanager.service.interface';
import { FileClass } from '../util';

@Injectable()
export class FileManagerOntimizeService extends OntimizeEEService implements IFileManagerService {

  protected httpClient: HttpClient;

  constructor(injector: Injector) {
    super(injector);
    this.httpClient = this.injector.get(HttpClient);
  }

  protected manageError(error: any, observer: any) {
    if (error.status === 401) {
      this.authService.logout();
    } else {
      observer.error(error);
    }
  }

  configureService(config: any): void {
    super.configureService(config);
    if (config.fileManagerPath) {
      this.path = config.fileManagerPath;
    }
  }
  public configureAdapter() {
    this.adapter = this.injector.get(OntimizeDMSServiceResponseAdapter);
  }

  queryFiles(workspaceId: string, kv?: Object, av?: Array<string>): Observable<any> {
    const url = this._urlBase + this.path + '/queryFiles/' + workspaceId;

    const authorizationToken = 'Bearer ' + this.sessionId;
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
        this.manageError(error, _innerObserver);
      }, () => _innerObserver.complete());

    return dataObservable;
  }

  download(workspaceId: string, files: FileClass[]): Observable<any> {
    const file: FileClass = files[0];
    if (files.length > 1 || file.directory) {
      return this.downloadMultiple(workspaceId, files);
    }

    const url = this._urlBase + this.path + '/getFile/' + file.id;

    const authorizationToken = 'Bearer ' + this.sessionId;
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
            this.createDownloadLink(resp['body'], file.name);
            _innerObserver.next(resp);
          } else {
            _innerObserver.error(resp.body);
          }
        }
      }, error => {
        this.manageError(error, _innerObserver);
      }, () => _innerObserver.complete());

    return dataObservable;
  }

  downloadMultiple(workspaceId: string, files: FileClass[]): Observable<any> {
    // Send data to generate zip file
    const url = this._urlBase + this.path + '/getFiles/' + workspaceId;

    const authorizationToken = 'Bearer ' + this.sessionId;
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


    const getZipDataSubscription = this.httpClient
      .request(request)
      .pipe(filter(resp => HttpEventType.Response === resp.type))
      .subscribe((resp: HttpResponse<any>) => {
        const body = JSON.parse(resp.body);
        const zipFileName = body.file;

        // Download zip file
        const url_zip = this._urlBase + this.path + '/getZipFile/' + zipFileName.substring(0, zipFileName.lastIndexOf('.'));

        const request_zip = new HttpRequest('GET', url_zip, null, {
          headers: headers,
          reportProgress: true,
          responseType: 'blob'
        });

        const downloadDataSubscription = this.httpClient
          .request(request_zip)
          .subscribe(resp_zip => {
            if (HttpEventType.DownloadProgress === resp_zip.type) {
              // Download progress event received
              const progressData = {
                loaded: resp_zip.loaded
              };
              _innerObserver.next(progressData);
            } else if (HttpEventType.Response === resp_zip.type) {
              // Full response received
              if (resp_zip.body) {
                this.createDownloadLink(resp_zip['body'], zipFileName);
                _innerObserver.next(resp_zip);
              } else {
                _innerObserver.error(resp_zip);
              }
            }

          }, error => {
            this.manageError(error, _innerObserver);
          }, () => _innerObserver.complete());
        _innerObserver.next({
          subscription: downloadDataSubscription,
          name: zipFileName
        });
      }, error => {
        this.manageError(error, _innerObserver);
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

  upload(workspaceId: string, folderId: any, files: any[]): Observable<any> {
    const url = this._urlBase + this.path + '/insertFile/' + workspaceId;
    const authorizationToken = 'Bearer ' + this.sessionId;
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


    const httpSubscription =
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
          this.manageError(error, _innerObserver);
        }, () => _innerObserver.complete());
    files.forEach(item => {
      item._uploadSuscription = httpSubscription;
    });
    return dataObservable;
  }

  deleteFiles(workspaceId: string, files: FileClass[] = []): Observable<any> {
    const url = this._urlBase + this.path + '/deleteFiles/' + workspaceId;

    const body = JSON.stringify({
      fileList: files
    });

    return this.doRequest({
      method: 'POST',
      url: url,
      body: body,
      successCallback: this.parseSuccessfulQueryResponse,
      errorCallBack: this.parseUnsuccessfulQueryResponse
    });
  }

  insertFolder(workspaceId: string, name: any, kv?: Object): Observable<any> {
    const url = this._urlBase + this.path + '/insertFolder/' + workspaceId + '/' + name;

    const body = JSON.stringify({
      data: kv
    });

    return this.doRequest({
      method: 'POST',
      url: url,
      body: body,
      successCallback: this.parseSuccessfulQueryResponse,
      errorCallBack: this.parseUnsuccessfulQueryResponse
    });
  }

  changeFileName(name: string, file: FileClass): Observable<any> {
    const url = this._urlBase + this.path + '/fileUpdate';

    const body = JSON.stringify({
      file: file,
      params: { name: name }
    });

    return this.doRequest({
      method: 'POST',
      url: url,
      body: body,
      successCallback: this.parseSuccessfulQueryResponse,
      errorCallBack: this.parseUnsuccessfulQueryResponse
    });
  }

  get sessionId() {
    return this.authService.getSessionInfo().id;
  }

  copyFiles(workspaceId: string, files: FileClass[], folder: string, kv?: Object): Observable<any> {
    throw new Error('Method not implemented.');
  }

  moveFiles(workspaceId: string, files: FileClass[], folder: string, kv?: Object): Observable<any> {
    throw new Error('Method not implemented.');
  }

}
