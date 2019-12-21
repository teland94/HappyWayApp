import { AfterViewInit, Component, ViewChild, OnInit } from '@angular/core';
import { MatDrawer, MatDatepickerInputEvent } from '@angular/material';
import { Router } from '@angular/router';
import { FormControl, Validators } from '@angular/forms';
import { EventMemberService } from 'src/app/services/event-member.service';
import { EventService } from 'src/app/services/event.service';
import { AuthenticationService } from '../../services/authentication.service';
import { Role, UserModel } from '../../models/user.model';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css']
})
export class LayoutComponent implements OnInit, AfterViewInit {

  @ViewChild('drawer', { static: false }) drawer: MatDrawer;

  currentUser: UserModel;

  constructor(private readonly router: Router,
    private authenticationService: AuthenticationService) {
    this.authenticationService.currentUser.subscribe(x => this.currentUser = x);
  }

  ngOnInit() {

  }

  ngAfterViewInit() {
    this.router.events.subscribe(() => {
      this.drawer.close();
    });
  }

  get loggedIn() {
    return this.currentUser;
  }

  get isAdmin() {
    return this.currentUser && this.currentUser.role === Role.Admin;
  }

  logout() {
    this.authenticationService.logout();
    this.router.navigate(['/login']);
  }
}
