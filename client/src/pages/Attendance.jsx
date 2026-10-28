import { useEffect, useState } from 'react';
import api from '../api';
import { useAuth } from '../AuthContext';
import { errMsg, fmtDate, fmtTime } from '../util';

export default function Attendance() {
  const { user } = useAuth();
  const canReview = user.role !== 'employee';
  const [today, setToday] = useState(null);
  const [mine, setMine] = useState([]);
  const [team, setTeam] = useState([]);
  const [date, setDate] = useState('');
  const [err, setErr] = useState('');

  const load = () => {
    api.get('/attendance/today').then((r) => setToday(r.data || null));
    api.get('/attendance/mine').then((r) => setMine(r.data));
  };
  const loadTeam = () => canReview && api.get('/attendance/team', { params: date ? { date } : {} }).then((r) => setTeam(r.data));

  useEffect(load, []);
  useEffect(() => { loadTeam(); }, [date]);

  const act = async (path) => {
    setErr('');
    try { await api.post(`/attendance/${path}`); load(); loadTeam(); } catch (x) { setErr(errMsg(x)); }
  };

  const state = !today ? 'Not checked in' : today.checkOut ? `Done for the day (out at ${fmtTime(today.checkOut)})` : `Checked in at ${fmtTime(today.checkIn)}`;

  return (
    <>
      <h1 className="page-title">Attendance</h1>
      <div className="panel d-flex flex-wrap justify-content-between align-items-center mb-4">
        <div><div className="small text-muted">Today</div><div className="h5 mb-0">{state}</div></div>
        <div>
          <button className="btn btn-primary me-2" disabled={!!today} onClick={() => act('check-in')}>Check in</button>
          <button className="btn btn-outline-secondary" disabled={!today || !!today.checkOut} onClick={() => act('check-out')}>Check out</button>
        </div>
      </div>
      {err && <div className="alert alert-danger py-2">{err}</div>}

      {canReview && (
        <section className="mb-5">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2 className="h5 mb-0">{user.role === 'hr' ? 'Everyone' : 'Your team'}</h2>
            <input type="date" className="form-control w-auto" value={date} onChange={(e) => setDate(e.target.value)} aria-label="Pick a date" />
          </div>
          <div className="table-responsive panel p-0">
            <table className="table mb-0">
              <thead><tr><th>Employee</th><th>Department</th><th>In</th><th>Out</th></tr></thead>
              <tbody>
                {team.map((r) => <tr key={r._id}><td>{r.employee?.name}</td><td>{r.employee?.department}</td><td>{fmtTime(r.checkIn)}</td><td>{fmtTime(r.checkOut)}</td></tr>)}
                {team.length === 0 && <tr><td colSpan={4} className="text-center text-muted py-4">No check-ins for {date ? fmtDate(date) : 'today'}.</td></tr>}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <h2 className="h5 mb-3">My last 31 days</h2>
      <div className="table-responsive panel p-0">
        <table className="table mb-0">
          <thead><tr><th>Date</th><th>In</th><th>Out</th></tr></thead>
          <tbody>
            {mine.map((r) => <tr key={r._id}><td>{fmtDate(r.date)}</td><td>{fmtTime(r.checkIn)}</td><td>{fmtTime(r.checkOut)}</td></tr>)}
            {mine.length === 0 && <tr><td colSpan={3} className="text-center text-muted py-4">No attendance recorded yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
