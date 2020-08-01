import { Component, OnInit } from '@angular/core';
import {GroupModel} from "../../models/group.model";
import {GroupService} from "../../services/group.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {MatDialog} from "@angular/material/dialog";
import {GroupDialogComponent} from "../dialogs/group-dialog/group-dialog.component";
import {BaseComponent} from "../base/base.component";
import {ConfirmationService} from "../../services/confirmation.service";
import {ProgressSpinnerService} from "../../services/progress-spinner.service";

@Component({
  selector: 'app-groups',
  templateUrl: './groups.component.html',
  styleUrls: ['./groups.component.css']
})
export class GroupsComponent extends BaseComponent implements OnInit {

  groups: GroupModel[];

  displayedColumns: string[] = ['name', 'edit', 'delete'];

  constructor(protected readonly snackBar: MatSnackBar,
              private readonly dialog: MatDialog,
              private readonly groupService: GroupService,
              private readonly confirmationService: ConfirmationService,
              private readonly progressSpinnerService: ProgressSpinnerService) {
    super(snackBar);
  }

  ngOnInit() {
    this.load();
  }

  add() {
    this.openDialog().subscribe(group => {
      if (!group) { return; }
      this.groupService.create(group)
        .subscribe(() => {
          this.load();
        }, error => {
          this.showError('Ошибка добавления группы.', error);
        });
    });
  }

  edit(group: GroupModel) {
    this.openDialog(group).subscribe(editedGroup => {
      if (!editedGroup) { return; }
      editedGroup.id = group.id;
      this.groupService.update(editedGroup)
        .subscribe(() => {
          this.load();
        }, error => {
          this.showError('Ошибка редактирования группы.', error);
        });
    });
  }

  delete(group: GroupModel) {
    this.confirmationService.openConfirmDialog('удалить').subscribe(data => {
      if (!data) { return; }
      this.groupService.delete(group.id)
        .subscribe(() => {
          this.load();
        }, error => {
          this.showError('Ошибка удаления группы.', error);
        });
    });
  }

  private load() {
    this.progressSpinnerService.start();
    this.groupService.get().subscribe(data => {
      this.groups = data;
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
