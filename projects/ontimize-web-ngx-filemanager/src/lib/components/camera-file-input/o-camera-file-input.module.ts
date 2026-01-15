import { NgModule } from "@angular/core";
import { OSharedModule } from "ontimize-web-ngx";
import { CommonModule } from "@angular/common";
import { MatListModule } from "@angular/material/list";
import { MatBottomSheetModule } from "@angular/material/bottom-sheet";
import { OCameraFileBottomSheetComponent } from "./bottom-sheet/bottom-sheet.component";
import { OCameraFileInputComponent } from "./o-camera-file-input.component";
import { OFileManagerTranslateModule } from "../../util";

@NgModule({
  declarations: [OCameraFileInputComponent, OCameraFileBottomSheetComponent],
  imports: [OSharedModule, CommonModule, MatListModule, MatBottomSheetModule, OFileManagerTranslateModule],
  exports: [OCameraFileInputComponent],
})
export class OCameraFileInputModule {}
