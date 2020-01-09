import { AfterViewInit, Component, ViewChild, OnInit } from '@angular/core';
import { MatDrawer, MatDatepickerInputEvent, MatDialog, MatSnackBarConfig, MatSnackBar } from '@angular/material';
import { Router } from '@angular/router';
import { FormControl, Validators } from '@angular/forms';
import { EventService } from '../../services/event.service';
import { AuthenticationService } from '../../services/authentication.service';
import { Role, UserModel } from '../../models/user.model';
import { EventModel } from '../../models/event.model';
import { EventDialogComponent, EventDialogData } from '../dialogs/event-dialog/event-dialog.component';
import { getDateWithTimeZoneOffsetHours } from '../../utilities';
import { concat } from 'rxjs';
import { DatabaseService } from '../../services/database.service';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { ConfirmationService } from '../../services/confirmation.service';
import { map } from 'rxjs/operators';
import { ImportDataService } from '../../services/import-data.service';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css']
})
export class LayoutComponent implements OnInit, AfterViewInit {

  @ViewChild('drawer', { static: false }) drawer: MatDrawer;
  @BlockUI() blockUI: NgBlockUI;

  event: EventModel;
  currentUser: UserModel;
  groups: string[];

  constructor(private readonly router: Router,
              private readonly authenticationService: AuthenticationService,
              private readonly confirmationService: ConfirmationService,
              private readonly dialog: MatDialog,
              private readonly snackBar: MatSnackBar,
              private readonly eventService: EventService,
              private readonly databaseService: DatabaseService,
              private readonly importDataService: ImportDataService) {
    this.authenticationService.currentUser.subscribe(x => this.currentUser = x);
  }

  ngOnInit() {
    this.databaseService.getGroups().subscribe(data => {
      this.groups = data;
    });
    this.authenticationService.currentUser.subscribe(user => {
      if (!user) { return; }
      this.eventService.getEventFromStorage()
        .subscribe(event => {
          this.event = event;
          this.eventService.setCurrentEvent(event);
          this.blockUI.stop();
        }, error => {
          this.blockUI.stop();
          if (error.status === 403 || error.status === 404) {
            this.setLastEvent();
            return;
          }
          this.showError('Ошибка установки мероприятия.', error);
        });
    });
  }

  ngAfterViewInit() {
    this.router.events.subscribe(() => {
      this.drawer.close();
    });
  }

  get loggedIn() {
    return this.currentUser;
  }

  get isAdmin() {
    return this.currentUser && this.currentUser.role === Role.Admin;
  }

  createEvent() {
    this.openDialog().subscribe(eventDialogResult => {
      if (!eventDialogResult) { return; }
      const event = eventDialogResult.event;
      event.date = getDateWithTimeZoneOffsetHours(event.date);

      this.blockUI.start();
      this.eventService.create(event).subscribe(createdEvent => {
        this.importDataService.downloadDocData(createdEvent.id, eventDialogResult.docUrl).subscribe(() => {
          this.blockUI.stop();
          this.setLastEvent('/home');
        }, error => {
          this.blockUI.stop();
          this.setLastEvent('/event-members');
          this.showError('Ошибка загрузки данных.', error);
        });
      }, error => {
        this.blockUI.stop();
        this.showError('Ошибка добавления мероприятия.', error);
      });
    });
  }

  shutdown() {
    this.confirmationService.openConfirmDialogWithPassword('завершить работу').subscribe(data => {
      if (!data) { return; }
      if (!this.event) {
        this.logout();
        return;
      }
      this.blockUI.start();
      this.eventService.setCompleted(this.event.id, true).subscribe(() => {
        this.logout();
      }, error => {
        this.blockUI.stop();
        this.showError('Ошибка завершения работы.', error);
      });
    });
  }

  private logout() {
    this.event = null;
    this.eventService.setCurrentEvent(null);
    this.authenticationService.logout();
    this.router.navigate(['/login']).then(() => {
      this.blockUI.stop();
      this.snackBar.open('Благодарим, что были сегодня с нами ❤');
    });
  }

  private setLastEvent(navigateCommand?: string) {
    this.blockUI.start();
    this.eventService.getLastEvent()
      .subscribe(event => {
        this.event = event;
        this.eventService.setCurrentEvent(event);
        this.blockUI.stop();
        if (navigateCommand) {
          this.drawer.close();
          this.router.navigate([navigateCommand]);
        }
      }, error => {
        this.blockUI.stop();
        if (error.status === 404) { return; }
        this.showError('Ошибка установки мероприятия.', error);
      });
  }

  private openDialog(event?: EventModel) {
    const dialogRef = this.dialog.open(EventDialogComponent, {
      width: '370px',
      data: <EventDialogData>{
        event: event ? event : { },
        groups: this.groups
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
