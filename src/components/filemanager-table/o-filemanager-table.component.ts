import { AfterViewInit, Component, forwardRef, Inject, Injector, NgModule, OnDestroy, OnInit, Optional, ViewChild, ViewEncapsulation, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpEventType } from '@angular/common/http';
import { MatDialog, MatDialogConfig } from '@angular/material';
import { Subscription } from 'rxjs';
import { DialogService, InputConverter, OFormComponent, OntimizeWebModule, OSharedModule, OTranslateService } from 'ontimize-web-ngx';

import { FileClass } from '../../core/file.class';
import { DomService } from '../../services/dom.service';
import { FileManagerStateService } from '../../services/filemanager-state.service';
import { OFileManagerTranslateModule, OFileManagerTranslatePipe } from '../../core';
import { UploadProgressComponent } from '../status/upload/upload-progress.component';
import { DownloadProgressComponent } from '../status/download/download-progress.component';
import { OTableExtendedComponent, OTableExtendedModule } from './table-extended/o-table-extended.component';
import { OFileInputExtendedComponent, OFileInputExtendedModule } from '../file-input/o-file-input-extended.component';
import { OTableColumnRendererFileTypeComponent } from './renderers/filetype/o-table-column-renderer-filetype.component';
import { OTableColumnRendererFileSizeComponent } from './renderers/filesize/o-table-column-renderer-filesize.component';
import { ChangeNameDialogComponent, ChangeNameDialogData } from './table-extended/dialog/changename/change-name-dialog.component';

export const DEFAULT_INPUTS_O_FILEMANAGER_TABLE = [
  'workspaceKey: workspace-key',
  'service',
  'parentKeys: parent-keys',
  'autoHideUpload : auto-hide-upload',
  'autoHideTimeout : auto-hide-timeout',
  'serviceType : service-type',
  'newFolderButton: new-folder-button',
  'selectAllCheckbox: select-all-checkbox'
];

export const DEFAULT_OUTPUTS_O_FILEMANAGER_TABLE = [];

@Component({
  selector: 'o-filemanager-table',
  templateUrl: './o-filemanager-table.component.html',
  styleUrls: ['./o-filemanager-table.component.scss'],
  inputs: DEFAULT_INPUTS_O_FILEMANAGER_TABLE,
  outputs: DEFAULT_OUTPUTS_O_FILEMANAGER_TABLE,
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class.o-filemanager-table]': 'true'
  },
  providers: [{
    provide: FileManagerStateService,
    useClass: FileManagerStateService
  }]
})
export class OFileManagerTableComponent implements OnInit, OnDestroy, AfterViewInit {

  public static DEFAULT_SERVICE_TYPE = 'FileManagerService';

  workspaceKey: string;
  service: string;
  parentKeys: string;
  @InputConverter()
  autoHideUpload: boolean = true;
  @InputConverter()
  autoHideTimeout: number = 20000;
  serviceType: string;
  @InputConverter()
  newFolderButton: boolean = false;
  selectAllCheckbox: string;

  queryMethod: string = 'queryFiles';
  deleteMethod: string = 'deleteFiles';
  addFolderMethod: string = 'insertFolder';
  changeNameMethod: string = 'changeFileName';

  protected uploadMethod: string = 'upload';
  protected downloadMethod: string = 'download';

  protected onFormDataSubscribe: Subscription;
  protected stateService: FileManagerStateService;
  protected stateSubscription: Subscription;

  @ViewChild('oTable') oTable: OTableExtendedComponent;
  @ViewChild('oFileInput') oFileInput: OFileInputExtendedComponent;
  protected _showUploaderStatus = false;

  protected translateService: OTranslateService;
  protected translatePipe: OFileManagerTranslatePipe;
  protected onLanguageChangeSubscribe: any;

  protected dialog: MatDialog;
  protected dialogService: DialogService;
  protected doReloadQuery: boolean;

  protected domService: DomService;
  protected uploadProgressComponentRef: any;
  protected fileChangeSubscription: Subscription;

  protected downloadProgressComponentRef: any;

