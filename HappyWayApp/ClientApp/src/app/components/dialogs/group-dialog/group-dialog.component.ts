import { Component, Inject, OnInit } from '@angular/core';
import { GroupModel } from '../../../models/group.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-group-dialog',
  templateUrl: './group-dialog.component.html',
  styleUrls: ['./group-dialog.component.css']
})
export class GroupDialogComponent implements OnInit {

  form: FormGroup;

  constructor(private readonly dialogRef: MatDialogRef<GroupDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public group: GroupModel,
              private readonly fb: FormBuilder) {
    this.form = this.fb.group({
      name: this.fb.control(this.group.name, Validators.required)
    });
  }

  ngOnInit() {
  }

  submit(form: FormGroup) {
    const group = form.value as GroupModel;
    this.dialogRef.close(group);
  }
}
