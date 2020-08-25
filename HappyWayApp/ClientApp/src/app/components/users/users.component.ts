import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { UserModel, Role } from '../../models/user.model';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { UserDialogComponent, UserDialogData } from '../dialogs/user-dialog/user-dialog.component';
import { AuthenticationService } from '../../services/authentication.service';
import { ConfirmationService } from '../../services/confirmation.service';
import { ProgressSpinnerService } from '../../services/progress-spinner.service';
import { BaseComponent } from '../base/base.component';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent extends BaseComponent implements OnInit {

  users: UserModel[];

  currentUser: UserModel;
  role = Role;

  displayedColumns: string[] = ['username', 'displayName', 'phoneNumber', 'edit', 'delete'];

  constructor(private readonly userService: UserService,
              private readonly authenticationService: AuthenticationService,
              private readonly confirmationService: ConfirmationService,
              protected readonly snackBar: MatSnackBar,
              private readonly dialog: MatDialog,
              private readonly progressSpinnerService: ProgressSpinnerService) {
    super(snackBar);
  }

  ngOnInit() {
    this.load();
    this.currentUser = this.authenticationService.currentUserValue;
  }

  add() {
    this.openDialog().subscribe(user => {
      if (!user) { return; }
      this.userService.create(user)
        .subscribe(() => {
          this.load();
        }, error => {
          this.showError('Ошибка добавления хостес.', error);
        });
    });
  }

  edit(user: UserModel) {
    this.openDialog(user).subscribe(editedUser => {
      if (!editedUser) { return; }
      editedUser.id = user.id;
      this.userService.update(editedUser)
        .subscribe(() => {
          this.load();
        }, error => {
          this.showError('Ошибка редактирования хостес.', error);
        });
    });
  }

  delete(user: UserModel) {
    this.confirmationService.openConfirmDialogWithPassword('удалить').subscribe(data => {
      if (!data) { return; }
      this.userService.delete(user.id)
        .subscribe(() => {
          this.load();
        }, error => {
          this.showError('Ошибка удаления хостес.', error);
        });
    });
  }

  private load() {
    this.progressSpinnerService.start();
    this.userService.getAll().subscribe((users) => {
      this.users = users;
      this.progressSpinnerService.stop();
    }, error => {
      this.progressSpinnerService.stop();
      this.showError('Ошибка загрузки пользователей.', error);
    });
  }

  private openDialog(user?: UserModel) {
    const dialogRef = this.dialog.open(UserDialogComponent, {
      width: '370px',
      data: <UserDialogData>{
        user: user ? user : { }
      }
    });

    return dialogRef.afterClosed();
  }
}
