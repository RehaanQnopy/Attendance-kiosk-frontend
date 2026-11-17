/** Exactly what the backend's AttendanceRow sends (the JSON). */
export interface AttendanceRow {
  date: string;                     // "2026-11-05"
  status: string;                   // WORK, LEAVE, ABSENT, WEEKEND, HOLIDAY, NOT_CLOCKED_IN
  inTime: string | null;            // ISO instant, e.g. "2026-11-05T05:50:00Z"
  outTime: string | null;
  totalDurationMin: number | null;
  leaveType: string | null;
}