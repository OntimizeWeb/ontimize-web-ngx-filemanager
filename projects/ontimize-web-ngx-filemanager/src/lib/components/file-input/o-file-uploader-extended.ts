import { IFileService, OFileItem, OFileUploader, OFormComponent } from 'ontimize-web-ngx';

import { FileManagerService } from '../../services/filemanager/filemanager.service';
import { WorkspaceService } from '../../services/workspace.service';

export class OFileUploaderExtended extends OFileUploader {

  protected form: OFormComponent;
  parentKey: string;
  protected filemanagerService: FileManagerService;
  protected parentItem: any;
  protected workspaceService: WorkspaceService;

  constructor(
    service: IFileService,
    entity: string,
    form: OFormComponent,
    parentKey: string,
    filemanagerService: any,
    workspaceService: WorkspaceService
  ) {
    super(service, entity);
    this.form = form;
    this.parentKey = parentKey;
    this.filemanagerService = filemanagerService;
    this.workspaceService = workspaceService;
  }

  setParentItem(val: any) {
    this.parentItem = val;
  }

  getParentItem(): any {
    return this.parentItem;
  }

  /**
   * Uploads a single file on a single request.
   * @param item the file to upload
   */
  uploadItem(item: OFileItem): void {
    item.prepareToUpload();
    if (this.isUploading || item.isUploading) {
      return;
    }
    this.isUploading = true;
    item.isUploading = true;

    this._onBeforeUploadItem(item);

    if (this.service === undefined) {
      console.warn('No service configured! aborting upload');
      return;
    }
    if (this._uploadSuscription) {
      this._uploadSuscription.unsubscribe();
    }

    const workspaceId = this.workspaceService.getWorkspace();
    let folderId;
    if (this.parentKey && this.parentItem.hasOwnProperty(this.parentKey)) {
      folderId = this.parentItem[this.parentKey];
    }

    const self = this;
    this._uploadSuscription =
      this.filemanagerService.upload(workspaceId, folderId, [item]).subscribe(resp => {
        if (resp.loaded && resp.total) {
          const progress = Math.round(resp.loaded * 100 / resp.total);
          self._onProgressItem(item, progress);
        } else if ( (resp.documentId && resp.fileId && resp.versionId) || (resp.data != null && resp.data.length > 0)) {
          self._onSuccessItem(item, resp);
        } else {
          console.log('error');
          self._onErrorItem(item, 'Unknow error');
        }
      },
        err => self._onErrorItem(item, err),
        () => self._onCompleteItem(item)
      );
  }

}
