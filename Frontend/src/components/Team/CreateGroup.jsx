import { useState } from "react";
import { TbX } from "react-icons/tb";

// Relative path so Vite's dev proxy (and the ngrok tunnel, which only
// exposes the frontend) can forward this to the backend — see ngrok.yml.
const API = '/api';
const authHeader = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('token')}`
});

// Bottom sheet for creating a group — same anatomy as the app's other sheets
// (Edit Expense, Add Preset). `onSuccess` gets the new group's id so the Team
// page can refetch and open it; `onClose` dismisses without changes.
const CreateGroup = ({ onClose, onSuccess }) => {
  const [title, setTitle] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

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

      onSuccess?.(data.id);
    } catch (err) {
      setError("Could not create group. Please try again.");
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
            <h2 className="text-xl font-causten font-bold text-brand-dark-violet">Create a group</h2>
            <p className="mt-1 text-sm text-brand-dark-violet/60">
              Start a shared pool your friends can contribute to.
            </p>
          </div>
          <button onClick={dismiss} className="active:scale-90 transition-transform duration-150 shrink-0">
            <TbX className="w-5 h-5 text-brand-dark-violet/60" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-causten font-bold uppercase tracking-wider text-brand-dark-violet/80">Group name</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Bali Trip Fund"
              className="mt-2 w-full rounded-xl bg-brand-dark-violet/5 px-4 py-3 text-sm text-brand-dark-violet placeholder-brand-dark-violet/40 outline-none focus:ring-2 focus:ring-brand-dark-violet/15 transition-shadow"
            />
          </div>

          <div>
            <label className="block text-xs font-causten font-bold uppercase tracking-wider text-brand-dark-violet/80">Target amount</label>
            <div className="mt-2 flex items-center rounded-xl bg-brand-dark-violet/5 px-4 py-3 focus-within:ring-2 focus-within:ring-brand-dark-violet/15 transition-shadow">
              <span className="text-sm font-causten font-bold text-brand-dark-violet/60">$</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                placeholder="0.00"
                className="ml-2 w-full text-sm text-brand-dark-violet placeholder-brand-dark-violet/40 outline-none bg-transparent"
              />
            </div>
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
              {submitting ? "Creating…" : "Create group"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default CreateGroup;
