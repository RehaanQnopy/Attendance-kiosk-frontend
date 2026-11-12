
export interface AttendanceRow {
  id: string;
  name: string;
  state: string;
  inTime: Date | null;   // pass to the `date` pipe
  outTime: Date | null;  // null while still working
}