import { BrowserModule } from '@angular/platform-browser';
import { NgModule, LOCALE_ID } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppMaterialModule } from '../material.module';
import { ClipboardModule } from 'ngx-clipboard';
import { BlockUIModule } from 'ng-block-ui';
import localeRu from '@angular/common/locales/ru';
import { appRoutingModule } from './app.routing';
import { UsersComponent } from './components/users/users.component';
import { PasswordPromptDialogComponent } from './components/dialogs/password-prompt-dialog/password-prompt-dialog.component';

import { AppComponent } from './app.component';
import { LayoutComponent } from './components/layout/layout.component';
import { HomeComponent } from './components/home/home.component';
import { ResultsComponent } from './components/results/results.component';
import { EventsComponent } from './components/events/events.component';
import { SexSelectComponent } from './components/sex-select/sex-select.component';
import { MAT_SNACK_BAR_DEFAULT_OPTIONS, MAT_DATE_LOCALE, DateAdapter } from '@angular/material';
import { EventDialogComponent } from './components/dialogs/event-dialog/event-dialog.component';
import { ConfirmationDialogComponent } from './components/dialogs/confirmation-dialog/confirmation-dialog.component';
import { CustomDateAdapter } from './custom-date-adapter';
import { EventMembersComponent } from './components/event-members/event-members.component';
import { EventMemberDialogComponent } from './components/dialogs/event-member-dialog/event-member-dialog.component';
import { UserDialogComponent } from './components/dialogs/user-dialog/user-dialog.component';
import { LoginComponent } from './components/login/login.component';
import { JwtInterceptor } from './interceptors/jwt.interceptor';
import { ErrorInterceptor } from './interceptors/error.interceptor';

registerLocaleData(localeRu, 'ru');

@NgModule({
  declarations: [
    AppComponent,
    LayoutComponent,
    HomeComponent,
    SexSelectComponent,
    EventsComponent,
    EventDialogComponent,
    EventMemberDialogComponent,
    UserDialogComponent,
    ConfirmationDialogComponent,
    ResultsComponent,
    EventMembersComponent,
    LoginComponent,
    UsersComponent,
    PasswordPromptDialogComponent
  ],
  entryComponents: [
    EventDialogComponent,
    EventMemberDialogComponent,
    ConfirmationDialogComponent,
    UserDialogComponent,
    PasswordPromptDialogComponent
  ],
  imports: [
    BrowserModule.withServerTransition({ appId: 'ng-cli-universal' }),
    HttpClientModule,
    FormsModule,
    BrowserAnimationsModule,
    AppMaterialModule,
    ReactiveFormsModule,
    ClipboardModule,
    BlockUIModule.forRoot(),
    appRoutingModule
  ],
  providers: [
    { provide: MAT_SNACK_BAR_DEFAULT_OPTIONS, useValue: {duration: 2500, panelClass: 'info-panel'} },
    { provide: LOCALE_ID, useValue: 'ru' },
    { provide: DateAdapter, useClass: CustomDateAdapter },
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
