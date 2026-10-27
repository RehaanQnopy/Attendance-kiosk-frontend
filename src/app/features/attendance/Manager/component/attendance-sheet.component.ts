import { Component, Input, OnInit } from '@angular/core';
import { AttendanceMonth } from '../../User/models/Attendance-page';
import { AttendancePageService } from '../../User/service/Attendance-Page/attendance-page.service';

type Status = 'full' | 'short' | 'leave' | 'progress' | 'noout' | 'absent' | 'weekend' | 'upcoming';

interface Row {
  dateLabel: string; weekday: string;
  status: Status; statusLabel: string;
  inTime: string; outTime: string; duration: string;
  durationMin: number; diffMin: number; diffLabel: string;
  isToday: boolean;
}

const FULL_DAY_MIN = 480;
const TZ = 'Asia/Kolkata';
const STATUS_LABEL: Record<Status, string> = {
  full: 'Full day', short: 'Short day', leave: 'Leave', progress: 'In progress',
  noout: 'No clock-out', absent: 'Absent', weekend: 'Weekend', upcoming: ''
};

@Component({
  selector: 'app-attendance-sheet',
  templateUrl: './attendance-sheet.component.html',
  styleUrls: ['./attendance-sheet.component.css']
})
export class ManagerAttendanceSheetComponent implements OnInit {
  @Input() employeeName = '';

  year = 0;
  month = 0;                 // 1-12
  rows: Row[] = [];
  totals = this.emptyTotals();
  loading = false;
  exporting = false;
  error = '';

  constructor(private api: AttendancePageService) {}

  ngOnInit(): void {
    const t = this.istToday();
    this.year = t.year;
    this.month = t.month;
    this.load();
  }

  // ---------- month handling ----------
  get monthKey(): string { return `${this.year}-${String(this.month).padStart(2, '0')}`; }
  get monthLabel(): string {
    return new Date(this.year, this.month - 1, 1).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
  }
  get isCurrentMonth(): boolean {
    const t = this.istToday();
    return t.year === this.year && t.month === this.month;
  }

  changeMonth(delta: number): void {
    const d = new Date(this.year, this.month - 1 + delta, 1);
    this.year = d.getFullYear();
    this.month = d.getMonth() + 1;
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = '';
    this.api.getMonth(this.monthKey).subscribe({
      next: data => { this.build(data); this.loading = false; },
      error: () => { this.error = 'Could not load attendance for this month.'; this.loading = false; }
    });
  }

