import {Component, EventEmitter, Inject} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {EventModel} from '../../../models/event.model';
import {EventPlaceViewModel} from '../../../models/event-place.model';
import {CustomValidators} from '../../../custom-validators';
import {getNowDateWithoutTime} from '../../../utilities';
import {GroupModel} from '../../../models/group.model';

export class EventDialogResult {
  event: EventModel;
  docUrl: string;
  eventActive: boolean;
}

export class EventDialogData {
  event: EventModel;
  groups: GroupModel[];
  eventPlaces: EventPlaceViewModel[];
  completedControlVisible: boolean;
  eventActive: boolean;
}

@Component({
  selector: 'app-event',
  templateUrl: './event-dialog.component.html',
  styleUrls: ['./event-dialog.component.css']
})
export class EventDialogComponent {

  form: FormGroup;
  groups: GroupModel[];
  eventPlaces: EventPlaceViewModel[];
  editMode: boolean;
  completedControlVisible: boolean;
  eventActive: boolean;

  onSetDefault = new EventEmitter<EventModel>();

  constructor(private readonly dialogRef: MatDialogRef<EventDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private data: EventDialogData,
    private readonly fb: FormBuilder) {
    const { id, name, date, completed, eventPlaceId } = this.data.event;
    this.form = this.fb.group({
      name: this.fb.control(name, Validators.required),
      eventPlaceId: this.fb.control(eventPlaceId, Validators.required),
      date: this.fb.control(date ? date : getNowDateWithoutTime(), Validators.required),
      enabled: this.fb.control(completed ? !completed : true)
    });
    this.groups = this.data.groups;
    this.eventPlaces = this.data.eventPlaces;
    this.editMode = !!id;
    this.completedControlVisible = this.data.completedControlVisible;
    this.eventActive = this.data.eventActive;
    if (!this.editMode) {
      this.form.addControl('docUrl', new FormControl('', [Validators.required, CustomValidators.url]));
    }
  }

  submit(form: FormGroup) {
    const { date, name, eventPlaceId, docUrl, enabled } = form.value;
    const event = <EventModel>{ date, name, eventPlaceId, completed: !enabled };
    this.dialogRef.close(<EventDialogResult>{ event, docUrl, eventActive: this.eventActive });
  }

  onDefaultButtonClick() {
    this.onSetDefault.emit(this.data.event);
    this.eventActive = true;
  }
}
