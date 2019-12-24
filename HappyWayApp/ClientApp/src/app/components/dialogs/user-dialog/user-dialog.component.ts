import {Component, Inject, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {UserModel} from '../../../models/user.model';

@Component({
  selector: 'app-user-dialog',
  templateUrl: './user-dialog.component.html',
  styleUrls: ['./user-dialog.component.css']
})
export class UserDialogComponent implements OnInit {

  form: FormGroup;

  constructor(private readonly dialogRef: MatDialogRef<UserDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public user: UserModel,
              private readonly fb: FormBuilder) {
    this.form = this.fb.group({
      username: this.fb.control(this.user.username, Validators.required),
      password: this.fb.control(this.user.password, Validators.required),
      firstName: this.fb.control(this.user.firstName),
      lastName: this.fb.control(this.user.lastName),
    });
  }

  ngOnInit() {
  }

  submit(form: FormGroup) {
    const user = form.value as UserModel;
    user.id = this.user.id;
    this.dialogRef.close(user);
  }
}
