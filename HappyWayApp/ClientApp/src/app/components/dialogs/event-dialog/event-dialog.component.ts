import {Component, Inject, ViewEncapsulation} from '@angular/core';
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

  constructor(private readonly dialogRef: MatDialogRef<EventDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private data: EventDialogData,
    private readonly fb: FormBuilder) {
    const { id, name, date } = this.data.event;
    this.form = this.fb.group({
      name: this.fb.control(name),
      date: this.fb.control(date ? date : new Date()),
      docUrl: this.fb.control('')
    });
    this.groups = this.data.groups;
    this.editMode = !!id;
  }

  submit(form: FormGroup) {
    const { date, name, docUrl } = form.value;
    const event = <EventModel>{ date, name };
    this.dialogRef.close(<EventDialogResult>{ event, docUrl });
  }
}
