import { AfterViewInit, Component, ViewChild, OnInit } from '@angular/core';
import { MatDrawer, MatDatepickerInputEvent, MatDialog, MatSnackBarConfig, MatSnackBar } from '@angular/material';
import { Router } from '@angular/router';
import { FormControl, Validators } from '@angular/forms';
import { EventMemberService } from 'src/app/services/event-member.service';
import { EventService } from 'src/app/services/event.service';
import { AuthenticationService } from '../../services/authentication.service';
import { Role, UserModel } from '../../models/user.model';
import { EventModel } from '../../models/event.model';
import { EventDialogComponent, EventDialogData } from '../dialogs/event-dialog/event-dialog.component';
import { getDateWithTimeZoneOffsetHours } from '../../utilities';
import { concat } from 'rxjs';
import { DatabaseService } from '../../services/database.service';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { ConfirmationService } from '../../services/confirmation.service';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css']
})
export class LayoutComponent implements OnInit, AfterViewInit {

  @ViewChild('drawer', { static: false }) drawer: MatDrawer;
  @BlockUI() blockUI: NgBlockUI;

  currentUser: UserModel;
  groups: string[];

  constructor(private readonly router: Router,
              private readonly authenticationService: AuthenticationService,
              private readonly confirmationService: ConfirmationService,
              private readonly dialog: MatDialog,
              private readonly snackBar: MatSnackBar,
              private readonly eventService: EventService,
              private readonly databaseService: DatabaseService,
              private readonly eventMemberService: EventMemberService) {
    this.authenticationService.currentUser.subscribe(x => this.currentUser = x);
  }

  ngOnInit() {
    this.databaseService.getGroups().subscribe(data => {
      this.groups = data;
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
    //   let createEventObs = this.eventService.create(event);
    //   if (eventDialogResult.docUrl) {
    //     createEventObs = concat(createEventObs, this.eventMemberService.downloadDocData(eventDialogResult.docUrl));
    //   }
    //   createEventObs.subscribe(() => {
    //       this.router.navigate(['/home']);
    //     }, error => {
    //       this.showError('Ошибка добавления мероприятия.', error);
    //     });
      this.blockUI.start();
      this.eventService.create(event).subscribe(() => {
        if (eventDialogResult.docUrl) {
          this.eventMemberService.downloadDocData(eventDialogResult.docUrl).subscribe(() => {
            this.blockUI.stop();
            this.router.navigate(['/home']);
          }, error => {
            this.blockUI.stop();
            this.showError('Ошибка добавления мероприятия.', error);
          });
        }
      }, error => {
        this.blockUI.stop();
        this.showError('Ошибка добавления мероприятия.', error);
      });
    });

  }

  logout() {
    this.confirmationService.openConfirmDialogWithPassword('завершить работу').subscribe(data => {
      if (!data) { return; }
      this.blockUI.start();
      this.eventService.setCompleted(0, true).subscribe(() => {
        this.authenticationService.logout();
        this.router.navigate(['/login']).then(() => {
          this.blockUI.stop();
          this.snackBar.open('Благодарим, что были сегодня с нами ❤');
        });
      }, error => {
        this.blockUI.stop();
        this.showError('Ошибка завершения работы.', error);
      });
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
