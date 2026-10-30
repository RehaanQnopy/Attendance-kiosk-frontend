export interface DayEntry {
  type: 'work' | 'leave';
  inTime?: string;                  // ISO string from the server
  outTime?: string | null;
  totalDurationMin?: number | null;
  leaveId?: string | null;
  leaveType?: string | null;
}