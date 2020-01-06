import {Component, Input, OnInit, ViewEncapsulation} from '@angular/core';
import {FormControl} from '@angular/forms';

@Component({
  selector: '[app-validation-error]',
  templateUrl: './validation-error.component.html',
  styleUrls: ['./validation-error.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class ValidationErrorComponent implements OnInit {

  @Input() control: FormControl;
  @Input() propertyName: string;

  constructor() { }

  ngOnInit() {
  }
}
