import { useState } from "react";
import { useNavigate } from 'react-router-dom';

// Relative path so Vite's dev proxy (and the ngrok tunnel, which only
// exposes the frontend) can forward this to the backend — see ngrok.yml.
const API = '/api';
const authHeader = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('token')}`
});

const CreateGroup = () => {
  const [title, setTitle] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const trimmedTitle = title.trim();
    const amount = Number(targetAmount);

    if (!trimmedTitle) {
      setError("Group name is required");
      return;
    }
    if (!Number.isFinite(amount) || amount < 0) {
      setError("Target amount must be a positive number");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API}/team-budget/groups`, {
        method: 'POST',
        headers: authHeader(),
        body: JSON.stringify({ title: trimmedTitle, targetAmount: amount })
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Could not create group");
        return;
      }

      navigate('/team', { state: { newGroupId: data.id } });
    } catch (err) {
      setError("Could not create group. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-start justify-center bg-gray-50 px-4 py-16 font-sans">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-900">Create a group</h1>
        <p className="mt-1 text-sm text-gray-500">
          Start a shared pool your friends can contribute to.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700">Group name</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Bali Trip Fund"
              className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-indigo-400"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700">Target amount</label>
            <div className="mt-2 flex items-center rounded-xl border border-gray-200 bg-white px-4 py-3 focus-within:border-indigo-400">
              <span className="text-sm text-gray-400">$</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                placeholder="0.00"
                className="ml-2 w-full text-sm text-gray-900 outline-none"
              />
            </div>
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
              {submitting ? "Creating…" : "Create group"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateGroup;
