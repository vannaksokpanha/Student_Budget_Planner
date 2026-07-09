import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { LiaPiggyBankSolid } from "react-icons/lia";
import { TbX, TbPlus } from "react-icons/tb";
import NavBar from '../components/NavBar';
import ExpenseForm from '../components/ExpenseForm';
import CategoryManager from '../components/CategoryManager';
import EditExpenseSheet from '../components/EditExpenseSheet';
import PresetItem from '../components/PresetItem';

const API = 'http://localhost:3000/api';

const isTokenValid = (token) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
};

const authHeader = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('token')}`
});

const mapLog = (e) => ({
  id: e.expense_id,
  amount: parseFloat(e.amount),
  categoryId: e.Category?.category_id || null,
  categoryName: e.Category?.name || null,
  categoryColor: e.Category?.color || '#D1D5DB',
  note: e.expense_description || null,
  date: e.expense_date
});

const mapPreset = (p) => ({
  id: p.preset_id,
  amount: parseFloat(p.amount),
  categoryId: p.Category?.category_id || null,
  categoryName: p.Category?.name || null,
  categoryColor: p.Category?.color || '#D1D5DB',
  note: p.note || null
});

const mapCategory = (c) => ({
  id: c.category_id,
  name: c.name,
  color: c.color
});

const DailyLog = () => {
  const [expenses, setExpenses] = useState([]);
  const [editing, setEditing] = useState(null);
  const [dailyBudget, setDailyBudget] = useState(0);
  const [baseAllowance, setBaseAllowance] = useState(0);
  const [presets, setPresets] = useState([]);
  const [showPresetForm, setShowPresetForm] = useState(false);
  const [presetForm, setPresetForm] = useState({ category_id: '', amount: '', note: '' });
  const [presetFormError, setPresetFormError] = useState('');
  const [categories, setCategories] = useState([]);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [formPrefill, setFormPrefill] = useState(null);
  const navigate = useNavigate();

  const userName = localStorage.getItem('userName') || 'there';

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || !isTokenValid(token)) {
      navigate('/login', { replace: true });
      return;
    }

    const headers = authHeader();

    Promise.all([
      fetch(`${API}/daily-log`, { headers }).then(r => r.json()),
      fetch(`${API}/monthly-budget`, { headers }).then(r => r.json()),
      fetch(`${API}/daily-log/presets`, { headers }).then(r => r.json()),
      fetch(`${API}/categories`, { headers }).then(r => r.json())
    ]).then(([logs, budget, presetList, cats]) => {
      setExpenses(Array.isArray(logs) ? logs.map(mapLog) : []);
      setDailyBudget(parseFloat(budget?.daily_allowance) || 0);
      setBaseAllowance(parseFloat(budget?.base_allowance) || 0);
      setPresets(Array.isArray(presetList) ? presetList.map(mapPreset) : []);
      setCategories(Array.isArray(cats) ? cats.map(mapCategory) : []);
    });
  }, [navigate]);

  // Local YYYY-MM-DD — avoids toISOString(), which converts to UTC first and can
  // shift the calendar day in timezones ahead of/behind UTC
  const todayString = () => {
    const d = new Date();
    const pad = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  };

  // Re-pulls the backend's allowance numbers — a backdated entry changes
  // "spent before today", which feeds today's carryover
  const refreshBudgetNumbers = async () => {
    try {
      const res = await fetch(`${API}/monthly-budget`, { headers: authHeader() });
      if (!res.ok) return;
      const budget = await res.json();
      setDailyBudget(parseFloat(budget?.daily_allowance) || 0);
      setBaseAllowance(parseFloat(budget?.base_allowance) || 0);
    } catch { /* keep the numbers we have */ }
  };

  // Logs a new expense; matches ExpenseForm's onSubmit({ amount, category_id, name, date }) contract
  const handleAdd = async ({ amount, category_id, name, date }) => {
    const logDate = date || todayString();
    const res = await fetch(`${API}/daily-log`, {
      method: 'POST',
      headers: authHeader(),
      body: JSON.stringify({
        amount,
        category_id: category_id || null,
        expense_description: name || '',
        expense_date: logDate
      })
    });
    if (!res.ok) return false;
    const created = await res.json();

    if (logDate === todayString()) {
      // Today's entry joins the list and today's totals
      setExpenses(prev => [mapLog(created), ...prev]);
    } else {
      // Backdated — it lives on a past day, so it won't appear in today's
      // list, but it shrinks today's allowance via the carryover
      refreshBudgetNumbers();
    }
  };

  // Tapping a preset loads it into the quick-add form for review instead of
  // logging immediately — the user often tweaks the amount or note before adding.
  // `key` changes per tap so re-tapping the same preset re-fills the form.
  const handleUsePreset = (preset) => {
    setFormPrefill({
      amount: preset.amount,
      category_id: preset.categoryId,
      name: preset.note || '',
      key: Date.now()
    });
  };

  const handleAddPreset = async () => {
    if (!presetForm.amount || isNaN(parseFloat(presetForm.amount))) return;
    setPresetFormError('');
    const res = await fetch(`${API}/daily-log/presets`, {
      method: 'POST',
      headers: authHeader(),
      body: JSON.stringify({
        amount: parseFloat(presetForm.amount),
        category_id: presetForm.category_id || null,
        note: presetForm.note || ''
      })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      setPresetFormError(err.message || 'Failed to add preset. Please try again.');
      return;
    }
    const created = await res.json();
    setPresets(prev => [...prev, mapPreset(created)]);
    setPresetForm({ category_id: '', amount: '', note: '' });
    setShowPresetForm(false);
  };

  const handleDeletePreset = async (id) => {
    const res = await fetch(`${API}/daily-log/presets/${id}`, {
      method: 'DELETE',
      headers: authHeader()
    });
    if (!res.ok) return;
    setPresets(prev => prev.filter(p => p.id !== id));
  };

  // Creates a new custom category, which then shows up in the quick-add form's picker
  const handleAddCategory = async ({ name, color }) => {
    const res = await fetch(`${API}/categories`, {
      method: 'POST',
      headers: authHeader(),
      body: JSON.stringify({ name, color })
    });
    if (!res.ok) return false;
    const created = await res.json();
    setCategories(prev => [...prev, mapCategory(created)].sort((a, b) => a.name.localeCompare(b.name)));
  };

  const handleDeleteCategory = async (id) => {
    const res = await fetch(`${API}/categories/${id}`, {
      method: 'DELETE',
      headers: authHeader()
    });
    if (!res.ok) return;
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  // Saves an edited expense; matches EditExpenseSheet's onSave(id, { amount, category_id, name, date }) contract
  const handleSaveEdit = async (id, { amount, category_id, name, date }) => {
    const res = await fetch(`${API}/daily-log/${id}`, {
      method: 'PUT',
      headers: authHeader(),
      body: JSON.stringify({
        amount,
        category_id,
        expense_description: name,
        expense_date: date
      })
    });
    if (!res.ok) return;
    const updated = await res.json();
    setExpenses(prev => prev.map(e => e.id === id ? mapLog(updated) : e));
  };

  const handleDelete = async (id) => {
    const res = await fetch(`${API}/daily-log/${id}`, {
      method: 'DELETE',
      headers: authHeader()
    });
    if (!res.ok) return;
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  const todaySpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const remaining = dailyBudget - todaySpent;
  // Fraction of today's allowance still unspent — the border trace starts the
  // day full and drains as money goes out
  const remainPct = dailyBudget > 0 ? Math.max(0, Math.min(remaining / dailyBudget, 1)) : 0;

  return (
    <div
      className="min-h-screen bg-brand-base pb-24 md:pb-10 md:pl-56"
      style={{
        // Overspent turns the whole page's wash orange, fading down its full
        // height so there's no hard cutoff line anywhere
        backgroundImage: remaining < 0
          ? 'linear-gradient(to bottom, rgba(249, 115, 22, 0.55), rgba(249, 115, 22, 0.05))'
          : 'linear-gradient(to bottom, rgba(0, 92, 255, 0.3), rgba(245, 245, 245, 0.15))'
      }}
    >
      {/* On desktop the content sits in a centered phone-width column beside
          the sidebar; on mobile it spans the screen as before */}
      <div className="md:max-w-2xl md:mx-auto md:pt-8">

      {/* Header — transparent over the page's purple; the overspend warning
          lives on the hero box below, not up here */}
      <div className="relative px-5 pt-12 pb-10 min-h-45 md:rounded-3xl md:pt-10">
        {/* Top right: daily allowance vertically centered beside the profile */}
        <div className="absolute top-12 right-5 flex items-center gap-3">
          <div className="flex flex-col justify-center text-right">
            <p className="text-white/60 text-xs font-causten font-bold uppercase tracking-widest leading-none mb-1">Allowance</p>
            <p className="text-white text-xl font-causten font-extrabold leading-none">${dailyBudget.toFixed(2)}</p>
            {/* Where the number comes from: base rate ± banked carryover */}
            {baseAllowance > 0 && (
              <p className="text-white/50 text-[10px] font-causten leading-none mt-1">
                {dailyBudget - baseAllowance > 0.005
                  ? `$${baseAllowance.toFixed(2)}/day + $${(dailyBudget - baseAllowance).toFixed(2)} saved up`
                  : dailyBudget - baseAllowance < -0.005
                    ? `$${baseAllowance.toFixed(2)}/day − $${(baseAllowance - dailyBudget).toFixed(2)} behind`
                    : `$${baseAllowance.toFixed(2)}/day · right on pace`}
              </p>
            )}
          </div>
          <button
            onClick={() => navigate('/profile')}
            className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center shrink-0"
          >
            <span className="text-white font-causten font-bold text-base">
              {userName.charAt(0).toUpperCase()}
            </span>
          </button>
        </div>

        <div className="mb-6 pr-40">
          <h1 className="text-white font-causten font-extrabold tracking-tight leading-none">
            <span className="block text-2xl text-white/80">Today's</span>
            <span className="block text-5xl mt-1">Record</span>
          </h1>
          <p className="text-white/50 text-sm font-causten mt-1">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        {/* Remaining Today — hero box with the allowance bar along its bottom edge.
            When overspent, the big number stays at $0.00 (what's actually
            spendable) and the deficit is spelled out underneath instead of
            showing a raw negative. */}
        <div className="relative bg-white/15 rounded-2xl px-4 pt-9 pb-11 text-center">
          <p className="text-white/60 text-lg font-causten font-bold uppercase tracking-wide mb-2">Remaining Today</p>
          <p className="text-white text-6xl font-causten font-extrabold tracking-tight">
            ${Math.max(0, remaining).toFixed(2)}
          </p>
          {remaining < 0 && (
            <p className="text-orange-200 text-sm font-causten font-semibold mt-2">
              You're ${Math.abs(remaining).toFixed(2)} behind — tomorrow's allowance will absorb it
            </p>
          )}
          {/* starts the day full and drains as money goes out */}
          <div className="absolute left-4 right-4 bottom-4 h-1.5 rounded-full bg-white/20 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${remainPct * 100}%`,
                backgroundColor: remaining < 0 ? '#FB923C' : '#FFDBFD'
              }}
            />
          </div>
        </div>
      </div>

      {/* Quick Add card */}
      <div className="relative z-10 mx-5 -mt-5">
        <ExpenseForm
          label="Log an expense"
          namePlaceholder="Note (optional)"
          categories={categories}
          onRequestNewCategory={() => setShowCategoryForm(true)}
          onSubmit={handleAdd}
          prefill={formPrefill}
          showDate
        />
      </div>

      {/* Quick Access */}
      <div className="mx-5 mt-7">
        <div className="flex justify-between items-center mb-2">
          <p className="font-causten font-bold text-white text-xl">
            Quick Access
          </p>
          <button
            onClick={() => setShowPresetForm(true)}
            className="flex items-center gap-1 text-white/80 text-sm font-causten font-bold hover:text-white transition-colors"
          >
            <TbPlus className="w-4 h-4" /> ADD PRESET
          </button>
        </div>

        {presets.length === 0 ? (
          <p className="text-white/60 text-sm">No presets yet — add one to log common expenses in one tap.</p>
        ) : (
          <div className="grid grid-cols-4 gap-2">
            {presets.map(preset => (
              <PresetItem
                key={preset.id}
                preset={preset}
                onUse={handleUsePreset}
                onDelete={handleDeletePreset}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add preset bottom sheet */}
      {showPresetForm && (
        <>
          <div className="fixed inset-0 bg-black/30 z-55" onClick={() => { setShowPresetForm(false); setPresetFormError(''); }} />
          <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-60 px-5 pt-5 pb-10 shadow-2xl">
            <div className="flex justify-between items-center mb-5">
              <p className="font-causten font-bold text-brand-dark-violet text-xl">Add Preset</p>
              <button onClick={() => { setShowPresetForm(false); setPresetFormError(''); }}>
                <TbX className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-400 uppercase tracking-wider mb-1">Amount</p>
                <div className="flex items-center gap-1 border-b border-gray-100 pb-2">
                  <span className="text-2xl font-causten font-bold text-brand-dark-violet">$</span>
                  <input
                    type="number"
                    inputMode="decimal"
                    placeholder="0.00"
                    value={presetForm.amount}
                    onChange={e => setPresetForm(f => ({ ...f, amount: e.target.value }))}
                    className="flex-1 text-2xl font-causten font-bold text-brand-dark-violet border-none outline-none bg-transparent"
                  />
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-400 uppercase tracking-wider mb-1">Category</p>
                <select
                  value={presetForm.category_id}
                  onChange={e => {
                    if (e.target.value === '__add_new__') {
                      setShowCategoryForm(true);
                      return;
                    }
                    setPresetForm(f => ({ ...f, category_id: e.target.value }));
                  }}
                  className="w-full text-base text-brand-dark-violet border-b border-gray-100 pb-2 outline-none bg-transparent appearance-none p-0"
                >
                  <option value="">Uncategorized</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  <option value="__add_new__">+ Add new category</option>
                </select>
              </div>

              <div>
                <p className="text-sm text-gray-400 uppercase tracking-wider mb-1">Note (optional)</p>
                <input
                  type="text"
                  placeholder="e.g. Morning coffee"
                  value={presetForm.note}
                  onChange={e => setPresetForm(f => ({ ...f, note: e.target.value }))}
                  className="w-full text-base text-brand-dark-violet border-b border-gray-100 pb-2 outline-none bg-transparent placeholder-gray-300"
                />
              </div>
            </div>

            {presetFormError && (
              <p className="mt-4 text-sm text-red-400 font-causten text-center">{presetFormError}</p>
            )}
            <button
              onClick={handleAddPreset}
              disabled={!presetForm.amount}
              className="w-full mt-4 py-3 rounded-xl bg-brand-dark-violet text-white font-causten font-bold disabled:opacity-20"
            >
              Add Preset
            </button>
          </div>
        </>
      )}

      {/* Today's Spending */}
      <div className="mx-5 mt-6">
        <div className="flex justify-between items-center mb-3">
          <p className="font-causten font-bold text-white text-xl">Today's Spending</p>
          {expenses.length > 0 && (
            <p className="text-sm text-white/70">${todaySpent.toFixed(2)} spent</p>
          )}
        </div>

        {expenses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 gap-4">
            <div className="bg-brand-light-pink rounded-full p-6">
              <LiaPiggyBankSolid className="w-16 h-16 text-brand-dark-violet" />
            </div>
            <div className="text-center">
              <p className="text-white font-causten font-bold text-lg">Nothing logged yet</p>
              <p className="text-white/60 text-sm mt-1">Type an amount above and tap + ADD</p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Each entry is its own compact one-line card; tap to edit */}
            {expenses.map(e => (
              <button
                key={e.id}
                onClick={() => setEditing(e)}
                className="w-full bg-white rounded-xl shadow-sm px-4 py-3 flex items-center gap-2.5 text-left transition-colors hover:bg-brand-light-violet"
              >
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: e.categoryColor }} />
                <p className="text-brand-dark-violet text-sm font-semibold truncate">
                  {e.note || e.categoryName || 'Uncategorized'}
                </p>
                {e.note && (
                  <p className="text-gray-300 text-xs shrink-0">{e.categoryName || 'Uncategorized'}</p>
                )}
                <p className="ml-auto text-brand-dark-violet font-causten font-bold text-sm shrink-0">
                  ${e.amount.toFixed(2)}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>

      {editing && (
        <EditExpenseSheet
          expense={{ id: editing.id, amount: editing.amount, categoryId: editing.categoryId, name: editing.note, date: editing.date }}
          categories={categories}
          namePlaceholder="Note (optional)"
          showDate
          onRequestNewCategory={() => setShowCategoryForm(true)}
          onSave={handleSaveEdit}
          onDelete={handleDelete}
          onClose={() => setEditing(null)}
        />
      )}

      {showCategoryForm && (
        <CategoryManager
          categories={categories}
          onAdd={handleAddCategory}
          onDelete={handleDeleteCategory}
          onClose={() => setShowCategoryForm(false)}
        />
      )}

      </div>

      <NavBar />
    </div>
  );
};

export default DailyLog;
