import { BrowserModule } from '@angular/platform-browser';
import { NgModule, LOCALE_ID } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppMaterialModule } from '../material.module';
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
import { ValidationErrorComponent } from './components/validation-error/validation-error.component';
import { MAT_DATE_LOCALE, DateAdapter, ErrorStateMatcher, ShowOnDirtyErrorStateMatcher } from '@angular/material/core';
import { MAT_SNACK_BAR_DEFAULT_OPTIONS } from '@angular/material/snack-bar';
import { EventDialogComponent } from './components/dialogs/event-dialog/event-dialog.component';
import { ConfirmationDialogComponent } from './components/dialogs/confirmation-dialog/confirmation-dialog.component';
import { CustomDateAdapter } from './custom-date-adapter';
import { EventMembersComponent } from './components/event-members/event-members.component';
import { EventMemberDialogComponent } from './components/dialogs/event-member-dialog/event-member-dialog.component';
import { UserDialogComponent } from './components/dialogs/user-dialog/user-dialog.component';
import { LoginComponent } from './components/login/login.component';
import { JwtInterceptor } from './interceptors/jwt.interceptor';
import { ErrorInterceptor } from './interceptors/error.interceptor';
import { ProgressSpinnerComponent } from './components/progress-spinner/progress-spinner.component';
import { PROGRESS_SPINNER_CONFIG } from './services/progress-spinner.service';

registerLocaleData(localeRu, 'ru');

@NgModule({
  declarations: [
    AppComponent,
    LayoutComponent,
    HomeComponent,
    SexSelectComponent,
    ValidationErrorComponent,
    EventsComponent,
    EventDialogComponent,
    EventMemberDialogComponent,
    UserDialogComponent,
    ConfirmationDialogComponent,
    ResultsComponent,
    EventMembersComponent,
    LoginComponent,
    UsersComponent,
    PasswordPromptDialogComponent,
    ProgressSpinnerComponent
  ],
  entryComponents: [
    EventDialogComponent,
    EventMemberDialogComponent,
    ConfirmationDialogComponent,
    UserDialogComponent,
    PasswordPromptDialogComponent,
    ProgressSpinnerComponent
  ],
  imports: [
    BrowserModule.withServerTransition({ appId: 'ng-cli-universal' }),
    HttpClientModule,
    FormsModule,
    BrowserAnimationsModule,
    AppMaterialModule,
    ReactiveFormsModule,
    appRoutingModule
  ],
  providers: [
    { provide: MAT_SNACK_BAR_DEFAULT_OPTIONS, useValue: { duration: 3000, panelClass: 'info-panel' } },
    { provide: LOCALE_ID, useValue: 'ru' },
    { provide: DateAdapter, useClass: CustomDateAdapter },
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    { provide: ErrorStateMatcher, useClass: ShowOnDirtyErrorStateMatcher },
    { provide: PROGRESS_SPINNER_CONFIG, useValue: { delayStart: 400, delayStop: 700 }}
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
