import {
  MenuRootItem,

} from 'ontimize-web-ngx';

export const MENU_CONFIG: MenuRootItem[] = [
  { id: 'home', name: 'HOME', icon: 'home', route: '/main/home' },
  { id: 'filemanager', name: 'FILEMANAGER', icon: 'folder_open', route: '/main/filemanager' },
  { id: 'testing', name: 'TESTING', icon: 'warning', route: '/main/filemanager/testing' }
];
