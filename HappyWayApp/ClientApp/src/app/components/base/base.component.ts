import { Component, OnInit } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

@Component({
  selector: 'app-base',
  template: ``,
})
export class BaseComponent implements OnInit {

  constructor(protected readonly snackBar: MatSnackBar) { }

  ngOnInit() {
  }

  protected showError(errorText: string, error: any) {
    console.log(error);
    const config = new MatSnackBarConfig();
    config.duration = 3000;
    config.panelClass = ['error-panel'];
    this.snackBar.open(errorText, null, config);
  }
}
