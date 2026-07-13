import { useEffect, useState } from "react";
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Trash2 } from 'lucide-react';

// Relative path so Vite's dev proxy (and the ngrok tunnel, which only
// exposes the frontend) can forward this to the backend — see ngrok.yml.
const API = '/api';
const authHeader = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('token')}`
});

const getMyUserId = () => {
  try {
    const token = localStorage.getItem('token');
    return JSON.parse(atob(token.split('.')[1])).id;
  } catch {
    return null;
  }
};

const SetExpense = () => {
  const { groupId, expenseId } = useParams();
  const [loading, setLoading] = useState(true);
  const [isMine, setIsMine] = useState(false);
  const [reason, setReason] = useState("");
  const [amount, setAmount] = useState(0);
  const [items, setItems] = useState([]);
  const [name, setName] = useState("");
  const [itemAmount, setItemAmount] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();
  const myUserId = getMyUserId();

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 2500);
  };

  const loadItems = async () => {
    try {
      const res = await fetch(`${API}/team-budget/groups/${groupId}/expenses/${expenseId}/items`, {
        headers: authHeader()
      });
      if (!res.ok) return;

      const data = await res.json();
      setIsMine(data.contributorId === myUserId);
      setReason(data.reason || 'Contribution');
      setAmount(data.amount);
      setItems(data.items);
    } catch (err) {
      console.error('Failed to load expense items:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, [groupId, expenseId]);

  const handleRemoveItem = async (itemId) => {
    try {
      const res = await fetch(`${API}/team-budget/groups/${groupId}/expenses/${expenseId}/items/${itemId}`, {
        method: 'DELETE',
        headers: authHeader()
      });
      if (!res.ok) {
        const data = await res.json();
        showToast(data.message || 'Could not remove item');
        return;
      }

      setItems((prev) => prev.filter((i) => i.id !== itemId));
      showToast('Item removed');
    } catch (err) {
      showToast('Could not remove item');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Item name is required");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API}/team-budget/groups/${groupId}/expenses/${expenseId}/items`, {
        method: 'POST',
        headers: authHeader(),
        body: JSON.stringify({ name: trimmedName, amount: itemAmount.trim() })
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Could not add item");
        return;
      }

      setItems((prev) => [...prev, data]);
      setName("");
      setItemAmount("");
    } catch (err) {
      setError("Could not add item. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return null;

  return (
    <div className="min-h-screen bg-brand-white px-4 py-10 font-causten sm:px-8">
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/team')}
            className="flex h-9 w-9 items-center justify-center rounded-full text-brand-dark-violet/60 hover:bg-brand-dark-violet/5 active:scale-90 transition-all duration-150"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-causten font-extrabold text-brand-dark-violet">{reason}</h1>
            <p className="text-sm text-brand-dark-violet/60">${Number(amount || 0).toFixed(2)} contributed</p>
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-2xl shadow-lg bg-white">
          <h2 className="border-b border-gray-100 px-6 py-4 text-xs font-causten font-bold uppercase tracking-widest text-brand-dark-violet/60">What it was spent on</h2>
          {items.length === 0 && (
            <p className="px-6 py-6 text-center text-sm text-brand-dark-violet/45">Nothing set yet.</p>
          )}
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-3 border-b border-gray-50 px-6 py-3 last:border-b-0">
              <p className="text-sm text-brand-dark-violet">{item.name}</p>
              <div className="flex items-center gap-3">
                {item.amount !== null && (
                  <p className="text-sm font-causten font-bold text-brand-dark-violet">${item.amount.toFixed(2)}</p>
                )}
                {isMine && (
                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    className="text-brand-dark-violet/40 hover:text-red-400 active:scale-90 transition-all duration-150"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {isMine ? (
          <form onSubmit={handleSubmit} className="mt-6 rounded-2xl shadow-lg bg-white p-6">
            <h2 className="text-xs font-causten font-bold uppercase tracking-widest text-brand-dark-violet/60">Add an item</h2>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Pasta, Pizza, Rice"
                className="flex-1 rounded-xl bg-brand-dark-violet/5 px-4 py-3 text-sm text-brand-dark-violet placeholder-brand-dark-violet/40 outline-none focus:ring-2 focus:ring-brand-dark-violet/15 transition-shadow"
              />
              <input
                type="number"
                min="0"
                step="0.01"
                value={itemAmount}
                onChange={(e) => setItemAmount(e.target.value)}
                placeholder="$ (optional)"
                className="w-full rounded-xl bg-brand-dark-violet/5 px-4 py-3 text-sm text-brand-dark-violet placeholder-brand-dark-violet/40 outline-none focus:ring-2 focus:ring-brand-dark-violet/15 transition-shadow sm:w-32"
              />
              <button
                type="submit"
                disabled={submitting}
                className="rounded-xl bg-brand-dark-violet px-5 py-3 text-sm font-causten font-bold text-white enabled:hover:bg-brand-base enabled:hover:-translate-y-0.5 enabled:hover:shadow-md active:scale-95 transition-all duration-150 disabled:opacity-50"
              >
                {submitting ? "Adding…" : "Add"}
              </button>
            </div>
            {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
          </form>
        ) : (
          <p className="mt-6 text-center text-sm text-brand-dark-violet/45">Only the contributor can set what this was spent on.</p>
        )}
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-brand-dark-violet px-4 py-2.5 text-sm font-causten font-bold text-white shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
};

export default SetExpense;