  constructor(
    protected injector: Injector,
    @Optional() @Inject(forwardRef(() => OFormComponent)) protected oForm: OFormComponent
  ) {
    this.translateService = this.injector.get(OTranslateService);
    this.translatePipe = new OFileManagerTranslatePipe(this.injector);
    this.stateService = this.injector.get(FileManagerStateService);
    this.dialogService = this.injector.get(DialogService);
    this.domService = this.injector.get(DomService);
    this.dialog = this.injector.get(MatDialog);

    const self = this;
    if (this.oForm) {
      this.onFormDataSubscribe = this.oForm.onDataLoaded.subscribe(function (data) {
        self.stateService.setFormParentItem(data);
      });
    }

    this.stateSubscription = this.stateService.getStateObservable().subscribe(array => {
      self.oTable.breadcrumbs = array;
    });

    this.onLanguageChangeSubscribe = this.translateService.onLanguageChanged.subscribe(() => self.translateTable());
  }

  ngOnInit() {
    if (!this.serviceType) {
      this.serviceType = OFileManagerTableComponent.DEFAULT_SERVICE_TYPE;
    }
    this.oTable.setStateService(this.stateService);
  }

  ngAfterViewInit() {
    this.oFileInput.parentKey = OTableExtendedComponent.FM_FOLDER_PARENT_KEY;
    this.oFileInput.uploader.parentKey = OTableExtendedComponent.FM_FOLDER_PARENT_KEY;

    this.translateTable();

    if (this.oFileInput) {
      this.fileChangeSubscription = this.oFileInput.onChange.subscribe(() => {
        this.showUploaderStatus = true;
        this.doReloadQuery = true;
        this.oFileInput.uploader.setParentItem(this.oTable.getParentItem());
        this.oFileInput.upload();
      });
    }
  }

  ngOnDestroy() {
    if (this.onFormDataSubscribe) {
      this.onFormDataSubscribe.unsubscribe();
    }
    if (this.stateSubscription) {
      this.stateSubscription.unsubscribe();
    }
    if (this.onLanguageChangeSubscribe) {
      this.onLanguageChangeSubscribe.unsubscribe();
    }
    this.destroyUploadProgress();
    this.destroyDownloadProgress();
    if (this.fileChangeSubscription) {
      this.fileChangeSubscription.unsubscribe();
    }
  }

  translateTable() {
    const self = this;
    this.oTable.oTableOptions.columns.forEach(col => {
      if (col.title !== undefined) {
        col.title = self.translatePipe.transform(col.attr);
      }
    });
  }

  get uploadLabel(): string {
    return this.translatePipe.transform('BUTTONS.UPLOAD');
  }

  get newFolderLabel(): string {
    return this.translatePipe.transform('BUTTONS.NEW_FOLDER');
  }

  get downloadLabel(): string {
    return this.translatePipe.transform('CONTEXT_MENU.DOWNLOAD_FILE');
  }

  get changeNameLabel(): string {
    return this.translatePipe.transform('CONTEXT_MENU.CHANGE_NAME');
  }

  get openFolderLabel(): string {
    return this.translatePipe.transform('CONTEXT_MENU.OPEN_FOLDER');
  }

  onTableDoubleClick(item: FileClass) {
    if (item === undefined || !item['directory'] || !this.oTable) {
      return;
    }
    this.oTable.clearSelection();
    this.doReloadQuery = false;
    const filter = this.stateService.getAndStoreQueryFilter({ 'FM_FOLDER_PARENT_KEY': item.id }, item);
    this.oTable.setParentItem(filter);
    this.oTable.queryData(filter);
  }

  onFileUploadClick() {
    if (this.oFileInput) {
      (this.oFileInput as any).inputFile.nativeElement.click();
    }
  }

  onUploadError() {
    if (this.uploadProgressComponentRef) {
      this.uploadProgressComponentRef.instance.title = this.translatePipe.transform('MESSAGES.UPLOADING_ERROR');
    }
  }

  onUploadedFile(arg: any) {
    if (this.uploadProgressComponentRef) {
      this.uploadProgressComponentRef.instance.title = this.translatePipe.transform('MESSAGES.UPLOADING_COMPLETED');
    }
    this.removeUploadProggressComponent();
    this.oFileInput.uploader.removeFile(arg.item);
    if (this.doReloadQuery) {
      let kv;
      if (this.stateService.stateArray && this.stateService.stateArray.length) {
        kv = this.stateService.stateArray[this.stateService.stateArray.length - 1].filter;
      }
      this.oTable.queryData(kv);
    }
  }

  onContextOpenFolder(event) {
    if (event && event.data) {
      this.onTableDoubleClick(event.data);
    }
  }

