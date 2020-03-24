import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { EventMemberModel } from '../../models/event-member';
import { EventMemberService } from '../../services/event-member.service';
import { EventMemberDialogComponent } from '../dialogs/event-member-dialog/event-member-dialog.component';
import { ActivatedRoute } from '@angular/router';
import { ConfirmationService } from '../../services/confirmation.service';
import { EventService } from '../../services/event.service';
import { Subscription } from 'rxjs';
import { ImportDataService } from '../../services/import-data.service';
import { ProgressSpinnerService } from '../../services/progress-spinner.service';
import { BaseComponent } from '../base/base.component';

@Component({
  selector: 'app-event-members',
  templateUrl: './event-members.component.html',
  styleUrls: ['./event-members.component.css']
})
export class EventMembersComponent extends BaseComponent implements OnInit, OnDestroy {

  private eventChangesSubscription: Subscription;

  displayedColumns: string[] = ['number', 'name', 'phoneNumber', 'edit', 'delete'];

  eventId: number;
  docUrl: string;
  eventMembers: EventMemberModel[];

  constructor(private readonly eventService: EventService,
              private readonly importDataService: ImportDataService,
              private readonly eventMemberService: EventMemberService,
              private readonly confirmationService: ConfirmationService,
              protected readonly snackBar: MatSnackBar,
              private readonly dialog: MatDialog,
              private readonly route: ActivatedRoute,
              private readonly progressSpinnerService: ProgressSpinnerService) {
    super(snackBar);
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.eventId = +id;
      this.load(+id);
    } else {
      this.eventChangesSubscription = this.eventService.eventChanges.subscribe(event => {
        if (!event) {
          this.eventId = null;
          return;
        }
        this.eventId = event.id;
        this.load(event.id);
      });
    }
  }

  ngOnDestroy() {
    if (!this.eventChangesSubscription) { return; }
    this.eventChangesSubscription.unsubscribe();
  }

  downloadDocData() {
    this.progressSpinnerService.start();
    this.importDataService.downloadDocData(this.eventId, this.docUrl)
      .subscribe(() => {
        this.docUrl = null;
        this.progressSpinnerService.stop();
        this.snackBar.open('Данные успешно загружены.');
        this.load(this.eventId);
      }, error => {
        this.progressSpinnerService.stop();
        this.showError('Ошибка загрузки данных.', error);
      });
  }

  private load(eventId: number) {
    this.progressSpinnerService.start();
    this.eventMemberService.sexChanges.subscribe(sex => {
      this.eventMemberService.get(eventId).subscribe(data => {
        this.eventMembers = data.filter(m => m.sex === sex);
        this.progressSpinnerService.stop();
      }, error => {
        this.progressSpinnerService.stop();
        this.showError('Ошибка загрузки участников.', error);
      });
    });
  }

  edit(eventMember: EventMemberModel) {
    this.openDialog(eventMember).subscribe(editedEventMember => {
      if (!editedEventMember) { return; }
      editedEventMember.id = eventMember.id;
      editedEventMember.sex = eventMember.sex;
      editedEventMember.eventId = eventMember.eventId;
      this.eventMemberService.update(editedEventMember)
        .subscribe(() => {
          this.load(this.eventId);
        }, error => {
          this.showError('Ошибка редактирования участника.', error);
        });
    });
  }

  delete(eventMember: EventMemberModel) {
    this.confirmationService.openConfirmDialog('удалить').subscribe(data => {
      if (!data) { return; }
      this.eventMemberService.delete(eventMember.id)
        .subscribe(() => {
          this.load(this.eventId);
        }, error => {
          this.showError('Ошибка удаления участника.', error);
        });
    });
  }

  private openDialog(event?: EventMemberModel) {
    const dialogRef = this.dialog.open(EventMemberDialogComponent, {
      width: '370px',
      data: event ? event : { }
    });

    return dialogRef.afterClosed();
  }
}
