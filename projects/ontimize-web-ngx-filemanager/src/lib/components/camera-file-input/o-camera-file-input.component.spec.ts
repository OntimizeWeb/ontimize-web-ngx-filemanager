import { ComponentFixture, TestBed } from "@angular/core/testing";
import {
  CUSTOM_ELEMENTS_SCHEMA,
  Injector,
} from "@angular/core";
import { OCameraFileInputComponent } from "./o-camera-file-input.component";
import {
  AppConfig,
  appConfigFactory,
  ONTIMIZE_PROVIDERS,
  APP_CONFIG,
  OntimizeWebModule,
} from "ontimize-web-ngx";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";

describe("OCameraFileInputComponent", () => {
  let component: OCameraFileInputComponent;
  let fixture: ComponentFixture<OCameraFileInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [OCameraFileInputComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        ONTIMIZE_PROVIDERS,
        {
          provide: APP_CONFIG,
          useValue: {
            uuid: "com.ontimize.web.test",
            title: "Ontimize Web Testing",
            locale: "en",
          },
        },
        { provide: AppConfig, useFactory: appConfigFactory, deps: [Injector] },
      ],
      imports: [OntimizeWebModule, NoopAnimationsModule],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OCameraFileInputComponent);
    component = fixture.componentInstance;
  });

  describe("fileSelected", () => {
    it("should ...", () => {
      expect(component).toBeTruthy();
    });
  });
});
