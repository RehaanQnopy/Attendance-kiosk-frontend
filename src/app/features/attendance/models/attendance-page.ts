import { DayEntry } from './DayEntry';
import { MonthSummary } from './MonthSummary';


export interface AttendanceMonth {
  id?: string;
  userId?: string;
  month: string;                      // "2026-10"
  days: Record<string, DayEntry>;     // plain JSON object, key = day number "21"
  summary: MonthSummary;
}