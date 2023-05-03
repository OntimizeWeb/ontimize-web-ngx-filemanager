import { Observable } from 'rxjs';
import { FileClass } from '../../util';
import { OntimizeEEService } from 'ontimize-web-ngx';


export interface FileManagerService extends OntimizeEEService{

  configureService( config: any ): void;
  queryFiles( workspace: any, kv?: Object, av?: Array<string> ): Observable<any>;
  download( workspace: any, files: FileClass[] ): Observable<any>;
  downloadMultiple( workspace: any, files: FileClass[] ): Observable<any>;
  copy( workspace: any, currentFolder: string, targetFolder: string, items: FileClass[] ): Observable<any>;
  move( workspace: any, currentFolder: string, targetFolder: string, items: FileClass[] ): Observable<any>;
  upload( workspace: any, folderId: any, files: any[] ): Observable<any>;
  deleteFiles( workspace: any, files: FileClass[] ): Observable<any>;
  insertFolder( workspace: any, name: any, kv?: Object ): Observable<any>;
  changeFileName( workspace: any, name: string, file: FileClass ): Observable<any>;
}
