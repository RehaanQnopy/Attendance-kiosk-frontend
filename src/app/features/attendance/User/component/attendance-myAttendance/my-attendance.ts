import { Component, OnInit } from '@angular/core';
import { Workbook } from 'exceljs';
import { AttendanceRow } from '../../models/AttendanceRow';
import {
  ATTENDANCE_COLUMNS, AttendanceRowUser, DayStatus,
  STATUS_LABEL, toDayStatus
} from '../../models/AttendanceRowUser';
import { AttendancePageService } from '../../service/Attendance-Page/attendance-page.service';

// Excel wants colours as ARGB text: FF = fully opaque, then the usual RRGGBB.
const EXCEL_HEADER_FILL = 'FF2F7A80';
const EXCEL_STATUS_COLOUR: Record<DayStatus, { fill: string; text: string }> = {
  'full-day':    { fill: 'FFEAFBE9', text: 'FF2E7D4F' },
  'short-day':   { fill: 'FFF6E9E9', text: 'FFA24B4B' },
  'leave':       { fill: 'FFE3EEFB', text: 'FF2F5F9E' },
  'in-progress': { fill: 'FFFBF2E0', text: 'FF8A5F0F' },
  'absent':      { fill: 'FFF6E9E9', text: 'FFA24B4B' },
  'weekend':     { fill: 'FFF0F0F0', text: 'FF666666' },
  'holiday':     { fill: 'FFEDE7F6', text: 'FF5E35B1' },
  'other':       { fill: 'FFF0F0F0', text: 'FF666666' }
};

// The "this is an .xlsx file" label the browser attaches to the download.
const EXCEL_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

@Component({
  selector: 'my-attendance',
  templateUrl: './my-attendance.html',
  styleUrls: ['./my-attendance.css']
})
export class MyAttendanceComponent implements OnInit {

  readonly columns = ATTENDANCE_COLUMNS;     // drives the table header AND the Excel columns
  readonly statusLabel = STATUS_LABEL;

  rows: AttendanceRowUser[] = [];
  monthKey = '';                                                       // month on screen, '2026-10'
  private readonly currentMonthKey = this.toMonthKey(new Date());      // this month in IST, set once

  loading = false;
  downloading = false;
  error = '';

  constructor(private attendanceService: AttendancePageService) {}


  ngOnInit(): void {
    this.loadMonth(this.currentMonthKey);
  }


  //Month Buttons: Previous and Next
  onPreviousMonth(): void { this.loadMonth(this.shiftMonthKey(this.monthKey, -1)); }

  // The html greys this button out on the current month, so a future month can never be asked for.
  onNextMonth(): void { this.loadMonth(this.shiftMonthKey(this.monthKey, 1)); }

  /*
    Buttons are disabled while loading, so two requests can never be in flight at once
    and the month label always matches the rows underneath it.
  */
  private loadMonth(key: string): void {
    this.monthKey = key;
    this.loading = true;
    this.error = '';

    this.attendanceService.getCurrentMonthFullView(key).subscribe({
      next: list => {
        this.rows = this.buildRows(list);
        this.loading = false;
      },
      error: () => {
        this.rows = [];
        this.error = 'Could not load attendance. Please sign in again.';
        this.loading = false;
      }
    });
  }


  /** 'YYYY-MM' for the given moment, in IST (same rule as the backend). */
  private toMonthKey(date: Date): string {
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit'
    }).formatToParts(date);
    const year = parts.find(p => p.type === 'year')!.value;
    const month = parts.find(p => p.type === 'month')!.value;
    return `${year}-${month}`;
  }

  /** '2026-12' + 1 gives '2027-01'. Plain arithmetic, no Date involved. */
  private shiftMonthKey(key: string, delta: number): string {
    const [year, month] = key.split('-').map(Number);
    const index = year * 12 + (month - 1) + delta;
    return `${Math.floor(index / 12)}-${String((index % 12) + 1).padStart(2, '0')}`;
  }


  // The backend already sends one row per day for the whole month.
  // This turns each backend AttendanceRow into the display-ready AttendanceRowUser.

  private buildRows(list: AttendanceRow[]): AttendanceRowUser[] {
  const today = this.todayKey();
  const rows: AttendanceRowUser[] = [];

  for (let i = 0; i < list.length; i++) {
    const r = list[i];
    const date = new Date(r.date + 'T00:00:00Z');
    const status = toDayStatus(r, today);

    rows.push({
      date,
      weekday: date.toLocaleDateString('en-GB', { weekday: 'short', timeZone: 'UTC' }),
      inMin: this.minutesIntoIstDay(r.inTime),
      outMin: this.minutesIntoIstDay(r.outTime),
      durationMin: r.outTime ? (r.totalDurationMin ?? 0) : null,
      status,
      statusText: status === 'other' ? r.status : STATUS_LABEL[status]
    });
  }
  return rows;
}


  //  - - - tools used by the rows - - - - - - - - - - - - - - - - - - - - - - - - //

  /** '2026-10-27T05:32:00Z' becomes 662 (11:02 AM in IST). Null stays null. */
  private minutesIntoIstDay(iso?: string | null): number | null {
    if (!iso) return null;
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
    }).formatToParts(new Date(iso));
    const hour = Number(parts.find(p => p.type === 'hour')!.value);
    const minute = Number(parts.find(p => p.type === 'minute')!.value);
    return hour * 60 + minute;
  }

  /** Today as 'YYYY-MM-DD' in IST. */
  private todayKey(): string {
    return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date());
  }


