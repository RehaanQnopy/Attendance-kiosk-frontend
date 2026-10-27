import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { CalendarModule } from 'angular-calendar';

import { AttendanceRoutingModule } from './attendance-routing.module';
import { AttendancePageComponent } from './User/component/attendance-page';

@NgModule({
  declarations: [AttendancePageComponent],
  imports: [CommonModule, CalendarModule, AttendanceRoutingModule]
})
export class AttendanceModule {}