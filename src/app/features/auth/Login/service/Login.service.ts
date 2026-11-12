import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { SessionUser } from 'src/app/features/attendance/User/models/SessionUser';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class LoginService {
  private apiUrl = `${environment.baseUrl}/auth`;

  // set after a successful sign-in; null means signed out
  //AuthGuard checks the curr_user to decide whether user should be sent to login or to Dashboard 
  currUser: SessionUser | null = null;

  constructor(private http: HttpClient) {}

  //The below method checks if the skipAuth enabled or not, if yes, 
  isUserValid(email: string): Observable<SessionUser> {
    // if (environment.skipAuth) {
    //   const user: SessionUser =
    //   { 
    //       id: 'dev-user', 
    //       name: 'Test Employee', 
    //       role: email.toLowerCase().startsWith('manager') ? ['EMPLOYEE', 'MANAGER'] : ['EMPLOYEE']
    //   };
    //   this.currUser = user;
    //   return of(user).pipe(delay(300));
    // }

    return this.http
    //okay one important thing here { email } is sent as an object its a short hand for { email: email } 
    // and the backend expects the email to be sent as an object with key as email and value as the 
    // email address which is filled by user itself.
      .post<SessionUser>(`${this.apiUrl}/user`, { email }, { withCredentials: true })
      .pipe(
        tap(user => (this.currUser = user)),
        catchError((err => {
          console.log(`Login.service.ts: Error in making the POST call to the Backend`);
          throw err;
        }))
    );
  }
//Since in many palces we need the role to display different components absed on the role, we ensure we provide string
//and not string[]
  hasRole(role: string): boolean {
          return this.currUser?.role.includes(role) ?? false;
      }

//Very important stuff, the Backend call has no controller for this call, this call is interferred by the SpringSecruities CORS file and is handled there itself
      //ALWAYS MAKE THE POST CALL FRO THE LOGOUT OR LOGIN FROM FRONTEND TO BACKEND< WHY IS EXPLAINED BELOW
        /*

            How the Cookie Overwrite Works Step-by-Step

            1. Before the Attack: The victim is logged into their own account (victim@gmail.com). Their browser holds JSESSIONID = VICTIM_123.
            2. The Hidden Image Loads: The victim opens the fraud email containing <img src="https://yourapp.com">.
            3. Your Backend Authenticates the Attacker: Your server sees valid login credentials for attacker@gmail.com. 
              It creates a new session (JSESSIONID = ATTACKER_999) and sends back a Set-Cookie header to the victim's browser.
            4. The Browser Overwrites the Cookie: The victim's browser replaces VICTIM_123 with ATTACKER_999.
            5. The Victim Uses the App: When the victim returns to your website tab, the page looks identical, 
              except every action they take now belongs to attacker@gmail.com.
            6. The Attacker Collects the Data: Suppose your app is an e-commerce store, note-taking app, or document portal. 
              The victim adds their credit card to buy something, uploads a tax document, or saves private notes. Later, 
              the attacker logs into attacker@gmail.com from their own laptop and views everything the victim saved.
        */
    logout():Observable<void> 
    {
        return this.http.post<void>(`${this.apiUrl}/logout`, {}, { withCredentials: true}).pipe(catchError(err => {
          console.error(`LoginServcie: Error in making the logout call to the backend`,err);
          return throwError(()=>err);
        }))
    }


}