import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

//for the map
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';

import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ManagerModule } from './features/attendance/Manager/attendance.manager.modules';
/* Commented out the Attendance Module cause it would be lazy-loaded */
// import { AttendanceModule } from './features/attendance/service/Attendance-Page/attendance.module';

import { SharedModule } from './shared/shared.module';

@NgModule({
  declarations: [
    AppComponent
  ],
imports: [
  BrowserModule,
  BrowserAnimationsModule,
  HttpClientModule,         
  AppRoutingModule,
  SharedModule,
  CalendarModule.forRoot({
    provide: DateAdapter,
    useFactory: adapterFactory
  }),
  ManagerModule
],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
