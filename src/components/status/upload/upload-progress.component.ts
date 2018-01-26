import { Component, ViewEncapsulation, AfterViewInit } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';

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
  title: string;
  protected _uploaderFiles: any[] = [];

  isOpened: boolean = false;
  onCloseFunction: Function;
  onCancelItemUpload: Function;

  protected collapsed: boolean = false;

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

  get uploaderFiles(): any[] {
    return this._uploaderFiles;
  }

  set uploaderFiles(arg: any[]) {
    this._uploaderFiles = arg;
  }
}
