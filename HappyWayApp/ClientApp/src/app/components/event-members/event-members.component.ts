import { Component, OnInit } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig, MatDialog } from '@angular/material';
import { EventMemberModel } from 'src/app/models/event-member';
import { EventMemberService } from 'src/app/services/event-member.service';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { ConfirmationDialogComponent } from '../dialogs/confirmation-dialog/confirmation-dialog.component';
import { EventMemberDialogComponent } from '../dialogs/event-member-dialog/event-member-dialog.component';
import { ActivatedRoute } from '@angular/router';

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

  constructor(private readonly eventMemberService: EventMemberService,
              private readonly snackBar: MatSnackBar,
              private readonly dialog: MatDialog,
              private readonly route: ActivatedRoute) { }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.load(+id);
    } else {
      this.load();
    }
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

  private load(eventId?: number) {
    this.blockUI.start();
    this.eventMemberService.sexChanges.subscribe(sex => {
      this.eventMemberService.get(eventId).subscribe(data => {
        this.eventMembers = data.filter(m => m.sex === sex);
        this.blockUI.stop();
      }, error => {
        this.blockUI.stop();
        this.showError('Ошибка загрузки участников.', error);
      });
    });
  }

  edit(eventMember: EventMemberModel) {
    this.openDialog(eventMember).subscribe(editedEventMember => {
      if (!editedEventMember) { return; }
      this.eventMemberService.update(editedEventMember)
        .subscribe(() => {
          this.load();
        }, error => {
          this.showError('Ошибка редактирования участника.', error);
        });
    });
  }

  delete(eventMember: EventMemberModel) {
    this.openConfirmDialog().subscribe(data => {
      if (!data) { return; }
      this.eventMemberService.delete(eventMember.id)
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
