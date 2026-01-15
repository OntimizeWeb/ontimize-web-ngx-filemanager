import { Component } from "@angular/core";
import { MatBottomSheetRef } from "@angular/material/bottom-sheet";

@Component({
  selector: "o-camera-file-bottom-sheet",
  templateUrl: "./bottom-sheet.component.html",
})
export class OCameraFileBottomSheetComponent {
  constructor(
    private bottomSheetRef: MatBottomSheetRef<OCameraFileBottomSheetComponent>
  ) {}

  onClickCamera(): void {
    this.bottomSheetRef.dismiss("camera");
  }

  onClickDocument(): void {
    this.bottomSheetRef.dismiss("file");
  }

  onClickCancel(): void {
    this.bottomSheetRef.dismiss("cancel");
  }
}
