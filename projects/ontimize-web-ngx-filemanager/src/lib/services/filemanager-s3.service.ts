import { HttpClient, HttpEventType, HttpHeaders, HttpRequest, HttpResponse } from '@angular/common/http';
import { Injectable, Injector } from '@angular/core';
import { Observable, OntimizeEEService, OntimizeServiceResponse, ServiceResponse } from 'ontimize-web-ngx';

import { FileClass } from '../util';
import { IFileManagerService } from './filemanager.service.interface';
import { OFileManagerTableComponent } from '../components';
import { filter, share } from 'rxjs/operators';



/**
 * A service class that provides file management functionality using S3 as the underlying storage.
 * Extends the OntimizeEEService and implements the FileManagerService interface.
 *
 * @see OntimizeEEService
 * @see FileManagerService
 */
@Injectable()
export class FileManagerS3Service extends OntimizeEEService implements IFileManagerService {

  //Constants
  private static SYMBOL_SLASH : string = '/';
  private static SYMBOL_ALL : string = '*';
  private static HTTP_HEADER_CONTENT_TYPE_JSON_VALUE : string = 'application/json;charset=UTF-8';
  private static FORMDATA_DATA : string = 'data';
  private static FORMDATA_FILE : string = 'file';

  private static KV_FOLDER_KEY: string = 'FM_FOLDER_PARENT_KEY';

  private static ROOT: string = FileManagerS3Service.SYMBOL_SLASH;

  private static FILTER_KEY: string = 'key';
  private static FILTER_PREFIX: string = 'prefix';
  private static FILTER_DELIMITER: string = 'delimiter';

  private static DATA_PREFIX: string = 'prefix';
  private static DATA_NAME: string = 'fileName';
  private static DATA_CURRENT_PREFIX: string = 'currentPrefix';

  private static RESPONSE_KEY_CODE: string = 'code';
  private static RESPONSE_KEY_MESSAGE: string = 'message';
  private static RESPONSE_KEY_DATA: string = 'data';

  private static HEADER_CONTENT_DISPOSITION : string = 'content-disposition';

  private static HTTP_GET : string = 'GET';
  private static HTTP_POST : string = 'POST';
  private static HTTP_PUT : string = 'PUT';
  private static HTTP_DELETE : string = 'DELETE';

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

    if ( config && config.path && component ) {
      this.entity = component.oForm.entity;
      this.path = `${config.path}/${this.entity}`;
      this.host = `${this._urlBase}${this.path}/sdms`;
    }
  }

// ------------------------------------------------------------------------------------------------------ \\

  public queryItems( workspace: any, kv?: Object, av?: Array<string> ): Observable<any> {
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

    //Build request
    const url: string = `${this.host}/find`;
    const body: string = JSON.stringify( data );
    const headers: HttpHeaders = this.getHeaders();
    const request: HttpRequest<string> = new HttpRequest( FileManagerS3Service.HTTP_POST, url, body, { headers } );

    //Request
    return this.simpleRequest( request );
  }

// ------------------------------------------------------------------------------------------------------ \\

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
    const headers: HttpHeaders = this.getHeaders();
    const request: HttpRequest<string> = new HttpRequest( FileManagerS3Service.HTTP_GET, url, null, {
      headers: headers,
      reportProgress: true,
      responseType: 'blob'
    });

    //Request
    return this.downloadRequest( request, file.name );
  }

// ------------------------------------------------------------------------------------------------------ \\

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
    const headers: HttpHeaders = this.getHeaders();
    const request: HttpRequest<string> = new HttpRequest( FileManagerS3Service.HTTP_POST, url, body, {
      headers: headers,
      reportProgress: true,
      responseType: 'blob'
    });

    //Request
    return this.downloadRequest( request, 'data.zip' );
  }

