import { Component, OnInit } from '@angular/core';
import {UserService} from '../../services/user.service';
import {UserModel} from '../../models/user.model';
import {MatDialog, MatSnackBar, MatSnackBarConfig} from '@angular/material';
import {UserDialogComponent, UserDialogData} from '../dialogs/user-dialog/user-dialog.component';
import {ConfirmationDialogComponent} from '../dialogs/confirmation-dialog/confirmation-dialog.component';
import {BlockUI, NgBlockUI} from 'ng-block-ui';
import { DatabaseService } from 'src/app/services/database.service';
import { forkJoin } from 'rxjs';
import { Area } from 'src/app/models/area.model';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {

  users: UserModel[] = [];

  cities: string[];

  displayedColumns: string[] = ['username', 'displayName', 'city', 'edit', 'delete'];
  @BlockUI() blockUI: NgBlockUI;

  constructor(private readonly userService: UserService,
              private readonly databaseService: DatabaseService,
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
    forkJoin([this.userService.getAll(), this.databaseService.getAreas()])
      .subscribe(([users, areas]) => {
        this.users = users;
        this.cities = this.getCities(areas);
        this.blockUI.stop();
      }, error => {
        this.blockUI.stop();
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
