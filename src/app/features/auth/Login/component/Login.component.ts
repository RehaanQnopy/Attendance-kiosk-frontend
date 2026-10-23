import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginService } from '../service/Login.service';

@Component({
  selector: 'login-page',
  templateUrl: './Login.component.html',
  styleUrls: ['./Login.component.css']
})
export class LoginPage {

  errorMessage = '';
  loading = false;

  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email])
  });

  constructor(private loginService: LoginService, private router: Router) {}

  // runs when the user clicks Login
  onLogin(): void {
    if (this.loginForm.invalid) {
      this.errorMessage = 'Enter a valid email to log in.';
      return;
    }
    this.login(this.loginForm.value.email!.trim().toLowerCase());
  }

  public login(email: string): void {
    this.loading = true;
    this.errorMessage = '';

    this.loginService.isUserValid(email).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/attendance']);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.status === 401
          ? 'No account found for this email.'
          : 'Could not reach the server. Try again.';
      }
    });
  }
}