// ------------------------------------------------------------------------------------------------------ \\

  public upload( workspace: any, folderId: any, files: any[] ): Observable<any> {
    //Initialize result
    let _innerObserver: any;
    const result: Observable<any> = new Observable( observer => _innerObserver = observer ).pipe( share() );

    //Build folderId
    let folder: string = FileManagerS3Service.ROOT;
    if( folderId != null ) folder = folderId;
    if( !folder.endsWith( FileManagerS3Service.SYMBOL_SLASH )) folder = `${folder}${FileManagerS3Service.SYMBOL_SLASH }`;

    //Build request data
    const data: any = {
      filter:{
        workspace: workspace.name,
        data: workspace.data
      },
      data:{}
    };

    //Build request
    const url: string = `${this.host}/upload`;
    const formData: any = new FormData();
    files.forEach(item => {
      item.prepareToUpload();
      item.isUploading = true;

      if( folder === '/' ){
        data.data[ FileManagerS3Service.DATA_PREFIX ] = folder;
        data.data[ FileManagerS3Service.DATA_NAME ] = item.file.name;
      }
      else data.data = { key: `${folder}${item.file.name}` };

      formData.append( FileManagerS3Service.FORMDATA_DATA, JSON.stringify( data ) );
      formData.append( FileManagerS3Service.FORMDATA_FILE, item.file );
    });
    const headers: HttpHeaders = this.getHeaders();
    const request = new HttpRequest( FileManagerS3Service.HTTP_POST, url, formData, {
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
            const body: any = response.body;
            if ( body ) {
              this.mapDataBodyToFileClass( body );
              _innerObserver.next( body );
            }
            else {
              this.errorHandler( response, _innerObserver );
            }
          }
        }, error => {
          this.errorHandler(error, _innerObserver);
        }, () => _innerObserver.complete());

      files.forEach( item => {
      item._uploadSuscription = httpSubscription;
    });

    return result;
  }

// ------------------------------------------------------------------------------------------------------ \\

  public deleteItems( workspace: any, files: FileClass[] ): Observable<any> {
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
    const headers: HttpHeaders = this.getHeaders();
    const request: HttpRequest<string> = new HttpRequest( FileManagerS3Service.HTTP_DELETE, url, body, { headers } );

    //Request
    return this.simpleRequest( request );
  }

// ------------------------------------------------------------------------------------------------------ \\

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
    const headers: HttpHeaders = this.getHeaders();
    const request: HttpRequest<string> = new HttpRequest( FileManagerS3Service.HTTP_POST, url, body, { headers } );

    //Request
    return this.simpleRequest( request );
  }

