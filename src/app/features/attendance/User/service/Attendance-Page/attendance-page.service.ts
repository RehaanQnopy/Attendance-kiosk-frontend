import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable } from 'rxjs';
import { ApiResponse } from 'src/app/core/apiResponse';
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
      return this.http.get<ApiResponse<AttendanceRow[]>>(`${this.baseUrl}/my-attendance/${monthAndYearKey}`, this.opts).pipe(
    map(res => res.data),
    catchError(err => {
      // the backend's error body has the same shape, so its message can be reused
      throw new Error(err.error?.message ?? err.message);
    })
  );
}


  clockIn(): Observable<AttendanceMonth> {
    return this.http.post<AttendanceMonth>(`${this.baseUrl}/clock-in`, {}, this.opts);
  }

  clockOut(): Observable<AttendanceMonth> {
    return this.http.post<AttendanceMonth>(`${this.baseUrl}/clock-out`, {}, this.opts);
  }
}