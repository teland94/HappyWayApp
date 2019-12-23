import { Component, OnInit } from '@angular/core';
import {UserService} from '../../services/user.service';
import {UserModel} from '../../models/user.model';
import {MatDialog, MatSnackBar, MatSnackBarConfig} from '@angular/material';
import {UserDialogComponent} from '../dialogs/user-dialog/user-dialog.component';
import {ConfirmationDialogComponent} from '../dialogs/confirmation-dialog/confirmation-dialog.component';
import {BlockUI, NgBlockUI} from 'ng-block-ui';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {

  users: UserModel[] = [];

  displayedColumns: string[] = ['username', 'firstName', 'lastName', 'edit', 'delete'];
  @BlockUI() blockUI: NgBlockUI;

  constructor(private readonly userService: UserService,
              private readonly snackBar: MatSnackBar,
              private readonly dialog: MatDialog) { }

  ngOnInit() {
    this.load();
  }

  edit(user: UserModel) {
    this.openDialog(user).subscribe(editedUser => {
      if (!editedUser) { return; }
      this.userService.update(user)
        .subscribe(() => {
          this.load();
        }, error => {
          this.showError('Ошибка редактирования пользователя.', error);
        });
    });
  }

  delete(user: UserModel) {
    this.openConfirmDialog().subscribe(data => {
      if (!data) { return; }
      this.userService.delete(user.id)
        .subscribe(() => {
          this.load();
        }, error => {
          this.showError('Ошибка удаления пользователя.', error);
        });
    });
  }

  private load() {
    this.blockUI.start();
    this.userService.getAll().subscribe(users => {
      this.users = users;
      this.blockUI.stop();
    }, error => {
      this.blockUI.stop();
      this.showError('Ошибка загрузки пользователей.', error);
    });
  }

  private openConfirmDialog() {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '350px',
      data: 'Вы действительно хотите удалить?'
    });

    return dialogRef.afterClosed();
  }

  private openDialog(user?: UserModel) {
    const dialogRef = this.dialog.open(UserDialogComponent, {
      width: '270px',
      data: user ? user : { }
    });

    return dialogRef.afterClosed();
  }

  private showError(errorText: string, error: any) {
    console.log(error);
    const config = new MatSnackBarConfig();
    config.duration = 3000;
    config.panelClass = ['error-panel'];
    this.snackBar.open(errorText, null, config);
  }
}
