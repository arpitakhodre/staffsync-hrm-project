import { useEffect, useState } from 'react';
import api from '../api';
import { useAuth } from '../AuthContext';
import { fmtDate } from '../util';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [news, setNews] = useState([]);

  useEffect(() => {
    api.get('/dashboard').then((r) => setStats(r.data));
    api.get('/announcements').then((r) => setNews(r.data.slice(0, 3)));
  }, []);

  let tiles = [];
  if (stats?.role === 'employee')
    tiles = [['Today', stats.today], ['Leave requests pending', stats.pendingLeaves], ['Training to finish', stats.openTraining]];
  else if (stats)
    tiles = [[user.role === 'hr' ? 'People' : 'Your team', stats.people], ['Leave requests to review', stats.pendingReviews], ['Present today', stats.presentToday], ['Training programs', stats.programs]];

  return (
    <>
      <h1 className="page-title">Good to see you, {user.name.split(' ')[0]}</h1>
      <div className="figures">
        {tiles.map(([label, value]) => (
          <div className="figure" key={label}>
            <div className="figure-value">{value}</div>
            <div className="figure-label">{label}</div>
          </div>
        ))}
      </div>
      <h2 className="h5 mt-5 mb-3">Latest announcements</h2>
      {news.length === 0 && <p className="text-muted">Nothing posted yet.</p>}
      {news.map((a) => (
        <article className="note" key={a._id}>
          <h3 className="h6 mb-1">{a.title}</h3>
          <p className="mb-1">{a.body}</p>
          <small className="text-muted">{a.postedBy?.name} · {fmtDate(a.createdAt)}</small>
        </article>
      ))}
    </>
  );
}
