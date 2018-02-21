import { Component, forwardRef, Injector, NgModule, ViewEncapsulation, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MdDialogConfig } from '@angular/material';

import { ServiceUtils } from 'ontimize-web-ngx';

import { OntimizeService, dataServiceFactory, DEFAULT_INPUTS_O_TABLE, DEFAULT_OUTPUTS_O_TABLE, OTableComponent, OntimizeWebModule, Util, ObservableWrapper } from 'ontimize-web-ngx';
import { FolderNameDialogComponent } from './dialog/folder-name-dialog.component';
import { OTableExtendedDataSource } from './datasource/o-table-extended.datasource';
import { FileManagerStateService } from '../../../services/filemanager-state.service';

@Component({
  selector: 'o-table-extended',
  templateUrl: './o-table-extended.component.html',
  styleUrls: ['./o-table-extended.component.scss'],
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

  protected workspaceKey: string;
  protected addFolderMethod: string;

  protected workspaceId: any;

  protected clickTimer;
  protected clickDelay = 200;
  protected clickPrevent = false;

  protected stateService: FileManagerStateService;
  protected _breadcrumbs: Array<any> = [];

  setParentItem(val: any) {
    this.parentItem = val;
  }

  getParentItem(): any {
    return this.parentItem;
  }

  setDatasource() {
    this.dataSource = new OTableExtendedDataSource(this);
    if (this.daoTable) {
      this.dataSource.resultsLength = this.daoTable.data.length;
    }
  }

  handleDOMClick(event) {
    const tableContent = this.elRef.nativeElement;
    const overlayContainer = document.body.getElementsByClassName('cdk-overlay-container')[0];
    if (overlayContainer && overlayContainer.contains(event.target)) {
      return;
    }
    if (tableContent && !tableContent.contains(event.target) && this.selection && this.selection.selected.length) {
      this.clearSelection();
    }
  }

  handleDoubleClick(item: any) {
    clearTimeout(this.clickTimer);
    this.clickPrevent = true;
    super.handleDoubleClick(item);
  }

  handleClick(item: any, $event?) {
    const self = this;
    this.clickTimer = setTimeout(() => {
      if (!self.clickPrevent) {
        self.doClick(item, $event);
      }
      self.clickPrevent = false;
    }, this.clickDelay);
  }

  doClick(item: any, $event?) {
    if ($event.ctrlKey || $event.metaKey) {
      // TODO: test $event.metaKey on MAC
      this.selectedRow(item);
      ObservableWrapper.callEmit(this.onClick, item);
      return;
    } else if ($event.shiftKey) {
      if (this.selection.selected.length > 0) {
        let first = this.dataSource.renderedData.indexOf(this.selectedItems[0]);
        let last = this.dataSource.renderedData.indexOf(item);
        let indexFrom = Math.min(first, last);
        let indexTo = Math.max(first, last);
        this.selection.clear();
        this.dataSource.renderedData.slice(indexFrom, indexTo + 1).forEach(e => this.selectedRow(e));
        ObservableWrapper.callEmit(this.onClick, this.selection.selected);
        return;
      }
    }
    if (this.selection.selected.length > 0 && !(this.selection.selected.length === 1 && this.selection.selected.indexOf(item) !== -1)) {
      this.selection.clear();
      this.selectedItems = [];
    }
    this.selectedRow(item);
    ObservableWrapper.callEmit(this.onClick, item);
  }
  /**
     * This method manages the call to the service
     * @param parentItem it is defined if its called from a form
     * @param ovrrArgs
     */
  queryData(parentItem: any = undefined, ovrrArgs?: any) {
    // If exit tab and not is active then waiting call queryData
    if (this.mdTabContainer && !this.mdTabContainer.isActive) {
      this.pendingQuery = true;
      this.pendingQueryFilter = parentItem;
      return;
    }
    let queryMethodName = this.pageable ? this.paginatedQueryMethod : this.queryMethod;
    if (!this.dataService || !(queryMethodName in this.dataService)) {
      return;
    }

    this.workspaceId = this.form.getDataValue(this.workspaceKey).value;
    this.pendingQuery = false;
    this.pendingQueryFilter = undefined;

    parentItem = ServiceUtils.getParentItemFromForm(parentItem, this._pKeysEquiv, this.form);

    let formData = this.form.formData;
    this.workspaceId = formData[this.workspaceKey] ? formData[this.workspaceKey].value : undefined;

    if (this.workspaceId === undefined || (Object.keys(this._pKeysEquiv).length > 0) && parentItem === undefined) {
      this.setData([], []);
    } else {
      let filter = ServiceUtils.getFilterUsingParentKeys(parentItem, this._pKeysEquiv);

      if (parentItem.hasOwnProperty(OTableExtendedComponent.FM_FOLDER_PARENT_KEY)) {
        filter[OTableExtendedComponent.FM_FOLDER_PARENT_KEY] = parentItem[OTableExtendedComponent.FM_FOLDER_PARENT_KEY];
      }

      let queryArguments = this.getQueryArguments(filter, ovrrArgs);
      if (this.querySubscription) {
        this.querySubscription.unsubscribe();
      }
      this.querySubscription = this.daoTable.getQuery(queryArguments).subscribe(res => {
        let data = undefined;
        let sqlTypes = undefined;
        if (Util.isArray(res)) {
          data = res;
          sqlTypes = [];
        } else if ((res.code === 0) && Util.isArray(res.data)) {
          data = (res.data !== undefined) ? res.data : [];
          sqlTypes = res.sqlTypes;
        }
        this.setData(data, sqlTypes);
        if (this.pageable) {
          ObservableWrapper.callEmit(this.onPaginatedTableDataLoaded, data);
        }
        ObservableWrapper.callEmit(this.onTableDataLoaded, this.daoTable.data);
      }, err => {
        this.showDialogError(err, 'MESSAGES.ERROR_QUERY');
        this.setData([], []);
      });
    }
  }

  getQueryArguments(filter: Object, ovrrArgs?: any): Array<any> {
    let queryArguments = [this.workspaceId, filter, this.colArray];
    if (this.pageable) {
      let queryOffset = (ovrrArgs && ovrrArgs.hasOwnProperty('offset')) ? ovrrArgs.offset : this.state.queryRecordOffset;
      let queryRowsN = (ovrrArgs && ovrrArgs.hasOwnProperty('length')) ? ovrrArgs.length : this.queryRows;
      queryArguments = queryArguments.concat([undefined, queryOffset, queryRowsN, undefined]);
    }
    queryArguments[2] = this.getAttributesValuesToQuery();
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

  isSelected(item): boolean {
    return this.selection.selected.indexOf(item) !== -1;
  }

  remove(clearSelectedItems: boolean = false) {
    if ((this.keysArray.length === 0) || this.selectedItems.length === 0) {
      return;
    }
    this.dialogService.confirm('CONFIRM', 'MESSAGES.CONFIRM_DELETE').then(res => {
      if (res === true) {
        if (this.dataService && (this.deleteMethod in this.dataService) && (this.keysArray.length > 0)) {
          let workspaceId = this.parentItem[this.workspaceKey];
          this.dataService[this.deleteMethod](workspaceId, this.selectedItems).subscribe(() => {
            this.clearSelection();
            ObservableWrapper.callEmit(this.onRowDeleted, this.selectedItems);
          }, error => {
            this.showDialogError(error, 'MESSAGES.ERROR_DELETE');
          }, () => {
            this.reloadData();
          });
        } else {
          // remove local
          this.deleteLocalItems();
        }
      } else if (clearSelectedItems) {
        this.selectedItems = [];
      }
    });
  }

  onAddFolder() {
    let cfg: MdDialogConfig = {
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
    const workspaceId = this.parentItem[this.workspaceKey];
    let kv = {};
    if (this.parentItem.hasOwnProperty(OTableExtendedComponent.FM_FOLDER_PARENT_KEY)) {
      kv[OTableExtendedComponent.FM_FOLDER_PARENT_KEY] = this.parentItem[OTableExtendedComponent.FM_FOLDER_PARENT_KEY];
    }
    tableService[this.addFolderMethod](workspaceId, folderName, kv).subscribe(() => {
      // do nothing
    }, err => {
      if (err && typeof err !== 'object') {
        this.dialogService.alert('ERROR', err);
      }
    }, () => {
      this.reloadData();
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
    this.setParentItem(filter);
    this.queryData(filter);
  }

  onBreadcrumbItemClick(filter: any, index: number) {
    this.stateService.restart(index);
    this.setParentItem(filter);
    this.queryData(filter);
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
    OntimizeWebModule
  ],
  exports: [OTableExtendedComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class OTableExtendedModule {
}
