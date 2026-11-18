import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { CalendarModule } from 'angular-calendar';

import { AttendanceRoutingModule } from './attendance-routing.module';
import { AttendancePageComponent } from './User/component/attendance-home/attendance-page';
import { MyAttendanceComponent } from './User/component/attendance-myAttendance/my-attendance';

@NgModule({
  declarations: [AttendancePageComponent, MyAttendanceComponent],
  imports: [CommonModule, CalendarModule, AttendanceRoutingModule],
  //Very important learning, you declare all those components as exports, all the ones which are to be used
  //by another modules 
  exports: [MyAttendanceComponent]
})
export class AttendanceModule {}