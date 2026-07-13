import { useEffect, useState } from "react";
import { useNavigate, useParams } from 'react-router-dom';

// Relative path so Vite's dev proxy (and the ngrok tunnel, which only
// exposes the frontend) can forward this to the backend — see ngrok.yml.
const API = '/api';
const authHeader = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('token')}`
});

const STATUS_OPTIONS = ['Paid', 'Pending'];

const AddContribution = () => {
  const { groupId } = useParams();
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [members, setMembers] = useState([]);
  const [contributorId, setContributorId] = useState("");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [status, setStatus] = useState(STATUS_OPTIONS[0]);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  // Everyone logs their own contributions. The owner additionally gets a
  // contributor picker so they can record entries on behalf of members
  // (e.g. cash handed over in person).
  useEffect(() => {
    const checkRole = async () => {
      try {
        const groupsRes = await fetch(`${API}/team-budget/groups`, { headers: authHeader() });
        const groups = groupsRes.ok ? await groupsRes.json() : [];
        const group = groups.find((g) => String(g.id) === groupId);

        if (group?.myRole === 'owner') {
          setIsOwner(true);

          const membersRes = await fetch(`${API}/team-budget/groups/${groupId}/members`, { headers: authHeader() });
          if (membersRes.ok) {
            const memberList = await membersRes.json();
            setMembers(memberList);
            setContributorId(String(memberList.find((m) => m.role === 'owner')?.userId ?? ""));
          }
        }
      } catch (err) {
        console.error('Failed to check group role:', err);
      } finally {
        setCheckingAccess(false);
      }
    };
    checkRole();
  }, [groupId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const parsedAmount = Number(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setError("Amount must be a positive number");
      return;
    }

    setSubmitting(true);
    try {
      const body = { amount: parsedAmount, reason: reason.trim(), status };
      if (isOwner && contributorId) {
        body.userId = contributorId;
      }

      const res = await fetch(`${API}/team-budget/groups/${groupId}/expenses`, {
        method: 'POST',
        headers: authHeader(),
        body: JSON.stringify(body)
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Could not add contribution");
        return;
      }

      navigate('/team', { state: { newGroupId: Number(groupId), showDetailOnMobile: true } });
    } catch (err) {
      setError("Could not add contribution. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (checkingAccess) return null;

  return (
    <div className="flex min-h-screen items-start justify-center bg-brand-white px-4 py-16 font-causten">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg px-6 py-6">
        <h1 className="text-2xl font-causten font-extrabold text-brand-dark-violet">Add a contribution</h1>
        <p className="mt-1 text-sm text-brand-dark-violet/60">
          Record what you're putting into this group's pool — e.g. "Food $100" or "Coca $30".
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          {isOwner && members.length > 0 && (
            <div>
              <label className="block text-xs font-causten font-bold uppercase tracking-wider text-brand-dark-violet/80">Contributor</label>
              <select
                value={contributorId}
                onChange={(e) => setContributorId(e.target.value)}
                className="mt-2 w-full rounded-xl bg-brand-dark-violet/5 px-4 py-3 text-sm text-brand-dark-violet placeholder-brand-dark-violet/40 outline-none focus:ring-2 focus:ring-brand-dark-violet/15 transition-shadow"
              >
                {members.map((m) => (
                  <option key={m.userId} value={m.userId}>
                    {m.role === 'owner' ? `${m.name} (You)` : m.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-causten font-bold uppercase tracking-wider text-brand-dark-violet/80">Amount</label>
            <div className="mt-2 flex items-center rounded-xl bg-brand-dark-violet/5 px-4 py-3 focus-within:ring-2 focus-within:ring-brand-dark-violet/15 transition-shadow">
              <span className="text-sm font-causten font-bold text-brand-dark-violet/60">$</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="ml-2 w-full text-sm text-brand-dark-violet placeholder-brand-dark-violet/40 outline-none bg-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-causten font-bold uppercase tracking-wider text-brand-dark-violet/80">Reason</label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Food, Coca, Flight deposit"
              className="mt-2 w-full rounded-xl bg-brand-dark-violet/5 px-4 py-3 text-sm text-brand-dark-violet placeholder-brand-dark-violet/40 outline-none focus:ring-2 focus:ring-brand-dark-violet/15 transition-shadow"
            />
          </div>

          <div>
            <label className="block text-xs font-causten font-bold uppercase tracking-wider text-brand-dark-violet/80">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="mt-2 w-full rounded-xl bg-brand-dark-violet/5 px-4 py-3 text-sm text-brand-dark-violet placeholder-brand-dark-violet/40 outline-none focus:ring-2 focus:ring-brand-dark-violet/15 transition-shadow"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          {error && <p className="text-sm text-red-400 font-causten">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate('/team')}
              className="flex-1 rounded-xl border border-gray-200 py-3 text-sm font-causten font-bold text-brand-dark-violet/60 hover:bg-gray-50 active:scale-95 transition-all duration-150"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded-xl bg-brand-dark-violet py-3 text-sm font-causten font-bold text-white enabled:hover:bg-brand-base enabled:hover:-translate-y-0.5 enabled:hover:shadow-md active:scale-95 transition-all duration-150 disabled:opacity-50"
            >
              {submitting ? "Adding…" : "Add contribution"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddContribution;
