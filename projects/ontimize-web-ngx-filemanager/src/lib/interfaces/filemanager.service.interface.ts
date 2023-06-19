import { OntimizeEEService } from 'ontimize-web-ngx';
import { Observable } from 'rxjs';

import { FileClass } from '../util';


/**
 * Interface that extends the OntimizeEEService and defines the contract for a file manager service.
 *
 * @see OntimizeEEService
 */
export interface IFileManagerService extends OntimizeEEService{

  /**
   * Configures the service with the provided configuration.
   *
   * @param config The configuration object for the service.
   */
  configureService( config: any ): void;


  /**
   * Retrieves files from the specified workspace based on the provided key-value pairs and attributes.
   *
   * @param workspace The workspace to query files from.
   * @param kv (Optional) Key-value pairs.
   * @param av (Optional) Attributes to retrieve for the files.
   *
   * @returns An Observable emitting the query results.
   */
  queryItems( workspace: any, kv?: Object, av?: Array<string> ): Observable<any>;


  /**
   * Downloads the specified files from the provided workspace.
   *
   * @param workspace The workspace to download files from.
   * @param files An array of FileClass objects representing the files to download.
   *
   * @returns An Observable emitting the download results.
   */
  download( workspace: any, files: FileClass[] ): Observable<any>;

  /**
   * Downloads multiple files from the provided workspace.
   *
   * @param workspace The workspace to download files from.
   * @param files An array of FileClass objects representing the files to download.
   *
   * @returns An Observable emitting the download results.
   */
  downloadMultiple( workspace: any, files: FileClass[] ): Observable<any>;

  /**
   * Uploads the specified files to the provided workspace and folder.
   *
   * @param workspace The workspace to upload files to.
   * @param folderId The ID of the folder to upload files to.
   * @param files An array of files to upload.
   *
   * @returns An Observable emitting the upload results.
   */
  upload( workspace: any, folderId: any, files: any[] ): Observable<any>;

  /**
   * Changes the name of a file or directory in the specified workspace.
   *
   * @param workspace The workspace where the file resides.
   * @param name The new name for the file.
   * @param item The FileClass object representing the file to rename.
   *
   * @returns An Observable emitting the result of the name change operation.
   */
  changeItemName( workspace: any, name: string, item: FileClass ): Observable<any>;

  /**
   * Deletes the specified files or directories from the provided workspace.
   *
   * @param workspace The workspace from which to delete files.
   * @param items An array of FileClass objects representing the files to delete.
   *
   * @returns An Observable emitting the result of the file deletion operation.
   */
  deleteItems( workspace: any, items: FileClass[] ): Observable<any>;

  /**
   * Inserts a new folder in the specified workspace with the provided name.
   *
   * @param workspace The workspace where the folder will be inserted.
   * @param name The name of the new folder.
   * @param kv (Optional) Key-value pairs.
   *
   * @returns An Observable emitting the result of the folder insertion operation.
   */
  insertFolder( workspace: any, name: any, kv?: Object ): Observable<any>;

  /**
   * Copies the specified items (files and folders) to the provided destination folder in the workspace.
   *
   * @param workspace The workspace where the items exist and will be copied from.
   * @param items An array of FileClass objects representing the items to copy.
   * @param folder The destination folder where the items will be copied to.
   * @param kv (Optional) Key-value pairs.
   *
   * @returns An Observable emitting the result of the copy operation.
   */
  copyItems( workspace: any, items: FileClass[], folder: string, kv?: Object ): Observable<any>;

  /**
   * Moves the specified items (files and folders) to the provided destination folder in the workspace.
   *
   * @param workspace The workspace where the items exist and will be moved from.
   * @param items An array of FileClass objects representing the items to move.
   * @param folder The destination folder where the items will be moved to.
   * @param kv (Optional) Key-value pairs.
   *
   * @returns An Observable emitting the result of the move operation.
   */
  moveItems( workspace: any, items: FileClass[], folder: string, kv?: Object ): Observable<any>;
}
