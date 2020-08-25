import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {EventPlaceViewModel} from '../../../models/event-place.model';
import {CityService} from '../../../services/city.service';
import {CityModel} from '../../../models/city.model';
import {debounceTime, distinctUntilChanged, switchMap} from 'rxjs/operators';
import {of, Subscription} from 'rxjs';
import {CustomValidators} from '../../../custom-validators';

@Component({
  selector: 'app-event-place-dialog',
  templateUrl: './event-place-dialog.component.html',
  styleUrls: ['./event-place-dialog.component.css']
})
export class EventPlaceDialogComponent implements OnInit, OnDestroy {

  private cityQuerySubscription: Subscription;

  form: FormGroup;
  cities: CityModel[];

  constructor(private readonly dialogRef: MatDialogRef<EventPlaceDialogComponent>,
              @Inject(MAT_DIALOG_DATA) private readonly eventPlace: EventPlaceViewModel,
              private readonly fb: FormBuilder,
              private readonly cityService: CityService) {
    const { city, name, googleUrl, facebookUrl, instagramUrl } = this.eventPlace;
    this.form = this.fb.group({
      city: this.fb.control(city, [Validators.required, CustomValidators.type(Object)]),
      name: this.fb.control(name, Validators.required),
      googleUrl: this.fb.control(googleUrl, [Validators.required, CustomValidators.fullUrl]),
      facebookUrl: this.fb.control(facebookUrl, [Validators.required, CustomValidators.fullUrl]),
      instagramUrl: this.fb.control(instagramUrl, [Validators.required, CustomValidators.fullUrl])
    });
  }

  ngOnInit() {
    this.cityQuerySubscription = this.form.get('city').valueChanges
      .pipe(
        distinctUntilChanged(),
        debounceTime(200),
        switchMap((text: string) => text ? this.cityService.get(text) : of(null)))
      .subscribe(data => {
        this.cities = data;
      });
  }

  ngOnDestroy() {
    this.cityQuerySubscription.unsubscribe();
  }

  submit(form: FormGroup) {
    const eventPlaceVm = form.value as EventPlaceViewModel;
    this.dialogRef.close(eventPlaceVm);
  }

  displayCity(city: CityModel) {
    return city ? (city.region ? `${city.name} (${city.region})` : city.name) : undefined;
  }
}
