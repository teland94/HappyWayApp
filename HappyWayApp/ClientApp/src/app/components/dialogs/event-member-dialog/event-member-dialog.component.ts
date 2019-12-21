import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { EventMemberModel } from 'src/app/models/event-member';

@Component({
  selector: 'app-event-member-dialog',
  templateUrl: './event-member-dialog.component.html',
  styleUrls: ['./event-member-dialog.component.css']
})
export class EventMemberDialogComponent implements OnInit {

  form: FormGroup;

  constructor(private readonly dialogRef: MatDialogRef<EventMemberDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public eventMember: EventMemberModel,
    private readonly fb: FormBuilder) {
    this.form = this.fb.group({
      number: this.fb.control(this.eventMember.number, Validators.required),
      name: this.fb.control(this.eventMember.name, Validators.required),
      phoneNumber: this.fb.control(this.eventMember.phoneNumber, Validators.required),
    });
  }

  ngOnInit() {
  }

  submit(form: FormGroup) {
    const eventMember = form.value as EventMemberModel;
    eventMember.id = this.eventMember.id;
    eventMember.eventId = this.eventMember.eventId;
    this.dialogRef.close(eventMember);
  }
}
