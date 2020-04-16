import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OntimizeWebNgxFilemanagerComponent } from './ontimize-web-ngx-filemanager.component';

describe('OntimizeWebNgxFilemanagerComponent', () => {
  let component: OntimizeWebNgxFilemanagerComponent;
  let fixture: ComponentFixture<OntimizeWebNgxFilemanagerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OntimizeWebNgxFilemanagerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OntimizeWebNgxFilemanagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
