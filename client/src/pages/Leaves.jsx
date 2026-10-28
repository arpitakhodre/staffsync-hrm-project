import { useEffect, useState } from 'react';
import api from '../api';
import { useAuth } from '../AuthContext';
import Status from '../components/Status';
import { errMsg, fmtDate } from '../util';

const blank = { type: 'casual', from: '', to: '', reason: '' };

export default function Leaves() {
  const { user } = useAuth();
  const canReview = user.role !== 'employee';
  const [mine, setMine] = useState([]);
  const [review, setReview] = useState([]);
  const [form, setForm] = useState(blank);
  const [err, setErr] = useState('');

  const load = () => {
    api.get('/leaves/mine').then((r) => setMine(r.data));
    if (canReview) api.get('/leaves/review').then((r) => setReview(r.data));
  };
  useEffect(load, []);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const apply = async (e) => {
    e.preventDefault();
    setErr('');
    try { await api.post('/leaves', form); setForm(blank); load(); } catch (x) { setErr(errMsg(x)); }
  };

  const decide = async (id, status) => {
    try { await api.patch(`/leaves/${id}/status`, { status }); load(); } catch (x) { window.alert(errMsg(x)); }
  };

  return (
    <>
      <h1 className="page-title">Leave</h1>

      {canReview && (
        <section className="mb-5">
          <h2 className="h5 mb-3">Requests to review</h2>
          <div className="table-responsive panel p-0">
            <table className="table align-middle mb-0">
              <thead><tr><th>Employee</th><th>Type</th><th>Dates</th><th>Reason</th><th>Status</th><th></th></tr></thead>
              <tbody>
                {review.map((l) => (
                  <tr key={l._id}>
                    <td>{l.employee?.name}<br /><small className="text-muted">{l.employee?.department}</small></td>
                    <td className="text-capitalize">{l.type}</td>
                    <td>{fmtDate(l.from)} to {fmtDate(l.to)}</td>
                    <td>{l.reason}</td>
                    <td><Status value={l.status} /></td>
                    <td className="text-end text-nowrap">
                      {l.status === 'pending' && <>
                        <button className="btn btn-sm btn-primary me-1" onClick={() => decide(l._id, 'approved')}>Approve</button>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => decide(l._id, 'rejected')}>Reject</button>
                      </>}
                    </td>
                  </tr>
                ))}
                {review.length === 0 && <tr><td colSpan={6} className="text-center text-muted py-4">No leave requests from your people.</td></tr>}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section>
        <h2 className="h5 mb-3">Apply for leave</h2>
        <form onSubmit={apply} className="panel mb-4">
          <div className="row g-3">
            <div className="col-md-3"><label className="form-label">Type</label>
              <select className="form-select" value={form.type} onChange={set('type')}>
                <option value="casual">Casual</option><option value="sick">Sick</option><option value="earned">Earned</option><option value="unpaid">Unpaid</option>
              </select></div>
            <div className="col-md-3"><label className="form-label">From</label><input type="date" className="form-control" value={form.from} onChange={set('from')} required /></div>
            <div className="col-md-3"><label className="form-label">To</label><input type="date" className="form-control" value={form.to} onChange={set('to')} required /></div>
            <div className="col-md-12"><label className="form-label">Reason</label><input className="form-control" value={form.reason} onChange={set('reason')} required /></div>
          </div>
          {err && <div className="alert alert-danger py-2 mt-3 mb-0">{err}</div>}
          <button className="btn btn-primary mt-3">Send request</button>
        </form>

        <h2 className="h5 mb-3">My requests</h2>
        <div className="table-responsive panel p-0">
          <table className="table align-middle mb-0">
            <thead><tr><th>Type</th><th>Dates</th><th>Reason</th><th>Status</th><th>Reviewed by</th></tr></thead>
            <tbody>
              {mine.map((l) => (
                <tr key={l._id}>
                  <td className="text-capitalize">{l.type}</td><td>{fmtDate(l.from)} to {fmtDate(l.to)}</td>
                  <td>{l.reason}</td><td><Status value={l.status} /></td><td>{l.reviewedBy?.name || '-'}</td>
                </tr>
              ))}
              {mine.length === 0 && <tr><td colSpan={5} className="text-center text-muted py-4">You have not applied for leave yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
