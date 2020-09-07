import { AfterViewInit, Component, ViewChild, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatDrawer } from '@angular/material/sidenav';
import { MatSnackBarConfig, MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { EventService } from '../../services/event.service';
import { AuthenticationService } from '../../services/authentication.service';
import { Role, UserModel } from '../../models/user.model';
import { EventModel } from '../../models/event.model';
import { EventDialogComponent, EventDialogData } from '../dialogs/event-dialog/event-dialog.component';
import { ConfirmationService } from '../../services/confirmation.service';
import { ImportDataService } from '../../services/import-data.service';
import { ProgressSpinnerService } from '../../services/progress-spinner.service';
import { BaseComponent } from '../base/base.component';
import { GroupModel } from '../../models/group.model';
import { GroupStoreService } from '../../services/group-store.service';
import { EventPlaceViewModel } from '../../models/event-place.model';
import { EventPlaceStoreService } from '../../services/event-place-store.service';
import { EventMemberStoreService } from '../../services/event-member-store.service';
import { catchError, map, switchMap} from 'rxjs/operators';
import { of } from "rxjs";

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css']
})
export class LayoutComponent extends BaseComponent implements OnInit, AfterViewInit {

  @ViewChild('drawer') drawer: MatDrawer;

  event: EventModel;
  currentUser: UserModel;
  date = new Date();

  groups: GroupModel[];
  eventPlaces: EventPlaceViewModel[];

  constructor(private readonly router: Router,
              private readonly authenticationService: AuthenticationService,
              private readonly confirmationService: ConfirmationService,
              private readonly dialog: MatDialog,
              protected readonly snackBar: MatSnackBar,
              private readonly groupStoreService: GroupStoreService,
              private readonly eventService: EventService,
              private readonly eventMemberStoreService: EventMemberStoreService,
              private readonly eventPlaceStoreService: EventPlaceStoreService,
              private readonly importDataService: ImportDataService,
              private readonly progressSpinnerService: ProgressSpinnerService) {
    super(snackBar);
    this.authenticationService.currentUser.subscribe(x => this.currentUser = x);
  }

  ngOnInit() {
    this.authenticationService.currentUser.subscribe(user => {
      if (!user) { return; }
      this.progressSpinnerService.start();
      this.groupStoreService.load().subscribe(groups => {
        this.groups = groups;
      }, error => {
        this.progressSpinnerService.stop();
        this.showError('Ошибка загрузки данных.', error);
      });
      this.eventPlaceStoreService.load().subscribe(eventPlaces => {
        this.eventPlaces = eventPlaces;
      }, error => {
        this.progressSpinnerService.stop();
        this.showError('Ошибка загрузки данных.', error);
      });
      this.eventService.getEventFromStorage()
        .subscribe(event => {
          this.setCurrentEvent(event);
        }, error => {
          this.progressSpinnerService.stop();
          if (error.status === 403 || error.status === 404) {
            this.setCurrentEvent(null);
            return;
          }
          if (error.status === 401) { return; }
          this.showError('Ошибка установки мероприятия.', error);
        });
      this.eventService.eventChanges.subscribe(event => {
        this.event = event;
        if (!event) { this.progressSpinnerService.stop(); return; }
        this.eventMemberStoreService.fetchByEventId(event.id).subscribe(data => {
          this.progressSpinnerService.stop();
        }, error => {
          this.progressSpinnerService.stop();
          this.showError('Ошибка загрузки данных.', error);
        });
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
    this.openDialogAndCreateEvent().subscribe(createdEvent => {
      if (!createdEvent) { this.progressSpinnerService.stop(); return; }
      this.progressSpinnerService.stop();
      this.setCurrentEvent(createdEvent, '/home');
    }, error => {
      this.progressSpinnerService.stop();
      if (error.createdEvent) {
        this.setCurrentEvent(error.createdEvent, '/event-members');
        let errorText = 'Ошибка загрузки данных.';
        if (error.status === 422) {
          errorText += ` Отсутствует ${error.displayParamName}.`;
        }
        this.showError(errorText, error);
      } else {
        this.showError('Ошибка добавления мероприятия.', error);
      }
    });
  }

  shutdown() {
    this.confirmationService.openConfirmDialogWithPassword('завершить работу').subscribe(data => {
      if (!data) { return; }
      if (!this.event) {
        this.logout();
        return;
      }
      this.progressSpinnerService.start();
      this.eventService.setCompleted(this.event.id, true).subscribe(() => {
        this.logout();
      }, error => {
        this.progressSpinnerService.stop();
        if (error.status === 404) {
          this.logout(false);
        }
        this.showError('Ошибка завершения работы.', error);
      });
    }, error => {
      this.logout(false);
    });
  }

  private openDialogAndCreateEvent() {
    return this.openDialog().pipe(switchMap(eventDialogResult => {
      if (!eventDialogResult) { return of(null); }
      const event = eventDialogResult.event;
      this.progressSpinnerService.start();
      return this.setEventCompleted(this.event).pipe(switchMap(() => {
        return this.eventService.create(event).pipe(switchMap(createdEvent => {
          return this.importDataService.downloadDocData(createdEvent.id, eventDialogResult.docUrl)
            .pipe(map(data => {
              return createdEvent;
            }), catchError(err => {
              err.createdEvent = createdEvent;
              throw err;
            }));
        }));
      }));
    }));
  }

  private logout(showMessage = true) {
    this.event = null;
    this.setCurrentEvent(null);
    this.authenticationService.logout();
    this.router.navigate(['/login']).then(() => {
      this.progressSpinnerService.stop();
      if (showMessage) {
        this.snackBar.open('Благодарим, что были сегодня с нами ❤');
      }
    });
  }

  private setEventCompleted(event: EventModel) {
    if (event && !event.completed) {
      return this.eventService.setCompleted(event.id, true).pipe(catchError(error => {
        console.log(error);
        if (error.status === 404) {
          return of(null);
        }
        throw error;
      }));
    } else {
      return of(null);
    }
  }

  private setCurrentEvent(event: EventModel, navigateCommand?: string) {
    this.eventService.setCurrentEvent(event);
    if (navigateCommand) {
      this.drawer.close();
      this.router.navigate([navigateCommand]);
    }
  }

  private openDialog(event?: EventModel) {
    const dialogRef = this.dialog.open(EventDialogComponent, {
      width: '370px',
      data: <EventDialogData>{
        event: event ? event : { },
        groups: this.groups,
        eventPlaces: this.eventPlaces
      }
    });
    return dialogRef.afterClosed();
  }
}
