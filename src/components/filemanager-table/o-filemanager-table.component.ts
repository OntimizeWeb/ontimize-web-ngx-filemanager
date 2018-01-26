import { AfterViewInit, Component, forwardRef, Inject, Injector, NgModule, OnDestroy, OnInit, Optional, ViewChild, ViewEncapsulation, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs/Subscription';

import { DialogService, InputConverter, OFormComponent, OntimizeWebModule, OSharedModule, OTranslateService } from 'ontimize-web-ngx';
import { OTableColumnRendererFileTypeComponent } from './renderers/filetype/o-table-column-renderer-filetype.component';
import { OTableColumnRendererFileSizeComponent } from './renderers/filesize/o-table-column-renderer-filesize.component';

import { FileManagerStateService } from '../../services/filemanager-state.service';
import { OFileManagerTranslateModule, OFileManagerTranslatePipe } from '../../core/o-filemanager-translate.pipe';
import { OTableExtendedModule, OTableExtendedComponent } from './table-extended/o-table-extended.component';
import { OFileInputExtendedModule, OFileInputExtendedComponent } from '../file-input/o-file-input-extended.component';
import { FileClass } from '../../core/file.class';
import { DomService } from '../../services/dom.service';
import { UploadProgressComponent } from '../status/upload/upload-progress.component';

export const DEFAULT_INPUTS_O_FILEMANAGER_TABLE = [
  'workspaceKey: workspace-key',
  'service',
  'parentKeys: parent-keys',
  'autoHideUpload : auto-hide-upload',
  'autoHideTimeout : auto-hide-timeout',
  'serviceType : service-type',
  'newFolderButton: new-folder-button'
];

export const DEFAULT_OUTPUTS_O_FILEMANAGER_TABLE = [
];

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

  protected workspaceKey: string;
  protected service: string;
  protected parentKeys: string;
  @InputConverter()
  autoHideUpload: boolean = false;
  @InputConverter()
  autoHideTimeout: number = 1500;
  serviceType: string;
  @InputConverter()
  newFolderButton: boolean = false;

  queryMethod: string = 'queryFiles';
  deleteMethod: string = 'deleteFiles';
  addFolderMethod: string = 'insertFolder';

  protected uploadMethod: string = 'upload';
  protected downloadMethod: string = 'download';

  protected onFormDataSubscribe: Subscription;
  protected stateService: FileManagerStateService;
  protected stateSubscription: Subscription;
  protected _breadcrumbs: Array<any> = [];

  @ViewChild('oTable') oTable: OTableExtendedComponent;
  @ViewChild('oFileInput') oFileInput: OFileInputExtendedComponent;
  protected _showUploaderStatus = false;

  protected translateService: OTranslateService;
  protected translatePipe: OFileManagerTranslatePipe;
  protected onLanguageChangeSubscribe: any;

  protected dialogService: DialogService;
  protected doReloadQuery: boolean;

  protected domService: DomService;
  protected uploadProggresComponentRef: any;

  constructor(
    protected injector: Injector,
    @Optional() @Inject(forwardRef(() => OFormComponent)) protected oForm: OFormComponent
  ) {
    this.translateService = this.injector.get(OTranslateService);
    this.translatePipe = new OFileManagerTranslatePipe(this.injector);
    this.stateService = this.injector.get(FileManagerStateService);
    this.dialogService = this.injector.get(DialogService);
    this.domService = this.injector.get(DomService);

    const self = this;
    if (this.oForm) {
      this.onFormDataSubscribe = this.oForm.onFormDataLoaded.subscribe(function (data) {
        self.stateService.setFormParentItem(data);
      });
    }

    this.stateSubscription = this.stateService.getStateObservable().subscribe(array => {
      self.breadcrumbs = array;
    });

    this.onLanguageChangeSubscribe = this.translateService.onLanguageChanged.subscribe(res => {
      self.translateTable();
    });
  }

  ngOnInit() {
    if (!this.serviceType) {
      this.serviceType = OFileManagerTableComponent.DEFAULT_SERVICE_TYPE;
    }
  }

  ngAfterViewInit() {
    this.oFileInput.parentKey = OTableExtendedComponent.FM_FOLDER_PARENT_KEY;
    this.oFileInput.uploader.parentKey = OTableExtendedComponent.FM_FOLDER_PARENT_KEY;

    this.translateTable();
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
      this.oFileInput.onChange.subscribe(data => {
        this.showUploaderStatus = true;
        this.doReloadQuery = true;
        this.oFileInput.uploader.setParentItem(this.oTable.getParentItem());
        this.oFileInput.upload();
      });
    }
  }

  onUploadError() {
    if (this.uploadProggresComponentRef) {
      this.uploadProggresComponentRef.instance.title = this.translatePipe.transform('MESSAGES.UPLOADING_ERROR');
    }
  }

  onUploadedFile() {
    if (this.uploadProggresComponentRef) {
      this.uploadProggresComponentRef.instance.title = this.translatePipe.transform('MESSAGES.UPLOADING_SINGLE_FILE');
    }
    this.removeUploadProggressComponent();
    if (this.doReloadQuery) {
      this.oTable.reloadData();
    }
  }

  onGoToRootFolderClick() {
    this.stateService.restart();
    const filter = this.stateService.getFormParentItem();
    this.oTable.setParentItem(filter);
    this.oTable.queryData(filter);
  }

  onBreadcrumbItemClick(filter: any, index: number) {
    this.stateService.restart(index);
    this.oTable.setParentItem(filter);
    this.oTable.queryData(filter);
  }

  onOpenFolder(event) {
    if (event && event.data) {
      this.onTableDoubleClick(event.data);
    }
  }

  onDownloadFile() {
    const tableService = this.oTable.dataService;
    if (tableService && this.oTable.getSelectedItems().length > 0) {
      if (this.oTable.getSelectedItems().length === 1) {
        let file: FileClass = this.oTable.getSelectedItems()[0];
        if (!file.directory) {
          tableService.download(file).subscribe(resp => {
            if (resp['loaded']) {
              // TODO
              console.log(resp);
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
      tableService.downloadMultiple(this.oTable.getSelectedItems()).subscribe(asdf => {
        // TODO
        console.log(asdf);
      }, err => {
        if (err && typeof err !== 'object') {
          this.dialogService.alert('ERROR', err);
        } else {
          this.dialogService.alert('ERROR', this.translatePipe.transform('MESSAGES.ERROR_DOWNLOAD'));
        }
      });
    }
  }

  isFileItem(item: FileClass) {
    return item && !item.directory;
  }

  isDirectoryItem(item: FileClass) {
    return item && item.directory;
  }

  cmShowDownloadOpt(item: FileClass) {
    return this.oTable.getSelectedItems().length > 0 ? true : item && !item.directory;
  }

  get breadcrumbs(): Array<any> {
    return this._breadcrumbs;
  }

  set breadcrumbs(arg: Array<any>) {
    this._breadcrumbs = arg;
  }

  get showUploaderStatus(): boolean {
    return this._showUploaderStatus;
  }

  set showUploaderStatus(val: boolean) {
    this._showUploaderStatus = val;
    if (val && !this.uploadProggresComponentRef) {
      this.uploadProggresComponentRef = this.domService.appendComponentToBody(UploadProgressComponent);
      const instance = this.uploadProggresComponentRef.instance;
      instance.uploaderFiles = this.oFileInput.uploader.files;
      instance.onCloseFunction = this.closeUploadProgressComponent.bind(this);
      instance.onCancelItemUpload = this.cancelFileUpload.bind(this);
    }

    if (val && this.uploadProggresComponentRef) {
      let title = this.translatePipe.transform('MESSAGES.UPLOADING_SINGLE_FILE');
      if (this.oFileInput.uploader.files.length > 1) {
        title = this.translatePipe.transform('MESSAGES.UPLOADING_MULTIPLE_FILE');
      }
      this.uploadProggresComponentRef.instance.title = title;
    }
  }

  cancelFileUpload(file: any) {
    this.oFileInput.uploader.cancelItem(file);
  }

  closeUploadProgressComponent() {
    let allUploaded: boolean = true;
    this.oFileInput.uploader.files.forEach(file => {
      allUploaded = allUploaded && file.isUploaded;
    });
    if (allUploaded) {
      this.removeUploadProggressComponent(true);
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
      this.domService.removeComponentFromBody(this.uploadProggresComponentRef, auto ? 0 : this.autoHideTimeout);
      this.uploadProggresComponentRef = undefined;
    }
    this.showUploaderStatus = false;
  }
}

@NgModule({
  declarations: [
    OFileManagerTableComponent,
    OTableColumnRendererFileTypeComponent,
    OTableColumnRendererFileSizeComponent,
    UploadProgressComponent
  ],
  imports: [
    CommonModule,
    OntimizeWebModule,
    OSharedModule,
    OTableExtendedModule,
    OFileInputExtendedModule,
    OFileManagerTranslateModule
  ],
  entryComponents: [
    UploadProgressComponent
  ],
  exports: [OFileManagerTableComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class OFileManagerTableModule {
}
