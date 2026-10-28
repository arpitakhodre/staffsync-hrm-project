import { useEffect, useState } from 'react';
import api from '../api';
import { useAuth } from '../AuthContext';
import { errMsg, fmtDate } from '../util';

export default function Announcements() {
  const { user } = useAuth();
  const [list, setList] = useState([]);
  const [form, setForm] = useState({ title: '', body: '' });
  const [err, setErr] = useState('');

  const load = () => api.get('/announcements').then((r) => setList(r.data));
  useEffect(() => { load(); }, []);

  const post = async (e) => {
    e.preventDefault();
    setErr('');
    try { await api.post('/announcements', form); setForm({ title: '', body: '' }); load(); } catch (x) { setErr(errMsg(x)); }
  };
  const remove = async (id) => { await api.delete(`/announcements/${id}`); load(); };

  return (
    <>
      <h1 className="page-title">Announcements</h1>
      {user.role === 'hr' && (
        <form onSubmit={post} className="panel mb-4">
          <div className="mb-3"><label className="form-label">Title</label><input className="form-control" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></div>
          <div className="mb-3"><label className="form-label">Message</label><textarea rows={3} className="form-control" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} required /></div>
          {err && <div className="alert alert-danger py-2">{err}</div>}
          <button className="btn btn-primary">Post announcement</button>
        </form>
      )}
      {list.map((a) => (
        <article className="note" key={a._id}>
          <div className="d-flex justify-content-between">
            <h2 className="h6 mb-1">{a.title}</h2>
            {user.role === 'hr' && <button className="btn btn-sm btn-link text-danger p-0" onClick={() => remove(a._id)}>Delete</button>}
          </div>
          <p className="mb-1">{a.body}</p>
          <small className="text-muted">{a.postedBy?.name} · {fmtDate(a.createdAt)}</small>
        </article>
      ))}
      {list.length === 0 && <p className="text-muted">No announcements yet.</p>}
    </>
  );
}
