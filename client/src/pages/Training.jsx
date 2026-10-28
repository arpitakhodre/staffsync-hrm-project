import { useEffect, useState } from 'react';
import api from '../api';
import { useAuth } from '../AuthContext';
import { errMsg, fmtDate } from '../util';

const blank = { title: '', description: '', startDate: '', assignees: [] };

export default function Training() {
  const { user } = useAuth();
  const canCreate = user.role !== 'employee';
  const [list, setList] = useState([]);
  const [people, setPeople] = useState([]);
  const [form, setForm] = useState(blank);
  const [err, setErr] = useState('');

  const load = () => api.get('/training').then((r) => setList(r.data));
  useEffect(() => {
    load();
    if (canCreate) api.get('/employees').then((r) => setPeople(r.data.filter((p) => p._id !== user.id)));
  }, []);

  const toggle = (id) => setForm({ ...form, assignees: form.assignees.includes(id) ? form.assignees.filter((x) => x !== id) : [...form.assignees, id] });

  const create = async (e) => {
    e.preventDefault();
    setErr('');
    try { await api.post('/training', form); setForm(blank); load(); } catch (x) { setErr(errMsg(x)); }
  };
  const complete = async (id) => { await api.patch(`/training/${id}/complete`); load(); };
  const remove = async (id) => {
    if (!window.confirm('Delete this training program?')) return;
    try { await api.delete(`/training/${id}`); load(); } catch (x) { window.alert(errMsg(x)); }
  };

  return (
    <>
      <h1 className="page-title">Training and development</h1>
      {canCreate && (
        <form onSubmit={create} className="panel mb-4">
          <h2 className="h6 mb-3">New program</h2>
          <div className="row g-3">
            <div className="col-md-8"><label className="form-label">Title</label><input className="form-control" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></div>
            <div className="col-md-4"><label className="form-label">Start date</label><input type="date" className="form-control" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} required /></div>
            <div className="col-12"><label className="form-label">Description</label><textarea rows={2} className="form-control" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div className="col-12"><label className="form-label d-block">Assign to</label>
              {people.map((p) => (
                <label key={p._id} className="form-check form-check-inline">
                  <input type="checkbox" className="form-check-input" checked={form.assignees.includes(p._id)} onChange={() => toggle(p._id)} /> {p.name}
                </label>
              ))}
              {people.length === 0 && <span className="text-muted">No one to assign yet.</span>}
            </div>
          </div>
          {err && <div className="alert alert-danger py-2 mt-3 mb-0">{err}</div>}
          <button className="btn btn-primary mt-3">Create program</button>
        </form>
      )}

      {list.map((t) => {
        const mine = t.assignedTo.find((a) => a.user?._id === user.id);
        const done = t.assignedTo.filter((a) => a.completed).length;
        return (
          <article className="note" key={t._id}>
            <div className="d-flex justify-content-between">
              <h2 className="h6 mb-1">{t.title}</h2>
              {canCreate && <button className="btn btn-sm btn-link text-danger p-0" onClick={() => remove(t._id)}>Delete</button>}
            </div>
            <p className="mb-1">{t.description}</p>
            <small className="text-muted">Starts {fmtDate(t.startDate)} · by {t.createdBy?.name} · {done} of {t.assignedTo.length} finished</small>
            {canCreate && <div className="small mt-1">{t.assignedTo.map((a) => `${a.user?.name}${a.completed ? ' (done)' : ''}`).join(', ')}</div>}
            {mine && (mine.completed
              ? <div className="mt-2 text-success fw-semibold">You finished this program</div>
              : <button className="btn btn-sm btn-primary mt-2" onClick={() => complete(t._id)}>Mark as finished</button>)}
          </article>
        );
      })}
      {list.length === 0 && <p className="text-muted">{canCreate ? 'No programs yet. Create the first one above.' : 'No training has been assigned to you.'}</p>}
    </>
  );
}
