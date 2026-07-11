import { useState } from "react";
import { useNavigate, useSearchParams } from 'react-router-dom';

// Relative path so Vite's dev proxy (and the ngrok tunnel, which only
// exposes the frontend) can forward this to the backend — see ngrok.yml.
const API = '/api';
const authHeader = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('token')}`
});

const JoinGroup = () => {
  const [searchParams] = useSearchParams();
  // Lets a shared invite link (?token=...) pre-fill the field instead of
  // making people copy-paste the token by hand.
  const [token, setToken] = useState(searchParams.get('token') || "");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const trimmedToken = token.trim();
    if (!trimmedToken) {
      setError("Invite token is required");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API}/team-budget/groups/join`, {
        method: 'POST',
        headers: authHeader(),
        body: JSON.stringify({ token: trimmedToken })
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Could not join group");
        return;
      }

      navigate('/team', { state: { newGroupId: data.id } });
    } catch (err) {
      setError("Could not join group. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-start justify-center bg-gray-50 px-4 py-16 font-sans">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-900">Join a group</h1>
        <p className="mt-1 text-sm text-gray-500">
          Paste the invite token a group owner shared with you.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700">Invite token</label>
            <input
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Paste invite token"
              className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-indigo-400"
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate('/team')}
              className="flex-1 rounded-xl border border-gray-200 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded-xl bg-indigo-800 py-3 text-sm font-semibold text-white hover:bg-indigo-900 disabled:opacity-50"
            >
              {submitting ? "Joining…" : "Join group"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JoinGroup;
