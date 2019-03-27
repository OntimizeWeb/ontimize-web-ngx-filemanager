import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, CUSTOM_ELEMENTS_SCHEMA, forwardRef, Injector, NgModule, ViewEncapsulation } from '@angular/core';
import { MatDialogConfig } from '@angular/material';
import { dataServiceFactory, ObservableWrapper, OColumn, OntimizeService, OntimizeWebModule, OQueryDataArgs, OTableComponent, Util } from 'ontimize-web-ngx';

import { FileManagerStateService } from '../../../services/filemanager-state.service';
import { OFileManagerTranslateModule } from '../../../util';
import { OTableExtendedDataSource } from './datasource/o-table-extended.datasource';
import { FolderNameDialogComponent } from './dialog/foldername/folder-name-dialog.component';

@Component({
  moduleId: module.id,
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
    ...OTableComponent.DEFAULT_INPUTS_O_TABLE,
    'workspaceKey: workspace-key',
    'addFolderMethod : add-folder-method'
  ],
  outputs: OTableComponent.DEFAULT_OUTPUTS_O_TABLE,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
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

  protected mutationObserver: MutationObserver;

  ngOnInit() {
    // setting fake value for avoid entity is undefined checking
    this.entity = 'fakeEntity';
    super.ngOnInit();
    this.paginationControls = false;
  }

  ngAfterViewInit() {
    super.ngAfterViewInit();
    this.registerHeaderMutationObserver();
  }

  ngOnDestroy() {
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
    }
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
    if (!Util.isDefined(this.workspaceId)) {
      this.setData([], []);
      return;
    }
    super.queryData(filter, ovrrArgs);
  }

  getQueryArguments(filter: Object, ovrrArgs?: any): Array<any> {
    const compFilter = this.getComponentFilter(filter);
    const queryCols = this.getAttributesValuesToQuery();
    let queryArguments = [this.workspaceId, compFilter, queryCols, /*this.entity*/ undefined, Util.isDefined(ovrrArgs) ? ovrrArgs.sqltypes : undefined];
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
          let workspaceId = (this.form as any).getDataValue(this.workspaceKey).value;
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
    const workspaceId = (this.form as any).getDataValue(this.workspaceKey).value;
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

  protected registerHeaderMutationObserver() {
    const self = this;
    this.mutationObserver = new MutationObserver(() => {
      if (self.tableHeaderEl.nativeElement.children.length > 0) {
        self.initializeColumnsDOMWidth();
        self.mutationObserver.disconnect();
      }
    });

    this.mutationObserver.observe(this.tableHeaderEl.nativeElement, {
      attributes: true
    });
  }

  protected initializeColumnsDOMWidth() {
    const self = this;
    if (Util.isDefined(this.tableHeaderEl)) {
      [].slice.call(this.tableHeaderEl.nativeElement.children).forEach(thEl => {
        const oCol: OColumn = self.getOColumnFromTh(thEl);
        if (Util.isDefined(oCol)) {
          if (!Util.isDefined(oCol.padding)) {
            oCol.padding = (!thEl.previousElementSibling || !thEl.nextElementSibling) ? OTableComponent.FIRST_LAST_CELL_PADDING : 0;
          }
          if (!Util.isDefined(oCol.DOMWidth) && thEl.clientWidth > 0) {
            oCol.DOMWidth = thEl.clientWidth;
          }
        }
      });
    }
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
