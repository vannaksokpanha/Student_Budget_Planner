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

  // Only the group owner can add contributions at all — everyone else gets
  // turned back at the door instead of a form they can't submit anyway.
  useEffect(() => {
    const checkAccess = async () => {
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
        console.error('Failed to check group ownership:', err);
      } finally {
        setCheckingAccess(false);
      }
    };
    checkAccess();
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

  if (!isOwner) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 font-sans">
        <div className="text-center">
          <h1 className="text-xl font-bold text-gray-900">Owner only</h1>
          <p className="mt-2 text-sm text-gray-500">Only the group owner can add contributions.</p>
          <button
            onClick={() => navigate('/team')}
            className="mt-6 rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Back to Team Budget
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-start justify-center bg-gray-50 px-4 py-16 font-sans">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-900">Add a contribution</h1>
        <p className="mt-1 text-sm text-gray-500">
          Record what you're putting into this group's pool — e.g. "Food $100" or "Coca $30".
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          {isOwner && members.length > 0 && (
            <div>
              <label className="block text-sm font-semibold text-gray-700">Contributor</label>
              <select
                value={contributorId}
                onChange={(e) => setContributorId(e.target.value)}
                className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-indigo-400"
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
            <label className="block text-sm font-semibold text-gray-700">Amount</label>
            <div className="mt-2 flex items-center rounded-xl border border-gray-200 bg-white px-4 py-3 focus-within:border-indigo-400">
              <span className="text-sm text-gray-400">$</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="ml-2 w-full text-sm text-gray-900 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700">Reason</label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Food, Coca, Flight deposit"
              className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-indigo-400"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-indigo-400"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
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
              {submitting ? "Adding…" : "Add contribution"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddContribution;
