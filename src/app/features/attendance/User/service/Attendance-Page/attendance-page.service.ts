// import { Injectable } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { Observable } from 'rxjs';
// import { AttendanceMonth } from '../../models/Attendance-page';

// @Injectable({ providedIn: 'root' })
// export class AttendancePageService {
//   private baseUrl = 'http://localhost:8080/api/attendance';
//   private opts = { withCredentials: true };

//   constructor(private http: HttpClient) {}

//   getMonth(monthAndYearKey: string): Observable<AttendanceMonth> {
//     return this.http.get<AttendanceMonth>(`${this.baseUrl}/months/${monthAndYearKey}`, this.opts);
//   }
//   clockIn(): Observable<AttendanceMonth> {
//     return this.http.post<AttendanceMonth>(`${this.baseUrl}/clock-in`, {}, this.opts);
//   }
//   clockOut(): Observable<AttendanceMonth> {
//     return this.http.post<AttendanceMonth>(`${this.baseUrl}/clock-out`, {}, this.opts);
//   }
// }

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, delay, Observable, of, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AttendanceMonth } from '../../models/Attendance-page';
import { DayEntry } from '../../models/DayEntry';
import { MonthSummary } from '../../models/MonthSummary';

@Injectable({ providedIn: 'root' })
export class AttendancePageService {
  private baseUrl = `${environment.baseUrl}/attendance`;
  private opts = { withCredentials: true };

  // in-memory fake database, used only when environment.skipAuth is true
  private fakeDb = new Map<string, AttendanceMonth>();

  constructor(private http: HttpClient) {}

  getMonth(monthAndYearKey: string): Observable<AttendanceMonth> {
    if (environment.skipAuth) return this.reply(this.fakeMonth(monthAndYearKey));
    return this.http.get<AttendanceMonth>(`${this.baseUrl}/months/${monthAndYearKey}`, this.opts).pipe((catchError(err => {
        console.error(`Error in fetching the user's month data from the backend`);
        throw new Error(`Error in fetching the user's month data from the backend`);
    })));
  }

  clockIn(): Observable<AttendanceMonth> {
    if (environment.skipAuth) {
      const { monthAndYearKey, day } = this.istToday();
      const month = this.fakeMonth(monthAndYearKey);
      if (month.days[String(day)]) return this.fail('Already clocked in today');
      month.days[String(day)] = {
        type: 'work', inTime: new Date().toISOString(), outTime: null, totalDurationMin: null
      };
      return this.reply(month);
    }
    return this.http.post<AttendanceMonth>(`${this.baseUrl}/clock-in`, {}, this.opts);
  }

  clockOut(): Observable<AttendanceMonth> {
    if (environment.skipAuth) {
      const { monthAndYearKey, day } = this.istToday();
      const month = this.fakeMonth(monthAndYearKey);
      const entry = month.days[String(day)];
      if (!entry) return this.fail('Not clocked in today');
      if (entry.outTime) return this.fail('Already clocked out today');

      const now = new Date();
      const minutes = Math.floor((now.getTime() - new Date(entry.inTime!).getTime()) / 60000);
      entry.outTime = now.toISOString();
      entry.totalDurationMin = minutes;
      if (minutes >= 480) month.summary.fullDays++; else month.summary.shortDays++;
      month.summary.totalMin += minutes;
      return this.reply(month);
    }
    return this.http.post<AttendanceMonth>(`${this.baseUrl}/clock-out`, {}, this.opts);
  }

  // ---------------- fake-data helpers ----------------

  /** Returns the stored month, creating and seeding it on first use. */
  private fakeMonth(key: string): AttendanceMonth {
    if (!this.fakeDb.has(key)) this.fakeDb.set(key, this.seed(key));
    return this.fakeDb.get(key)!;
  }

  /** Past weekdays get sample entries. The current day and future days stay empty. */
  private seed(key: string): AttendanceMonth {
    const [y, m] = key.split('-').map(Number);
    const today = this.istToday();
    const days: Record<string, DayEntry> = {};
const summary: MonthSummary = { fullDays: 0, shortDays: 0, leaveDays: 0, totalMin: 0 };

    let last = new Date(y, m, 0).getDate();            // whole month
    if (key === today.monthAndYearKey) last = today.day - 1;  // only days before today
    if (key > today.monthAndYearKey) last = 0;                // future month: nothing

    for (let d = 1; d <= last; d++) {
      const weekday = new Date(y, m - 1, d).getDay();
      if (weekday === 0 || weekday === 6) continue;    // skip weekends

      const minutes = d % 4 === 0 ? 300 : 480 + (d % 3) * 20;   // some short days, some full
      const inTime = new Date(Date.UTC(y, m - 1, d, 4, 0));     // 09:30 IST
      days[String(d)] = {
        type: 'work',
        inTime: inTime.toISOString(),
        outTime: new Date(inTime.getTime() + minutes * 60000).toISOString(),
        totalDurationMin: minutes
      };
      if (minutes >= 480) summary.fullDays++; else summary.shortDays++;
      summary.totalMin += minutes;
    }
    return { id: 'fake-' + key, userId: 'dev-user', month: key, days, summary };
  }

  private reply(m: AttendanceMonth): Observable<AttendanceMonth> {
    return of(JSON.parse(JSON.stringify(m)) as AttendanceMonth).pipe(delay(300));    // simulate network latency
  }

  private fail(message: string): Observable<never> {
    return throwError(() => ({ status: 409, error: { message } })).pipe(delay(300));
  }

  private istToday(): { monthAndYearKey: string; day: number } {
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit'
    }).formatToParts(new Date());
    const get = (t: string) => parts.find(p => p.type === t)!.value;
    return { monthAndYearKey: `${get('year')}-${get('month')}`, day: Number(get('day')) };
  }
}