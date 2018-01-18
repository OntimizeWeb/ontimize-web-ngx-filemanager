import { OFileUploader } from 'ontimize-web-ngx/ontimize/components/input/file-input/o-file-uploader.class';
import { OFileItem } from 'ontimize-web-ngx/ontimize/components/input/file-input/o-file-item.class';

export class OFileUploaderExtended extends OFileUploader {

  /**
   * Uploads a single file on a single request.
   * @param item the file to upload
   */
  public uploadItem(item: OFileItem): void {
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

    var self = this;
    this._uploadSuscription = item._uploadSuscription = this.service.upload([item], this.entity, this.data).subscribe(
      resp => {
        if (resp.loaded && resp.total) {
          let progress = Math.round(resp.loaded * 100 / resp.total);
          self._onProgressItem(item, progress);
        } else if (resp.documentId && resp.fileId && resp.versionId) {
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
