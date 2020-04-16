import { TestBed } from '@angular/core/testing';

import { OntimizeWebNgxFilemanagerService } from './ontimize-web-ngx-filemanager.service';

describe('OntimizeWebNgxFilemanagerService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: OntimizeWebNgxFilemanagerService = TestBed.get(OntimizeWebNgxFilemanagerService);
    expect(service).toBeTruthy();
  });
});
