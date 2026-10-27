import { Component, OnDestroy, OnInit } from '@angular/core';
import { CalendarEvent } from 'angular-calendar';
import { Observable } from 'rxjs';

import { AttendanceMonth } from '../../models/Attendance-page';
import { DayEntry } from '../../models/DayEntry';
import { AttendancePageService } from '../../service/Attendance-Page/attendance-page.service';
// Use the exact class name that Login.service.ts exports
import { LoginService } from '../../../../auth/Login/service/Login.service';
import { MOCK } from './attendance-page.mock';

/*
  MAP OF THIS FILE
    0. Settings ........ dot colours and the 8h rule
    1. State ........... the fields (same names as before, nothing new)
    2. Lifecycle ....... page open / close
    3. Clock widget .... page load, clock in, clock out, ticking timer
    4. Month arrows .... ‹ › buttons
    5. Date keys ....... the one IST formatter, used by page open and the arrows
    6. Dots & bars ..... draw one month of data
    7. Getters ......... small read-only values for the html

  Two rules keep the logic flat:
    • todayEntry is set ONLY by page load / clock in / clock out (they all return the current month).
    • the arrows only redraw the calendar and chart, they never touch todayEntry.
*/


//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
//  ⚙  0 · SETTINGS                                                              //
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//

const DOT = {
  full:  { primary: '#5aa66e', secondary: '#eafbe9' },
  short: { primary: '#c07a7a', secondary: '#f6e9e9' },
  open:  { primary: '#e0a64a', secondary: '#fbf2e0' }
};

const FULL_DAY_MIN = 480;   // 8 hours

interface Bar { day: number; pct: number; kind: 'full' | 'short' | 'open' | 'none'; tip: string; }

@Component({
  selector: 'attendance-page',
  templateUrl: './attendance-page.html',
  styleUrls: ['./attendance-page.css']
})
export class AttendancePageComponent implements OnInit, OnDestroy {


//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
//  🗃  1 · STATE                                                                //
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//

  //mock
  mock = MOCK;

  // calendar
  viewDate = new Date();
  events: CalendarEvent[] = [];

  // data
  month: AttendanceMonth | null = null;
  todayEntry: DayEntry | null = null;      // today's in/out time, only from page load or clock in/out
  bars: Bar[] = [];

  // keys
  monthAndYearKey: string = '';            // month shown on screen: starts as the current month, changes with the arrows
  dayKey: string = '';                     // today's day of month, set once when the page opens

  // ui state
  elapsed = '00:00:00';
  busy = false;
  error = '';
  private timer?: any;

  constructor(
    private attendanceService: AttendancePageService,
    public auth: LoginService
  ) {}


//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
//  🔌  2 · LIFECYCLE                                                            //
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//

  ngOnInit(): void {
    this.setToday();

    // Every page load, hard refresh included, asks the backend for the current month,
    // so today's in-time always comes from the database, never from the browser.
    this.loadCurrentMonthAndToday(
      this.attendanceService.getMonth(this.monthAndYearKey),
      'Could not load attendance. Please sign in again.'
    );
    this.timer = setInterval(() => this.tick(), 1000);
  }

  ngOnDestroy(): void { clearInterval(this.timer); }


//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
//  ⏱  3 · CLOCK WIDGET  ·  "am I clocked in today, and for how long?"           //
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//

  onClockIn(): void  { this.loadCurrentMonthAndToday(this.attendanceService.clockIn(),  'Clock in failed'); }
  onClockOut(): void {
    // the button is easy to press by accident, so ask first and only then call the backend
    if (!confirm(`Clock out now? You have been clocked in for ${this.elapsed}.`)) return;
    this.loadCurrentMonthAndToday(this.attendanceService.clockOut(), 'Clock out failed');
  }

  /*
    Page load, clock in and clock out all return the CURRENT month, so all three do the same:
    jump the view back to the current month, draw it, and read today's entry out of it.
  */
  private loadCurrentMonthAndToday(call: Observable<AttendanceMonth>, failMessage: string): void {
    this.busy = true;       // buttons stay disabled until the backend has told us today's state
    this.error = '';
    call.subscribe({
      next: m => {
        this.viewDate = new Date();
        this.applyMonth(m);
        this.todayEntry = m.days?.[this.dayKey] ?? null;
        this.tick();
        this.busy = false;
      },
      error: e => {
        this.error = e.error?.message || failMessage;
        this.busy = false;
      }
    });
  }

