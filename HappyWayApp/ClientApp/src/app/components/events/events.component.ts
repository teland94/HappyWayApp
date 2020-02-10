import {Component, OnDestroy, OnInit} from '@angular/core';
import { EventService } from '../../services/event.service';
import { EventModel } from '../../models/event.model';
import {MatSnackBar, MatSnackBarConfig, MatDialog, MatSlideToggleChange, MatRadioChange} from '@angular/material';
import { EventDialogComponent, EventDialogData } from '../dialogs/event-dialog/event-dialog.component';
import { Router } from '@angular/router';
import {forkJoin, Subscription} from 'rxjs';
import { DatabaseService } from '../../services/database.service';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { ConfirmationService } from '../../services/confirmation.service';
import { getDateWithTimeZoneOffsetHours } from '../../utilities';
import { ImportDataService } from '../../services/import-data.service';
import {map} from 'rxjs/operators';

@Component({
  selector: 'app-events',
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.css']
})
export class EventsComponent implements OnInit, OnDestroy {

  private eventChangesSubscription: Subscription;

  displayedColumns: string[] = ['name', 'date', 'user', 'active', 'edit', 'delete'];
  @BlockUI() blockUI: NgBlockUI;

  events: EventModel[];
  groups: string[];
  currentEvent: EventModel;

  constructor(private readonly eventService: EventService,
              private readonly importDataService: ImportDataService,
              private readonly databaseService: DatabaseService,
              private readonly confirmationService: ConfirmationService,
              private readonly snackBar: MatSnackBar,
              private readonly dialog: MatDialog,
              private readonly router: Router) { }

  ngOnInit() {
    this.eventChangesSubscription = this.eventService.eventChanges.subscribe(event => {
      this.currentEvent = event;
    });
    this.load();
  }

  ngOnDestroy() {
    this.eventChangesSubscription.unsubscribe();
  }

  edit(event: EventModel) {
    this.openDialog(event).subscribe(eventDialogResult => {
      if (!eventDialogResult) { return; }
      const editedEvent = eventDialogResult.event;
      editedEvent.id = event.id;
      editedEvent.date = getDateWithTimeZoneOffsetHours(editedEvent.date);
      this.eventService.update(editedEvent)
        .subscribe(() => {
          if (eventDialogResult.eventActive) {
            this.eventService.setCurrentEvent(editedEvent);
          }
          this.load();
        }, error => {
          this.showError('Ошибка редактирования мероприятия.', error);
        });
    });
  }

  delete(event: EventModel) {
    this.confirmationService.openConfirmDialogWithPassword('удалить').subscribe(data => {
      if (!data) { return; }
      this.eventService.delete(event.id)
        .subscribe(() => {
          this.events = this.events.filter(ev => ev.id !== event.id);
          if (this.currentEvent && this.currentEvent.id === event.id) {
            this.checkEvent(this.currentEvent);
          }
        }, error => {
          this.showError('Ошибка удаления мероприятия.', error);
        });
    });
  }

  add() {
    this.openDialog().subscribe(eventDialogResult => {
      if (!eventDialogResult) { return; }
      const event = eventDialogResult.event;
      event.date = getDateWithTimeZoneOffsetHours(event.date);

      this.blockUI.start();
      this.eventService.create(event).subscribe(createdEvent => {
        if (eventDialogResult.eventActive) {
          this.eventService.setCurrentEvent(createdEvent);
        }
        this.importDataService.downloadDocData(createdEvent.id, eventDialogResult.docUrl).subscribe(() => {
          this.blockUI.stop();
          this.load();
        }, error => {
          this.blockUI.stop();
          this.showError('Ошибка загрузки данных.', error);
          this.load();
        });
      }, error => {
        this.blockUI.stop();
        this.showError('Ошибка добавления мероприятия.', error);
      });
    });
  }

  eventClick(event: EventModel) {
    if (event.completed) { return; }
    this.router.navigate(['/event', event.id]);
  }

  eventToggle(change: MatSlideToggleChange, event: EventModel) {
    this.eventService.setCompleted(event.id, !change.checked).subscribe(() => {
      event.completed = !change.checked;
      if (!this.currentEvent && !event.completed) {
        this.eventService.setCurrentEvent(event);
      }
      if (event.completed) {
        this.setLastEvent();
      }
    }, error => {
      this.showError('Ошибка изменения статуса мероприятия.', error);
    });
  }

  currentEventChange(change: MatRadioChange) {
    const event = change.value;
    this.eventService.setCurrentEvent(event);
  }

  private load() {
    this.blockUI.start();
    forkJoin([this.eventService.get(), this.databaseService.getGroups()])
      .subscribe(([events, groups]) => {
        this.events = events;
        if (this.currentEvent) {
          this.currentEvent = events.find(ev => ev.id === this.currentEvent.id);
        }
        this.checkEvent(this.currentEvent);
        this.groups = groups;
        this.blockUI.stop();
      }, error => {
        this.blockUI.stop();
        this.showError('Ошибка загрузки мероприятий.', error);
    });
  }

  private checkEvent(event: EventModel) {
    if (!event || !this.events) { return; }
    if (event.completed || !this.events.some(e => e.id === event.id)) {
      this.eventService.setCurrentEvent(null);
    }
  }

  private setLastEvent() {
    const nonCompletedEvents = this.events.filter(ev => !ev.completed);
    if (nonCompletedEvents && nonCompletedEvents.length > 0) {
      const event = nonCompletedEvents[0];
      this.eventService.setCurrentEvent(event);
    } else {
      this.eventService.setCurrentEvent(null);
    }
  }

  private openDialog(event?: EventModel) {
    const dialogRef = this.dialog.open(EventDialogComponent, {
      width: '370px',
      data: <EventDialogData>{
        event: event ? event : { },
        groups: this.groups,
        completedControlVisible: true,
        eventActive: this.currentEvent && event && this.currentEvent.id === event.id
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
