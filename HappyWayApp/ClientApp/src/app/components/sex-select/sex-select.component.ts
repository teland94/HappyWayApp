import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { EventMemberService } from 'src/app/services/event-member.service';
import { Sex } from 'src/app/models/event-member';

@Component({
  selector: 'app-sex-select',
  templateUrl: './sex-select.component.html',
  styleUrls: ['./sex-select.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class SexSelectComponent implements OnInit {

  sexItems = [
    { label: 'Мужчины', value: Sex.Male, icon: 'man' },
    { label: 'Женщины', value: Sex.Female, icon: 'woman' }
  ];

  sex: FormControl;

  constructor(private readonly eventMemberService: EventMemberService) {
    this.sex = new FormControl(0, Validators.required);
  }

  ngOnInit() {
    this.sex.valueChanges.subscribe(value => {
      this.eventMemberService.sexChange(value);
    });
  }
}
