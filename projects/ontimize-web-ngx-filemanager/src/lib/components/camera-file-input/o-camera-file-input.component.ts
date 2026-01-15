import {
  Component,
  ElementRef,
  forwardRef,
  Inject,
  Injector,
  Input,
  OnInit,
  Optional,
  ViewChild,
} from "@angular/core";
import {
  OFileInputComponent,
  OFileItem,
  OFormComponent,
  OntimizeFileService,
} from "ontimize-web-ngx";

import { OCameraFileBottomSheetComponent } from "./bottom-sheet/bottom-sheet.component";
import { MatBottomSheet } from "@angular/material/bottom-sheet";
import { OFileUploaderExtended } from "../o-file-uploader-extended";
import { WorkspaceService } from "../../services/workspace.service";
import { WorkspaceS3 } from "../../interfaces/workspaceS3.interface";
import { FileManagerS3Service } from "../../services/filemanager-s3.service";

export const DEFAULT_INPUTS_O_CAMERA_FILE = [
  "workspaceKey: workspace-key",
  /*Funtion called for creating the workspace S3.The function return a object of type WorkspaceS3*/
  "workspaceS3: workspace-s3",
  "type",
  "parentKey: parent-key",
];

@Component({
  selector: "o-camera-file-input",
  templateUrl: "./o-camera-file-input.component.html",
  styleUrls: ["./o-camera-file-input.component.scss"],
  inputs: DEFAULT_INPUTS_O_CAMERA_FILE,
  providers: [WorkspaceService],
})
export class OCameraFileInputComponent
  extends OFileInputComponent
  implements OnInit
{
  @ViewChild("inputFile", { static: false })
  inputFileRef: ElementRef<HTMLInputElement>;

  workspaceS3: (values: { [key: string]: any }) => WorkspaceS3;

  public static readonly DEFAULT_SERVICE_TYPE = "FileManagerOntimizeService";
  public static readonly S3_SERVICE_TYPE = "FileManagerS3Service";
  public static readonly S3_TYPE = "S3";

  private _bottomSheet: MatBottomSheet;
  public showCameraOption: boolean = false;
  workspaceKey: string;
  parentKey: string;
  type: string = OCameraFileInputComponent.DEFAULT_SERVICE_TYPE;
  protected workspaceService: WorkspaceService;

  constructor(
    elRef: ElementRef,
    injector: Injector,
    @Optional()
    @Inject(forwardRef(() => OFormComponent))
    protected oForm: OFormComponent
  ) {
    super(oForm, elRef, injector);
    this._bottomSheet = this.injector.get(MatBottomSheet);
    this.workspaceService = this.injector.get(WorkspaceService);
  }

  ngOnInit() {
    super.ngOnInit();
    switch (this.type) {
      case OCameraFileInputComponent.S3_TYPE:
        this.serviceType = OCameraFileInputComponent.S3_SERVICE_TYPE;
        this.workspaceService.initializeS3Provider(
          this.workspaceKey,
          this.oForm,
          this.workspaceS3
        );
        var fileManagerService: FileManagerS3Service = new FileManagerS3Service(
          this.injector
        );
        this.uploader = new OFileUploaderExtended(
          this.fileService,
          this.entity,
          this.form,
          this.parentKey,
          fileManagerService,
          this.workspaceService
        );
        break;
    }
    this.detectCamera();
  }

  fileSelected(event: Event): void {
    let value: string = "";
    if (event) {
      const files: FileList = event.target["files"];

      for (let i = 0, f: File; (f = files[i]); i++) {
        const fileItem: OFileItem = new OFileItem(f, this.uploader);
        this.uploader.addFile(fileItem);
      }
      value = this.uploader.files.map((file) => file.name).join(", ");
    }
    window.setTimeout(() => {
      this.setValue(value !== "" ? value : undefined);
      this.inputFile.nativeElement.value = "";
      if (this._fControl) {
        this._fControl.markAsTouched();
      }
    }, 0);
  }

  private async detectCamera() {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const hasCamera = devices.some((device) => device.kind === "videoinput");
      this.showCameraOption = hasCamera;
    } catch (err) {
      this.showCameraOption = false;
    }
  }

  openBottomSheet(): void {
    const bottomSheetRef = this._bottomSheet.open(
      OCameraFileBottomSheetComponent
    );

    bottomSheetRef.afterDismissed().subscribe((result) => {
      switch (result) {
        case "camera":
          this.useCameraMode();
          break;
        case "file":
          this.useFilePicker();
          break;
      }
    });
  }

  useCameraMode(): void {
    this.inputFileRef.nativeElement.setAttribute("accept", "image/*");
    this.inputFileRef.nativeElement.setAttribute("capture", "environment");
    this.inputFileRef.nativeElement.click();
  }

  useFilePicker(): void {
    this.inputFileRef.nativeElement.setAttribute(
      "accept",
      this.acceptFileType
        ? this.acceptFileType.replace(this.arraySeparatorRegExp, ",")
        : "*"
    );
    this.inputFileRef.nativeElement.removeAttribute("capture");
    this.inputFileRef.nativeElement.click();
  }
}