// ------------------------------------------------------------------------------------------------------ \\

  public changeItemName( workspace: any, name: string, file: FileClass ): Observable<any> {
    //Check if it's a directory
    if( file.directory ) return this.changeFolderNameHelper( workspace, name, file );

    //Build request data
    const keyParts: string[] = file.id.split( FileManagerS3Service.SYMBOL_SLASH );
    let newKey: string = name;
    if( keyParts.length > 1 ){
      newKey = '';
      for( let i = 0 ; i < keyParts.length - 1 ; i++ ){
        newKey = `${newKey}${keyParts[ i ]}${FileManagerS3Service.SYMBOL_SLASH}`;
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
    const headers: HttpHeaders = this.getHeaders();
    const request: HttpRequest<string> = new HttpRequest( FileManagerS3Service.HTTP_PUT, url, body, { headers } );

    //Request
    return this.simpleRequest( request );
  }



  /**
   * Helper method to change the name of a folder in a workspace.
   *
   * @param workspace - The workspace where the folder belongs.
   * @param name - The new name for the folder.
   * @param folder - The folder to be renamed.
   *
   * @returns An Observable that emits the result of the folder name change operation.
   */
  private changeFolderNameHelper( workspace: any, name: string, folder: FileClass ): Observable<any> {
    //Initialize result
    let _innerObserver: any;
    const result: Observable<any> = new Observable( observer => _innerObserver = observer ).pipe( share() );

    //Build new Prefix
    let newPrefix: string = `${folder.directoryPath}${name}`;
    const kv: any = { FM_FOLDER_PARENT_KEY: folder.id };

    if( folder && folder.path === newPrefix ) return _innerObserver;

    //Move items
    this.moveItems( workspace, [ folder ], newPrefix, kv ).subscribe( moveResponse => {
      if( moveResponse ){
        //Delete old items
        this.deleteItems( workspace, [ folder ] ).subscribe( deleteResponse => {
          if( deleteResponse ){
            _innerObserver.next( this.createServiceResponseFromBody( deleteResponse ));
          }
          else {
            this.errorHandler( deleteResponse, _innerObserver );
          }
        }, error => {
          this.errorHandler( error, _innerObserver );
        }, () => _innerObserver.complete());
      }
      else {
        this.errorHandler( moveResponse, _innerObserver );
      }
    }, error => {
      this.errorHandler( error, _innerObserver );
    }, () => _innerObserver.complete());

    return result;
  }

// ------------------------------------------------------------------------------------------------------ \\

  public copyItems( workspace: any, items: FileClass[], folder: string, kv?: Object ): Observable<any> {
    const url: string = `${this.host}/copy`;
    return this.copyAndMoveItemsHelper( url, workspace, items, folder, kv );
  }

  public moveItems( workspace: any, items: FileClass[], folder: string, kv?: Object ): Observable<any> {
    const url: string = `${this.host}/move`;
    return this.copyAndMoveItemsHelper( url, workspace, items, folder, kv );
  }

  private copyAndMoveItemsHelper( url: string, workspace: any, items: FileClass[], folder: string, kv?: Object ): Observable<any> {
    //Build request data
    let keys: string[] = [];
    items.forEach( target => keys.push( target.id ))

    if( !folder.endsWith( FileManagerS3Service.SYMBOL_SLASH )) folder = `${folder}${FileManagerS3Service.SYMBOL_SLASH}`;

    const data: any = {
      filter:{
        workspace: workspace.name,
        data: workspace.data,
        key: keys
      },
      data: {}
    };

    if( keys.length === 1 && !items[0].directory ){
      let file: FileClass = items[ 0 ];
      data.data[ FileManagerS3Service.DATA_PREFIX ] = folder;
      data.data[ FileManagerS3Service.DATA_NAME ] = file.name;
    }
    else if( keys.length > 0 ){
      let currentFolder: string = FileManagerS3Service.ROOT;
      if( kv[ FileManagerS3Service.KV_FOLDER_KEY ] ) currentFolder = kv[ FileManagerS3Service.KV_FOLDER_KEY ];
      data.data[ FileManagerS3Service.DATA_PREFIX ] = folder;
      data.data[ FileManagerS3Service.DATA_CURRENT_PREFIX ] = currentFolder;
    }


    //Build request
    const body: string = JSON.stringify( data );
    const headers: HttpHeaders = this.getHeaders();
    const request: HttpRequest<string> = new HttpRequest( FileManagerS3Service.HTTP_PUT, url, body, { headers } );

    //Request
    return this.simpleRequest( request );
  }

// ------------------------------------------------------------------------------------------------------ \\
// -----| Utility Methods |------------------------------------------------------------------------------ \\
// ------------------------------------------------------------------------------------------------------ \\

  /**
   * Retrieves the file name from the headers if it exists.
   *
   * @param headers The HTTP request headers.
   * @param fileNameDefault (Optional) Default file name to use if not found in the headers.
   *
   * @returns The file name extracted from the headers, or the default file name if not found in the headers.
   */
  private getFileNameFromHeadersIfExists( headers: any, fileNameDefault?: string ): string{
    //Initialize result
    let result: string = fileNameDefault;

    //Check if there are headers
    if( !headers ) return result;

    //Get content disposition header
    const contentDispositionHeader: string = headers.get( FileManagerS3Service.HEADER_CONTENT_DISPOSITION );

    //Check if content disposition header exists
    if( contentDispositionHeader ){
      result = contentDispositionHeader.split( ';' )[1].split( '=' )[1].replace( /"/g, '' );
    }

    return result;
  }



  /**
   * Creates a download link for the provided file body with the specified name.
   *
   * @param body The file body or data.
   * @param name The desired file name for the download.
   */
  private createDownloadLink( body: any, name: string ): void {
    //Create link
    const url: string = URL.createObjectURL( body );
    const a: HTMLAnchorElement = document.createElement( 'a' );
    a.href = url;
    a.download = name;

    //Download
    a.click();
  }



  /**
   * Handles errors by performing specific actions based on the error status.
   *
   * @param error The error object or response.
   * @param observer The observer to notify in case of an error.
   */
  private errorHandler( error: any, observer: any ): void {
    observer.error(error);
  }



  /**
   * Creates a service response object from the provided response body.
   *
   * @param body The response body containing the response code, message, and data.
   * @returns A ServiceResponse object created from the response body.
   */
  private createServiceResponseFromBody( body: any ): ServiceResponse{
    //Get Data from body
    const responseCode: number = body[ FileManagerS3Service.RESPONSE_KEY_CODE ];
    const responseMessage: string = body[ FileManagerS3Service.RESPONSE_KEY_MESSAGE ];
    const responseData: FileClass[] = body[ FileManagerS3Service.RESPONSE_KEY_DATA ];

    //Create a new ServiceResponse
    return new OntimizeServiceResponse( responseCode, responseData, responseMessage );
  }



  /**
   * Maps the data in the response body to an array of FileClass objects.
   * @param body The response body containing the data to be mapped.
   */
  private mapDataBodyToFileClass( body: any ): void {
    if( body && body[ FileManagerS3Service.RESPONSE_KEY_DATA ] ){
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
    }
  }


  /**
   * Performs a simple request and returns an Observable that emits the response.
   *
   * @param request - HttpRequest object representing the request.
   *
   * @returns An Observable that emits the response of the request.
   */
  private simpleRequest( request: HttpRequest<string> ): Observable<any>{
    let _innerObserver: any;
    const result: Observable<any> = new Observable( observer => _innerObserver = observer ).pipe( share() );

    //Request
    this.httpClient
      .request( request )
      .pipe( filter( response => HttpEventType.Response === response.type ))
      .subscribe( ( response: HttpResponse<any> ) => {
        const body: any = response.body;
        if ( body ) {
          this.mapDataBodyToFileClass( body );
          _innerObserver.next( this.createServiceResponseFromBody( body ));
        }
        else {
          this.errorHandler( response, _innerObserver );
        }
      }, error => {
        this.errorHandler( error, _innerObserver );
      }, () => _innerObserver.complete());

    return result;
  }


  /**
   * Performs a download request and returns an Observable that emits the response.
   *
   * @param request - HttpRequest object representing the request.
   * @param fileNameDefault - Default file name to be used for the downloaded file.
   *
   * @returns An Observable that emits the response of the request.
   */
  private downloadRequest( request: HttpRequest<string>, fileNameDefault: string ): Observable<any>{
    let _innerObserver: any;
    const result: Observable<any> = new Observable( observer => _innerObserver = observer ).pipe( share() );

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
          const body: any = response.body;
          if ( body ) {
            this.mapDataBodyToFileClass( body );
            const fileName = this.getFileNameFromHeadersIfExists( response.headers, fileNameDefault );
            this.createDownloadLink( body, fileName );
            _innerObserver.next( response );
          }
          else {
            this.errorHandler( body, _innerObserver );
          }
        }
      }, error => {
        this.errorHandler( error, _innerObserver );
      }, () => _innerObserver.complete());

    return result;
  }


  private getHeaders(): HttpHeaders{
    return new HttpHeaders({
      'Access-Control-Allow-Origin': FileManagerS3Service.SYMBOL_ALL,
      'Content-Type': FileManagerS3Service.HTTP_HEADER_CONTENT_TYPE_JSON_VALUE
    });
  }

// ------------------------------------------------------------------------------------------------------ \\

}
