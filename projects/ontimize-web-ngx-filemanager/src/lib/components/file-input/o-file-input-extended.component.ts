import { CommonModule } from '@angular/common';
import { Component, forwardRef, NgModule } from '@angular/core';
import { OFileInputComponent, OFileItem, OSharedModule } from 'ontimize-web-ngx';

import { WorkspaceService } from '../../services/workspace.service';
import { OFileUploaderExtended } from './o-file-uploader-extended';

@Component({
  selector: 'o-file-input-extended',
  templateUrl: './o-file-input-extended.component.html',
  styleUrls: ['./o-file-input-extended.component.scss'],
  inputs: [
    'workspaceKey: workspace-key',
    'parentKey: parent-key'
  ],
  providers: [
    {
      provide: OFileInputComponent,
      useExisting: forwardRef(() => OFileInputExtendedComponent)
    }
  ]
})
export class OFileInputExtendedComponent extends OFileInputComponent {
  uploader: OFileUploaderExtended;
  parentKey: string;

  initialize() {
    super.initialize();
    const workspaceService: WorkspaceService = this.injector.get( WorkspaceService );
    this.uploader = new OFileUploaderExtended( this.fileService, this.entity, this.form, this.parentKey, this.fileService, workspaceService );
    this.uploader.splitUpload = this.splitUpload;
  }

  fileSelected(event: Event): void {
    let value: string = '';
    if (event) {
      const files: FileList = event.target['files'];

      for (let i = 0, f: File; f = files[i]; i++) {
        const fileItem: OFileItem = new OFileItem(f, this.uploader);
        this.uploader.addFile(fileItem);
      }
      value = this.uploader.files.map(file => file.name).join(', ');
    }
    window.setTimeout(() => {
      this.setValue(value !== '' ? value : undefined);
      this.inputFile.nativeElement.value = '';
      if (this._fControl) {
        this._fControl.markAsTouched();
      }
    }, 0);
  }

}

@NgModule({
  declarations: [OFileInputExtendedComponent],
  imports: [OSharedModule, CommonModule],
  exports: [OFileInputExtendedComponent]
})
export class OFileInputExtendedModule { }
