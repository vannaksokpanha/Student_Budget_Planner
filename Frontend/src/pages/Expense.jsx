import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { TbTrash, TbPlus, TbX } from "react-icons/tb";

const LIABILITY_CATEGORIES = ['Rent', 'Groceries', 'Utilities', 'Transport', 'School Fees', 'Other'];

const isTokenValid = (token) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
};

const daysRemainingInMonth = () => {
  const now = new Date();
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  return lastDay - now.getDate() + 1;
};

const Expense = () => {
  const [income, setIncome] = useState('');
  const [liabilities, setLiabilities] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', category: 'Rent', amount: '' });
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || !isTokenValid(token)) {
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  const handleAddLiability = () => {
    if (!form.amount || isNaN(parseFloat(form.amount))) return;
    setLiabilities(prev => [...prev, {
      id: Date.now(),
      name: form.name || form.category,
      category: form.category,
      amount: parseFloat(form.amount),
    }]);
    setForm({ name: '', category: 'Rent', amount: '' });
    setShowForm(false);
  };

  const handleDelete = (id) => setLiabilities(prev => prev.filter(l => l.id !== id));

  const totalLiabilities = liabilities.reduce((sum, l) => sum + l.amount, 0);
  const available = Math.max(0, parseFloat(income || 0) - totalLiabilities);
  const daysLeft = daysRemainingInMonth();
  const dailyAllowance = daysLeft > 0 ? available / daysLeft : 0;

  return (
    <div className="min-h-screen bg-brand-white pb-24">

      {/* Header */}
      <div
        className="px-5 pt-12 pb-10 bg-brand-base"
        style={{ backgroundImage: 'linear-gradient(to bottom, rgba(0, 92, 255, 0.3), rgba(245, 245, 245, 0.3))' }}
      >
        <p className="text-white/60 text-sm font-causten">Manage your</p>
        <h1 className="text-white text-3xl font-causten font-extrabold tracking-tight">Budget</h1>
      </div>

      <div className="mx-4 space-y-4 -mt-5">

        {/* Income card */}
        <div className="bg-white rounded-2xl shadow-lg px-5 py-5">
          <p className="text-xs font-causten font-bold text-gray-400 uppercase tracking-widest mb-4">Monthly Income</p>
          <div className="flex items-center gap-2">
            <span className="text-4xl font-causten font-extrabold text-brand-dark-violet">$</span>
            <input
              type="number"
              inputMode="decimal"
              placeholder="0.00"
              value={income}
              onChange={e => setIncome(e.target.value)}
              className="flex-1 text-4xl font-causten font-extrabold text-brand-dark-violet placeholder-gray-200 border-none outline-none bg-transparent min-w-0"
            />
          </div>
        </div>

        {/* Liabilities */}
        <div className="bg-white rounded-2xl shadow-lg px-5 py-5">
          <div className="flex justify-between items-center mb-4">
            <p className="text-xs font-causten font-bold text-gray-400 uppercase tracking-widest">Monthly Liabilities</p>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-1 bg-brand-dark-violet text-white px-3 py-1.5 rounded-lg text-xs font-causten font-bold"
            >
              <TbPlus className="w-3.5 h-3.5" /> ADD
            </button>
          </div>

          {liabilities.length === 0 ? (
            <p className="text-gray-300 text-sm text-center py-4">No liabilities added yet</p>
          ) : (
            <div className="space-y-2">
              {liabilities.map(l => (
                <div key={l.id} className="flex justify-between items-center py-2.5 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="text-brand-dark-violet font-semibold text-sm">{l.name}</p>
                    <p className="text-gray-300 text-xs">{l.category}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-brand-dark-violet font-causten font-bold">${l.amount.toFixed(2)}</p>
                    <button onClick={() => handleDelete(l.id)}>
                      <TbTrash className="w-4 h-4 text-gray-300 hover:text-red-400 transition-colors" />
                    </button>
                  </div>
                </div>
              ))}
              <div className="flex justify-between items-center pt-2">
                <p className="text-xs text-gray-400 font-semibold">Total liabilities</p>
                <p className="text-brand-dark-violet font-causten font-bold">${totalLiabilities.toFixed(2)}</p>
              </div>
            </div>
          )}
        </div>

        {/* Daily allowance result */}
        <div
          className="rounded-2xl px-5 py-5 bg-brand-base"
          style={{ backgroundImage: 'linear-gradient(to bottom, rgba(0, 92, 255, 0.3), rgba(245, 245, 245, 0.3))' }}
        >
          <p className="text-white/60 text-xs font-causten uppercase tracking-widest mb-1">Your daily allowance</p>
          <p className="text-white text-5xl font-causten font-extrabold">${dailyAllowance.toFixed(2)}</p>
          <p className="text-white/40 text-xs mt-2">{daysLeft} days remaining · ${available.toFixed(2)} available</p>
        </div>

      </div>

      {/* Add liability bottom sheet */}
      {showForm && (
        <>
          <div className="fixed inset-0 bg-black/30 z-40" onClick={() => setShowForm(false)} />
          <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 px-5 pt-5 pb-10 shadow-2xl">
            <div className="flex justify-between items-center mb-5">
              <p className="font-causten font-bold text-brand-dark-violet text-lg">Add Liability</p>
              <button onClick={() => setShowForm(false)}>
                <TbX className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Category</p>
                <select
                  value={form.category}
                  onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  className="w-full text-sm text-brand-dark-violet border-b border-gray-100 pb-2 outline-none bg-transparent"
                >
                  {LIABILITY_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Name (optional)</p>
                <input
                  type="text"
                  placeholder={`e.g. ${form.category}`}
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full text-sm text-brand-dark-violet border-b border-gray-100 pb-2 outline-none bg-transparent placeholder-gray-300"
                />
              </div>

              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Amount per month</p>
                <div className="flex items-center gap-1 border-b border-gray-100 pb-2">
                  <span className="text-2xl font-causten font-bold text-brand-dark-violet">$</span>
                  <input
                    type="number"
                    inputMode="decimal"
                    placeholder="0.00"
                    value={form.amount}
                    onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                    className="flex-1 text-2xl font-causten font-bold text-brand-dark-violet border-none outline-none bg-transparent"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleAddLiability}
              disabled={!form.amount}
              className="w-full mt-6 py-3 rounded-xl bg-brand-dark-violet text-white font-causten font-bold disabled:opacity-20"
            >
              Add
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Expense;
