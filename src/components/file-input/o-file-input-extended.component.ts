import { Component, forwardRef, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OFileInputComponent, OSharedModule, DEFAULT_INPUTS_O_FILE_INPUT, DEFAULT_OUTPUTS_O_FILE_INPUT } from 'ontimize-web-ngx';

import { OFileUploaderExtended } from './o-file-uploader-extended';

@Component({
  selector: 'o-file-input-extended',
  templateUrl: './o-file-input-extended.component.html',
  styleUrls: ['./o-file-input-extended.component.scss'],
  inputs: DEFAULT_INPUTS_O_FILE_INPUT,
  outputs: DEFAULT_OUTPUTS_O_FILE_INPUT,
  providers: [
    {
      provide: OFileInputComponent,
      useExisting: forwardRef(() => OFileInputExtendedComponent)
    }
  ]
})
export class OFileInputExtendedComponent extends OFileInputComponent {

  initialize() {
    super.initialize();

    this.uploader = new OFileUploaderExtended(this.fileService, this.entity);
    this.uploader.splitUpload = this.splitUpload;
  }

}

@NgModule({
  declarations: [OFileInputExtendedComponent],
  imports: [OSharedModule, CommonModule],
  exports: [OFileInputExtendedComponent]
})
export class OFileInputExtendedModule {
}
