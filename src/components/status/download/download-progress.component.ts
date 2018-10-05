import { Component, ViewEncapsulation, AfterViewInit } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { OFileManagerTranslatePipe } from '../../../core';

export const DEFAULT_INPUTS_DOWNLOAD_PROGRESS = [
  'title',
  'files'
];

export const DEFAULT_OUTPUTS_DOWNLOAD_PROGRESS = [
];

export const EXPANSION_PANEL_ANIMATION_TIMING = '225ms cubic-bezier(0.4,0.0,0.2,1)';

@Component({
  moduleId: module.id,
  selector: 'download-progress',
  templateUrl: './download-progress.component.html',
  styleUrls: ['./download-progress.component.scss'],
  inputs: DEFAULT_INPUTS_DOWNLOAD_PROGRESS,
  outputs: DEFAULT_OUTPUTS_DOWNLOAD_PROGRESS,
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class.download-progress]': 'true'
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

export class DownloadProgressComponent implements AfterViewInit {
  _title: string;
  protected _files: any[] = [];

  isOpened: boolean = false;
  onCloseFunction: Function;

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

  onCancelFileDownload(file: any) {
    if (file.subscription) {
      file.subscription.unsubscribe();
      file.cancelled = true;
    }
  }

  getText(file: any): string {
    if (file && file.name) {
      return file.name;
    }
    const quantityStr = file && file.filesQuantity ? '  (' + file.filesQuantity + ')' : '';
    return this.translatePipe.transform('MESSAGES.COMPRESSING_FILES') + quantityStr;
  }

  get cancelledDownloadText(): string {
    return this.translatePipe.transform('MESSAGES.DOWNLOAD_CANCELLED');
  }

  get files(): any[] {
    return this._files;
  }

  set files(arg: any[]) {
    this._files = arg;
  }

  get title(): string {
    return this._title;
  }

  set title(arg: string) {
    this._title = arg;
  }
}
