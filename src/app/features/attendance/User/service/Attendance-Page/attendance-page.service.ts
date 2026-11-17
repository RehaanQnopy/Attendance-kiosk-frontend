import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AttendanceMonth } from '../../models/Attendance-page';
import { AttendanceRow } from '../../models/AttendanceRow';

@Injectable({ providedIn: 'root' })
export class AttendancePageService {
  private baseUrl = `${environment.baseUrl}/attendance`;
  private opts = { withCredentials: true };

  constructor(private http: HttpClient) {}

  getMonth(monthAndYearKey: string): Observable<AttendanceMonth> {
    return this.http.get<AttendanceMonth>(`${this.baseUrl}/month/${monthAndYearKey}`, this.opts).pipe((catchError(err => {
        console.error(`[getMonth from Attendance-page.service]: Error in fetching the user's month data from the backend`);
        throw new Error(`Error in fetching the user's month data from the backend`);
    })));
  }

  getCurrentMonthFullView(monthAndYearKey: string): Observable<AttendanceRow[]> {
    return this.http.get<AttendanceRow[]>(`${this.baseUrl}/my-attendance/${monthAndYearKey}`, this.opts).pipe((catchError(err => {
        console.error(`[getCurrentMonthFullView from Attendance-page.service]: Error in fetching the user's month data from the backend`);
        throw new Error(`Attendance-page.service: ${err.message}`);
    })));
  }


  clockIn(): Observable<AttendanceMonth> {
    return this.http.post<AttendanceMonth>(`${this.baseUrl}/clock-in`, {}, this.opts);
  }

  clockOut(): Observable<AttendanceMonth> {
    return this.http.post<AttendanceMonth>(`${this.baseUrl}/clock-out`, {}, this.opts);
  }
}