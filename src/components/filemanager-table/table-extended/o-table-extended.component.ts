import { Component, forwardRef, Injector, NgModule, ViewEncapsulation, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogConfig } from '@angular/material';
import { OntimizeService, dataServiceFactory, DEFAULT_INPUTS_O_TABLE, DEFAULT_OUTPUTS_O_TABLE, OTableComponent, OntimizeWebModule, Util, ObservableWrapper, ServiceUtils, OQueryDataArgs, Codes } from 'ontimize-web-ngx';
import { FolderNameDialogComponent } from './dialog/foldername/folder-name-dialog.component';
import { OTableExtendedDataSource } from './datasource/o-table-extended.datasource';
import { FileManagerStateService } from '../../../services/filemanager-state.service';
import { OFileManagerTranslateModule } from '../../../core';

@Component({
  selector: 'o-table-extended',
  templateUrl: './o-table-extended.component.html',
  providers: [
    { provide: OntimizeService, useFactory: dataServiceFactory, deps: [Injector] },
    {
      provide: OTableComponent,
      useExisting: forwardRef(() => OTableExtendedComponent)
    }
  ],
  inputs: [
    ...DEFAULT_INPUTS_O_TABLE,
    'workspaceKey: workspace-key',
    'addFolderMethod : add-folder-method'
  ],
  outputs: DEFAULT_OUTPUTS_O_TABLE,
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class.o-table]': 'true',
    '[class.ontimize-table]': 'true',
    '[class.o-table-fixed]': 'fixedHeader',
    '(document:click)': 'handleDOMClick($event)'
  }
})

export class OTableExtendedComponent extends OTableComponent {

  public static FM_FOLDER_PARENT_KEY: string = 'FM_FOLDER_PARENT_KEY';

  protected workspaceId: any;
  protected workspaceKey: string;
  protected addFolderMethod: string;

  protected clickTimer;
  protected clickDelay = 200;
  protected clickPrevent = false;

  protected stateService: FileManagerStateService;
  protected _breadcrumbs: Array<any> = [];

  ngOnInit() {
    super.ngOnInit();
    this.paginationControls = false;
  }

  getDataService(): any {
    return this.dataService;
  }

  setDatasource() {
    this.dataSource = new OTableExtendedDataSource(this);
    if (this.daoTable) {
      this.dataSource.resultsLength = this.daoTable.data.length;
    }
  }

  /**
 * This method manages the call to the service
 * @param filter
 * @param ovrrArgs
 */
  queryData(filter: any = undefined, ovrrArgs?: OQueryDataArgs) {
    this.workspaceId = this.form.formData[this.workspaceKey] ? this.form.formData[this.workspaceKey].value : undefined;

    // If tab exists and is not active then wait for queryData
    if (this.tabContainer && !this.tabContainer.isActive) {
      this.pendingQuery = true;
      this.pendingQueryFilter = filter;
      return;
    }
    this.pendingQuery = false;
    this.pendingQueryFilter = undefined;

    let queryMethodName = this.pageable ? this.paginatedQueryMethod : this.queryMethod;
    if (!this.dataService || !(queryMethodName in this.dataService)) {
      return;
    }
    let filterParentKeys = ServiceUtils.getParentKeysFromForm(this._pKeysEquiv, this.form);

    if (this.workspaceId === undefined || (!this.filterContainsAllParentKeys(filterParentKeys) && !this.queryWithNullParentKeys)) {
      this.setData([], []);
    } else {
      let pkFilter = ServiceUtils.getFilterUsingParentKeys(filterParentKeys, this._pKeysEquiv);
      filter = Object.assign(filter || {}, pkFilter);

      if (filter.hasOwnProperty(OTableExtendedComponent.FM_FOLDER_PARENT_KEY)) {
        filter[OTableExtendedComponent.FM_FOLDER_PARENT_KEY] = filter[OTableExtendedComponent.FM_FOLDER_PARENT_KEY];
      }

      let queryArguments = this.getQueryArguments(filter, ovrrArgs);
      if (this.querySubscription) {
        this.querySubscription.unsubscribe();
        this.loaderSubscription.unsubscribe();
      }
      this.loaderSubscription = this.load();
      const self = this;
      this.querySubscription = this.dataService[queryMethodName].apply(this.dataService, queryArguments).subscribe(res => {
        let data = undefined;
        let sqlTypes = undefined;
        if (Util.isArray(res)) {
          data = res;
          sqlTypes = {};
        } else if ((res.code === Codes.ONTIMIZE_SUCCESSFUL_CODE)) {
          const arrData = (res.data !== undefined) ? res.data : [];
          data = Util.isArray(arrData) ? arrData : [];
          sqlTypes = res.sqlTypes;
          if (this.pageable) {
            this.updatePaginationInfo(res);
          }
        }
        self.setData(data, sqlTypes);
        self.loaderSubscription.unsubscribe();
      }, err => {
        self.setData([], []);
        self.loaderSubscription.unsubscribe();
        if (err && typeof err !== 'object') {
          self.dialogService.alert('ERROR', err);
        } else {
          self.dialogService.alert('ERROR', 'MESSAGES.ERROR_QUERY');
        }
      });
    }
  }

