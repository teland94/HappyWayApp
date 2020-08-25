import {Component, OnDestroy, OnInit} from '@angular/core';
import {ProgressSpinnerService} from '../../services/progress-spinner.service';
import {EventPlaceViewModel} from '../../models/event-place.model';
import {BaseComponent} from '../base/base.component';
import {MatSnackBar} from '@angular/material/snack-bar';
import {ConfirmationService} from '../../services/confirmation.service';
import {EventPlaceDialogComponent} from '../dialogs/event-place-dialog/event-place-dialog.component';
import {MatDialog} from '@angular/material/dialog';
import {CityService} from '../../services/city.service';
import {EventPlaceStoreService} from '../../services/event-place-store.service';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-event-places',
  templateUrl: './event-places.component.html',
  styleUrls: ['./event-places.component.css']
})
export class EventPlacesComponent extends BaseComponent implements OnInit, OnDestroy {

  private eventPlacesSubscription: Subscription;

  eventPlaces: EventPlaceViewModel[];

  displayedColumns: string[] = ['city', 'name', 'googleUrl', 'facebookUrl', 'instagramUrl', 'edit', 'delete'];

  constructor(protected readonly snackBar: MatSnackBar,
              private readonly dialog: MatDialog,
              private readonly eventPlaceStoreService: EventPlaceStoreService,
              private readonly cityService: CityService,
              private readonly progressSpinnerService: ProgressSpinnerService,
              private readonly confirmationService: ConfirmationService) {
    super(snackBar);
  }

  ngOnInit() {
    this.load();
    this.eventPlacesSubscription = this.eventPlaceStoreService.eventPlaces$.subscribe(data => {
      this.eventPlaces = data;
    });
  }

  ngOnDestroy() {
    this.eventPlacesSubscription.unsubscribe();
  }

  add() {
    this.openDialog().subscribe(eventPlaceVm => {
      if (!eventPlaceVm) { return; }
      this.eventPlaceStoreService.create(eventPlaceVm)
        .subscribe(() => {
        }, error => {
          this.showError('Ошибка добавления места мероприятия.', error);
        });
    });
  }

  edit(eventPlace: EventPlaceViewModel) {
    this.openDialog(eventPlace).subscribe(editedEventPlace => {
      if (!editedEventPlace) { return; }
      editedEventPlace.id = eventPlace.id;
      this.eventPlaceStoreService.update(editedEventPlace)
        .subscribe(() => {
        }, error => {
          this.showError('Ошибка редактирования места мероприятия.', error);
        });
    });
  }

  delete(eventPlace: EventPlaceViewModel) {
    this.confirmationService.openConfirmDialogWithPassword('удалить').subscribe(data => {
      if (!data) { return; }
      this.eventPlaceStoreService.delete(eventPlace.id)
        .subscribe(() => {
        }, error => {
          this.showError('Ошибка удаления места мероприятия.', error);
        });
    });
  }

  private load() {
    this.progressSpinnerService.start();
    this.eventPlaceStoreService.fetchAll().subscribe(data => {
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
