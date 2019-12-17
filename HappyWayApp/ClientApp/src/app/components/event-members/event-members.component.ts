import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar, MatSnackBarConfig, MatDialog } from '@angular/material';
import { EventMemberModel } from 'src/app/models/event-member';
import { EventMemberService } from 'src/app/services/event-member.service';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { EventMemberDialogComponent } from '../event-member-dialog/event-member-dialog.component';

@Component({
  selector: 'app-event-members',
  templateUrl: './event-members.component.html',
  styleUrls: ['./event-members.component.css']
})
export class EventMembersComponent implements OnInit {

  displayedColumns: string[] = ['number', 'name', 'phoneNumber', 'edit', 'delete'];

  docUrl: string;
  eventMembers: EventMemberModel[];

  @BlockUI() blockUI: NgBlockUI;

  constructor(private readonly httpClient: HttpClient,
              private readonly eventMemberService: EventMemberService,
              private readonly snackBar: MatSnackBar,
              private readonly dialog: MatDialog) { }

  ngOnInit() {
    this.load();
  }

  downloadDocData() {
    this.blockUI.start();
    this.eventMemberService.downloadDocData(this.docUrl)
      .subscribe(() => {
        this.blockUI.stop();
        this.snackBar.open('Данные успешно загружены.');
        this.load();
      }, error => {
        this.blockUI.stop();
        this.showError('Ошибка загрузки данных.', error);
      });
  }

  private load() {
    this.blockUI.start();
    this.eventMemberService.sexChanges.subscribe(sex => {
      this.eventMemberService.get().subscribe(data => {
        this.eventMembers = data.filter(m => m.sex === sex);
        this.blockUI.stop();
      }, error => {
        this.blockUI.stop();
        this.showError('Ошибка загрузки участников.', error);
      });
    });
  }

  edit(event: EventMemberModel) {
    this.openDialog(event).subscribe(editedEventMember => {
      if (!editedEventMember) { return; }
      this.eventMemberService.update(editedEventMember)
        .subscribe(() => {
          this.load();
        }, error => {
          this.showError('Ошибка редактирования участника.', error);
        });
    });
  }

  delete(event: EventMemberModel) {
    this.openConfirmDialog().subscribe(data => {
      if (!data) { return; }
      this.eventMemberService.delete(event.id)
        .subscribe(() => {
          this.load();
        }, error => {
          this.showError('Ошибка удаления участника.', error);
        });
    });
  }

  add() {
    this.openDialog().subscribe(event => {
      if (!event) { return; }
      this.eventMemberService.create(event)
        .subscribe(() => {
          this.load();
        }, error => {
          this.showError('Ошибка добавления участника.', error);
        });
    });
  }

  private openConfirmDialog() {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '350px',
      data: 'Вы действительно хотите удалить?'
    });

    return dialogRef.afterClosed();
  }

  private openDialog(event?: EventMemberModel) {
    const dialogRef = this.dialog.open(EventMemberDialogComponent, {
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
