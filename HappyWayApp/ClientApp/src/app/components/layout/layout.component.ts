import {AfterViewInit, Component, ViewChild, OnInit} from '@angular/core';
import {MatDrawer, MatDatepickerInputEvent} from '@angular/material';
import {Router} from '@angular/router';
import { FormControl, Validators } from '@angular/forms';
import { EventMemberService } from 'src/app/services/event-member.service';
import { EventService } from 'src/app/services/event.service';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css']
})
export class LayoutComponent implements OnInit, AfterViewInit {

  @ViewChild('drawer', { static: false }) drawer: MatDrawer;



  constructor(private readonly router: Router,
    private eventService: EventService) {

  }

  ngOnInit() {

  }

  ngAfterViewInit() {
    this.router.events.subscribe(() => {
      this.drawer.close();
    });
  }

  dateChange(event: MatDatepickerInputEvent<Date>) {

  }
}
