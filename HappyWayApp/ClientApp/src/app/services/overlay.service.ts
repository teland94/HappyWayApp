import {Injectable, TemplateRef, ViewContainerRef} from '@angular/core';
import {Overlay, OverlayConfig, OverlayRef, PositionStrategy} from '@angular/cdk/overlay';
import {TemplatePortal} from '@angular/cdk/portal';

@Injectable({
  providedIn: 'root'
})
export class OverlayService {

  constructor(private readonly overlay: Overlay) { }

  createOverlay(config: OverlayConfig) {
    return this.overlay.create(config);
  }

  attachTemplatePortal(overlayRef: OverlayRef, templateRef: TemplateRef<any>, vcRef: ViewContainerRef) {
    const templatePortal = new TemplatePortal(templateRef, vcRef);
    overlayRef.attach(templatePortal);
  }

  positionGloballyCenter() {
    return this.overlay.position()
      .global()
      .centerHorizontally()
      .centerVertically();
  }
}
