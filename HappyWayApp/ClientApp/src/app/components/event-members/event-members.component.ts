import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material';
import { EventMemberModel } from 'src/app/models/event-member';
import { EventMemberService } from 'src/app/services/event-member.service';
import { BlockUI, NgBlockUI } from 'ng-block-ui';

@Component({
  selector: 'app-event-members',
  templateUrl: './event-members.component.html',
  styleUrls: ['./event-members.component.css']
})
export class EventMembersComponent implements OnInit {

  displayedColumns: string[] = ['number', 'name', 'phoneNumber'];

  docUrl: string;
  eventMembers: EventMemberModel[];

  @BlockUI() blockUI: NgBlockUI;

  constructor(private readonly httpClient: HttpClient,
    private eventMemberService: EventMemberService,
    private readonly snackBar: MatSnackBar) { }

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

  private showError(errorText: string, error: any) {
    console.log(error);
    const config = new MatSnackBarConfig();
    config.duration = 3000;
    config.panelClass = ['error-panel'];
    this.snackBar.open(errorText, null, config);
  }
}
