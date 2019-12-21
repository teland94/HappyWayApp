import { Component, OnInit } from '@angular/core';
import { EventService } from 'src/app/services/event.service';
import { EventModel } from 'src/app/models/event.model';
import { MatSnackBar, MatSnackBarConfig, MatDialog } from '@angular/material';
import { EventDialogComponent } from '../dialogs/event-dialog/event-dialog.component';
import { ConfirmationDialogComponent } from '../dialogs/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-events',
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.css']
})
export class EventsComponent implements OnInit {

  private initialDisplayedColumns: string[] = ['name', 'date', 'edit'];
  displayedColumns: string[];

  events: EventModel[];
  currentEvent: EventModel;

  constructor(private readonly eventService: EventService,
              private readonly snackBar: MatSnackBar,
              private readonly dialog: MatDialog) { }

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
    this.openConfirmDialog().subscribe(data => {
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

  private load() {
    this.eventService.get().subscribe(data => {
      this.displayedColumns = this.getDisplayedColumns(data);
      this.events = data;
    }, error => {
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

  private openConfirmDialog() {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '350px',
      data: 'Вы действительно хотите удалить?'
    });

    return dialogRef.afterClosed();
  }

  private openDialog(event?: EventModel) {
    const dialogRef = this.dialog.open(EventDialogComponent, {
      width: '270px',
      data: event ? event : { }
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
