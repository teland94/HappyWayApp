import {RouterModule, Routes} from '@angular/router';
import {LoginComponent} from './components/login/login.component';
import {Role} from './models/user.model';
import {AuthGuard} from './guards/auth.guard';
import {HomeComponent} from './components/home/home.component';
import {EventsComponent} from './components/events/events.component';
import {EventMembersComponent} from './components/event-members/event-members.component';
import {ResultsComponent} from './components/results/results.component';
import {UsersComponent} from './components/users/users.component';
import {EventPlacesComponent} from "./components/event-places/event-places.component";
import {GroupsComponent} from "./components/groups/groups.component";

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'users', component: UsersComponent, canActivate: [AuthGuard], data: { roles: [Role.Admin] } },
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
  { path: 'groups', component: GroupsComponent, canActivate: [AuthGuard], data: { roles: [Role.Admin] } },
  { path: 'events', component: EventsComponent, canActivate: [AuthGuard], data: { roles: [Role.Admin] } },
  { path: 'event/:id', component: EventMembersComponent, canActivate: [AuthGuard], data: { roles: [Role.Admin] } },
  { path: 'event-members', component: EventMembersComponent, canActivate: [AuthGuard] },
  { path: 'event-places', component: EventPlacesComponent, canActivate: [AuthGuard], data: { roles: [Role.Admin] } },
  { path: 'results', component: ResultsComponent, canActivate: [AuthGuard] },

  { path: '**', redirectTo: 'home' }
];

export const appRoutingModule = RouterModule.forRoot(routes);
