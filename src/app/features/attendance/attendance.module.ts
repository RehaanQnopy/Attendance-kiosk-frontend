import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { AttendanceRoutingModule } from './attendance-routing.module';
import { AttendancePageComponent } from './component/attendance-page';

//Need to declare the CalendarModule
//So that the <mwl-calendar-month-view> tag can be visible in the html file of the attendance-page.html
import { CalendarModule } from 'angular-calendar';

 

@NgModule({
  declarations: [
    AttendancePageComponent
  ],
  imports: [
    CommonModule,
    AttendanceRoutingModule,
    CalendarModule
  ],
  exports: [
    AttendancePageComponent
  ]
})
export class AttendanceModule { }
