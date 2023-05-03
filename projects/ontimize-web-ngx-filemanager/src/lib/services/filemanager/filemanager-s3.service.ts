import { HttpClient, HttpEventType, HttpHeaders, HttpRequest, HttpResponse } from '@angular/common/http';
import { Injectable, Injector } from '@angular/core';
import { OntimizeEEService, OntimizeServiceResponse, ServiceResponse } from 'ontimize-web-ngx';
import { Observable, forkJoin } from 'rxjs';
import { filter, share, switchMap } from 'rxjs/operators';

import { FileClass } from '../../util';
import { FileManagerService } from './filemanager.service';
import { OFileManagerTableComponent } from '../../components';


@Injectable()
export class FileManagerS3Service extends OntimizeEEService implements FileManagerService {

  //Constants
  private static KV_FOLDER_KEY: string = 'FM_FOLDER_PARENT_KEY';

  private static ROOT: string = '/';

  private static FILTER_KEY: string = 'key';
  private static FILTER_PREFIX: string = 'prefix';
  private static FILTER_DELIMITER: string = 'delimiter';

  private static DATA_PREFIX: string = 'prefix';
  private static DATA_FILE_NAME: string = 'fileName';
  private static DATA_KEY: string = 'key';

  private static RESPONSE_KEY_CODE: string = 'code';
  private static RESPONSE_KEY_MESSAGE: string = 'message';
  private static RESPONSE_KEY_DATA: string = 'data';

  //Dependencies
  protected httpClient: HttpClient;

  //Properties
  private entity: string;
  private host: string;

// ------------------------------------------------------------------------------------------------------ \\

  public constructor( injector: Injector ) {
    super(injector);
    this.httpClient = this.injector.get( HttpClient );
  }

// ------------------------------------------------------------------------------------------------------ \\
// -----| Implemented Methods |-------------------------------------------------------------------------- \\
// ------------------------------------------------------------------------------------------------------ \\

  public configureService( config: any ): void {
    super.configureService( config );
    const component: any = this.injector.get( OFileManagerTableComponent );

    if( component ){
      this.entity = component.oForm.entity;
    }

    if ( config.path && this.entity ) {
      this.path = `${config.path}/${this.entity}`;
      this.host = `${this._urlBase}${this.path}/odms`;
    }
  }



  public queryFiles( workspace: any, kv?: Object, av?: Array<string> ): Observable<any> {
    //Build request data
    const data: any = {
      filter:{
        workspace: workspace.name,
        data: workspace.data,
        delimiter: FileManagerS3Service.ROOT
      }
    };

    if( kv[ FileManagerS3Service.KV_FOLDER_KEY ] ) {
      data.filter[ FileManagerS3Service.FILTER_KEY ] = kv[ FileManagerS3Service.KV_FOLDER_KEY ];
    }
    else{
      data.filter[ FileManagerS3Service.FILTER_PREFIX ] = FileManagerS3Service.ROOT;
      data.filter[ FileManagerS3Service.FILTER_DELIMITER ] = FileManagerS3Service.ROOT;
    }

    return this.queryFilesHelper( data );
  }

  private queryFilesHelper( data: any ): Observable<any> {
    //Build request
    const url: string = `${this.host}/find`;
    const body: string = JSON.stringify( data );
    const headers: HttpHeaders = new HttpHeaders({
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json;charset=UTF-8'
    });

    let _innerObserver: any;
    const result: Observable<any> = new Observable( observer => _innerObserver = observer ).pipe( share() );
    const request: HttpRequest<string> = new HttpRequest( 'POST', url, body, { headers } );

    //Request
    this.httpClient
      .request( request )
      .pipe( filter( response => HttpEventType.Response === response.type ))
      .subscribe(( response: HttpResponse<any> ) => {
        const body: any = response && response.body ? this.map( response.body ) : null;
        if( body ){
          //Process body to return a valid service response
          const responseCode: number = body[ FileManagerS3Service.RESPONSE_KEY_CODE ];
          const responseMessage: string = body[ FileManagerS3Service.RESPONSE_KEY_MESSAGE ];
          const responseData: FileClass[] = body[ FileManagerS3Service.RESPONSE_KEY_DATA ];
          const serviceResponse: ServiceResponse = new OntimizeServiceResponse( responseCode, responseData, responseMessage );
          _innerObserver.next( serviceResponse );
        }
        else {
          _innerObserver.error( response );
        }
      }, error => {
        this.manageError( error, _innerObserver );
      }, () => _innerObserver.complete());

    return result;
  }



