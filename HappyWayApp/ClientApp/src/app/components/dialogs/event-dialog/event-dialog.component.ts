import {Component, EventEmitter, Inject, ViewEncapsulation} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {EventModel} from '../../../models/event.model';

export class EventDialogResult {
  event: EventModel;
  docUrl: string;
}

export class EventDialogData {
  event: EventModel;
  groups: string[];
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
  groups: string[];
  editMode: boolean;
  completedControlVisible: boolean;
  eventActive: boolean;

  onSetDefault = new EventEmitter<EventModel>();

  constructor(private readonly dialogRef: MatDialogRef<EventDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private data: EventDialogData,
    private readonly fb: FormBuilder) {
    const { id, name, date, completed } = this.data.event;
    this.form = this.fb.group({
      name: this.fb.control(name),
      date: this.fb.control(date ? date : new Date()),
      docUrl: this.fb.control(''),
      enabled: this.fb.control(completed ? !completed : true)
    });
    this.groups = this.data.groups;
    this.editMode = !!id;
    this.completedControlVisible = this.data.completedControlVisible;
    this.eventActive = this.data.eventActive;
  }

  submit(form: FormGroup) {
    const { date, name, docUrl, enabled } = form.value;
    const event = <EventModel>{ date, name, completed: !enabled };
    this.dialogRef.close(<EventDialogResult>{ event, docUrl });
  }

  onDefaultButtonClick() {
    this.onSetDefault.emit(this.data.event);
    this.eventActive = true;
  }
}
