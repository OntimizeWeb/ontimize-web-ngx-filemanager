import { Component, ViewEncapsulation, Injector, NgModule, CUSTOM_ELEMENTS_SCHEMA, ViewChild, Optional, Inject, forwardRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs/Subscription';

import { OntimizeWebModule, OTableComponent, OSharedModule, OFormComponent, OFileInputComponent } from 'ontimize-web-ngx';
import { OTableColumnRendererFileTypeComponent } from './renderers/o-table-column-renderer-filetype.component';
import { FileManagerStateService } from '../../services/filemanager-state.service';


export const DEFAULT_INPUTS_O_FILEMANAGER_TABLE = [
  // parent-keys [string]: parent keys to filter, separated by ';'. Default: no value.
  'parentKeys: parent-keys',
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
  protected onFormDataSubscribe: Subscription;
  protected stateService: FileManagerStateService;
  protected parentKeys: string;

  protected stateSubscription: Subscription;
  protected _breadcrumbs: Array<any> = [];

  @ViewChild('oTable') oTable: OTableComponent;
  @ViewChild('oFileInput') oFileInput: OFileInputComponent;

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
    const filter = this.stateService.getAndStoreQueryFilter({ PARENT: item.id }, item);
    this.oTable.queryData(filter);
  }

  onFileUploadClick() {
    if (this.oFileInput) {
      (this.oFileInput as any).inputFile.nativeElement.click();
      this.oFileInput.onChange.subscribe(data => {
        this.oFileInput.upload();
      });
    }
  }

  onUploadedFile(arg) {
    this.oTable.reloadData();
  }

  onGoToRootFolderClick() {
    this.stateService.restart();
    const filter = this.stateService.getFormParentItem();
    this.oTable.queryData(filter);
  }

  onGoToFolderClick(filter: any, index: number) {
    this.stateService.restart(index);
    this.oTable.queryData(filter);
  }

  get breadcrumbs(): Array<any> {
    return this._breadcrumbs;
  }

  set breadcrumbs(arg: Array<any>) {
    this._breadcrumbs = arg;
  }

  get uploadFile(): any {
    return this.oFileInput.uploader.files[0];
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
