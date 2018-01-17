import { Component, Injector, forwardRef, ViewEncapsulation, NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { OntimizeService, dataServiceFactory, DEFAULT_INPUTS_O_TABLE, DEFAULT_OUTPUTS_O_TABLE, OTableComponent, OTableModule, OntimizeWebModule } from 'ontimize-web-ngx';
import { CommonModule } from '@angular/common';

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
  inputs: DEFAULT_INPUTS_O_TABLE,
  outputs: DEFAULT_OUTPUTS_O_TABLE,
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class.o-table]': 'true',
    '[class.ontimize-table]': 'true',
    '[class.o-table-fixed]': 'fixedHeader'
  }
})

export class OTableExtendedComponent extends OTableComponent {

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
