import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { ManagerRoutingModule } from "./attendance-routing.manager.module";
import { ManagerDashboardComponent } from "./component/Manager-Dashboard/manager-dashboard.component";

@NgModule({
    declarations: [ManagerDashboardComponent],
    imports: 
    [
        CommonModule,
        ManagerRoutingModule

    ]
})
export class ManagerModule {};