import {Component, OnDestroy, OnInit} from '@angular/core';
import { MatSnackBar, MatSnackBarConfig, MatDialog } from '@angular/material';
import { EventMemberModel } from '../../models/event-member';
import { EventMemberService } from '../../services/event-member.service';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { EventMemberDialogComponent } from '../dialogs/event-member-dialog/event-member-dialog.component';
import { ActivatedRoute } from '@angular/router';
import { ConfirmationService } from '../../services/confirmation.service';
import { EventService } from '../../services/event.service';
import { Subscription } from 'rxjs';
import { ImportDataService } from '../../services/import-data.service';

@Component({
  selector: 'app-event-members',
  templateUrl: './event-members.component.html',
  styleUrls: ['./event-members.component.css']
})
export class EventMembersComponent implements OnInit, OnDestroy {

  private eventChangesSubscription: Subscription;

  displayedColumns: string[] = ['number', 'name', 'phoneNumber', 'edit', 'delete'];

  eventId: number;
  docUrl: string;
  eventMembers: EventMemberModel[];

  @BlockUI() blockUI: NgBlockUI;

  constructor(private readonly eventService: EventService,
              private readonly importDataService: ImportDataService,
              private readonly eventMemberService: EventMemberService,
              private readonly confirmationService: ConfirmationService,
              private readonly snackBar: MatSnackBar,
              private readonly dialog: MatDialog,
              private readonly route: ActivatedRoute) { }

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
    this.blockUI.start();
    this.importDataService.downloadDocData(this.eventId, this.docUrl)
      .subscribe(() => {
        this.docUrl = null;
        this.blockUI.stop();
        this.snackBar.open('Данные успешно загружены.');
        this.load(this.eventId);
      }, error => {
        this.blockUI.stop();
        this.showError('Ошибка загрузки данных.', error);
      });
  }

  private load(eventId: number) {
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
      editedEventMember.id = eventMember.id;
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

  private showError(errorText: string, error: any) {
    console.log(error);
    const config = new MatSnackBarConfig();
    config.duration = 3000;
    config.panelClass = ['error-panel'];
    this.snackBar.open(errorText, null, config);
  }
}
