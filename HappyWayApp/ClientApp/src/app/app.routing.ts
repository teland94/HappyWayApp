import {RouterModule, Routes} from '@angular/router';
import {LoginComponent} from './components/login/login.component';
import {Role} from './models/user.model';
import {AuthGuard} from './guards/auth.guard';
import {HomeComponent} from './components/home/home.component';
import {EventsComponent} from './components/events/events.component';
import {EventMembersComponent} from './components/event-members/event-members.component';
import {ResultsComponent} from './components/results/results.component';
import {AdminComponent} from './components/admin/admin.component';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'admin', component: AdminComponent, canActivate: [AuthGuard], data: { roles: [Role.Admin] } },
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
  { path: 'events', component: EventsComponent, canActivate: [AuthGuard], data: { roles: [Role.Admin] } },
  { path: 'event-members', component: EventMembersComponent, canActivate: [AuthGuard] },
  { path: 'results', component: ResultsComponent, canActivate: [AuthGuard] },

  { path: '**', redirectTo: 'home' }
];

export const appRoutingModule = RouterModule.forRoot(routes);
