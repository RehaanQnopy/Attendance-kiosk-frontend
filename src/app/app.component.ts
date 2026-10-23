import { Component } from '@angular/core';
import { LoginService } from './features/auth/Login/service/Login.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  constructor(public loginService: LoginService) {}
}
