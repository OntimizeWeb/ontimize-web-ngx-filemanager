import { animate, state, style, transition, trigger } from '@angular/animations';
import { VIRTUAL_SCROLL_STRATEGY } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, Component, forwardRef, Injector, NgModule, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialogConfig } from '@angular/material';
import {
  AbstractComponentStateService,
  DEFAULT_INPUTS_O_TABLE,
  DEFAULT_OUTPUTS_O_TABLE,
  ObservableWrapper,
  OColumn,
  OntimizeServiceProvider,
  OntimizeWebModule,
  OQueryDataArgs,
  OTableComponent,
  OTableComponentStateService,
  OTableDataSourceService,
  OTableVirtualScrollStrategy,
  Util
} from 'ontimize-web-ngx';

import { FileManagerStateService } from '../../../services/filemanager-state.service';
import { OFileManagerTranslateModule } from '../../../util';
import { FolderNameDialogComponent } from './dialog/foldername/folder-name-dialog.component';

@Component({
  selector: 'o-table-extended',
  templateUrl: './o-table-extended.component.html',
  providers: [
    OntimizeServiceProvider,
    OTableDataSourceService,
    { provide: OTableComponent, useExisting: forwardRef(() => OTableExtendedComponent) },
    { provide: AbstractComponentStateService, useClass: OTableComponentStateService, deps: [Injector] },
    { provide: VIRTUAL_SCROLL_STRATEGY, useClass: OTableVirtualScrollStrategy }
  ],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ])
  ],
  inputs: [
    ...DEFAULT_INPUTS_O_TABLE,
    'workspaceKey: workspace-key',
    'addFolderMethod : add-folder-method'
  ],
  outputs: DEFAULT_OUTPUTS_O_TABLE,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.o-table]': 'true',
    '[class.ontimize-table]': 'true',
    '[class.o-table-fixed]': 'fixedHeader',
    '[class.o-table-disabled]': '!enabled',
    '(document:click)': 'handleDOMClick($event)'
  }
})
export class OTableExtendedComponent extends OTableComponent implements OnInit, AfterViewInit, OnDestroy {

  public static FM_FOLDER_PARENT_KEY = 'FM_FOLDER_PARENT_KEY';

  protected workspaceId: any;
  protected workspaceKey: string;
  protected addFolderMethod: string;

  protected stateService: FileManagerStateService;
  protected _breadcrumbs: any[] = [];

  protected mutationObserver: MutationObserver;

  public ngOnInit(): void {
    // setting fake value for avoid entity is undefined checking
    this.entity = 'fakeEntity';
    super.ngOnInit();
    this.paginationControls = false;
  }

  public ngAfterViewInit(): void {
    super.ngAfterViewInit();
    this.registerHeaderMutationObserver();
  }

  public ngOnDestroy(): void {
    super.ngOnDestroy();
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
    }
  }

  public getDataService(): any {
    return this.dataService;
  }

  /**
   * This method manages the call to the service
   * @param filter the query filter
   * @param ovrrArgs override arguments
   */
  public queryData(filter?: any, ovrrArgs?: OQueryDataArgs): void {
    this.workspaceId = this.form.formData[this.workspaceKey] ? this.form.formData[this.workspaceKey].value : undefined;

    if (!Util.isDefined(this.workspaceId)) {
      this.setData([], []);
      return;
    }
    super.queryData(filter, ovrrArgs);
  }

  public getQueryArguments(filter: object, ovrrArgs?: any): any[] {
    const queryArguments = super.getQueryArguments(filter, ovrrArgs);
    queryArguments.unshift(this.workspaceId);
    return queryArguments;
  }

  public remove(clearSelectedItems: boolean = false): void {
    if ((this.keysArray.length === 0) || this.selection.isEmpty()) {
      return;
    }
    this.dialogService.confirm('CONFIRM', 'MESSAGES.CONFIRM_DELETE').then(res => {
      if (res === true) {
        if (this.dataService && (this.deleteMethod in this.dataService) && (this.keysArray.length > 0)) {
          const workspaceId = (this.form as any).getDataValue(this.workspaceKey).value;
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

  public onAddFolder(): void {
    const cfg: MatDialogConfig = {
      role: 'dialog',
      disableClose: false,
      panelClass: ['o-dialog-class']
    };
    const dialogRef = this.dialog.open(FolderNameDialogComponent, cfg);
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.insertFolder(result);
      }
    });
  }

  public insertFolder(folderName: string): void {
    const tableService = this.dataService;
    if (!tableService || !(this.addFolderMethod in tableService)) {
      return;
    }
    const workspaceId = (this.form as any).getDataValue(this.workspaceKey).value;
    const kv = {};
    const currentFilter = this.stateService.getCurrentQueryFilter();
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

  public setStateService(service: FileManagerStateService): void {
    this.stateService = service;
  }

  get breadcrumbs(): any[] {
    return this._breadcrumbs;
  }

  set breadcrumbs(arg: any[]) {
    this._breadcrumbs = arg;
  }

  public onGoToRootFolderClick(): void {
    this.stateService.restart();
    const filter = this.stateService.getFormParentItem();
    this.queryData(filter);
  }

  public onBreadcrumbItemClick(filter: any, index: number): void {
    this.stateService.restart(index);
    this.queryData(filter);
  }

  reloadData() {
    this.reloadCurrentFolder();
  }

  public reloadCurrentFolder(): void {
    const kv = {};
    const currentFilter = this.stateService.getCurrentQueryFilter();
    if (currentFilter.hasOwnProperty(OTableExtendedComponent.FM_FOLDER_PARENT_KEY)) {
      kv[OTableExtendedComponent.FM_FOLDER_PARENT_KEY] = currentFilter[OTableExtendedComponent.FM_FOLDER_PARENT_KEY];
    }
    this.queryData(kv);
  }

  protected registerHeaderMutationObserver(): void {
    this.mutationObserver = new MutationObserver(() => {
      if (this.tableHeaderEl.nativeElement.children.length > 0) {
        this.initializeColumnsDOMWidth();
        this.mutationObserver.disconnect();
      }
    });

    this.mutationObserver.observe(this.tableHeaderEl.nativeElement, {
      attributes: true
    });
  }

  protected initializeColumnsDOMWidth(): void {
    if (Util.isDefined(this.tableHeaderEl)) {
      [].slice.call(this.tableHeaderEl.nativeElement.children).forEach(thEl => {
        const oCol: OColumn = this.getOColumnFromTh(thEl);
        if (Util.isDefined(oCol)) {
          if (!Util.isDefined(oCol.DOMWidth) && thEl.clientWidth > 0) {
            oCol.DOMWidth = thEl.clientWidth;
          }
        }
      });
    }
  }

}

@NgModule({
  declarations: [OTableExtendedComponent, FolderNameDialogComponent],
  entryComponents: [FolderNameDialogComponent],
  imports: [CommonModule, OntimizeWebModule, OFileManagerTranslateModule],
  exports: [OTableExtendedComponent]
})
export class OTableExtendedModule { }
