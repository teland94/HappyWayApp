import { Inject, Injectable, InjectionToken, Optional } from '@angular/core';
import { Subject } from 'rxjs';

export let PROGRESS_SPINNER_CONFIG = new InjectionToken<ProgressSpinnerConfig>('progress-spinner.config');

export class ProgressSpinnerConfig {
  delayStart: number;
  delayStop: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProgressSpinnerService {

  private displayProgressSpinnerChange$ = new Subject<boolean>();
  displayProgressSpinnerChange = this.displayProgressSpinnerChange$.asObservable();

  state: any = { startTimeout: null, stopTimeout: null, blockCount: 0 };
  isActive = false;

  constructor(@Optional() @Inject(PROGRESS_SPINNER_CONFIG)
  private readonly progressSpinnerConfig: ProgressSpinnerConfig) { }

  start(delayStart?: number) {
    const delay = delayStart !== undefined && delayStart !== null ? delayStart
      : (this.progressSpinnerConfig ? this.progressSpinnerConfig.delayStart : 0);
    if (this.state.startTimeout === null) {
      if (delay === 0) {
        this.showBlock();
      } else {
        this.state.startTimeout = setTimeout(() => {
          this.showBlock();
        }, delay);
      }
    }
    this.state.blockCount++;
  }

  stop(delayStop?: number) {
    const delay = delayStop !== undefined && delayStop !== null ? delayStop
      : (this.progressSpinnerConfig ? this.progressSpinnerConfig.delayStop : 0);
    if (this.state.blockCount > 1) {
      this.state.blockCount--;
    } else {
      if (!this.isActive) {
        this.clearState();
      } else {
        if (this.state.stopTimeout === null) {
          if (delay === 0) {
            this.hideBlock();
          } else {
            this.state.stopTimeout = setTimeout(() => {
              this.hideBlock();
            }, delay);
          }
        }
      }
    }
  }

  private showBlock() {
    this.isActive = true;
    this.displayProgressSpinnerChange$.next(true);
  }

  private hideBlock() {
    this.clearState();
    this.isActive = false;
    this.displayProgressSpinnerChange$.next(false);
  }


  private clearState() {
    this.state.startTimeout != null && clearTimeout(this.state.startTimeout);
    this.state.stopTimeout != null && clearTimeout(this.state.stopTimeout);
    this.state.blockCount = 0;
    this.state.startTimeout = null;
    this.state.stopTimeout = null;
  }
}
