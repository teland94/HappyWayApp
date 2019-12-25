import { Component, OnInit, Inject } from '@angular/core';
import { FormControl, Validators, FormGroup, FormBuilder } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-password-prompt-dialog',
  templateUrl: './password-prompt-dialog.component.html',
  styleUrls: ['./password-prompt-dialog.component.css']
})
export class PasswordPromptDialogComponent implements OnInit {

  form: FormGroup;

  constructor(private readonly dialogRef: MatDialogRef<PasswordPromptDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public message: string,
              private readonly fb: FormBuilder) {
    this.form = this.fb.group({
      password: new FormControl('', Validators.required)
    });
  }

  ngOnInit() {
  }

  submit(form: FormGroup) {
    this.dialogRef.close(form.value.password);
  }
}
