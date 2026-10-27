// Static content for tiles that have no backend yet. Replace each list with a real API later.
export const MOCK = {
  tasks: [
    { project: 'HRMS portal', task: 'Invoice design',   log: '01h 04m', due: '6 Nov 2026' },
    { project: 'HRMS portal', task: 'Dashboard R&D',    log: '01h 42m', due: '6 Nov 2026' },
    { project: 'Payroll',     task: 'Dashboard design', log: '01h 42m', due: '9 Nov 2026' },
    { project: 'Mobile app',  task: 'Admin design',     log: '01h 42m', due: '12 Nov 2026' },
    { project: 'Mobile app',  task: 'App design',       log: '01h 42m', due: '12 Nov 2026' }
  ],
  leave: { balance: 12, used: 4, remain: 8 },
  onLeave: [
    { name: 'Asha Rao',    sub: 'UI/UX designer',    note: '' },
    { name: 'Dev Patel',   sub: 'iOS developer',     note: '' },
    { name: 'Meera Nair',  sub: 'Web developer',     note: '26 Oct' },
    { name: 'Rohan Shah',  sub: 'Game designer',     note: '28 Oct' }
  ],
  holidays: [
    { name: 'Diwali',    sub: '8 Nov 2026',  note: '' },
    { name: 'Christmas', sub: '25 Dec 2026', note: '' },
    { name: 'New Year',  sub: '1 Jan 2027',  note: '' }
  ],
  birthdays: [
    { name: 'Asha Rao',   sub: 'UI/UX designer', note: 'Today' },
    { name: 'Dev Patel',  sub: 'iOS developer',  note: 'Tomorrow' },
    { name: 'Meera Nair', sub: 'Web developer',  note: 'Tomorrow' },
    { name: 'Rohan Shah', sub: 'Game designer',  note: '30 Oct' }
  ],
  newJoins: [
    { name: 'Asha Rao',   sub: 'UI/UX designer', note: '1 yr' },
    { name: 'Dev Patel',  sub: 'iOS developer',  note: '6 mo' },
    { name: 'Meera Nair', sub: 'Web developer',  note: '3 mo' },
    { name: 'Rohan Shah', sub: 'Game designer',  note: '2 mo' }
  ],
  quickLinks: [
    { name: 'Employee policy',  sub: '', note: '' },
    { name: 'Shift policy',     sub: '', note: '' },
    { name: 'Leave policy',     sub: '', note: '' },
    { name: 'Overtime policy',  sub: '', note: '' },
    { name: 'Company handbook', sub: '', note: '' }
  ],
  anniversaries: [
    { name: 'Asha Rao',   sub: 'UI/UX designer', note: '1 year' },
    { name: 'Dev Patel',  sub: 'iOS developer',  note: '2 years' },
    { name: 'Meera Nair', sub: 'Web developer',  note: '2 years' },
    { name: 'Rohan Shah', sub: 'Game designer',  note: '5 years' }
  ],
  announcements: [
    { name: 'Office management meeting', sub: '21 Nov, 2:00 PM', note: '' },
    { name: 'Team leader meeting',       sub: '21 Nov, 2:00 PM', note: '' },
    { name: 'Project manager meeting',   sub: '21 Nov, 2:00 PM', note: '' }
  ],
  reminders: [
    'You have 00:02:00 remaining for 26-10-2026',
    'You have 00:05:00 remaining for 27-10-2026'
  ],
  lateArrivals: 12
};