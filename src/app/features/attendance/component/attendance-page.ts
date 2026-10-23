import { Component, OnDestroy, OnInit } from '@angular/core';
import { CalendarEvent } from 'angular-calendar';
import { Observable } from 'rxjs';

import { AttendanceMonth } from '../models/Attendance-page';
import { DayEntry } from '../models/DayEntry';
import { AttendancePageService } from '../service/Attendance-Page/attendance-page.service';
// Use the exact class name that Login.service.ts exports
import { LoginService } from '../../auth/Login/service/Login.service';
import { MOCK } from './attendance-page.mock';

const DOT = {
  full:  { primary: '#5aa66e', secondary: '#eafbe9' },
  short: { primary: '#c07a7a', secondary: '#f6e9e9' },
  open:  { primary: '#e0a64a', secondary: '#fbf2e0' }
};

interface Bar { day: number; pct: number; kind: 'full' | 'short' | 'open' | 'none'; tip: string;}

@Component({
  selector: 'attendance-page',
  templateUrl: './attendance-page.html',
  styleUrls: ['./attendance-page.css']
})
export class AttendancePageComponent implements OnInit, OnDestroy {

//mock
mock = MOCK;

  // calendar
  viewDate = new Date();
  events: CalendarEvent[] = [];

  // data
  month: AttendanceMonth | null = null;
  todayEntry: DayEntry | null = null;
  bars: Bar[] = [];

  // keys
  monthKey = '';            // month being viewed
  todayMonthKey = '';       // the real current month
  dayKey = '';

  // ui state
  elapsed = '00:00:00';
  busy = false;
  error = '';
  private timer?: any;

  constructor(
    private attendanceService: AttendancePageService,
    public auth: LoginService
  ) {}

  // ---------- lifecycle ----------
  ngOnInit(): void {
    this.setToday();
    this.loadMonth(this.todayMonthKey);
    this.timer = setInterval(() => this.tick(), 1000);
  }
  ngOnDestroy(): void { clearInterval(this.timer); }

  // ---------- actions ----------
  loadMonth(key: string): void {
    this.monthKey = key;
    this.attendanceService.getMonth(key).subscribe({
      next: m => this.applyMonth(m),
      error: () => this.error = 'Could not load attendance. Please sign in again.'
    });
  }

  onMonthChange(delta: number): void {
    this.viewDate = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth() + delta, 1);
    const y = this.viewDate.getFullYear();
    const m = String(this.viewDate.getMonth() + 1).padStart(2, '0');
    this.loadMonth(`${y}-${m}`);
  }

  onClockIn(): void { this.act(this.attendanceService.clockIn()); }
  onClockOut(): void { this.act(this.attendanceService.clockOut()); }

  private act(call: Observable<AttendanceMonth>): void {
    this.busy = true;
    this.error = '';
    call.subscribe({
      next: m => {
        this.viewDate = new Date();          // clock actions return the current month
        this.applyMonth(m);
        this.busy = false;
      },
      error: e => {
        this.error = e.error?.message || 'Action failed';
        this.busy = false;
      }
    });
  }

  // ---------- derived state (used by the template) ----------
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
    const [y, m] = this.monthKey.split('-').map(Number);
    return new Date(y, m - 1, 1).toLocaleString('en-US', { month: 'long', year: 'numeric' });
  }
  get userInitial(): string { return this.auth.currUser?.name?.charAt(0).toUpperCase() ?? ''; }

  // ---------- internals ----------
  private applyMonth(m: AttendanceMonth): void {
    this.month = m;
    this.monthKey = m.month;
    if (m.month === this.todayMonthKey) this.todayEntry = m.days?.[this.dayKey] ?? null;

    const [y, mo] = m.month.split('-').map(Number);

    // calendar dots
    this.events = Object.entries(m.days || {}).map(([d, e]) => ({
      start: new Date(y, mo - 1, Number(d)),
      title: e.outTime ? 'Present' : 'Clocked in',
      color: !e.outTime ? DOT.open : (e.totalDurationMin ?? 0) >= 480 ? DOT.full : DOT.short
    }));

    // chart bars
    const count = new Date(y, mo, 0).getDate();
    this.bars = Array.from({ length: count }, (_, i) => {
      const d = i + 1, e = m.days?.[String(d)];
      if (!e) return { day: d, pct: 0, kind: 'none', tip: '' } as Bar;
      const min = e.totalDurationMin ?? 0;
      return {
        day: d,
        pct: e.outTime ? Math.min(100, (min / 600) * 100) : 8,
        kind: !e.outTime ? 'open' : min >= 480 ? 'full' : 'short',
        tip: e.outTime ? `${Math.floor(min / 60)}h ${min % 60}m` : 'Clocked in'
      } as Bar;
    });

    this.tick();
  }

  private tick(): void {
    const t = this.todayEntry;
    if (!t) { this.elapsed = '00:00:00'; return; }
    const end = t.outTime ? new Date(t.outTime).getTime() : Date.now();
    const s = Math.max(0, Math.floor((end - new Date(t.inTime!).getTime()) / 1000));
    const p = (n: number) => String(n).padStart(2, '0');
    this.elapsed = `${p(Math.floor(s / 3600))}:${p(Math.floor((s % 3600) / 60))}:${p(s % 60)}`;
  }

  /** Same IST rule as the backend, so the keys always match. */
  private setToday(): void {
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit'
    }).formatToParts(new Date());
    const get = (t: string) => parts.find(p => p.type === t)!.value;
    this.monthKey = `${get('year')}-${get('month')}`;
    this.todayMonthKey = this.monthKey;
    this.dayKey = String(Number(get('day')));
  }
}