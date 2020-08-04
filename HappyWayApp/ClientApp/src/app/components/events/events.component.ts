import { Component, OnDestroy, OnInit } from '@angular/core';
import { EventService } from '../../services/event.service';
import {EventModel, EventViewModel} from '../../models/event.model';
import { MatDialog } from '@angular/material/dialog';
import { MatRadioChange } from '@angular/material/radio';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { EventDialogComponent, EventDialogData } from '../dialogs/event-dialog/event-dialog.component';
import { Router } from '@angular/router';
import { forkJoin, Subscription } from 'rxjs';
import { DatabaseService } from '../../services/database.service';
import { ConfirmationService } from '../../services/confirmation.service';
import { ImportDataService } from '../../services/import-data.service';
import { ProgressSpinnerService } from '../../services/progress-spinner.service';
import { BaseComponent } from '../base/base.component';
import { EventPlaceViewModel } from '../../models/event-place.model';
import { GroupModel } from "../../models/group.model";
import { GroupStoreService } from "../../services/group-store.service";
import { EventPlaceStoreService } from "../../services/event-place-store.service";

@Component({
  selector: 'app-events',
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.css']
})
export class EventsComponent extends BaseComponent implements OnInit, OnDestroy {

  private eventChangesSubscription: Subscription;
  private groupsSubscription: Subscription;
  private eventPlacesSubscription: Subscription;

  displayedColumns: string[] = ['name', 'eventPlace', 'date', 'user', 'active', 'edit', 'delete'];

  events: EventViewModel[];
  groups: GroupModel[];
  eventPlaces: EventPlaceViewModel[];
  currentEvent: EventModel;

  constructor(private readonly groupStoreService: GroupStoreService,
              private readonly eventService: EventService,
              private readonly eventPlaceStoreService: EventPlaceStoreService,
              private readonly importDataService: ImportDataService,
              private readonly databaseService: DatabaseService,
              private readonly confirmationService: ConfirmationService,
              protected readonly snackBar: MatSnackBar,
              private readonly dialog: MatDialog,
              private readonly router: Router,
              private readonly progressSpinnerService: ProgressSpinnerService) {
    super(snackBar);
  }

  ngOnInit() {
    this.eventChangesSubscription = this.eventService.eventChanges.subscribe(event => {
      this.currentEvent = event;
    });
    this.groupsSubscription = this.groupStoreService.groups$.subscribe(groups => {
      this.groups = groups;
    });
    this.eventChangesSubscription = this.eventPlaceStoreService.eventPlaces$.subscribe(eventPlaces => {
      this.eventPlaces = eventPlaces;
      if (!eventPlaces) { return; }
      this.load();
    });
  }

  ngOnDestroy() {
    this.eventChangesSubscription.unsubscribe();
    this.groupsSubscription.unsubscribe();
    this.eventChangesSubscription.unsubscribe();
  }

  edit(event: EventModel) {
    this.openDialog(event).subscribe(eventDialogResult => {
      if (!eventDialogResult) { return; }
      const editedEvent = eventDialogResult.event;
      editedEvent.id = event.id;
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

      this.progressSpinnerService.start();
      this.eventService.create(event).subscribe(createdEvent => {
        if (eventDialogResult.eventActive) {
          this.eventService.setCurrentEvent(createdEvent);
        }
        this.importDataService.downloadDocData(createdEvent.id, eventDialogResult.docUrl).subscribe(() => {
          this.progressSpinnerService.stop();
          this.load();
        }, error => {
          this.progressSpinnerService.stop();
          let errorText = 'Ошибка загрузки данных.';
          if (error.status === 422) {
            errorText += ` Отсутствует ${error.displayParamName}.`;
          }
          this.showError(errorText, error);
          this.load();
        });
      }, error => {
        this.progressSpinnerService.stop();
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
    this.progressSpinnerService.start();
    forkJoin([this.eventService.get()])
      .subscribe(([events]) => {
        this.events = events.map(e => {
          const eventPlace = this.eventPlaces.find(ep => ep.id === e.eventPlaceId);
          return new EventViewModel(e, eventPlace);
        });
        if (this.currentEvent) {
          this.currentEvent = events.find(ev => ev.id === this.currentEvent.id);
        }
        this.checkEvent(this.currentEvent);
        this.progressSpinnerService.stop();
      }, error => {
        this.progressSpinnerService.stop();
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
        eventPlaces: this.eventPlaces,
        completedControlVisible: true,
        eventActive: this.currentEvent && event && this.currentEvent.id === event.id
      }
    });

    return dialogRef.afterClosed();
  }
}
