import { NgModule } from "@angular/core"
import { RouterModule, Routes } from "@angular/router"
import { ManagerDashboardComponent } from "./component/Manager-Dashboard/manager-dashboard.component"

const route:Routes = [
    {path: '', component: ManagerDashboardComponent}
]
@NgModule({
    imports: [RouterModule.forChild(route)],
    exports: [RouterModule]
})
export class ManagerRoutingModule {};
