import {Component, Inject, ViewEncapsulation} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {EventModel} from '../../../models/event.model';

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

  constructor(private readonly dialogRef: MatDialogRef<EventDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private data: EventDialogData,
    private readonly fb: FormBuilder) {
    const { name, date } = this.data.event;
    this.form = this.fb.group({
      name: this.fb.control(name, Validators.required),
      date: this.fb.control(date ? date : new Date(), Validators.required)
    });
    this.groups = this.data.groups;
  }

  submit(form: FormGroup) {
    const event = form.value as EventModel;
    event.id = this.data.event.id;
    this.dialogRef.close(event);
  }
}
