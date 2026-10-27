import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { delay, Observable, of, tap } from 'rxjs';
import { SessionUser } from 'src/app/features/attendance/User/models/SessionUser';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class LoginService {
  private apiUrl = `${environment.baseUrl}/auth/user`;

  // set after a successful sign-in; null means signed out
  //AuthGuard checks the curr_user to decide whether user should be sent to login or to Dashboard 
  currUser: SessionUser | null = null;

  constructor(private http: HttpClient) {}

//   isUserValid(email: string): Observable<SessionUser> {
//     return this.http
//       .post<SessionUser>(this.apiUrl, { email }, { withCredentials: true })
//       .pipe(tap(user => (this.currUser = user)));
//   }
//The below method checks if the skipAuth enabled or not, if yes, 
isUserValid(email: string): Observable<SessionUser> {
  if (environment.skipAuth) {
    const user: SessionUser =
    { 
        id: 'dev-user', 
        name: 'Test Employee', 
         role: email.toLowerCase().startsWith('manager') ? 'MANAGER' : 'EMPLOYEE'
    };
    this.currUser = user;
    return of(user).pipe(delay(300));
  }

  return this.http
    .post<SessionUser>(this.apiUrl, { email }, { withCredentials: true })
    .pipe(tap(user => (this.currUser = user)));
}
}