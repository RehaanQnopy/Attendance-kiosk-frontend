export interface DayEntry {
  type: 'work' | 'leave';
  inTime?: string;                  // ISO string from the server
  outTime?: string | null;
  totalDurationMin?: number | null;
  leaveId?: string;
  leaveType?: string;
}
export interface MonthDoc {
  month: string;// "2026-10"
  //This is for the days, and the Dayentry
  days: Map<string, DayEntry>; //Embedded
  summary: MonthSummary //Embeded
}

export interface MonthSummary {
  fullDays: number; shortDays: number; leaveDays: number; totalMin: number;
}
