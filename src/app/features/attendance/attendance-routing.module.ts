import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AttendancePageComponent } from './User/component/attendance-home/attendance-page';
import { MyAttendanceComponent } from './User/component/attendance-myAttendance/my-attendance';

const routes: Routes = [
  { path: '', component: AttendancePageComponent },
  {path: 'myAttendance', component: MyAttendanceComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AttendanceRoutingModule {}