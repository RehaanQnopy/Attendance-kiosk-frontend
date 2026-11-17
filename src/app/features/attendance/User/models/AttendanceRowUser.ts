import { AttendanceRow } from './AttendanceRow';

export type DayStatus =
  'full-day' | 'short-day' | 'leave' | 'in-progress' | 'absent' | 'weekend' | 'holiday' | 'other';

export const STATUS_LABEL: Record<DayStatus, string> = {
  'full-day': 'Full day',
  'short-day': 'Short day',
  'leave': 'Leave',
  'in-progress': 'In progress',
  'absent': 'Absent',
  'weekend': 'Weekend',
  'holiday': 'Holiday',
  'other': ''                  // replaced by the raw backend text in statusText
};

/** 8 hours or more counts as a full day. */
export const FULL_DAY_MIN = 480;

/** One table row = one day, built from an AttendanceRow by buildRows(). */
export interface AttendanceRowUser {
  date: Date;                  // UTC midnight
  weekday: string;             // 'Tue'
  inMin: number | null;        // minutes after midnight in IST
  outMin: number | null;
  durationMin: number | null;
  status: DayStatus;           // for logic and colours
  statusText: string;          // what screen and Excel display
}

/** Backend status (+ times) → DayStatus. Unknown values become 'other'. */
export function toDayStatus(r: AttendanceRow, today: string): DayStatus {
  switch ((r.status ?? '').toUpperCase()) {
    case 'LEAVE':   return 'leave';
    case 'ABSENT':  return 'absent';
    case 'WEEKEND': return 'weekend';
    case 'HOLIDAY': return 'holiday';
    case 'WORK':
      if (!r.inTime) return 'absent';
      if (!r.outTime) return r.date < today ? 'short-day' : 'in-progress';
      return (r.totalDurationMin ?? 0) >= FULL_DAY_MIN ? 'full-day' : 'short-day';
    case 'NOT_CLOCKED_IN':
      return 'in-progress';
    default:
      return 'other';
  }
}

/** One column: its header, how wide it is in Excel, and how Excel should display its values. */
export interface AttendanceColumn {
  key: keyof AttendanceRowUser;
  header: string;
  width: number;
  align: 'left' | 'center';
  numFmt?: string;
}

export const ATTENDANCE_COLUMNS: AttendanceColumn[] = [
  { key: 'date',        header: 'Date',           width: 14, align: 'left',   numFmt: 'dd mmm yyyy' },
  { key: 'weekday',     header: 'Day',            width: 8,  align: 'center' },
  { key: 'inMin',       header: 'In time',        width: 12, align: 'center', numFmt: 'h:mm AM/PM' },
  { key: 'outMin',      header: 'Out time',       width: 12, align: 'center', numFmt: 'h:mm AM/PM' },
  { key: 'durationMin', header: 'Total duration', width: 16, align: 'center', numFmt: '[h]:mm' },
  { key: 'statusText',  header: 'Status',         width: 14, align: 'center' }
];