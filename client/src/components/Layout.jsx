import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { roleLabel } from '../util';

const links = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/employees', label: 'People', roles: ['hr', 'manager'] },
  { to: '/leaves', label: 'Leave' },
  { to: '/attendance', label: 'Attendance' },
  { to: '/announcements', label: 'Announcements' },
  { to: '/training', label: 'Training' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  return (
    <div className="shell">
      <aside className="side">
        <div className="brand">StaffSync</div>
        <nav>
          {links.filter((l) => !l.roles || l.roles.includes(user.role)).map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className="side-link">{l.label}</NavLink>
          ))}
        </nav>
        <div className="side-user">
          <div className="fw-semibold">{user.name}</div>
          <div className="small opacity-75">{roleLabel[user.role]} · {user.department}</div>
          <button className="btn btn-sm btn-outline-light mt-2" onClick={logout}>Log out</button>
        </div>
      </aside>
      <main className="main"><Outlet /></main>
    </div>
  );
}
