import { useState } from 'react';
import { useAuth } from '../AuthContext';
import { errMsg } from '../util';

const demos = [
  ['HR', 'hr@staffsync.com'],
  ['Manager', 'manager@staffsync.com'],
  ['Employee', 'employee@staffsync.com'],
];

export default function Login() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [err, setErr] = useState('');
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    try {
      await (mode === 'login' ? login(form) : register(form));
    } catch (x) {
      setErr(errMsg(x));
    }
  };

  return (
    <div className="login">
      <section className="login-hero">
        <h1>StaffSync</h1>
        <p>Leave, attendance, announcements and training for HR, managers and employees, in one place.</p>
      </section>
      <section className="login-form">
        <form onSubmit={submit} className="mx-auto" style={{ maxWidth: 380 }}>
          <h2 className="h4 mb-4">{mode === 'login' ? 'Log in to your account' : 'Create an employee account'}</h2>
          {mode === 'register' && (
            <div className="mb-3"><label className="form-label">Full name</label>
              <input className="form-control" value={form.name} onChange={set('name')} required /></div>
          )}
          <div className="mb-3"><label className="form-label">Email</label>
            <input type="email" className="form-control" value={form.email} onChange={set('email')} required /></div>
          <div className="mb-3"><label className="form-label">Password</label>
            <input type="password" className="form-control" value={form.password} onChange={set('password')} required minLength={6} /></div>
          {err && <div className="alert alert-danger py-2">{err}</div>}
          <button className="btn btn-primary w-100">{mode === 'login' ? 'Log in' : 'Create account'}</button>
          <button type="button" className="btn btn-link w-100 mt-2" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setErr(''); }}>
            {mode === 'login' ? 'New here? Create an account' : 'Already registered? Log in'}
          </button>
          {mode === 'login' && (
            <div className="demo mt-4">
              <div className="small text-muted mb-2">Demo accounts (password: Pass@123)</div>
              {demos.map(([label, email]) => (
                <button type="button" key={email} className="btn btn-sm btn-outline-secondary me-2"
                  onClick={() => setForm({ ...form, email, password: 'Pass@123' })}>{label}</button>
              ))}
            </div>
          )}
        </form>
      </section>
    </div>
  );
}
