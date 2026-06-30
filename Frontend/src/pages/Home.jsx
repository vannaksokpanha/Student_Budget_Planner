import { useEffect, useState, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import { LiaPiggyBankSolid } from "react-icons/lia";
import { TbX } from "react-icons/tb"; 

const CATEGORIES = ['Food & Drink', 'Transportation', 'Groceries', 'Bills', 'Rental Fee', 'Other'];

const isTokenValid = (token) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
};

const Home = () => {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [note, setNote] = useState('');
  const [expenses, setExpenses] = useState([]);
  const [editing, setEditing] = useState(null); // holds the expense being edited
  const priceRef = useRef(null);
  const navigate = useNavigate();

  const userName = localStorage.getItem('userName') || 'there';
  const dailyBudget = 10.00; // placeholder until Budget page is wired to backend

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || !isTokenValid(token)) {
      navigate('/login', { replace: true });
      return;
    }
    priceRef.current?.focus();
  }, [navigate]);

  const handleAdd = () => {
    if (!amount || isNaN(parseFloat(amount))) return;
    const newExpense = {
      id: Date.now(),
      amount: parseFloat(amount),
      category: category || null,
      note: note || null,
      date: new Date().toISOString().split('T')[0],
    };
    setExpenses(prev => [newExpense, ...prev]);
    setAmount('');
    setCategory('');
    setNote('');
    setTimeout(() => priceRef.current?.focus(), 0);
  };

  const handleSaveEdit = () => {
    setExpenses(prev =>
      prev.map(e => e.id === editing.id ? { ...editing } : e)
    );
    setEditing(null);
  };

  const handleDelete = (id) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
    setEditing(null);
  };

  const todaySpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const remaining = dailyBudget - todaySpent;
  const progress = Math.min(todaySpent / dailyBudget, 1);
  const progressColor = progress < 0.6 ? 'bg-emerald-400' : progress < 0.9 ? 'bg-amber-400' : 'bg-red-400';

  return (
    <div className="min-h-screen bg-brand-white pb-24">

      {/* Header — brand-base purple always underneath, gradient overlay shifts on overspend */}
      <div
        className="px-5 pt-12 pb-10 bg-brand-base transition-all duration-700"
        style={{
          backgroundImage: remaining < 0
            ? 'linear-gradient(to bottom, rgba(0, 92, 255, 0.3), rgba(249, 115, 22, 0.7))'
            : 'linear-gradient(to bottom, rgba(0, 92, 255, 0.3), rgba(245, 245, 245, 0.3))'
        }}
      >
        <div className="flex justify-between items-start mb-5">
          <div>
            <p className="text-white/60 text-sm font-causten">Hi, {userName}</p>
            <h1 className="text-white text-3xl font-causten font-extrabold tracking-tight">Daily Log</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-white/60 text-xs font-causten uppercase tracking-wide">Left today</p>
              <p className="text-2xl font-causten font-extrabold text-white">
                ${remaining.toFixed(2)}
              </p>
              <p className="text-white/40 text-xs">of ${dailyBudget.toFixed(2)}/day</p>
            </div>
            <button
              onClick={() => navigate('/profile')}
              className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0"
            >
              <span className="text-white font-causten font-bold text-sm">
                {userName.charAt(0).toUpperCase()}
              </span>
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-white/20 rounded-full h-1.5">
          <div
            className={`h-1.5 rounded-full transition-all duration-500 ${progressColor}`}
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </div>

      {/* Quick Add card */}
      <div className="mx-4 -mt-5">
        <div className="bg-white rounded-2xl shadow-lg px-5 pt-5 pb-4">
          <p className="text-xs font-causten font-bold text-gray-400 uppercase tracking-widest mb-4">
            Log an expense
          </p>

          {/* Amount row */}
          <div className="flex items-center gap-2">
            <span className="text-4xl font-causten font-extrabold text-brand-dark-violet">$</span>
            <input
              ref={priceRef}
              type="number"
              inputMode="decimal"
              placeholder="0.00"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
              className="flex-1 text-4xl font-causten font-extrabold text-brand-dark-violet placeholder-gray-200 border-none outline-none bg-transparent min-w-0"
            />
            <button
              onClick={handleAdd}
              disabled={!amount}
              className="bg-brand-dark-violet text-white px-5 py-3 rounded-xl font-causten font-bold text-sm disabled:opacity-20 transition-opacity active:scale-95"
            >
              + ADD
            </button>
          </div>

          {/* Optional fields — only appear after amount is typed */}
          {amount ? (
            <div className="mt-3 border-t border-gray-100 pt-3 space-y-2">
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full text-sm text-gray-400 border-none outline-none bg-transparent focus:text-brand-dark-violet"
              >
                <option value="">Category (optional)</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <input
                type="text"
                placeholder="Note (optional)"
                value={note}
                onChange={e => setNote(e.target.value)}
                className="w-full text-sm text-gray-400 border-none outline-none bg-transparent placeholder-gray-300 focus:text-brand-dark-violet"
              />
            </div>
          ) : null}
        </div>
      </div>

      {/* Today's Spending */}
      <div className="mx-4 mt-6">
        <div className="flex justify-between items-center mb-3">
          <p className="font-causten font-bold text-brand-dark-violet">Today's Spending</p>
          {expenses.length > 0 && (
            <p className="text-xs text-gray-400">${todaySpent.toFixed(2)} spent</p>
          )}
        </div>

        {expenses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 gap-4">
            <div className="bg-brand-light-pink rounded-full p-6">
              <LiaPiggyBankSolid className="w-16 h-16 text-brand-dark-violet" />
            </div>
            <div className="text-center">
              <p className="text-brand-dark-violet font-causten font-bold text-base">Nothing logged yet</p>
              <p className="text-gray-300 text-xs mt-1">Type an amount above and tap + ADD</p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {expenses.map(e => (
              <button
                key={e.id}
                onClick={() => setEditing({ ...e })}
                className="w-full bg-white rounded-xl px-4 py-3.5 flex justify-between items-center shadow-sm active:scale-[0.98] transition-transform text-left"
              >
                <div>
                  <p className="text-brand-dark-violet font-semibold text-sm">
                    {e.category ?? <span className="text-gray-300 font-normal italic">Uncategorized</span>}
                  </p>
                  {e.note && <p className="text-gray-400 text-xs mt-0.5">{e.note}</p>}
                  <p className="text-gray-300 text-xs mt-0.5">{e.date}</p>
                </div>
                <p className="text-brand-dark-violet font-causten font-bold">${e.amount.toFixed(2)}</p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Edit bottom sheet */}
      {editing && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/30 z-40"
            onClick={() => setEditing(null)}
          />

          {/* Sheet */}
          <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 px-5 pt-5 pb-10 shadow-2xl">
            <div className="flex justify-between items-center mb-5">
              <p className="font-causten font-bold text-brand-dark-violet text-lg">Edit Expense</p>
              <button onClick={() => setEditing(null)}>
                <TbX className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Amount</p>
                <div className="flex items-center gap-1 border-b border-gray-100 pb-2">
                  <span className="text-2xl font-causten font-bold text-brand-dark-violet">$</span>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={editing.amount}
                    onChange={e => setEditing(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                    className="flex-1 text-2xl font-causten font-bold text-brand-dark-violet border-none outline-none bg-transparent"
                  />
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Category</p>
                <select
                  value={editing.category ?? ''}
                  onChange={e => setEditing(prev => ({ ...prev, category: e.target.value || null }))}
                  className="w-full text-sm text-brand-dark-violet border-b border-gray-100 pb-2 outline-none bg-transparent"
                >
                  <option value="">Uncategorized</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Note</p>
                <input
                  type="text"
                  value={editing.note ?? ''}
                  onChange={e => setEditing(prev => ({ ...prev, note: e.target.value || null }))}
                  placeholder="Add a note"
                  className="w-full text-sm text-brand-dark-violet border-b border-gray-100 pb-2 outline-none bg-transparent placeholder-gray-300"
                />
              </div>

              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Date</p>
                <input
                  type="date"
                  value={editing.date ?? ''}
                  onChange={e => setEditing(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full text-sm text-brand-dark-violet border-b border-gray-100 pb-2 outline-none bg-transparent"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => handleDelete(editing.id)}
                className="flex-1 py-3 rounded-xl border border-red-200 text-red-400 font-causten font-bold text-sm"
              >
                Delete
              </button>
              <button
                onClick={handleSaveEdit}
                className="flex-2 py-3 rounded-xl bg-brand-dark-violet text-white font-causten font-bold text-sm"
              >
                Save
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Home;