//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
//  📥  5 · EXCEL  ·  exceljs builds the file, the browser saves it              //
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//

  async downloadExcel(): Promise<void> {
    this.downloading = true;
    this.error = '';

    try {
      const workbook = new Workbook();
      const sheet = workbook.addWorksheet(this.monthLabel);      // the tab name, e.g. "October 2026"

      // 1) columns: header text, width, number format and alignment, all from ATTENDANCE_COLUMNS
      sheet.columns = this.columns.map(c => ({
        header: c.header,
        key: c.key,
        width: c.width,
        style: { alignment: { horizontal: c.align }, ...(c.numFmt ? { numFmt: c.numFmt } : {}) }
      }));

      // 2) one Excel row per table row.
      //    Excel keeps a time as a fraction of a day (0.5 = 12:00), so minutes / 1440.
      //    That keeps the cells real numbers: sortable, filterable and summable.
      this.rows.forEach(r => {
        const excelRow = sheet.addRow({
          date: r.date,
          weekday: r.weekday,
          inMin: r.inMin === null ? null : r.inMin / 1440,
          outMin: r.outMin === null ? null : r.outMin / 1440,
          durationMin: r.durationMin === null ? null : r.durationMin / 1440,
          statusText: r.statusText
        });

        const colour = EXCEL_STATUS_COLOUR[r.status];
        const statusCell = excelRow.getCell('statusText');
        statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colour.fill } };
        statusCell.font = { bold: true, color: { argb: colour.text } };
      });

      // 3) header look, frozen header row, and filter arrows on the header
      const header = sheet.getRow(1);
      header.height = 22;
      header.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      header.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: EXCEL_HEADER_FILL } };
      header.alignment = { vertical: 'middle', horizontal: 'center' };
      sheet.views = [{ state: 'frozen', ySplit: 1 }];
      sheet.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: this.columns.length } };

      // 4) turn the workbook into bytes, wrap them in a Blob labelled as .xlsx, and let the browser save it
      const bytes = await workbook.xlsx.writeBuffer();
      const url = URL.createObjectURL(new Blob([bytes], { type: EXCEL_MIME }));
      const link = document.createElement('a');
      link.href = url;
      link.download = `attendance-${this.monthKey}.xlsx`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      this.error = 'Could not create the Excel file. Please try again.';
    } finally {
      this.downloading = false;
    }
  }


//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
//  🪟  6 · GETTERS  ·  values and text formats the html uses                    //
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//

  /** 'October 2026' */
  get monthLabel(): string {
    const [year, month] = this.monthKey.split('-').map(Number);
    return new Date(year, month - 1, 1).toLocaleString('en-US', { month: 'long', year: 'numeric' });
  }

  /** True on the current month (or later), which is when the next button turns grey. */
  get isCurrentMonth(): boolean { return this.monthKey >= this.currentMonthKey; }

  /** 662 becomes '11:02 AM' */
  formatClock(min: number | null): string {
    if (min === null) return '-';
    const hour24 = Math.floor(min / 60);
    const hour12 = hour24 % 12 || 12;
    return `${hour12}:${String(min % 60).padStart(2, '0')} ${hour24 < 12 ? 'AM' : 'PM'}`;
  }

  /** 492 becomes '8h 12m' */
  formatDuration(min: number | null): string {
    return min === null ? '-' : `${Math.floor(min / 60)}h ${min % 60}m`;
  }
}