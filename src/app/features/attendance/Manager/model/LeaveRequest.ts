
export interface LeaveRequest {
  id: number;
  empName: string;
  role: string;
  type: string;
  from: Date;
  to: Date;
  reason: string;
  status: LeaveStatus;
}

type LeaveStatus = 'Pending' | 'Approved' | 'Rejected';