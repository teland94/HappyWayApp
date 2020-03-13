import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { UserModel, Role } from '../../models/user.model';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { UserDialogComponent, UserDialogData } from '../dialogs/user-dialog/user-dialog.component';
import { DatabaseService } from '../../services/database.service';
import { forkJoin } from 'rxjs';
import { Area } from '../../models/area.model';
import { AuthenticationService } from '../../services/authentication.service';
import { ConfirmationService } from '../../services/confirmation.service';
import { ProgressSpinnerService } from '../../services/progress-spinner.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {

  users: UserModel[] = [];

  cities: string[];
  currentUser: UserModel;
  role = Role;

  displayedColumns: string[] = ['username', 'displayName', 'city', 'phoneNumber', 'edit', 'delete'];

  constructor(private readonly userService: UserService,
              private readonly authenticationService: AuthenticationService,
              private readonly confirmationService: ConfirmationService,
              private readonly databaseService: DatabaseService,
              private readonly snackBar: MatSnackBar,
              private readonly dialog: MatDialog,
              private readonly progressSpinnerService: ProgressSpinnerService) { }

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
    forkJoin([this.userService.getAll(), this.databaseService.getAreas()])
      .subscribe(([users, areas]) => {
        this.users = users;
        this.cities = this.getCities(areas);
        this.progressSpinnerService.stop();
      }, error => {
        this.progressSpinnerService.stop();
        this.showError('Ошибка загрузки пользователей.', error);
      });
  }

  private getCities(areas: Area[]) {
    const cities = [];
    const addCity = (area: Area) => {
      if (!area.areas || area.areas.length === 0) {
        cities.push(area.name);
      }
      area.areas.forEach(addCity);
    };
    areas.forEach(addCity);
    cities.sort();
    return cities;
  }

  private openDialog(user?: UserModel) {
    const dialogRef = this.dialog.open(UserDialogComponent, {
      width: '370px',
      data: <UserDialogData>{
        user: user ? user : { },
        cities: this.cities
      }
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
