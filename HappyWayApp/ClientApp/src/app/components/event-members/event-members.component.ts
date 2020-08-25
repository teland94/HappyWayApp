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
import { EventMemberStoreService } from '../../services/event-member-store.service';

@Component({
  selector: 'app-event-members',
  templateUrl: './event-members.component.html',
  styleUrls: ['./event-members.component.css']
})
export class EventMembersComponent extends BaseComponent implements OnInit, OnDestroy {

  private eventChangesSubscription: Subscription;
  private sexChangesSubscription: Subscription;
  private eventMembersSubscription: Subscription;

  displayedColumns: string[] = ['number', 'name', 'phoneNumber', 'edit', 'delete'];

  eventId: number;
  docUrl: string;
  eventMembers: EventMemberModel[];

  constructor(private readonly eventService: EventService,
              private readonly importDataService: ImportDataService,
              private readonly eventMemberService: EventMemberService,
              private readonly eventMemberStoreService: EventMemberStoreService,
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
    if (this.eventChangesSubscription) {
      this.eventChangesSubscription.unsubscribe();
    }
    if (this.sexChangesSubscription) {
      this.sexChangesSubscription.unsubscribe();
    }
    if (this.eventMembersSubscription) {
      this.eventMembersSubscription.unsubscribe();
    }
  }

  downloadDocData() {
    this.progressSpinnerService.start();
    this.importDataService.downloadDocData(this.eventId, this.docUrl)
      .subscribe(() => {
        this.progressSpinnerService.stop();
        this.snackBar.open('Данные успешно загружены.');
        this.load(this.eventId);
      }, error => {
        this.progressSpinnerService.stop();
        let errorText = 'Ошибка загрузки данных.';
        if (error.status === 422) {
          errorText += ` Отсутствует ${error.displayParamName}.`;
        }
        this.showError(errorText, error);
      });
  }

  edit(eventMember: EventMemberModel) {
    this.openDialog(eventMember).subscribe(editedEventMember => {
      if (!editedEventMember) { return; }
      editedEventMember.id = eventMember.id;
      editedEventMember.sex = eventMember.sex;
      editedEventMember.eventId = eventMember.eventId;
      this.eventMemberStoreService.update(editedEventMember)
        .subscribe(() => {
        }, error => {
          this.showError('Ошибка редактирования участника.', error);
        });
    });
  }

  delete(eventMember: EventMemberModel) {
    this.confirmationService.openConfirmDialog('удалить').subscribe(data => {
      if (!data) { return; }
      this.eventMemberStoreService.delete(eventMember.id)
        .subscribe(() => {
        }, error => {
          this.showError('Ошибка удаления участника.', error);
        });
    });
  }

  private load(eventId: number) {
    this.progressSpinnerService.start();
    this.eventMemberStoreService.fetchByEventId(eventId).subscribe(data => {
      this.initData();
      this.progressSpinnerService.stop();
    }, error => {
      this.progressSpinnerService.stop();
      this.showError('Ошибка загрузки участников.', error);
    });
  }

  private initData() {
    this.sexChangesSubscription = this.eventMemberService.sexChanges.subscribe(sex => {
      this.eventMembersSubscription = this.eventMemberStoreService.getByEventId(this.eventId).subscribe(data => {
        if (!data) { return; }
        this.eventMembers = data;
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
