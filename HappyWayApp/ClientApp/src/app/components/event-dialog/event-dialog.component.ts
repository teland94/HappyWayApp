import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { EventModel } from '../../models/event.model';

@Component({
  selector: 'app-event',
  templateUrl: './event-dialog.component.html',
  styleUrls: ['./event-dialog.component.css']
})
export class EventDialogComponent {

  form: FormGroup;

  constructor(private readonly dialogRef: MatDialogRef<EventDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public event: EventModel,
    private readonly fb: FormBuilder) {
    this.form = this.fb.group({
      name: this.fb.control(this.event.name, Validators.required),
      date: this.fb.control(this.event.date, Validators.required)
    });
  }

  submit(form: FormGroup) {
    const event = form.value as EventModel;
    event.id = this.event.id;
    this.dialogRef.close(event);
  }
}
