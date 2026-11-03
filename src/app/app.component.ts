import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from './features/auth/Login/service/Login.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  constructor(public loginService: LoginService, private route: Router) {}

  isLoginPage(): boolean {
    return this.route.url === '/login';
    
  }
  get showChrome(): boolean {
  return !!this.loginService.currUser && !this.isLoginPage();
}

}
