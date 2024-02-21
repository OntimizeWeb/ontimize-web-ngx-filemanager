import { Component, ElementRef, Injector, OnDestroy, ViewEncapsulation } from '@angular/core';
import { AppearanceService } from 'ontimize-web-ngx';
import { Subscription } from 'rxjs';

@Component({
  selector: 'o-table-skeleton',
  templateUrl: './o-table-skeleton.component.html',
  styleUrls: ['./o-table-skeleton.component.scss'],
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class.o-table-skeleton]': 'true'
  }

})
export class OTableSkeletonExtendedComponent implements OnDestroy {
  isDarkMode: boolean;
  subscription: Subscription;
  appearanceService: AppearanceService;

  constructor(protected elRef: ElementRef, protected injector: Injector) {
    this.appearanceService = this.injector.get<AppearanceService>(AppearanceService);
    this.isDarkMode = this.appearanceService.isDarkMode();
    this.subscription = this.appearanceService.isDarkMode$.subscribe(x => this.isDarkMode = x);
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  get count() {
    const parentElement = this.elRef.nativeElement.parentElement;
    /* available parentHeight = parentElement height  - (header table header height + margin bottom)*/
    const parentHeight = parentElement.offsetHeight - 50;
    return Math.floor(parentHeight / 30);
  }

}
