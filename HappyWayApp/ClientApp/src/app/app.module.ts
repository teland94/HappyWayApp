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

import { AppComponent } from './app.component';
import { LayoutComponent } from './components/layout/layout.component';
import { HomeComponent } from './components/home/home.component';
import { ResultsComponent } from './components/results/results.component';
import { EventsComponent } from './components/events/events.component';
import { SexSelectComponent } from './components/sex-select/sex-select.component';
import { MAT_SNACK_BAR_DEFAULT_OPTIONS, MAT_DATE_LOCALE, DateAdapter } from '@angular/material';
import { HeartCheckboxComponent } from './components/heart-checkbox/heart-checkbox.component';
import { EventDialogComponent } from './components/event-dialog/event-dialog.component';
import { ConfirmationDialogComponent } from './components/confirmation-dialog/confirmation-dialog.component';
import { CustomDateAdapter } from './custom-date-adapter';
import { EventMembersComponent } from './components/event-members/event-members.component';

registerLocaleData(localeRu, 'ru');

@NgModule({
  declarations: [
    AppComponent,
    LayoutComponent,
    HomeComponent,
    SexSelectComponent,
    EventsComponent,
    EventDialogComponent,
    ConfirmationDialogComponent,
    ResultsComponent,
    HeartCheckboxComponent,
    EventMembersComponent
  ],
  entryComponents: [
    EventDialogComponent,
    ConfirmationDialogComponent
  ],
  imports: [
    BrowserModule.withServerTransition({ appId: 'ng-cli-universal' }),
    HttpClientModule,
    FormsModule,
    RouterModule.forRoot([
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: HomeComponent },
      { path: 'events', component: EventsComponent },
      { path: 'event-members', component: EventMembersComponent },
      { path: 'results', component: ResultsComponent },
    ]),
    BrowserAnimationsModule,
    AppMaterialModule,
    ReactiveFormsModule,
    ClipboardModule,
    BlockUIModule.forRoot()
  ],
  providers: [
    { provide: MAT_SNACK_BAR_DEFAULT_OPTIONS, useValue: {duration: 2500, panelClass: 'info-panel'} },
    { provide: LOCALE_ID, useValue: 'ru' },
    { provide: DateAdapter, useClass: CustomDateAdapter }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
