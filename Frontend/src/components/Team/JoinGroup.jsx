import { useState } from "react";
import { TbX } from "react-icons/tb";

// Relative path so Vite's dev proxy (and the ngrok tunnel, which only
// exposes the frontend) can forward this to the backend — see ngrok.yml.
const API = '/api';
const authHeader = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('token')}`
});

// Bottom sheet for joining a group by invite token — same anatomy as the app's
// other sheets. `initialToken` lets a shared link pre-fill the field; `onSuccess`
// gets the joined group's id so the Team page can refetch and open it.
const JoinGroup = ({ onClose, onSuccess, initialToken = "" }) => {
  const [token, setToken] = useState(initialToken);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

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

      onSuccess?.(data.id);
    } catch (err) {
      setError("Could not join group. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const dismiss = () => { if (!submitting) onClose(); };

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-55" onClick={dismiss} />
      <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-60 px-5 pt-5 pb-10 shadow-2xl animate-slide-up font-causten">
        <div className="flex justify-between items-start mb-5">
          <div>
            <h2 className="text-xl font-causten font-bold text-brand-dark-violet">Join a group</h2>
            <p className="mt-1 text-sm text-brand-dark-violet/60">
              Paste the invite token a group owner shared with you.
            </p>
          </div>
          <button onClick={dismiss} className="active:scale-90 transition-transform duration-150 shrink-0">
            <TbX className="w-5 h-5 text-brand-dark-violet/60" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-causten font-bold uppercase tracking-wider text-brand-dark-violet/80">Invite token</label>
            <input
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Paste invite token"
              className="mt-2 w-full rounded-xl bg-brand-dark-violet/5 px-4 py-3 text-sm text-brand-dark-violet placeholder-brand-dark-violet/40 outline-none focus:ring-2 focus:ring-brand-dark-violet/15 transition-shadow"
            />
          </div>

          {error && <p className="text-sm text-red-400 font-causten">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={dismiss}
              className="flex-1 rounded-xl border border-gray-200 py-3 text-sm font-causten font-bold text-brand-dark-violet/60 hover:bg-gray-50 active:scale-95 transition-all duration-150"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded-xl bg-brand-dark-violet py-3 text-sm font-causten font-bold text-white enabled:hover:bg-brand-base enabled:hover:-translate-y-0.5 enabled:hover:shadow-md active:scale-95 transition-all duration-150 disabled:opacity-50"
            >
              {submitting ? "Joining…" : "Join group"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default JoinGroup;
