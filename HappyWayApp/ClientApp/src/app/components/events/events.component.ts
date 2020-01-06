import { Component, OnInit } from '@angular/core';
import { EventService } from '../../services/event.service';
import { EventModel } from '../../models/event.model';
import { MatSnackBar, MatSnackBarConfig, MatDialog } from '@angular/material';
import { EventDialogComponent, EventDialogData } from '../dialogs/event-dialog/event-dialog.component';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { DatabaseService } from '../../services/database.service';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { ConfirmationService } from '../../services/confirmation.service';
import { getDateWithTimeZoneOffsetHours } from '../../utilities';
import { ImportDataService } from '../../services/import-data.service';

@Component({
  selector: 'app-events',
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.css']
})
export class EventsComponent implements OnInit {

  displayedColumns: string[] = ['name', 'date', 'user', 'edit', 'delete'];
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
    this.load();
  }

  edit(event: EventModel) {
    this.openDialog(event).subscribe(eventDialogResult => {
      if (!eventDialogResult) { return; }
      const editedEvent = eventDialogResult.event;
      editedEvent.id = event.id;
      editedEvent.date = getDateWithTimeZoneOffsetHours(editedEvent.date);
      this.eventService.update(editedEvent)
        .subscribe(() => {
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
          this.load();
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
        this.importDataService.downloadDocData(createdEvent.id, eventDialogResult.docUrl).subscribe(() => {
          this.blockUI.stop();
          this.load();
        }, error => {
          this.blockUI.stop();
          this.showError('Ошибка добавления мероприятия.', error);
        });
      }, error => {
        this.blockUI.stop();
        this.showError('Ошибка добавления мероприятия.', error);
      });
    });
  }

  eventClick(event: EventModel) {
    this.router.navigate(['/event', event.id]);
  }

  private load() {
    this.blockUI.start();
    forkJoin([this.eventService.get(), this.databaseService.getGroups()])
      .subscribe(([events, groups]) => {
        this.events = events;
        this.setLastEvent();
        this.groups = groups;
        this.blockUI.stop();
      }, error => {
        this.blockUI.stop();
        this.showError('Ошибка загрузки мероприятий.', error);
    });
  }

  private setLastEvent() {
    const event = this.events[0];
    if (event) {
      this.eventService.setCurrentEvent(event);
    }
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