  getQueryArguments(filter: Object, ovrrArgs?: any): Array<any> {
    const compFilter = this.getComponentFilter(filter);
    const queryCols = this.getAttributesValuesToQuery();
    let queryArguments = [this.workspaceId, compFilter, queryCols, this.entity, Util.isDefined(ovrrArgs) ? ovrrArgs.sqltypes : undefined];
    if (this.pageable) {
      queryArguments[6] = this.paginator.isShowingAllRows(queryArguments[5]) ? this.state.totalQueryRecordsNumber : queryArguments[5];
      queryArguments[7] = this.sortColArray;
    }
    return queryArguments;
  }

  selectedRow(row: any) {
    this.selection.toggle(row);
    let index = this.selectedItems.indexOf(row);
    if (this.selection.selected.indexOf(row) !== -1) {
      if (index === -1) {
        this.selectedItems.push(row);
      }
    } else if (index !== -1) {
      this.selectedItems.splice(index, 1);
    }
  }

  remove(clearSelectedItems: boolean = false) {
    if ((this.keysArray.length === 0) || this.selection.isEmpty()) {
      return;
    }
    this.dialogService.confirm('CONFIRM', 'MESSAGES.CONFIRM_DELETE').then(res => {
      if (res === true) {
        if (this.dataService && (this.deleteMethod in this.dataService) && (this.keysArray.length > 0)) {
          let workspaceId = this.form.getDataValue(this.workspaceKey).value;
          this.dataService[this.deleteMethod](workspaceId, this.selection.selected).subscribe(() => {
            this.clearSelection();
            ObservableWrapper.callEmit(this.onRowDeleted, this.selection.selected);
          }, error => {
            this.showDialogError(error, 'MESSAGES.ERROR_DELETE');
          }, () => {
            this.reloadCurrentFolder();
          });
        } else {
          // remove local
          this.deleteLocalItems();
        }
      } else if (clearSelectedItems) {
        this.clearSelection();
      }
    });
  }

  onAddFolder() {
    let cfg: MatDialogConfig = {
      role: 'dialog',
      disableClose: false
    };
    let dialogRef = this.dialog.open(FolderNameDialogComponent, cfg);
    const self = this;
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        self.insertFolder(result);
      }
    });
  }

  insertFolder(folderName: string) {
    const tableService = this.dataService;
    if (!tableService || !(this.addFolderMethod in tableService)) {
      return;
    }
    const workspaceId = this.form.getDataValue(this.workspaceKey).value;
    let kv = {};
    let currentFilter = this.stateService.getCurrentQueryFilter();
    if (currentFilter.hasOwnProperty(OTableExtendedComponent.FM_FOLDER_PARENT_KEY)) {
      kv[OTableExtendedComponent.FM_FOLDER_PARENT_KEY] = currentFilter[OTableExtendedComponent.FM_FOLDER_PARENT_KEY];
    }
    tableService[this.addFolderMethod](workspaceId, folderName, kv).subscribe(() => {
      // do nothing
    }, err => {
      if (err && typeof err !== 'object') {
        this.dialogService.alert('ERROR', err);
      }
    }, () => {
      this.queryData(kv);
    });
  }

  setStateService(service: FileManagerStateService) {
    this.stateService = service;
  }

  get breadcrumbs(): Array<any> {
    return this._breadcrumbs;
  }

  set breadcrumbs(arg: Array<any>) {
    this._breadcrumbs = arg;
  }

  onGoToRootFolderClick() {
    this.stateService.restart();
    const filter = this.stateService.getFormParentItem();
    this.queryData(filter);
  }

  onBreadcrumbItemClick(filter: any, index: number) {
    this.stateService.restart(index);
    this.queryData(filter);
  }

  reloadCurrentFolder() {
    let kv = {};
    let currentFilter = this.stateService.getCurrentQueryFilter();
    if (currentFilter.hasOwnProperty(OTableExtendedComponent.FM_FOLDER_PARENT_KEY)) {
      kv[OTableExtendedComponent.FM_FOLDER_PARENT_KEY] = currentFilter[OTableExtendedComponent.FM_FOLDER_PARENT_KEY];
    }
    this.queryData(kv);
  }

}

@NgModule({
  declarations: [
    OTableExtendedComponent,
    FolderNameDialogComponent
  ],
  entryComponents: [
    FolderNameDialogComponent
  ],
  imports: [
    CommonModule,
    OntimizeWebModule,
    OFileManagerTranslateModule
  ],
  exports: [OTableExtendedComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class OTableExtendedModule {
}
