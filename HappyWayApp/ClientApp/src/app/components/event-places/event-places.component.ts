import { Component, OnInit } from '@angular/core';
import {EventPlaceService} from "../../services/event-place.service";
import {ProgressSpinnerService} from "../../services/progress-spinner.service";
import {EventPlaceModel, EventPlaceViewModel} from "../../models/event-place.model";
import {BaseComponent} from "../base/base.component";
import {MatSnackBar} from "@angular/material/snack-bar";
import {ConfirmationService} from "../../services/confirmation.service";
import {EventPlaceDialogComponent} from "../dialogs/event-place-dialog/event-place-dialog.component";
import {MatDialog} from "@angular/material/dialog";
import {CityService} from "../../services/city.service";
import {EventPlaceViewService} from "../../services/event-place-view.service";

@Component({
  selector: 'app-event-places',
  templateUrl: './event-places.component.html',
  styleUrls: ['./event-places.component.css']
})
export class EventPlacesComponent extends BaseComponent implements OnInit {

  eventPlaces: EventPlaceViewModel[];

  displayedColumns: string[] = ['city', 'name', 'googleUrl', 'facebookUrl', 'instagramUrl', 'edit', 'delete'];

  constructor(protected readonly snackBar: MatSnackBar,
              private readonly dialog: MatDialog,
              private readonly eventPlaceService: EventPlaceService,
              private readonly eventPlaceViewService: EventPlaceViewService,
              private readonly cityService: CityService,
              private readonly progressSpinnerService: ProgressSpinnerService,
              private readonly confirmationService: ConfirmationService) {
    super(snackBar);
  }

  ngOnInit() {
    this.load();
  }

  add() {
    this.openDialog().subscribe(eventPlaceVm => {
      if (!eventPlaceVm) { return; }
      const eventPlace = <EventPlaceModel> {
        name: eventPlaceVm.name,
        googleUrl: eventPlaceVm.googleUrl,
        facebookUrl: eventPlaceVm.facebookUrl,
        instagramUrl: eventPlaceVm.instagramUrl,
        cityId: eventPlaceVm.city.id
      }
      this.eventPlaceService.create(eventPlace)
        .subscribe(() => {
          this.load();
        }, error => {
          this.showError('Ошибка добавления места мероприятия.', error);
        });
    });
  }

  edit(eventPlace: EventPlaceViewModel) {
    this.openDialog(eventPlace).subscribe(editedEventPlace => {
      if (!editedEventPlace) { return; }
      editedEventPlace.id = eventPlace.id;
      editedEventPlace.cityId = eventPlace.city.id;
      this.eventPlaceService.update(editedEventPlace)
        .subscribe(() => {
          this.load();
        }, error => {
          this.showError('Ошибка редактирования места мероприятия.', error);
        });
    });
  }

  delete(eventPlace: EventPlaceViewModel) {
    this.confirmationService.openConfirmDialogWithPassword('удалить').subscribe(data => {
      if (!data) { return; }
      this.eventPlaceService.delete(eventPlace.id)
        .subscribe(() => {
          this.load();
        }, error => {
          this.showError('Ошибка удаления места мероприятия.', error);
        });
    });
  }

  private load() {
    this.progressSpinnerService.start();
    this.eventPlaceViewService.getEventPlaces().subscribe(data => {
      this.eventPlaces = data;
      this.progressSpinnerService.stop();
    }, error => {
      this.progressSpinnerService.stop();
      this.showError('Ошибка загрузки мест мероприятий.', error);
    });
  }

  private openDialog(eventPlaceVm?: EventPlaceViewModel) {
    const dialogRef = this.dialog.open(EventPlaceDialogComponent, {
      width: '370px',
      data: eventPlaceVm || { }
    });

    return dialogRef.afterClosed();
  }
}