  public download( workspace: any, files: FileClass[] ): Observable<any> {
    //Check if there is more than one file
    const file: FileClass = files[0];
    if ( files.length > 1 || file.directory ) {
      return this.downloadMultiple( workspace, files );
    }

    //Build request data
    const data: any = {
      filter:{
        workspace: workspace.name,
        data: workspace.data
      }
    };

    //Build request
    const id: string = btoa( file.id );
    const dataEncoded: string = encodeURIComponent( JSON.stringify( data ) );
    const url: string = `${this.host}/download/id/${id}?data=${dataEncoded}`;
    const headers: HttpHeaders = new HttpHeaders({
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json;charset=UTF-8'
    });

    let _innerObserver: any;
    const result: Observable<any> = new Observable( observer => _innerObserver = observer ).pipe( share() );
    const request: HttpRequest<string> = new HttpRequest( 'GET', url, null, {
      headers: headers,
      reportProgress: true,
      responseType: 'blob'
    });

    //Request
    this.httpClient
      .request( request )
      .subscribe( response => {
        if ( HttpEventType.DownloadProgress === response.type ) {
          let progressData: any = {
            loaded: response.loaded
          };
          _innerObserver.next( progressData );
        }
        else if ( HttpEventType.Response === response.type ) {
          const body: any = response && response.body ? response.body : null;
          if ( body ) {
            const contentDispositionHeader: string = response.headers.get( 'content-disposition' );
            const fileName = contentDispositionHeader ? contentDispositionHeader.split( ';' )[1].split( '=' )[1].replace( /"/g, '' ) : file.name;
            this.createDownloadLink( body, fileName );
            _innerObserver.next( response );
          }
          else {
            _innerObserver.error( body );
          }
        }
      }, error => {
        this.manageError( error, _innerObserver );
      }, () => _innerObserver.complete());

    return result;
  }



  public downloadMultiple( workspace: any, files: FileClass[] ): Observable<any> {
    //Build request data
    const keys: string[] = [];
    files.forEach( target => keys.push( target.id ));

    const data: any = {
      filter:{
        workspace: workspace.name,
        data: workspace.data,
        key: keys
      }
    };

    //Build request
    const url: string = `${this.host}/download`;
    const body: string = JSON.stringify( data );
    const headers: HttpHeaders = new HttpHeaders({
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json;charset=UTF-8'
    });

    let _innerObserver: any;
    const result: Observable<any> = new Observable( observer => _innerObserver = observer ).pipe( share() );
    const request: HttpRequest<string> = new HttpRequest( 'POST', url, body, {
      headers: headers,
      reportProgress: true,
      responseType: 'blob'
    });

    //Request
    this.httpClient
      .request( request )
      .subscribe( response => {
        if ( HttpEventType.DownloadProgress === response.type ) {
          let progressData: any = {
            loaded: response.loaded
          };
          _innerObserver.next( progressData );
        }
        else if ( HttpEventType.Response === response.type ) {
          const body: any = response && response.body ? response.body : null;
          if ( body ) {
            const contentDispositionHeader: string = response.headers.get( 'content-disposition' );
            const fileName = contentDispositionHeader ? contentDispositionHeader.split( ';' )[1].split( '=' )[1].replace( /"/g, '' ) : 'data.zip';
            this.createDownloadLink( body, fileName );
            _innerObserver.next( response );
          }
          else {
            _innerObserver.error( body );
          }
        }
      }, error => {
        this.manageError( error, _innerObserver );
      }, () => _innerObserver.complete());

    return result;
  }



  public copy( workspace: any, currentFolder: string, targetFolder: string, items: FileClass[] ): Observable<any> {
      let _innerObserver: any;
      const result: Observable<any> = new Observable( observer => _innerObserver = observer ).pipe( share() );

      this.copyAllHelper( workspace, currentFolder, targetFolder, items ).then( copyAllResponse => {
        forkJoin( copyAllResponse ).subscribe( ( response: any ) => {
          _innerObserver.next( response );
        }, error => {
          this.manageError( error, _innerObserver );
        }, () => _innerObserver.complete());
      });

      return result;
  }

  public async copyAllHelper( workspace: any, currentFolder: string, targetFolder: string, items: FileClass[] ): Promise<Observable<any>[]>{
    const responses: Observable<any>[] = [];

    for (let i = 0; i < items.length; i++) {
      const item: FileClass = items[i];

      if (item.directory) {
        const data: any = {
          filter: {
            workspace: workspace.name,
            data: workspace.data,
            key: item.id,
          },
        };

        const queryResponse = await this.queryFilesHelper(data).toPromise();
        const copyAllResponse = await this.copyAllHelper(workspace, currentFolder, targetFolder, queryResponse.data);
        responses.push( ...copyAllResponse );
      } else {
        const response = this.copyFileHelper(workspace, currentFolder, targetFolder, item);
        responses.push(response);
      }
    }

    return Promise.all(responses);
  }

  private copyFileHelper( workspace: any, currentFolder: string, targetFolder: string, file: FileClass ): Observable<any> {
    //Build targetFolder
    targetFolder = targetFolder.replace( new RegExp( `${file.name}$` ), '' );
    if( !targetFolder.endsWith( '/' )) targetFolder = `${targetFolder}/`;

    //Build prefix
    let prefix: string = null;
    if( currentFolder === '/' ) prefix = file.directoryPath.replace( new RegExp( `^${currentFolder}` ), targetFolder );
    else{
      prefix = file.id.replace( new RegExp( `^${currentFolder}` ), targetFolder ).replace( new RegExp( `${file.name}$` ), '' );
    }

    //Build request data
    const data: any = {
      filter:{
        workspace: workspace.name,
        data: workspace.data,
        key: file.id
      },
      data: {
        prefix: prefix,
        fileName: file.name
      }
    };

    //Build request
    const url: string = `${this.host}/copy`;
    const body: string = JSON.stringify( data );
    const headers: HttpHeaders = new HttpHeaders({
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json;charset=UTF-8'
    });

    let _innerObserver: any;
    const result: Observable<any> = new Observable( observer => _innerObserver = observer ).pipe( share() );
    const request: HttpRequest<string> = new HttpRequest( 'PUT', url, body, { headers } );

    //Request
    this.httpClient
      .request( request )
      .pipe( filter( response => HttpEventType.Response === response.type ))
      .subscribe( ( response: HttpResponse<any> ) => {
        _innerObserver.next( response );
      }, error => {
        this.manageError( error, _innerObserver );
      }, () => _innerObserver.complete());

    return result;
  }



  public move( workspace: any, currentFolder: string, targetFolder: string, items: FileClass[] ): Observable<any> {
    let _innerObserver: any;
    const result: Observable<any> = new Observable( observer => _innerObserver = observer ).pipe( share() );

    this.copy( workspace, currentFolder, targetFolder, items ).subscribe( ( copyResponse: any ) => {
      if( copyResponse.find( target => target.body.code !== 0 ) == null ){
        _innerObserver.next(this.deleteFiles( workspace, items ));
      }
    }, error => {
      this.manageError( error, _innerObserver );
    }, () => _innerObserver.complete());

    return result;
}



  public upload( workspace: any, folderId: any, files: any[] ): Observable<any> {
    //Build folderId
    let folder: string = FileManagerS3Service.ROOT;
    if( folderId != null ) folder = folderId;
    if( !folder.endsWith( '/' )) folder = `${folder}/`;

    //Build request data
    const data: any = {
      filter:{
        workspace: workspace.name,
        data: workspace.data
      },
      data:{
        prefix: folder,
      }
    };

    //Build request
    const url: string = `${this.host}/upload`;
    const headers: HttpHeaders = new HttpHeaders({
      'Access-Control-Allow-Origin': '*'
    });

    let _innerObserver: any;
    const result = new Observable(observer => _innerObserver = observer).pipe(share());

    let toUpload: any = new FormData();
    files.forEach(item => {
      item.prepareToUpload();
      item.isUploading = true;
      if( folder === '/' ) data.data[ FileManagerS3Service.DATA_PREFIX ] = `${folder}${item.file.name}`;
      else data.data = { key: `${folder}${item.file.name}` };
      toUpload.append( 'data', JSON.stringify( data ) );
      toUpload.append( 'file', item.file );
    });

    const request = new HttpRequest('POST', url, toUpload, {
      headers: headers,
      reportProgress: true
    });

    //Request
    const httpSubscription =
      this.httpClient
        .request( request )
        .subscribe( response => {
          if ( HttpEventType.UploadProgress === response.type ) {
            const progressData = {
              loaded: response.loaded,
              total: response.total
            };
            _innerObserver.next( progressData );
          }
          else if ( HttpEventType.Response === response.type ) {
            const body: any = response && response.body ? response.body : null;
            if ( body ) {
              _innerObserver.next( body );
            }
            else {
              _innerObserver.error( response );
            }
          }
        }, error => {
          this.manageError(error, _innerObserver);
        }, () => _innerObserver.complete());

    files.forEach( item => {
      item._uploadSuscription = httpSubscription;
    });

    return result;
  }



  public deleteFiles( workspace: any, files: FileClass[] ): Observable<any> {
    //Build request data
    const keys: string[] = [];
    if( files ) files.forEach( target => keys.push( target.id ));

    const data: any = {
      filter:{
        workspace: workspace.name,
        data: workspace.data,
        key: keys
      }
    };

    //Build request
    const url: string = `${this.host}/delete`;
    const body: string = JSON.stringify( data );
    const headers: HttpHeaders = new HttpHeaders({
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json;charset=UTF-8'
    });

    let _innerObserver: any;
    const result: Observable<any> = new Observable( observer => _innerObserver = observer ).pipe( share() );
    const request: HttpRequest<string> = new HttpRequest( 'DELETE', url, body, { headers } );

    //Request
    this.httpClient
      .request( request )
      .pipe( filter( response => HttpEventType.Response === response.type ))
      .subscribe( ( response: HttpResponse<any> ) => {
        _innerObserver.next( response );
      }, error => {
        this.manageError( error, _innerObserver );
      }, () => _innerObserver.complete());

    return result;
  }



  public insertFolder( workspace: any, name: any, kv?: Object ): Observable<any> {
    //Build request data
    const data: any = {
      filter:{
        workspace: workspace.name,
        data: workspace.data
      },
      data: {
        prefix: `${FileManagerS3Service.ROOT}${name}`
      }
    };

    if( kv[ FileManagerS3Service.KV_FOLDER_KEY ] ) data.data = { key: `${kv[ FileManagerS3Service.KV_FOLDER_KEY ]}${name}`};

    //Build request
    const url: string = `${this.host}/create`;
    const body: string = JSON.stringify( data );
    const headers: HttpHeaders = new HttpHeaders({
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json;charset=UTF-8'
    });

    let _innerObserver: any;
    const result: Observable<any> = new Observable( observer => _innerObserver = observer ).pipe( share() );
    const request: HttpRequest<string> = new HttpRequest( 'POST', url, body, { headers } );

    //Request
    this.httpClient
      .request( request )
      .pipe( filter( response => HttpEventType.Response === response.type ))
      .subscribe( ( response: HttpResponse<any> ) => {
        _innerObserver.next( response );
      }, error => {
        this.manageError( error, _innerObserver );
      }, () => _innerObserver.complete());

    return result;
  }



  public changeFileName( workspace: any, name: string, file: FileClass ): Observable<any> {
    if( !file.directory ) return this.changeFileNameHelper( workspace, name, file );
    const newFolder: string = `${file.directoryPath}${name}`;
    const kv: any = {};
    kv[ FileManagerS3Service.KV_FOLDER_KEY ] = file.directoryPath;
    let _innerObserver: any;
    const result: Observable<any> = new Observable( observer => _innerObserver = observer ).pipe( share() );
    this.insertFolder( workspace, name, kv )
      .pipe( switchMap( response => this.move( workspace, file.directoryPath, newFolder, [file] )))
      .subscribe( (response : any ) => {
        response.subscribe( target => _innerObserver.next( target ), error => {}, () => _innerObserver.complete() );
      }, error => {
        this.manageError( error, _innerObserver );
      }, () => _innerObserver.complete());
    return result;
  }

  private changeFileNameHelper( workspace: any, name: string, file: FileClass ): Observable<any> {
    //Build request data
    const keyParts: string[] = file.id.split( '/' );
    let newKey: string = name;
    if( keyParts.length > 1 ){
      newKey = '';
      for( let i = 0 ; i < keyParts.length - 1 ; i++ ){
        newKey = `${newKey}${keyParts[ i ]}/`;
      }
      newKey = `${newKey}${name}`;
    }

    const data: any = {
      filter:{
        workspace: workspace.name,
        data: workspace.data,
        key: file.id
      },
      data: {
        key: newKey
      }
    };

    //Build request
    const url: string = `${this.host}/update`;
    const body: string = JSON.stringify( data );
    const headers: HttpHeaders = new HttpHeaders({
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json;charset=UTF-8'
    });

    let _innerObserver: any;
    const result: Observable<any> = new Observable( observer => _innerObserver = observer ).pipe( share() );
    const request: HttpRequest<string> = new HttpRequest( 'PUT', url, body, { headers } );


    //Request
    this.httpClient
      .request( request )
      .pipe( filter( response => HttpEventType.Response === response.type ))
      .subscribe( ( response: HttpResponse<any> ) => {
        _innerObserver.next( response );
      }, error => {
        this.manageError( error, _innerObserver );
      }, () => _innerObserver.complete());

    return result;
  }

// ------------------------------------------------------------------------------------------------------ \\
// -----| Utility Methods |------------------------------------------------------------------------------ \\
// ------------------------------------------------------------------------------------------------------ \\

  private createDownloadLink( body: any, name: string ) {
    const url: string = URL.createObjectURL( body );
    const a: HTMLAnchorElement = document.createElement( 'a' );
    a.href = url;
    a.download = name;
    a.click();
  }



  private manageError( error: any, observer: any ): void {
    if ( error.status === 401 ) {
      this.authService.logout();
    } else {
      observer.error(error);
    }
  }



  private map( body: any ): any {
    const data: any[] = body[ FileManagerS3Service.RESPONSE_KEY_DATA ];
    const newData: FileClass[] = [];

    if( data != null && data instanceof Array ){
      data.forEach( target => {
        const file: any = {
          id: target.key,
          name: target.name,
          size: target.size,
          directory: target.folder,
          directoryPath: target.relativePrefix,
          path: target.relativeKey
        }
        newData.push( new FileClass( file ) );
      });
    }

    body[ FileManagerS3Service.RESPONSE_KEY_DATA ] = newData;
    return body;
  }

// ------------------------------------------------------------------------------------------------------ \\

}
