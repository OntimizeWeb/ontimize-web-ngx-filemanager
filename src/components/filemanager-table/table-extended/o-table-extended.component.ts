import { Component, forwardRef, Injector, NgModule, ViewEncapsulation, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OntimizeService, dataServiceFactory, DEFAULT_INPUTS_O_TABLE, DEFAULT_OUTPUTS_O_TABLE, OTableComponent, OntimizeWebModule, OFormValue, Util, ObservableWrapper } from 'ontimize-web-ngx';

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
    'workspaceKey: workspace-key'
  ],
  outputs: DEFAULT_OUTPUTS_O_TABLE,
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class.o-table]': 'true',
    '[class.ontimize-table]': 'true',
    '[class.o-table-fixed]': 'fixedHeader'
  }
})

export class OTableExtendedComponent extends OTableComponent {

  public static FM_FOLDER_PARENT_KEY: string = 'FM_FOLDER_PARENT_KEY';

  protected workspaceKey: string;
  protected workspaceId: any;

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
    if (this.dataService && (queryMethodName in this.dataService)) {
      this.pendingQuery = false;
      this.pendingQueryFilter = undefined;

      if (this.filterForm && (typeof (parentItem) === 'undefined')) {
        parentItem = {};
        let formComponents = this.form.getComponents();
        if ((this.dataParentKeys.length > 0) && (Object.keys(formComponents).length > 0)) {
          for (let k = 0; k < this.dataParentKeys.length; ++k) {
            let parentKey = this.dataParentKeys[k];
            if (formComponents.hasOwnProperty(parentKey['alias'])) {
              let currentData = formComponents[parentKey['alias']].getValue();
              switch (typeof (currentData)) {
                case 'string':
                  if (currentData.trim().length > 0) {
                    parentItem[parentKey['alias']] = currentData.trim();
                  }
                  break;
                case 'number':
                  if (!isNaN(currentData)) {
                    parentItem[parentKey['alias']] = currentData;
                  }
                  break;
              }
            }
          }
        }
      }

      let formComponents = this.form.getComponents();
      this.workspaceId = formComponents[this.workspaceKey].getValue();

      if ((this.dataParentKeys.length > 0) && (typeof (parentItem) === 'undefined')) {
        this.setData([], []);
      } else {
        let filter = {};
        if ((this.dataParentKeys.length > 0) && (typeof (parentItem) !== 'undefined')) {
          for (let k = 0; k < this.dataParentKeys.length; ++k) {
            let parentKey = this.dataParentKeys[k];
            if (parentItem.hasOwnProperty(parentKey['alias'])) {
              let currentData = parentItem[parentKey['alias']];
              if (currentData instanceof OFormValue) {
                currentData = currentData.value;
              }
              filter[parentKey['name']] = currentData;
            }
          }
        }

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

  handleClick(item: any, $event?) {
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

}

@NgModule({
  declarations: [OTableExtendedComponent],
  imports: [
    CommonModule,
    OntimizeWebModule
  ],
  exports: [OTableExtendedComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class OTableExtendedModule {
}
