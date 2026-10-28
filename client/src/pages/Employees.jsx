import { useEffect, useState } from 'react';
import api from '../api';
import { useAuth } from '../AuthContext';
import { errMsg, roleLabel } from '../util';

const empty = { name: '', email: '', password: '', role: 'employee', department: '', designation: '', phone: '', manager: '' };

export default function Employees() {
  const { user } = useAuth();
  const isHR = user.role === 'hr';
  const [list, setList] = useState([]);
  const [managers, setManagers] = useState([]);
  const [form, setForm] = useState(null);
  const [err, setErr] = useState('');

  const load = () => api.get('/employees').then((r) => setList(r.data));
  useEffect(() => {
    load();
    if (isHR) api.get('/employees/managers').then((r) => setManagers(r.data));
  }, []);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const edit = (p) => setForm({ ...p, password: '', manager: p.manager?._id || '' });

  const save = async (e) => {
    e.preventDefault();
    setErr('');
    try {
      if (form._id) await api.put(`/employees/${form._id}`, form);
      else await api.post('/employees', form);
      setForm(null);
      load();
    } catch (x) {
      setErr(errMsg(x));
    }
  };

  const remove = async (p) => {
    if (!window.confirm(`Remove ${p.name} from StaffSync?`)) return;
    try { await api.delete(`/employees/${p._id}`); load(); } catch (x) { window.alert(errMsg(x)); }
  };

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="page-title mb-0">{isHR ? 'People' : 'Your team'}</h1>
        {isHR && !form && <button className="btn btn-primary" onClick={() => setForm({ ...empty })}>Add employee</button>}
      </div>

      {form && (
        <form onSubmit={save} className="panel mb-4">
          <h2 className="h6 mb-3">{form._id ? `Edit ${form.name}` : 'New employee'}</h2>
          <div className="row g-3">
            <div className="col-md-4"><label className="form-label">Name</label><input className="form-control" value={form.name} onChange={set('name')} required /></div>
            <div className="col-md-4"><label className="form-label">Email</label><input type="email" className="form-control" value={form.email} onChange={set('email')} required /></div>
            <div className="col-md-4"><label className="form-label">{form._id ? 'New password (optional)' : 'Starting password'}</label>
              <input type="password" className="form-control" value={form.password} onChange={set('password')} required={!form._id} minLength={6} /></div>
            <div className="col-md-3"><label className="form-label">Role</label>
              <select className="form-select" value={form.role} onChange={set('role')}>
                <option value="employee">Employee</option><option value="manager">Manager</option><option value="hr">HR</option>
              </select></div>
            <div className="col-md-3"><label className="form-label">Department</label><input className="form-control" value={form.department} onChange={set('department')} /></div>
            <div className="col-md-3"><label className="form-label">Designation</label><input className="form-control" value={form.designation} onChange={set('designation')} /></div>
            <div className="col-md-3"><label className="form-label">Reports to</label>
              <select className="form-select" value={form.manager} onChange={set('manager')}>
                <option value="">No manager</option>
                {managers.map((m) => <option key={m._id} value={m._id}>{m.name}</option>)}
              </select></div>
          </div>
          {err && <div className="alert alert-danger py-2 mt-3 mb-0">{err}</div>}
          <div className="mt-3">
            <button className="btn btn-primary me-2">Save employee</button>
            <button type="button" className="btn btn-outline-secondary" onClick={() => { setForm(null); setErr(''); }}>Cancel</button>
          </div>
        </form>
      )}

      <div className="table-responsive panel p-0">
        <table className="table align-middle mb-0">
          <thead><tr><th>Name</th><th>Role</th><th>Department</th><th>Designation</th><th>Reports to</th>{isHR && <th></th>}</tr></thead>
          <tbody>
            {list.map((p) => (
              <tr key={p._id}>
                <td><div className="fw-semibold">{p.name}</div><small className="text-muted">{p.email}</small></td>
                <td>{roleLabel[p.role]}</td><td>{p.department}</td><td>{p.designation}</td><td>{p.manager?.name || '-'}</td>
                {isHR && <td className="text-end text-nowrap">
                  <button className="btn btn-sm btn-outline-secondary me-1" onClick={() => edit(p)}>Edit</button>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => remove(p)}>Remove</button>
                </td>}
              </tr>
            ))}
            {list.length === 0 && <tr><td colSpan={6} className="text-center text-muted py-4">No one here yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