  onContextDownloadFile() {
    const tableService = this.oTable.getDataService();
    if (tableService && (this.downloadMethod in tableService) && (this.oTable.getSelectedItems().length > 0)) {
      const workspaceId = this.oForm.getDataValue(this.workspaceKey);
      const selectedItems = this.oTable.getSelectedItems();
      let downloadId = undefined;
      if (selectedItems.length > 1 || (selectedItems.length === 1 && selectedItems[0].directory)) {
        downloadId = this.generateUniqueId();
        this.showDownloaderStatus(downloadId, { filesQuantity: selectedItems.length });
      }
      const self = this;
      tableService[this.downloadMethod](workspaceId, selectedItems).subscribe(resp => {
        if (resp.subscription) {
          self.updateDownloaderStatus(downloadId, resp);
        } else if (resp.loaded && resp.total) {
          let progress = Math.round(resp.loaded * 100 / resp.total);
          self.updateDownloaderStatus(downloadId, { progress: progress });
        } else if (resp.status === 200 && resp.type === HttpEventType.Response) {
          self.updateDownloaderStatus(downloadId, {
            downloaded: true
          });
        }
      }, err => {
        if (err && typeof err !== 'object') {
          this.dialogService.alert('ERROR', err);
        } else {
          this.dialogService.alert('ERROR', this.translatePipe.transform('MESSAGES.ERROR_DOWNLOAD'));
        }
      });
    }
  }

