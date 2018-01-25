import { AfterViewInit, Component, forwardRef, Inject, Injector, NgModule, OnDestroy, OnInit, Optional, ViewChild, ViewEncapsulation, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs/Subscription';

import { DialogService, InputConverter, OFileInputComponent, OFormComponent, OntimizeWebModule, OSharedModule, OTableComponent, OTranslateService } from 'ontimize-web-ngx';
import { OTableColumnRendererFileTypeComponent } from './renderers/o-table-column-renderer-filetype.component';
import { FileManagerStateService } from '../../services/filemanager-state.service';
import { OFileManagerTranslateModule, OFileManagerTranslatePipe } from '../../core/o-filemanager-translate.pipe';
import { OTableExtendedModule } from './table-extended/o-table-extended.component';
import { OFileInputExtendedModule } from '../file-input/o-file-input-extended.component';
import { File } from '../../core/file.class';

export const DEFAULT_INPUTS_O_FILEMANAGER_TABLE = [
  'workspaceKey: workspace-key',
  'service',
  'parentKeys: parent-keys',
  'autoHideUpload : auto-hide-upload',
  'autoHideTimeout : auto-hide-timeout',
  'serviceType : service-type'
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
  }],
})
export class OFileManagerTableComponent implements OnInit, OnDestroy, AfterViewInit {

  public static DEFAULT_SERVICE_TYPE = 'FileManagerService';

  protected workspaceKey: string;
  protected service: string;
  protected parentKeys: string;
  @InputConverter()
  autoHideUpload: boolean = true;
  @InputConverter()
  autoHideTimeout: number = 1500;

  serviceType: string;
  queryMethod: string = 'queryFiles';

  protected onFormDataSubscribe: Subscription;
  protected stateService: FileManagerStateService;
  protected stateSubscription: Subscription;
  protected _breadcrumbs: Array<any> = [];

  @ViewChild('oTable') oTable: OTableComponent;
  @ViewChild('oFileInput') oFileInput: OFileInputComponent;
  showUploaderStatus = false;

  protected translateService: OTranslateService;
  protected translatePipe: OFileManagerTranslatePipe;
  protected onLanguageChangeSubscribe: any;

  protected dialogService: DialogService;

  private doReloadQuery: boolean;

  constructor(
    protected injector: Injector,
    @Optional() @Inject(forwardRef(() => OFormComponent)) protected oForm: OFormComponent
  ) {
    this.translateService = this.injector.get(OTranslateService);
    this.translatePipe = new OFileManagerTranslatePipe(this.injector);
    this.stateService = this.injector.get(FileManagerStateService);
    this.dialogService = this.injector.get(DialogService);

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

  get downloadLabel(): string {
    return this.translatePipe.transform('DOWNLOAD_FILE');
  }

  get openFolderLabel(): string {
    return this.translatePipe.transform('OPEN_FOLDER');
  }

  onTableDoubleClick(item: File) {
    if (item === undefined || !item['directory'] || !this.oTable) {
      return;
    }
    this.doReloadQuery = false;
    const filter = this.stateService.getAndStoreQueryFilter({ 'FM_FOLDER_PARENT_KEY': item.id }, item);
    this.oTable.queryData(filter);
  }

  onFileUploadClick() {
    if (this.oFileInput) {
      (this.oFileInput as any).inputFile.nativeElement.click();
      this.oFileInput.onChange.subscribe(data => {
        this.showUploaderStatus = true;
        this.doReloadQuery = true;
        this.oFileInput.upload();
      });
    }
  }

  onUploadedFile() {
    if (this.autoHideUpload) {
      setTimeout(() => {
        this.onCloseUploaderStatus();
      }, this.autoHideTimeout);
    }
    if (this.doReloadQuery) {
      this.oTable.reloadData();
    }
  }

  onGoToRootFolderClick() {
    this.stateService.restart();
    const filter = this.stateService.getFormParentItem();
    this.oTable.queryData(filter);
  }

  onBreadcrumbItemClick(filter: any, index: number) {
    this.stateService.restart(index);
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
        let file: File = this.oTable.getSelectedItems()[0];
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

  isFileItem(item: File) {
    return item && !item.directory;
  }

  isDirectoryItem(item: File) {
    return item && item.directory;
  }

  cmShowDownloadOpt(item: File) {
    return this.oTable.getSelectedItems().length > 0 ? true : item && !item.directory;
  }

  get breadcrumbs(): Array<any> {
    return this._breadcrumbs;
  }

  set breadcrumbs(arg: Array<any>) {
    this._breadcrumbs = arg;
  }

  get uploaderFiles(): any {
    return this.showUploaderStatus ? this.oFileInput.uploader.files : undefined;
  }

  onCloseUploaderStatus() {
    this.showUploaderStatus = false;
  }
}

@NgModule({
  declarations: [
    OFileManagerTableComponent,
    OTableColumnRendererFileTypeComponent
  ],
  imports: [
    CommonModule,
    OntimizeWebModule,
    OSharedModule,
    OTableExtendedModule,
    OFileInputExtendedModule,
    OFileManagerTranslateModule
  ],
  exports: [OFileManagerTableComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class OFileManagerTableModule {
}
