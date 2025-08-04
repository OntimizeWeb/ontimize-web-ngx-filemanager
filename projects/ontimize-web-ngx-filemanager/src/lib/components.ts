import { OCameraFileInputModule } from './components/camera-file-input/o-camera-file-input.module';
import { OFileManagerTableModule } from './components/filemanager-table/o-filemanager-table.module';

export * from './components/filemanager-table/o-filemanager-table.component';
export * from './components/camera-file-input/o-camera-file-input.component';

export const OFILEMANAGER_MODULES: any[] = [
  OFileManagerTableModule,
  OCameraFileInputModule
];
