import { NgModule } from "@angular/core"
import { RouterModule, Routes } from "@angular/router"
import { MyAttendanceComponent } from "../User/component/attendance-myAttendance/my-attendance"
import { ManagerDashboardComponent } from "./component/Manager-Dashboard/manager-dashboard.component"

const route:Routes = [
    {path: '', component: ManagerDashboardComponent},
    {path: 'my-attendance', component: MyAttendanceComponent}
]
@NgModule({
    imports: [RouterModule.forChild(route)],
    exports: [RouterModule]
})
export class ManagerRoutingModule {};
