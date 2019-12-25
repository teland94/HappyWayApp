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

@Component({
  selector: 'app-events',
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.css']
})
export class EventsComponent implements OnInit {

  private initialDisplayedColumns: string[] = ['name', 'date', 'edit'];
  displayedColumns: string[];
  @BlockUI() blockUI: NgBlockUI;

  events: EventModel[];
  groups: string[];
  currentEvent: EventModel;

  constructor(private readonly eventService: EventService,
              private readonly databaseService: DatabaseService,
              private readonly confirmationService: ConfirmationService,
              private readonly snackBar: MatSnackBar,
              private readonly dialog: MatDialog,
              private readonly router: Router) { }

  ngOnInit() {
    this.load();
  }

  edit(event: EventModel) {
    this.openDialog(event).subscribe(editedEvent => {
      if (!editedEvent) { return; }
      editedEvent.date = this.getDateWithTimeZoneOffsetHours(editedEvent.date);
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
    this.openDialog().subscribe(event => {
      if (!event) { return; }
      event.date = this.getDateWithTimeZoneOffsetHours(event.date);
      this.eventService.create(event)
        .subscribe(() => {
          this.load();
        }, error => {
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
        this.displayedColumns = this.getDisplayedColumns(events);
        this.events = events;
        this.groups = groups;
        this.blockUI.stop();
      }, error => {
        this.blockUI.stop();
        this.showError('Ошибка загрузки мероприятий.', error);
    });
  }

  private getDisplayedColumns(events: EventModel[]) {
    const displayedColumns = [...this.initialDisplayedColumns];
    if (events.length > 1) {
      displayedColumns.push('delete');
    }
    return displayedColumns;
  }

  private getDateWithTimeZoneOffsetHours(date: Date) {
    const resDate = new Date(date);
    const currentTimeZoneOffsetInHours = resDate.getTimezoneOffset() / -60;
    resDate.setHours(resDate.getHours() + currentTimeZoneOffsetInHours);
    return resDate;
  }

  private openDialog(event?: EventModel) {
    const dialogRef = this.dialog.open(EventDialogComponent, {
      width: '270px',
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