  onContextChangeName(event): void {
    if (event && event.data) {
      let dialogData: ChangeNameDialogData = {
        title: 'CHANGE_NAME_TITLE',
        placeholder: 'newName',
        defaultValue: event.data.name,
        fileData: event.data
      };

      let cfg: MatDialogConfig = {
        role: 'dialog',
        disableClose: false,
        data: dialogData
      };
      let dialogRef = this.dialog.open(ChangeNameDialogComponent, cfg);
      const self = this;
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          self.changeFileName(result, event.data);
        }
      });
    }
  }

  changeFileName(name: string, file: FileClass): void {
    let tableService = this.oTable.getDataService();
    if (tableService && (this.changeNameMethod in tableService)) {
      let self = this;
      tableService[this.changeNameMethod](name, file).subscribe(() => {
        // do nothing
      }, err => {
        if (err && typeof err !== 'object') {
          self.dialogService.alert('ERROR', err);
        }
      }, () => {
        self.oTable.reloadData();
      });
    }
  }

  onContextDelete(event) {
    if (event && event.data) {
      this.oTable.remove();
    }
  }

  isFileContextItem(event) {
    return event && !event.directory;
  }

  cmShowOpenOpt(item: FileClass) {
    return this.oTable.getSelectedItems().length === 1 && item && item.directory;
  }

  get showUploaderStatus(): boolean {
    return this._showUploaderStatus;
  }

  set showUploaderStatus(val: boolean) {
    this._showUploaderStatus = val;
    let createComp = val && !this.uploadProgressComponentRef;
    if (createComp) {
      this.uploadProgressComponentRef = this.domService.appendComponentToBody(UploadProgressComponent);
      const instance: UploadProgressComponent = this.uploadProgressComponentRef.instance;
      instance.onCloseFunction = this.closeUploadProgressComponent.bind(this);
      instance.onCancelItemUpload = this.cancelFileUpload.bind(this);
      instance.translatePipe = this.translatePipe;
    }
    if (val && this.uploadProgressComponentRef) {
      const instance: UploadProgressComponent = this.uploadProgressComponentRef.instance;
      let files = this.oFileInput.uploader.files.filter(item => !item.isUploaded && !item.isCancel);
      instance.uploaderFiles = createComp ? files : instance.uploaderFiles.concat(files);
      let title = this.translatePipe.transform('MESSAGES.UPLOADING_SINGLE_FILE');
      if (instance.uploaderFiles.length > 1) {
        title = this.translatePipe.transform('MESSAGES.UPLOADING_MULTIPLE_FILE');
      }
      instance.title = title;
    }
  }

  cancelFileUpload(file: any) {
    this.oFileInput.uploader.cancelItem(file);
  }

  closeUploadProgressComponent() {
    let allUploaded: boolean = true;
    this.oFileInput.uploader.files.forEach(file => {
      allUploaded = allUploaded && !file.pendingUpload;
    });
    if (allUploaded) {
      this.removeUploadProggressComponent(true);
      this.oFileInput.uploader.clear();
    } else {
      const dialogTitle = this.translatePipe.transform('MESSAGES.CONFIRM_DISCARD_UPLOAD_TITLE');
      const dialogMsg = this.translatePipe.transform('MESSAGES.CONFIRM_DISCARD_UPLOAD_TEXT');

      const self = this;
      this.dialogService.confirm(dialogTitle, dialogMsg).then(res => {
        if (res) {
          self.oFileInput.uploader.cancel();
          self.removeUploadProggressComponent(true);
        }
      });
    }
  }

  removeUploadProggressComponent(auto: boolean = false) {
    if (this.autoHideUpload || auto) {
      this.destroyUploadProgress();
    }
    this.showUploaderStatus = false;
  }

  protected destroyUploadProgress(auto: boolean = false) {
    this.domService.removeComponentFromBody(this.uploadProgressComponentRef, auto ? 0 : this.autoHideTimeout);
    this.uploadProgressComponentRef = undefined;
  }

  protected generateUniqueId(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  protected updateDownloaderStatus(downloadId: string, data: any) {
    if (this.downloadProgressComponentRef) {
      const instance: DownloadProgressComponent = this.downloadProgressComponentRef.instance;
      let downloadData = instance.files.filter((item) => item.id === downloadId)[0];
      if (downloadData) {
        instance.title = this.translatePipe.transform('MESSAGES.DOWNLOADING');
        Object.keys(data).forEach((key) => {
          downloadData[key] = data[key];
        });
        instance.files = instance.files.slice();
        if (data && data.downloaded) {
          let allDownloaded: boolean = true;
          instance.files.forEach(file => {
            allDownloaded = allDownloaded && (file.downloaded || file.cancelled);
          });
          instance.title = this.translatePipe.transform('MESSAGES.DOWNLOAD_COMPLETED');
        }
      }
    }
  }

  showDownloaderStatus(downloadId: string, data: any) {
    if (!this.downloadProgressComponentRef) {
      this.downloadProgressComponentRef = this.domService.appendComponentToBody(DownloadProgressComponent);
      const instance: DownloadProgressComponent = this.downloadProgressComponentRef.instance;
      instance.onCloseFunction = this.closeDownloadProgressComponent.bind(this);
      instance.translatePipe = this.translatePipe;
    }
    if (this.downloadProgressComponentRef) {
      const instance: DownloadProgressComponent = this.downloadProgressComponentRef.instance;
      instance.files = instance.files.concat([{ id: downloadId }]);
      instance.title = this.translatePipe.transform('MESSAGES.PREPARE_DOWNLOAD');
    }
    if (data !== undefined) {
      this.updateDownloaderStatus(downloadId, data);
    }
  }

  closeDownloadProgressComponent() {
    let allDownloaded: boolean = true;
    if (this.downloadProgressComponentRef) {
      const instance: DownloadProgressComponent = this.downloadProgressComponentRef.instance;
      instance.files.forEach(file => {
        allDownloaded = allDownloaded && (file.downloaded || file.cancelled);
      });
    }
    if (allDownloaded) {
      this.removeDownloadProggressComponent(true);
    } else {
      const dialogTitle = this.translatePipe.transform('MESSAGES.CONFIRM_DISCARD_DOWNLOAD_TITLE');
      const dialogMsg = this.translatePipe.transform('MESSAGES.CONFIRM_DISCARD_DOWNLOAD_TEXT');
      const self = this;
      this.dialogService.confirm(dialogTitle, dialogMsg).then(res => {
        if (res) {
          self.removeDownloadProggressComponent(true);
        }
      });
    }
  }

  removeDownloadProggressComponent(auto: boolean = false) {
    if (this.autoHideUpload || auto) {
      this.destroyDownloadProgress();
    }
  }

  protected destroyDownloadProgress(auto: boolean = false) {
    this.domService.removeComponentFromBody(this.downloadProgressComponentRef, auto ? 0 : this.autoHideTimeout);
    this.downloadProgressComponentRef = undefined;
  }

}

@NgModule({
  declarations: [ChangeNameDialogComponent, DownloadProgressComponent, OFileManagerTableComponent, OTableColumnRendererFileSizeComponent, OTableColumnRendererFileTypeComponent, UploadProgressComponent],
  imports: [CommonModule, OFileInputExtendedModule, OFileManagerTranslateModule, OntimizeWebModule, OSharedModule, OTableExtendedModule],
  entryComponents: [ChangeNameDialogComponent, DownloadProgressComponent, UploadProgressComponent],
  exports: [OFileManagerTableComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class OFileManagerTableModule { }
