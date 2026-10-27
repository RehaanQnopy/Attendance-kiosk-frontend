import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from 'src/app/features/auth/Login/service/Login.service';

@Component({
    selector: 'side-navigator',
    templateUrl: './side-navigation.component.html',
    styleUrls: ['./side-navigation.component.css']
})
export class SideNavigationComponent {

    active = 'attendance'

    constructor(private router: Router, public loginService: LoginService){};

    MyAttendance() {};
    MarkLeave() {};
    Home() {};
    Manager() {
    this.active = 'manager';
    this.router.navigate(['/attendance/manager']);
}

}