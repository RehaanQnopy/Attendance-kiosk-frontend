import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from 'src/app/features/auth/Login/service/Login.service';

@Component({
    selector: 'side-navigator',
    templateUrl: './side-navigation.component.html',
    styleUrls: ['./side-navigation.component.css']
})
export class SideNavigationComponent {

    //The below variable is used to highlight the active link in the side navigation bar.
    active = '';

    constructor(private router: Router, public loginService: LoginService){};

    MyAttendance() {
        this.active='attendance';
        this.router.navigate(['/attendance/myAttendance'])
    };
    MarkLeave() {
        this.active='markLeave';
    };
    Home() {
        this.active='home';
        this.router.navigate(['/attendance/']);
    };
    Manager() {
        this.active = 'manager';
        this.router.navigate(['/attendance/manager']);
    }

}