import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { LoginService } from '../features/auth/Login/service/Login.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private loginService: LoginService, private router: Router) {}

// If the currUser is not null, then the user is logged in and can access the route. 
// Otherwise, redirect to the login page.
  canActivate(): boolean | UrlTree {
    return this.loginService.currUser ? true : this.router.createUrlTree(['/login']);
  }
}