  // elapsed = (out-time, or now if still clocked in) minus the in-time saved in the backend
  private tick(): void {
    const t = this.todayEntry;
    if (!t?.inTime) { this.elapsed = '00:00:00'; return; }
    const end = t.outTime ? new Date(t.outTime).getTime() : Date.now();
    const s = Math.max(0, Math.floor((end - new Date(t.inTime).getTime()) / 1000));
    const p = (n: number) => String(n).padStart(2, '0');
    this.elapsed = `${p(Math.floor(s / 3600))}:${p(Math.floor((s % 3600) / 60))}:${p(s % 60)}`;
  }


//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
//  ◀ ▶  4 · MONTH ARROWS  ·  click ‹ or › → fetch that month → redraw           //
//       (never touches todayEntry)                                              //
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//

  onMonthChange(direction: number): void {
    this.viewDate = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth() + direction, 1);
    this.loadMonth(this.toDateKeys(this.viewDate).monthAndYearKey);
  }

  /*
    Takes a monthAndYearKey like '2026-09', asks the backend for that month,
    then applyMonth() draws the AttendanceMonth it gets back.
  */
  loadMonth(key: string): void {
    this.monthAndYearKey = key;
    this.attendanceService.getMonth(key).subscribe({
      next: m => this.applyMonth(m),
      error: () => this.error = 'Could not load attendance. Please sign in again.'
    });
  }


//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
//  🗓  5 · DATE KEYS  ·  the ONE place that formats a date the IST way          //
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//

  // Page open: today's month and day.
  private setToday(): void {
    const todayKeys = this.toDateKeys(new Date());
    this.monthAndYearKey = todayKeys.monthAndYearKey;   // 2026-10
    this.dayKey = todayKeys.dayKey;                     // 26
  }

  /*
    Same IST rule as the backend, so the keys always match.
    Intl.DateTimeFormat is the rulebook for how the date is laid out, and formatToParts
    hands the date to that rulebook and gives back year / month / day separately.
    The arrows reuse this too, so no date is ever parsed or padded by hand.
  */
  private toDateKeys(date: Date): { monthAndYearKey: string; dayKey: string } {
    const dateValue = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).formatToParts(date);

    const year = dateValue.find(y => y.type === 'year')?.value;
    const month = dateValue.find(m => m.type === 'month')?.value;
    const day = dateValue.find(d => d.type === 'day')?.value;

    return {
      monthAndYearKey: year + '-' + month,
      dayKey: String(Number(day))              // '05' → '5', matches the keys inside month.days
    };
  }


//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
//  📊  6 · DOTS & BARS  ·  draw one month of data (calendar + chart only)       //
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//

  private applyMonth(m: AttendanceMonth): void {
    this.month = m;
    this.monthAndYearKey = m.month;    // trust the month the backend actually sent

    const [y, mo] = m.month.split('-').map(Number);

    // calendar dots
    //In .map([d,e]) d->key value and e->DayEntry for that particular day while traversing the days of the AttendanceMonth
    this.events = Object.entries(m.days || {}).map(([d, e]) => ({
      start: new Date(y, mo - 1, Number(d)),
      title: e.outTime ? 'Present' : 'Clocked in',
      color: !e.outTime ? DOT.open : (e.totalDurationMin ?? 0) >= FULL_DAY_MIN ? DOT.full : DOT.short
    }));

    // chart bars: day 0 of the next month is the last day of this one, so 28/29/30/31 just work
    const count = new Date(y, mo, 0).getDate();
    this.bars = Array.from({ length: count }, (_, i) => {
      const d = i + 1, e = m.days?.[String(d)];
      if (!e) return { day: d, pct: 0, kind: 'none', tip: '' } as Bar;
      const min = e.totalDurationMin ?? 0;
      return {
        day: d,
        pct: e.outTime ? Math.min(100, (min / 600) * 100) : 8,
        kind: !e.outTime ? 'open' : min >= FULL_DAY_MIN ? 'full' : 'short',
        tip: e.outTime ? `${Math.floor(min / 60)}h ${min % 60}m` : 'Clocked in'
      } as Bar;
    });
  }


//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
//  🪟  7 · GETTERS  ·  small read-only values the html binds to                 //
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//

  get today(): DayEntry | null { return this.todayEntry; }

  get state(): 'idle' | 'working' | 'done' {
    if (!this.todayEntry) return 'idle';
    return this.todayEntry.outTime ? 'done' : 'working';
  }
  get presentDays(): number { return this.month ? Object.keys(this.month.days || {}).length : 0; }
  get totalHours(): string {
    const m = this.month?.summary?.totalMin ?? 0;
    return `${Math.floor(m / 60)}h ${m % 60}m`;
  }
  get monthLabel(): string {
    const [y, m] = this.monthAndYearKey.split('-').map(Number);
    return new Date(y, m - 1, 1).toLocaleString('en-US', { month: 'long', year: 'numeric' });
  }
  get userInitial(): string { return this.auth.currUser?.name?.charAt(0).toUpperCase() ?? ''; }
}