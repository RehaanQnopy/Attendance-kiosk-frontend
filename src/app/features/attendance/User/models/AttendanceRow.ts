// Model for the "My attendance" table.
// ONE definition of the rows and columns feeds BOTH the on-screen table and the Excel sheet,
// so the two can never drift apart.

/** The four things a day can be. */
export type DayStatus = 'full-day' | 'short-day' | 'leave' | 'in-progress';

/** Text shown for each status, on screen and in Excel. */
export const STATUS_LABEL: Record<DayStatus, string> = {
  'full-day': 'Full day',
  'short-day': 'Short day',
  'leave': 'Leave',
  'in-progress': 'In progress'
};

/** 8 hours or more counts as a full day. */
export const FULL_DAY_MIN = 480;

/** One table row = one day. Values are kept raw; screen and Excel format them their own way. */
export interface AttendanceRow {
  date: Date;                  // that calendar day, stored as UTC midnight so Excel shows the right date
  weekday: string;             // 'Tue'
  inMin: number | null;        // minutes after midnight in IST, e.g. 662 = 11:02 AM. null = no in-time (leave)
  outMin: number | null;       // same, null while still clocked in
  durationMin: number | null;  // worked minutes, null until clocked out
  status: DayStatus;
}

/** One column: its header, how wide it is in Excel, and how Excel should display its values. */
export interface AttendanceColumn {
  key: keyof AttendanceRow;
  header: string;
  width: number;                      // Excel column width, in characters
  align: 'left' | 'center';
  numFmt?: string;                    // Excel number format. Leave out for plain text.
}

export const ATTENDANCE_COLUMNS: AttendanceColumn[] = [
  { key: 'date',        header: 'Date',           width: 14, align: 'left',   numFmt: 'dd mmm yyyy' },
  { key: 'weekday',     header: 'Day',            width: 8,  align: 'center' },
  { key: 'inMin',       header: 'In time',        width: 12, align: 'center', numFmt: 'h:mm AM/PM' },
  { key: 'outMin',      header: 'Out time',       width: 12, align: 'center', numFmt: 'h:mm AM/PM' },
  { key: 'durationMin', header: 'Total duration', width: 16, align: 'center', numFmt: '[h]:mm' },
  { key: 'status',      header: 'Status',         width: 14, align: 'center' }
];