import {Component, OnDestroy, OnInit} from '@angular/core';
import {GroupModel} from "../../models/group.model";
import {GroupService} from "../../services/group.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {MatDialog} from "@angular/material/dialog";
import {GroupDialogComponent} from "../dialogs/group-dialog/group-dialog.component";
import {BaseComponent} from "../base/base.component";
import {ConfirmationService} from "../../services/confirmation.service";
import {ProgressSpinnerService} from "../../services/progress-spinner.service";
import {Subscription} from "rxjs";
import {GroupStoreService} from "../../services/group-store.service";

@Component({
  selector: 'app-groups',
  templateUrl: './groups.component.html',
  styleUrls: ['./groups.component.css']
})
export class GroupsComponent extends BaseComponent implements OnInit, OnDestroy {

  private groupsSubscription: Subscription;

  groups: GroupModel[];

  displayedColumns: string[] = ['name', 'edit', 'delete'];

  constructor(protected readonly snackBar: MatSnackBar,
              private readonly dialog: MatDialog,
              private readonly groupStoreService: GroupStoreService,
              private readonly confirmationService: ConfirmationService,
              private readonly progressSpinnerService: ProgressSpinnerService) {
    super(snackBar);
  }

  ngOnInit() {
    this.load();
    this.groupsSubscription = this.groupStoreService.groups$.subscribe(data => {
      this.groups = data;
    });
  }

  ngOnDestroy() {
    this.groupsSubscription.unsubscribe();
  }

  add() {
    this.openDialog().subscribe(group => {
      if (!group) { return; }
      this.groupStoreService.create(group)
        .subscribe(() => {
        }, error => {
          this.showError('Ошибка добавления группы.', error);
        });
    });
  }

  edit(group: GroupModel) {
    this.openDialog(group).subscribe(editedGroup => {
      if (!editedGroup) { return; }
      editedGroup.id = group.id;
      this.groupStoreService.update(editedGroup)
        .subscribe(() => {
        }, error => {
          this.showError('Ошибка редактирования группы.', error);
        });
    });
  }

  delete(group: GroupModel) {
    this.confirmationService.openConfirmDialog('удалить').subscribe(data => {
      if (!data) { return; }
      this.groupStoreService.delete(group.id)
        .subscribe(() => {
        }, error => {
          this.showError('Ошибка удаления группы.', error);
        });
    });
  }

  private load() {
    this.progressSpinnerService.start();
    this.groupStoreService.fetchAll().subscribe(data => {
      this.progressSpinnerService.stop();
    });
  }

  private openDialog(group?: GroupModel) {
    const dialogRef = this.dialog.open(GroupDialogComponent, {
      width: '370px',
      data: group || { }
    });

    return dialogRef.afterClosed();
  }
}
