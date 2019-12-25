import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material';
import { ConfirmationDialogComponent } from '../components/dialogs/confirmation-dialog/confirmation-dialog.component';
import { PasswordPromptDialogComponent } from '../components/dialogs/password-prompt-dialog/password-prompt-dialog.component';
import { AuthenticationService } from './authentication.service';
import { flatMap } from 'rxjs/operators';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConfirmationService {

  private readonly dialogWidth = '350px';

  constructor(private readonly dialog: MatDialog,
              private readonly authenticationService: AuthenticationService) { }

  openConfirmDialogWithPassword(action: string) {
    return this.openConfirmDialog(action)
      .pipe(
          flatMap(confirmResult => {
            if (!confirmResult) { return of(confirmResult); }
            const dialogRef = this.dialog.open(PasswordPromptDialogComponent, {
              width: this.dialogWidth,
              data: `Чтобы ${action} необходимо ввести пароль.`
            });
            return dialogRef.afterClosed()
              .pipe(
                flatMap(password => {
                  return this.authenticationService.checkPassword(password);
                })
              );
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
}
