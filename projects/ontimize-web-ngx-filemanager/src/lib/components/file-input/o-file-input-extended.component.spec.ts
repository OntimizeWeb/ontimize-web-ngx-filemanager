import { CUSTOM_ELEMENTS_SCHEMA, Injector } from '@angular/core';
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { OFileInputExtendedComponent } from "./o-file-input-extended.component";
import { APP_CONFIG, AppConfig, appConfigFactory, ONTIMIZE_PROVIDERS, OntimizeWebModule } from 'ontimize-web-ngx';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe("OFileInputExtendedComponent", () => {
  let component: OFileInputExtendedComponent;
  let fixture: ComponentFixture<OFileInputExtendedComponent>;


  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [OFileInputExtendedComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        ONTIMIZE_PROVIDERS,
        {
          provide: APP_CONFIG, useValue:  {
            uuid: 'com.ontimize.web.test',
            title: 'Ontimize Web Testing',
            locale: 'en'
          } },
        { provide: AppConfig, useFactory: appConfigFactory, deps: [Injector] },
      ],
      imports: [
        OntimizeWebModule,
        NoopAnimationsModule
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OFileInputExtendedComponent);
    component = fixture.componentInstance;


  });

  describe('fileSelected', () => {
    it('should ...', () => {
      expect(component).toBeTruthy();
    });
  });
})