  // ---------- build one row per calendar day ----------
  private build(data: AttendanceMonth): void {
    const today = this.istToday();
    const daysInMonth = new Date(this.year, this.month, 0).getDate();
    const rows: Row[] = [];

    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(this.year, this.month - 1, d);
      const entry = data.days?.[String(d)];
      const isToday = this.isCurrentMonth && d === today.day;
      const isFuture = this.monthKey > today.key || (this.monthKey === today.key && d > today.day);
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;

      let status: Status;
      let durationMin = 0;

      if (entry?.type === 'leave') status = 'leave';
      else if (entry?.type === 'work' && entry.outTime) {
        durationMin = entry.totalDurationMin ?? 0;
        status = durationMin >= FULL_DAY_MIN ? 'full' : 'short';
      }
      else if (entry?.type === 'work') status = isToday ? 'progress' : 'noout';
      else if (isFuture) status = 'upcoming';
      else if (isWeekend) status = 'weekend';
      else status = 'absent';

      const counted = status === 'full' || status === 'short';
      const diffMin = counted ? durationMin - FULL_DAY_MIN : 0;

      rows.push({
        dateLabel: date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        weekday: date.toLocaleDateString('en-GB', { weekday: 'short' }),
        status, statusLabel: STATUS_LABEL[status],
        inTime: this.clock(entry?.inTime),
        outTime: this.clock(entry?.outTime),
        duration: counted ? this.hm(durationMin) : '–',
        durationMin, diffMin,
        diffLabel: counted ? this.signed(diffMin) : '–',
        isToday
      });
    }
    this.rows = rows;
    this.totals = this.sum(rows);
  }

  private sum(rows: Row[]) {
    const t = this.emptyTotals();
    let counted = 0;
    for (const r of rows) {
      if (r.status === 'full') { t.full++; counted++; t.min += r.durationMin; t.diffMin += r.diffMin; }
      else if (r.status === 'short') { t.short++; counted++; t.min += r.durationMin; t.diffMin += r.diffMin; }
      else if (r.status === 'leave') t.leave++;
      else if (r.status === 'absent') t.absent++;
    }
    t.hoursLabel = this.hm(t.min);
    t.avgLabel = counted ? this.hm(Math.round(t.min / counted)) : '–';
    t.diffLabel = counted ? this.signed(t.diffMin) : '–';
    return t;
  }

  private emptyTotals() {
    return { full: 0, short: 0, leave: 0, absent: 0, min: 0, diffMin: 0, hoursLabel: '0h 00m', avgLabel: '–', diffLabel: '–' };
  }

  // ================= DOWNLOADS =================

  /** CSV: no library needed. Opens fine in Excel. */
  downloadCsv(): void {
    const lines = [this.header(), ...this.rows.map(r => this.line(r)), this.totalLine()];
    const csv = lines.map(cols => cols.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\r\n');
    // \uFEFF (BOM) makes Excel read the file as UTF-8
    this.save(new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' }), `attendance-${this.monthKey}.csv`);
  }

  /** Real .xlsx with styling, built in the browser with ExcelJS (npm i exceljs). */
  async downloadExcel(): Promise<void> {
    this.exporting = true;
    try {
      const ExcelJS = await import('exceljs');           // lazy-loaded, so it stays out of the main bundle
      const wb = new ExcelJS.Workbook();
      const ws = wb.addWorksheet(this.monthKey, { views: [{ state: 'frozen', ySplit: 3 }] });

      ws.mergeCells('A1:G1');
      ws.getCell('A1').value = `Attendance – ${this.monthLabel}${this.employeeName ? ' – ' + this.employeeName : ''}`;
      ws.getCell('A1').font = { bold: true, size: 14 };

      const head = ws.getRow(3);
      head.values = this.header();
      head.eachCell(c => {
        c.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF43949A' } };
        c.alignment = { horizontal: 'center' };
      });

      const fills: Partial<Record<Status, string>> = {
        full: 'FFC8F0C8', short: 'FFFFD9A8', leave: 'FFFFF3A8', progress: 'FFCFE8FF',
        absent: 'FFF7D4D4', noout: 'FFE6DCF5', weekend: 'FFF1F3F3'
      };
      this.rows.forEach(r => {
        const row = ws.addRow(this.line(r));
        const fill = fills[r.status];
        if (fill) row.getCell(3).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: fill } };
        row.getCell(1).alignment = { horizontal: 'left' };
      });

      const total = ws.addRow(this.totalLine());
      total.font = { bold: true };
      total.eachCell(c => { c.border = { top: { style: 'medium' } }; });

      ws.columns = [{ width: 14 }, { width: 8 }, { width: 14 }, { width: 12 }, { width: 12 }, { width: 16 }, { width: 10 }];
      ws.eachRow((row, n) => { if (n >= 3) row.eachCell(c => {
        c.border = { ...c.border, bottom: { style: 'thin', color: { argb: 'FFD9E3E3' } }, right: { style: 'thin', color: { argb: 'FFD9E3E3' } } };
      }); });

      const buffer = await wb.xlsx.writeBuffer();
      this.save(
        new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
        `attendance-${this.monthKey}.xlsx`
      );
    } finally {
      this.exporting = false;
    }
  }

  // ---------- export helpers ----------
  private header(): string[] { return ['Date', 'Day', 'Status', 'In time', 'Out time', 'Total duration', 'vs 8h']; }
  private line(r: Row): string[] { return [r.dateLabel, r.weekday, r.statusLabel, r.inTime, r.outTime, r.duration, r.diffLabel]; }
  private totalLine(): string[] {
    return ['Month total', '', `${this.totals.full} full / ${this.totals.short} short`, '', '', this.totals.hoursLabel, this.totals.diffLabel];
  }

  /** The core of every browser download: Blob -> temporary URL -> hidden <a download> click. */
  private save(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  // ---------- formatting ----------
  private clock(iso?: string | null): string {
    if (!iso) return '–';
    return new Intl.DateTimeFormat('en-IN', { timeZone: TZ, hour: '2-digit', minute: '2-digit', hour12: true })
      .format(new Date(iso)).toUpperCase();
  }
  private hm(min: number): string {
    return `${Math.floor(min / 60)}h ${String(min % 60).padStart(2, '0')}m`;
  }
  private signed(min: number): string {
    if (min === 0) return '0m';
    const abs = Math.abs(min);
    const txt = abs >= 60 ? `${Math.floor(abs / 60)}h ${String(abs % 60).padStart(2, '0')}m` : `${abs}m`;
    return (min > 0 ? '+' : '−') + txt;
  }
  private istToday(): { year: number; month: number; day: number; key: string } {
    const p = new Intl.DateTimeFormat('en-GB', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date());
    const g = (t: string) => p.find(x => x.type === t)!.value;
    return { year: +g('year'), month: +g('month'), day: +g('day'), key: `${g('year')}-${g('month')}` };
  }
}