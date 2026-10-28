export const fmtDate = (d) =>
  new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

export const fmtTime = (d) =>
  d ? new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '-';

export const errMsg = (e) => e?.response?.data?.message || 'Something went wrong. Try again.';

export const roleLabel = { hr: 'HR', manager: 'Manager', employee: 'Employee' };
