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
    //The below varibale is for 
    employeeBlockOpen = false;

    constructor(private route: Router, public loginService: LoginService){};

    MyAttendance() {
        this.active='attendance';
        this.route.navigate(['/attendance/myAttendance'])
    };
    LogOut() {
        this.active='leave';
        this.loginService.logout().subscribe({
            next: () => {
                localStorage.clear();
                sessionStorage.clear();
                this.route.navigate(["/"]);
            },
            error: err=> {
                console.error(`Side-navigation: Error in making the logout call to the backend`,err);
                return alert('Failed to log out. Please check your connection and try again.');
            }

        })
    };
    Home() {
        this.active='home';
        if(this.route.url.includes('/manager')) {
            this.route.navigate(['/manager']);
        }
        else if(this.route.url.includes('/attendance')) {
            this.route.navigate(['/attendance']);
        }
        else {
            this.route.navigate(['/']);
        }
    };
    Manager() {
        this.active = 'manager';
        this.route.navigate(['/attendance/manager']);
    }
    MarkLeave() {
        this.active = 'markLeave';
        this.route.navigate(['/attendance/markLeave']);
    }
    EmployeeAttendance() {
        this.active = 'emp-attendance';
        this.route.navigate(['/attendance/manager/employeeAttendance']);
    }
    get isManager(): Boolean {
    return this.route.url.includes('/manager') || this.loginService.hasRole('manager');
    }

    toggleEmployee() {
        this.employeeBlockOpen = !this.employeeBlockOpen;
    }
}