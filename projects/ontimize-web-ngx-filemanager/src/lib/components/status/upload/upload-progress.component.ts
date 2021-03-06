import { animate, state, style, transition, trigger } from '@angular/animations';
import { AfterViewInit, Component, ViewEncapsulation } from '@angular/core';

import { OFileManagerTranslatePipe } from '../../../util';

export const DEFAULT_INPUTS_UPLOAD_PROGRESS = [
  'title',
  'uploaderFiles : files'
];

export const DEFAULT_OUTPUTS_UPLOAD_PROGRESS = [
];

export const EXPANSION_PANEL_ANIMATION_TIMING = '225ms cubic-bezier(0.4,0.0,0.2,1)';

@Component({
  selector: 'upload-progress',
  templateUrl: './upload-progress.component.html',
  styleUrls: ['./upload-progress.component.scss'],
  inputs: DEFAULT_INPUTS_UPLOAD_PROGRESS,
  outputs: DEFAULT_OUTPUTS_UPLOAD_PROGRESS,
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class.upload-progress]': 'true'
  },
  animations: [
    trigger('contentExpansion', [
      state('collapsed', style({ height: '0px' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate(EXPANSION_PANEL_ANIMATION_TIMING))
    ]),
    trigger('containerPosition', [
      state('opened', style({ opacity: '1' })),
      state('closed', style({ opacity: '0.01', bottom: '0px' })),
      transition('opened <=> closed', animate(EXPANSION_PANEL_ANIMATION_TIMING))
    ])
  ]
})

export class UploadProgressComponent implements AfterViewInit {
  _title: string;
  protected _uploaderFiles: any[] = [];

  isOpened: boolean = false;
  onCloseFunction: Function;
  onCancelItemUpload: Function;

  collapsed: boolean = false;
  translatePipe: OFileManagerTranslatePipe;

  ngAfterViewInit() {
    this.isOpened = true;
  }

  onClose() {
    if (this.onCloseFunction) {
      this.isOpened = false;
      this.onCloseFunction();
    }
  }

  onToggleCollapse() {
    this.collapsed = !this.collapsed;
  }

  _getExpandedState(): any {
    return this.collapsed ? 'collapsed' : 'expanded';
  }

  _getContainerState(): any {
    return this.isOpened ? 'opened' : 'closed';
  }

  onCancelFileUpload(file: any) {
    if (this.onCancelItemUpload) {
      this.onCancelItemUpload(file);
    }
  }

  get cancelledUploadText(): string {
    return this.translatePipe.transform('MESSAGES.UPLOADING_CANCELLED');
  }

  get uploaderFiles(): any[] {
    return this._uploaderFiles;
  }

  set uploaderFiles(arg: any[]) {
    this._uploaderFiles = arg;
  }

  get title(): string {
    return this._title;
  }

  set title(arg: string) {
    this._title = arg;
  }
}
