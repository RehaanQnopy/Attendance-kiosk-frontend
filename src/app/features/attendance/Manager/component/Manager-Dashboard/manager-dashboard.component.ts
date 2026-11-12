import { Component } from '@angular/core';
import { AttendanceRow } from '../../model/AttendanceRow';
import { LeaveRequest } from '../../model/LeaveRequest';
import { UsersAttendanceView } from '../../model/UsersAttendanceView';
import { ManagerService } from '../../service/manager-service';

type View = 'home' | 'leave';
type LeaveStatus = 'Pending' | 'Approved' | 'Rejected';
type StatusFilter = 'all' | 'working' | 'clockedOut' | 'late' | 'leave' | 'absent';

// Build a Date relative to today (fake data only)
const day = (offset: number): Date => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  d.setHours(0, 0, 0, 0);
  return d;
};

@Component({
  selector: 'app-manager-dashboard',
  // If your project declares components in an NgModule instead,
  // remove `standalone` and `imports` and declare it there.
  templateUrl: './manager-dashboard.component.html',
  styleUrls: ['./manager-dashboard.component.css'],
})
export class ManagerDashboardComponent {

  constructor(private mangerService: ManagerService) {};
  view: View = 'home';
  today = new Date();

  // Anyone clocking in after this is counted as late
  readonly lateAfterHour = 11;
  readonly lateAfterMinute = 30;

  // ---- Home filters ----
  search = '';
  statusFilter: StatusFilter = 'all';

  // ---- Leave tab ----
  leaveTab: LeaveStatus = 'Pending';
  readonly leaveTabs: LeaveStatus[] = ['Pending', 'Approved', 'Rejected'];

  // // ---------------- FAKE DATA (replace with service calls) ----------------
  // attendance: AttendanceRow[] = [
  //   { id: 1,  name: 'Pristia Candra',  role: 'Designer',        state: 'present', inTime: at('08:52'), outTime: at('17:30') },
  //   { id: 2,  name: 'Rahim Earteza',   role: 'Frontend Dev',    state: 'present', inTime: at('09:04'), outTime: null },
  //   { id: 3,  name: 'Arfat Chowdury',  role: 'Backend Dev',     state: 'present', inTime: at('09:41'), outTime: null },
  //   { id: 4,  name: 'MD Tohid',        role: 'QA Engineer',     state: 'present', inTime: at('08:58'), outTime: at('17:05') },
  //   { id: 5,  name: 'Md Fairose',      role: 'Product Manager', state: 'present', inTime: at('09:12'), outTime: null },
  //   { id: 6,  name: 'Shawlin Akter',   role: 'HR Executive',    state: 'leave',   inTime: null,        outTime: null },
  //   { id: 7,  name: 'Hasib Karim',     role: 'DevOps',          state: 'present', inTime: at('12:03'), outTime: null },
  //   { id: 8,  name: 'Nusrat Jahan',    role: 'Designer',        state: 'present', inTime: at('08:47'), outTime: at('16:58') },
  //   { id: 9,  name: 'Sabbir Hossain',  role: 'Backend Dev',     state: 'absent',  inTime: null,        outTime: null },
  //   { id: 10, name: 'Tania Rahman',    role: 'Support Lead',    state: 'present', inTime: at('09:00'), outTime: null },
  //   { id: 11, name: 'Imran Sheikh',    role: 'Frontend Dev',    state: 'leave',   inTime: null,        outTime: null },
  //   { id: 12, name: 'Mitu Das',        role: 'Accountant',      state: 'present', inTime: at('09:27'), outTime: at('17:45') },
  // ];
  leaves: LeaveRequest[] = [
    { id: 1, empName: 'Rahim Earteza',  role: 'Frontend Dev',    type: 'Sick leave',   from: day(3),   to: day(4),   reason: 'Fever and doctor visit', status: 'Pending' },
    { id: 2, empName: 'Md Fairose',     role: 'Product Manager', type: 'Casual leave', from: day(10),  to: day(10),  reason: 'Family function',        status: 'Pending' },
    { id: 3, empName: 'Nusrat Jahan',   role: 'Designer',        type: 'Annual leave', from: day(16),  to: day(20),  reason: 'Trip to Cox’s Bazar',    status: 'Pending' },
    { id: 4, empName: 'Mitu Das',       role: 'Accountant',      type: 'Casual leave', from: day(5),   to: day(5),   reason: 'Bank work',              status: 'Pending' },
    { id: 5, empName: 'Shawlin Akter',  role: 'HR Executive',    type: 'Sick leave',   from: day(-1),  to: day(1),   reason: 'Viral infection',        status: 'Approved' },
    { id: 6, empName: 'Imran Sheikh',   role: 'Frontend Dev',    type: 'Annual leave', from: day(0),   to: day(2),   reason: 'Wedding out of town',    status: 'Approved' },
    { id: 7, empName: 'Sabbir Hossain', role: 'Backend Dev',     type: 'Casual leave', from: day(-3),  to: day(-3),  reason: 'Personal errand',        status: 'Rejected' },
  ];
  // -----------------------------------------------------------------------

