import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarConfig, MatSnackBarDismiss } from '@angular/material/snack-bar';
import { ConfirmationDialogComponent } from '../components/dialogs/confirmation-dialog/confirmation-dialog.component';
import { PasswordPromptDialogComponent } from '../components/dialogs/password-prompt-dialog/password-prompt-dialog.component';
import { AuthenticationService } from './authentication.service';
import { catchError, flatMap, map } from 'rxjs/operators';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConfirmationService {

  private readonly dialogWidth = '370px';

  private passwordDialogRef: MatDialogRef<PasswordPromptDialogComponent, any>;

  constructor(private readonly dialog: MatDialog,
              private readonly snackBar: MatSnackBar,
              private readonly authenticationService: AuthenticationService) { }

  openConfirmDialogWithPassword(action: string) {
    return this.openConfirmDialog(action)
      .pipe(
          flatMap(confirmResult => {
            if (!confirmResult) { return of(false); }
            return this.openPasswordPromptDialog(action);
          })
      );
  }

  openConfirmDialog(action: string) {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: this.dialogWidth,
      data: `Вы действительно хотите ${action}?`
    });
    return dialogRef.afterClosed();
  }

  private openPasswordPromptDialog(action: string) {
    this.passwordDialogRef = this.dialog.open(PasswordPromptDialogComponent, {
      width: this.dialogWidth,
      data: `Чтобы ${action} необходимо ввести пароль.`
    });
    return this.passwordDialogRef.afterClosed()
      .pipe(
        flatMap(passwordResult => {
          if (!passwordResult) { return of(false); }
          return this.authenticationService.checkPassword(passwordResult)
            .pipe(
              map(() => true),
              catchError(this.checkPasswordErrorHandler(action))
            );
        })
      );
  }

  private checkPasswordErrorHandler(action: string) {
    return (err: any) => {
      if (err.status) {
        throw err;
      }
      return this.openRetryBar('Неверный пароль.')
       .pipe(
         flatMap((dismiss: MatSnackBarDismiss) => {
          if (dismiss.dismissedByAction) {
            return this.openPasswordPromptDialog(action);
          } else {
            return of(false);
          }
        })
       );
    };
  }

  private openRetryBar(errorText: string) {
    const config = new MatSnackBarConfig();
    config.duration = 5000;
    config.panelClass = ['error-panel'];
    return this.snackBar.open(errorText, 'Повторить', config).afterDismissed();
  }
}
