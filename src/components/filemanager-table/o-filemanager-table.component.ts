import { Component, ViewEncapsulation, Injector, NgModule, CUSTOM_ELEMENTS_SCHEMA, ViewChild, Optional, Inject, forwardRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs/Subscription';

import { OntimizeWebModule, OTableComponent, OSharedModule, OFormComponent, OFileInputComponent, InputConverter } from 'ontimize-web-ngx';
import { OTableColumnRendererFileTypeComponent } from './renderers/o-table-column-renderer-filetype.component';
import { FileManagerStateService } from '../../services/filemanager-state.service';

export const DEFAULT_INPUTS_O_FILEMANAGER_TABLE = [
  'parentKeys: parent-keys',
  'autoHideUpload : auto-hide-upload',
  'autoHideTimeout : auto-hide-timeout',
  'serviceType : service-type',
  'queryMethod : query-method',
  'uploadServiceType : upload-service-type'
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

export class OFileManagerTableComponent implements OnDestroy {
  protected parentKeys: string;
  @InputConverter()
  autoHideUpload: boolean = true;
  @InputConverter()
  autoHideTimeout: number = 1500;
  serviceType: string = 'FileManagerService';
  queryMethod: string = 'queryFiles';
  uploadServiceType: string = 'FileManagerService';

  protected onFormDataSubscribe: Subscription;
  protected stateService: FileManagerStateService;
  protected stateSubscription: Subscription;
  protected _breadcrumbs: Array<any> = [];

  @ViewChild('oTable') oTable: OTableComponent;
  @ViewChild('oFileInput') oFileInput: OFileInputComponent;
  showUploaderStatus = false;

  private doReloadQuery: boolean;

  constructor(
    protected injector: Injector,
    @Optional() @Inject(forwardRef(() => OFormComponent)) protected oForm: OFormComponent) {

    this.stateService = this.injector.get(FileManagerStateService);

    const self = this;
    if (this.oForm) {
      this.onFormDataSubscribe = this.oForm.onFormDataLoaded.subscribe(function (data) {
        self.stateService.setFormParentItem(data);
      });
    }

    this.stateSubscription = this.stateService.getStateObservable().subscribe(array => {
      self.breadcrumbs = array;
    });
  }

  ngOnDestroy() {
    if (this.onFormDataSubscribe) {
      this.onFormDataSubscribe.unsubscribe();
    }
    if (this.stateSubscription) {
      this.stateSubscription.unsubscribe();
    }
  }

  onTableDoubleClick(item: any) {
    if (item === undefined || !item['isDir'] || !this.oTable) {
      return;
    }
    this.doReloadQuery = false;
    const filter = this.stateService.getAndStoreQueryFilter({ PARENT: item.id }, item);
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
    OSharedModule
  ],
  exports: [OFileManagerTableComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class OFileManagerTableModule {
}
