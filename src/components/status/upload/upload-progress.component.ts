import { Component, ViewEncapsulation } from '@angular/core';
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
    '[class.upload-progress]': 'true',
    '[@displayMode]': '_getExpandedState()'
  },
  animations: [
    trigger('bodyExpansion', [
      state('collapsed', style({ height: '0px' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate(EXPANSION_PANEL_ANIMATION_TIMING)),
    ]),
    trigger('displayMode', [
      state('collapsed', style({ margin: '0' })),
      state('default', style({ margin: '16px 0' })),
      state('flat', style({ margin: '0' })),
      transition('flat <=> collapsed, default <=> collapsed, flat <=> default',
        animate(EXPANSION_PANEL_ANIMATION_TIMING)),
    ]),
  ],
})

export class UploadProgressComponent {
  protected title: string;
  protected uploaderFiles: any;

  protected onCloseFunction: Function;
  protected onCancelItemUpload: Function;

  protected collapsed: boolean = false;

  onClose() {
    if (this.onCloseFunction) {
      this.onCloseFunction();
    }
  }

  onToggleCollapse() {
    this.collapsed = !this.collapsed;
  }

  _getExpandedState(): any {
    return this.collapsed ? 'collapsed' : 'expanded';
  }

  onCancelFileUpload(file: any) {
    if (this.onCancelItemUpload) {
      this.onCancelItemUpload(file);
    }
  }
}
