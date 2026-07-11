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
    <div className="min-h-screen bg-gray-50 px-4 py-10 font-sans sm:px-8">
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/team')}
            className="flex h-9 w-9 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{reason}</h1>
            <p className="text-sm text-gray-500">${Number(amount || 0).toFixed(2)} contributed</p>
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-2xl border border-gray-100 bg-white">
          <h2 className="border-b border-gray-100 px-6 py-4 text-sm font-semibold text-gray-700">What it was spent on</h2>
          {items.length === 0 && (
            <p className="px-6 py-6 text-center text-sm text-gray-400">Nothing set yet.</p>
          )}
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-3 border-b border-gray-50 px-6 py-3 last:border-b-0">
              <p className="text-sm text-gray-900">{item.name}</p>
              <div className="flex items-center gap-3">
                {item.amount !== null && (
                  <p className="text-sm font-semibold text-gray-700">${item.amount.toFixed(2)}</p>
                )}
                {isMine && (
                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {isMine ? (
          <form onSubmit={handleSubmit} className="mt-6 rounded-2xl border border-gray-100 bg-white p-6">
            <h2 className="text-sm font-semibold text-gray-700">Add an item</h2>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Pasta, Pizza, Rice"
                className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-indigo-400"
              />
              <input
                type="number"
                min="0"
                step="0.01"
                value={itemAmount}
                onChange={(e) => setItemAmount(e.target.value)}
                placeholder="$ (optional)"
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-indigo-400 sm:w-32"
              />
              <button
                type="submit"
                disabled={submitting}
                className="rounded-xl bg-indigo-800 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-900 disabled:opacity-50"
              >
                {submitting ? "Adding…" : "Add"}
              </button>
            </div>
            {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
          </form>
        ) : (
          <p className="mt-6 text-center text-sm text-gray-400">Only the contributor can set what this was spent on.</p>
        )}
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-medium text-white shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
};

export default SetExpense;
