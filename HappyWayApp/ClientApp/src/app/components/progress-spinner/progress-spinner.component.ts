import {Component, Input, OnInit, ViewChild, TemplateRef, ViewContainerRef, DoCheck, OnDestroy} from '@angular/core';
import {OverlayConfig, OverlayRef} from '@angular/cdk/overlay';
import {OverlayService} from '../../services/overlay.service';
import {ProgressSpinnerMode} from '@angular/material/progress-spinner';
import {ThemePalette} from '@angular/material/core';
import {ProgressSpinnerService} from '../../services/progress-spinner.service';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-progress-spinner',
  templateUrl: './progress-spinner.component.html',
  styleUrls: ['./progress-spinner.component.css']
})
export class ProgressSpinnerComponent implements DoCheck, OnInit, OnDestroy {
  @Input() color?: ThemePalette;
  @Input() diameter = 100;
  @Input() mode?: ProgressSpinnerMode;
  @Input() strokeWidth?: number;
  @Input() value?: number;
  @Input() backdropEnabled = true;
  @Input() positionGloballyCenter = true;
  @Input() displayProgressSpinner: boolean;

  @ViewChild('progressSpinnerRef', { static: true }) private progressSpinnerRef: TemplateRef<any>;
  private progressSpinnerOverlayConfig: OverlayConfig;
  private overlayRef: OverlayRef;
  private displayProgressSpinnerSubscription: Subscription;

  constructor(private vcRef: ViewContainerRef,
              private overlayService: OverlayService,
              private progressSpinnerService: ProgressSpinnerService) { }

  ngOnInit() {
    this.progressSpinnerOverlayConfig = {
      hasBackdrop: this.backdropEnabled
    };
    if (this.positionGloballyCenter) {
      this.progressSpinnerOverlayConfig['positionStrategy'] = this.overlayService.positionGloballyCenter();
    }
    this.overlayRef = this.overlayService.createOverlay(this.progressSpinnerOverlayConfig);
    this.displayProgressSpinnerSubscription = this.progressSpinnerService.displayProgressSpinnerChange.subscribe(data => {
      this.displayProgressSpinner = data;
    });
  }

  ngDoCheck() {
    if (this.displayProgressSpinner && !this.overlayRef.hasAttached()) {
      this.overlayService.attachTemplatePortal(this.overlayRef, this.progressSpinnerRef, this.vcRef);
    } else if (!this.displayProgressSpinner && this.overlayRef.hasAttached()) {
      this.overlayRef.detach();
    }
  }

  ngOnDestroy() {
    this.displayProgressSpinnerSubscription.unsubscribe();
  }
}
