export interface AttendanceRow {
  id: number;
  name: string;
  role: string;
  state: 'present' | 'leave' | 'absent';
  inTime: Date | null;   // pass to the `date` pipe
  outTime: Date | null;  // null while still working
}