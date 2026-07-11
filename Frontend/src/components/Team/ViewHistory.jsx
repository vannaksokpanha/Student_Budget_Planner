import { useEffect, useState } from "react";
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

// Relative path so Vite's dev proxy (and the ngrok tunnel, which only
// exposes the frontend) can forward this to the backend — see ngrok.yml.
const API = '/api';
const authHeader = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('token')}`
});

const mapContribution = (c) => ({
  id: c.id,
  name: c.contributorName,
  date: new Date(c.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
  reason: c.reason,
  amount: `$${c.amount.toFixed(2)}`
});

const ViewHistory = () => {
  const { groupId } = useParams();
  const [contributions, setContributions] = useState([]);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch(`${API}/team-budget/groups/${groupId}/expenses`, {
          headers: authHeader()
        });
        if (!res.ok) throw new Error('Failed to load history');

        const data = await res.json();
        setContributions(data.map(mapContribution));
      } catch (err) {
        setError('Could not load contribution history.');
      } finally {
        setReady(true);
      }
    };
    fetchHistory();
  }, [groupId]);

  if (!ready) return null;

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10 font-sans sm:px-8">
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/team')}
            className="flex h-9 w-9 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold text-gray-900">Contribution history</h1>
        </div>

        <div className="mt-6 overflow-hidden rounded-2xl border border-gray-100 bg-white">
          {error && <p className="px-6 py-6 text-center text-sm text-red-500">{error}</p>}

          {!error && contributions.length === 0 && (
            <p className="px-6 py-6 text-center text-sm text-gray-400">No contributions yet.</p>
          )}

          {!error && contributions.map((row) => (
            <div key={row.id} className="flex items-center justify-between gap-3 border-b border-gray-50 px-6 py-4 last:border-b-0">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-gray-900">{row.name}</p>
                <p className="text-xs text-gray-400">{row.date}</p>
                <p className="mt-1 text-sm text-gray-700">{row.reason}</p>
              </div>
              <p className="shrink-0 text-sm font-bold text-gray-900">{row.amount}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ViewHistory;
