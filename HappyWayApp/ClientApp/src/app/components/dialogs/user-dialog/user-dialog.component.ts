import {Component, Inject, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {UserModel} from '../../../models/user.model';

export class UserDialogData {
  user: UserModel;
  cities: string[];
}

@Component({
  selector: 'app-user-dialog',
  templateUrl: './user-dialog.component.html',
  styleUrls: ['./user-dialog.component.css']
})
export class UserDialogComponent implements OnInit {

  form: FormGroup;
  filteredCities: string[];

  constructor(private readonly dialogRef: MatDialogRef<UserDialogComponent>,
              @Inject(MAT_DIALOG_DATA) private data: UserDialogData,
              private readonly fb: FormBuilder) {
    const { username, password, displayName, city } = this.data.user;
    this.form = this.fb.group({
      username: this.fb.control(username, Validators.required),
      password: this.fb.control(password, Validators.required),
      displayName: this.fb.control(displayName),
      city: this.fb.control(city),
    });
  }

  ngOnInit() {
    this.form.get('city').valueChanges.subscribe(value => {
      this.filteredCities = this.data.cities.filter(c => c.startsWith(value));
    });
  }

  submit(form: FormGroup) {
    const user = form.value as UserModel;
    user.id = this.user.id;
    this.dialogRef.close(user);
  }
}