  attendance: AttendanceRow[] = [];
  loading = false;
  errorMsg = '';

  ngOnInit() 
  {
    this.loadAttendance();

  }

    public loadAttendance(): void
    {
      this.loading = true;
      this.errorMsg = '';

      this.mangerService.getAllUsersAttendance().subscribe({
        next: (data) => {
          this.attendance = (data ?? []).map(d => this.toRow(d));
          this.loading = false;
        },
        error: () => {
          this.errorMsg = 'Could not load attendance. Please try again.';
          this.loading = false;
        },
      })
    }
    private toRow(d: UsersAttendanceView): AttendanceRow {
  // Debug: see the raw object from the backend (remove once working)
  console.log('raw row from backend:', d);

  // Use the backend status if present, otherwise fall back to 'Unknown'
  const status = d.status ? d.status : 'Unknown';

  return {
    id: d.userId,
    name: d.name,
    //Status is what backedn sends
    state: status,
    inTime: d.in_time ? new Date(d.in_time) : null,
    outTime: d.out_time ? new Date(d.out_time) : null
  };
}
  // ---------- navigation ----------
  setView(v: View): void {
    this.view = v;
  }

  // ---------- Home: stats ----------
get presentCount(): number {
  return this.attendance.filter(e => e.state === 'Working' || e.state === 'Left').length;
}
get lateCount(): number {
  return this.attendance.filter(e => this.isLate(e)).length;
}
get leaveCount(): number {
  return this.attendance.filter(e => e.state === 'Leave').length;
}
get absentCount(): number {
  return this.attendance.filter(e => e.state === 'Absent').length;
}

  // ---------- Home: table ----------
get filteredRows(): AttendanceRow[] {
  const q = this.search.trim().toLowerCase();
  return this.attendance.filter(e => {
    if (q && !e.name.toLowerCase().includes(q)) return false;
    switch (this.statusFilter) {
      case 'working':    return e.state === 'Working';
      case 'clockedOut': return e.state === 'Left';
      case 'late':       return this.isLate(e);
      case 'leave':      return e.state === 'Leave';
      case 'absent':     return e.state === 'Absent';
      default:           return true;
    }
  });
}

  isWorking(e: AttendanceRow): boolean {
  return e.state === 'Working';
}

isLate(e: AttendanceRow): boolean {
  if ((e.state !== 'Working' && e.state !== 'Left') || !e.inTime) return false;
  const limit = new Date(e.inTime);
  limit.setHours(this.lateAfterHour, this.lateAfterMinute, 0, 0);
  return e.inTime > limit;
}

/** Pill text = whatever the backend sent */
statusLabel(e: AttendanceRow): string {
  return e.state;
}

statusClass(e: AttendanceRow): string {
  switch (e.state) {
    case 'Working': return 'ok';
    case 'Left':    return 'idle';
    case 'Absent':  return 'bad';
    case 'Leave':   return 'teal';
    default:        return 'idle';   // Unknown
  }
}

  /** "7h 42m" — uses the current time while the person is still working */
  hoursWorked(e: AttendanceRow): string {
    if (!e.inTime) return '--';
    const end = e.outTime ?? new Date();
    const mins = Math.max(0, Math.floor((end.getTime() - e.inTime.getTime()) / 60000));
    return `${Math.floor(mins / 60)}h ${String(mins % 60).padStart(2, '0')}m`;
  }

  // ---------- Leave ----------
  get pendingCount(): number {
    return this.leaves.filter(l => l.status === 'Pending').length;
  }

  countByStatus(s: LeaveStatus): number {
    return this.leaves.filter(l => l.status === s).length;
  }

  get visibleLeaves(): LeaveRequest[] {
    return this.leaves.filter(l => l.status === this.leaveTab);
  }

  leaveDays(l: LeaveRequest): number {
    return Math.round((l.to.getTime() - l.from.getTime()) / 86400000) + 1;
  }

  // Local state update only. Call your service here, then refresh the list.
  onApprove(l: LeaveRequest): void {
    // TODO: this.leaveService.approve(l.id)
    l.status = 'Approved';
  }

  onReject(l: LeaveRequest): void {
    // TODO: this.leaveService.reject(l.id)
    l.status = 'Rejected';
  }

  initials(name: string): string {
    return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  }

  trackById(_: number, item: { id: string }): string {
    return item.id;
  }
//   trackByLeave(_: number, item: LeaveRequest): string {
//   return item.id;
// }

  onSearch(event: Event): void {
  this.search = (event.target as HTMLInputElement).value;
}

onFilter(event: Event): void {
  this.statusFilter = (event.target as HTMLSelectElement).value as StatusFilter;
}
}