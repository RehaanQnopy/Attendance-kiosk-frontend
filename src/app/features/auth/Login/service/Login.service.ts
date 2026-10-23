import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { delay, Observable, of, tap } from 'rxjs';
import { SessionUser } from 'src/app/features/attendance/models/SessionUser';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class LoginService {
  private apiUrl = `${environment.baseUrl}/auth/user`;

  // set after a successful sign-in; null means signed out
  currUser: SessionUser | null = null;

  constructor(private http: HttpClient) {}

//   isUserValid(email: string): Observable<SessionUser> {
//     return this.http
//       .post<SessionUser>(this.apiUrl, { email }, { withCredentials: true })
//       .pipe(tap(user => (this.currUser = user)));
//   }
isUserValid(email: string): Observable<SessionUser> {
  if (environment.skipAuth) {
    const user: SessionUser = { id: 'dev-user', name: 'Test Employee', role: 'EMPLOYEE' };
    this.currUser = user;
    return of(user).pipe(delay(300));
  }

  return this.http
    .post<SessionUser>(this.apiUrl, { email }, { withCredentials: true })
    .pipe(tap(user => (this.currUser = user)));
}
}