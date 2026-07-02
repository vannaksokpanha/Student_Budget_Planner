import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { TbPencil } from "react-icons/tb";
import ExpenseForm from '../components/ExpenseForm';
import CategoryManager from '../components/CategoryManager';
import ExpenseListItem from '../components/ExpenseListItem';
import EditExpenseSheet from '../components/EditExpenseSheet';

const API = 'http://localhost:3000/api';

// ─── Auth Helpers ─────────────────────────────────────────────────────────────

// Checks whether the stored JWT is still valid (not expired)
const isTokenValid = (token) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
};

// Builds the Authorization header used on every API call
const authHeader = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('token')}`
});

// ─── Data Mappers ─────────────────────────────────────────────────────────────

// Normalises a raw expense row from the API into the shape the UI expects
const mapLiability = (e) => ({
  id: e.expense_id,
  name: e.expense_description || e.Category?.name || 'Uncategorized',
  categoryId: e.Category?.category_id || null,
  categoryName: e.Category?.name || 'Uncategorized',
  categoryColor: e.Category?.color || '#D1D5DB',
  amount: parseFloat(e.amount)
});

const mapCategory = (c) => ({
  id: c.category_id,
  name: c.name,
  color: c.color
});

// ─── Component ────────────────────────────────────────────────────────────────

const MonthlyBudget = () => {
  // ── State ──────────────────────────────────────────────────────────────────

  // The raw monthly budget value the user sets (string to allow empty input)
  const [budget, setBudget] = useState('');
  const [editingBudget, setEditingBudget] = useState(false);
  const [budgetSaved, setBudgetSaved] = useState(false);

  // Calculated by the backend — frontend only displays these, never computes them
  const [available, setAvailable] = useState(0);
  const [daysRemaining, setDaysRemaining] = useState(0);

  // Monthly fixed expenses list
  const [liabilities, setLiabilities] = useState([]);
  const [editing, setEditing] = useState(null);

  // User's custom categories, shared across the app
  const [categories, setCategories] = useState([]);

  // Whether the Categories manager sheet is open
  const [showCategoryForm, setShowCategoryForm] = useState(false);

  const navigate = useNavigate();
  const userName = localStorage.getItem('userName') || 'there';

  // ── Initial Data Load ──────────────────────────────────────────────────────

  // On mount: verify auth, then fetch the budget summary and liabilities in parallel
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || !isTokenValid(token)) {
      navigate('/login', { replace: true });
      return;
    }

    const headers = authHeader();

    Promise.all([
      fetch(`${API}/monthly-budget`, { headers }).then(r => r.json()),
      fetch(`${API}/monthly-budget/liabilities`, { headers }).then(r => r.json()),
      fetch(`${API}/categories`, { headers }).then(r => r.json())
    ]).then(([data, lbs, cats]) => {
      // Budget summary — all values pre-calculated by the backend
      if (data?.monthly_income) setBudget(String(data.monthly_income));
      setAvailable(parseFloat(data?.available) || 0);
      setDaysRemaining(data?.days_remaining || 0);

      // Liabilities list
      setLiabilities(Array.isArray(lbs) ? lbs.map(mapLiability) : []);

      // Categories list
      setCategories(Array.isArray(cats) ? cats.map(mapCategory) : []);
    });
  }, [navigate]);

  // ── Handlers ───────────────────────────────────────────────────────────────

  // Saves the monthly income the user typed; the backend recalculates
  // available and days_remaining and returns them
  const handleSaveBudget = async () => {
    const val = parseFloat(budget);
    if (!budget || isNaN(val) || val <= 0) {
      setEditingBudget(false);
      return;
    }
    try {
      const res = await fetch(`${API}/monthly-budget`, {
        method: 'PUT',
        headers: authHeader(),
        body: JSON.stringify({ monthly_income: val })
      });
      if (!res.ok) return;
      const data = await res.json();

      // Update all derived values from the backend response — no local formulas
      setBudget(String(data.monthly_income));
      setAvailable(parseFloat(data.available) || 0);
      setDaysRemaining(data.days_remaining || 0);

      setBudgetSaved(true);
      setTimeout(() => setBudgetSaved(false), 2000);
    } catch (err) {
      console.error('[saveBudget] network error:', err);
    }
    setEditingBudget(false);
  };

  // Adds a new monthly liability; the backend recalculates allowance values
  // and returns them alongside the created record so no second fetch is needed
  const handleAddLiability = async ({ amount, category_id, name }) => {
    const selectedCategory = categories.find(c => c.id === Number(category_id));

    const res = await fetch(`${API}/monthly-budget/liabilities`, {
      method: 'POST',
      headers: authHeader(),
      body: JSON.stringify({
        amount,
        category_id: category_id || null,
        expense_description: name || selectedCategory?.name || ''
      })
    });

    if (!res.ok) return false;

    const created = await res.json();

    // Append the new liability to the list
    setLiabilities(prev => [...prev, mapLiability(created)]);

    // Update derived values returned by the backend
    setAvailable(parseFloat(created.new_available) || 0);
    setDaysRemaining(created.new_days_remaining || 0);
  };

  // Creates a new custom category, which then shows up in the Add Liability form's picker
  const handleAddCategory = async ({ name, color }) => {
    const res = await fetch(`${API}/categories`, {
      method: 'POST',
      headers: authHeader(),
      body: JSON.stringify({ name, color })
    });

    if (!res.ok) return false;

    const created = await res.json();
    const newCategory = mapCategory(created);

    setCategories(prev => [...prev, newCategory].sort((a, b) => a.name.localeCompare(b.name)));
  };

  // Deletes a category; any liabilities tagged with it fall back to "Uncategorized"
  // on the backend, so the liabilities list is re-fetched to reflect that
  const handleDeleteCategory = async (id) => {
    const res = await fetch(`${API}/categories/${id}`, {
      method: 'DELETE',
      headers: authHeader()
    });
    if (!res.ok) return;

    setCategories(prev => prev.filter(c => c.id !== id));

    const lbs = await fetch(`${API}/monthly-budget/liabilities`, { headers: authHeader() }).then(r => r.json());
    setLiabilities(Array.isArray(lbs) ? lbs.map(mapLiability) : []);
  };

  // Deletes a liability; the backend recalculates and returns updated values
  const handleDelete = async (id) => {
    const res = await fetch(`${API}/monthly-budget/liabilities/${id}`, {
      method: 'DELETE',
      headers: authHeader()
    });
    if (!res.ok) return;
    const data = await res.json();

    setLiabilities(prev => prev.filter(l => l.id !== id));

    // Update derived values returned by the backend
    setAvailable(parseFloat(data.new_available) || 0);
    setDaysRemaining(data.new_days_remaining || 0);
  };

  // Saves an edited liability; matches EditExpenseSheet's onSave(id, { amount, category_id, name }) contract
  const handleUpdateLiability = async (id, { amount, category_id, name }) => {
    const res = await fetch(`${API}/monthly-budget/liabilities/${id}`, {
      method: 'PUT',
      headers: authHeader(),
      body: JSON.stringify({ amount, category_id, expense_description: name })
    });
    if (!res.ok) return;
    const data = await res.json();

    setLiabilities(prev => prev.map(l => l.id === id ? mapLiability(data) : l));
    setAvailable(parseFloat(data.new_available) || 0);
    setDaysRemaining(data.new_days_remaining || 0);
  };

  // Brings last month's liabilities into the current month (skipping anything
  // that would duplicate a liability already added this month)
  const handleRestoreLiabilities = async () => {
    const res = await fetch(`${API}/monthly-budget/liabilities/restore`, {
      method: 'POST',
      headers: authHeader()
    });
    if (!res.ok) return;
    const data = await res.json();

    if (Array.isArray(data.liabilities)) {
      setLiabilities(data.liabilities.map(mapLiability));
      setAvailable(parseFloat(data.new_available) || 0);
      setDaysRemaining(data.new_days_remaining || 0);
    }
  };

  // ── Derived Display Value ──────────────────────────────────────────────────

  // Sum of all liabilities for the "Total liabilities" row — purely for display
  const totalLiabilities = liabilities.reduce((sum, l) => sum + l.amount, 0);

  // Which month this budget applies to, e.g. "August 2026"
  const currentMonthLabel = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-brand-white pb-24">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div
        className="relative px-5 pt-12 pb-10 min-h-45 bg-brand-base"
        style={{ backgroundImage: 'linear-gradient(to bottom, rgba(0, 92, 255, 0.3), rgba(245, 245, 245, 0.3))' }}
      >
        {/* Profile avatar */}
        <button
          onClick={() => navigate('/profile')}
          className="absolute top-12 right-5 w-12 h-12 rounded-full bg-white/20 flex items-center justify-center shrink-0"
        >
          <span className="text-white font-causten font-bold text-base">
            {userName.charAt(0).toUpperCase()}
          </span>
        </button>

        {/* Page title */}
        <div className="mb-6 pr-16">
          <p className="text-white/60 text-sm font-causten">Manage your</p>
          <h1 className="text-white text-3xl font-causten font-extrabold tracking-tight">Income</h1>
        </div>

        {/* Stat boxes */}
        <div className="flex gap-3">

          {/* Monthly Income — the only value the user can edit */}
          <div className="flex-1 min-w-0 bg-white/15 rounded-2xl px-4 py-3">
            <div className="flex items-center justify-between gap-2 mb-0.5">
              <p className="text-white/60 text-xs font-causten uppercase tracking-wide">Monthly Income</p>
              <div className="flex items-center gap-1.5 shrink-0">
                {budgetSaved && <span className="text-emerald-300 text-xs font-causten font-bold">✓</span>}
                {!editingBudget && (
                  <button onClick={() => setEditingBudget(true)} className="text-white/60 hover:text-white transition-colors">
                    <TbPencil className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
            {editingBudget ? (
              <div className="flex items-center gap-1">
                <span className="text-white text-2xl font-causten font-extrabold">$</span>
                <input
                  autoFocus
                  type="number"
                  inputMode="decimal"
                  placeholder="0.00"
                  value={budget}
                  onChange={e => { setBudget(e.target.value); setBudgetSaved(false); }}
                  onBlur={handleSaveBudget}
                  onKeyDown={e => e.key === 'Enter' && e.currentTarget.blur()}
                  className="w-full min-w-0 bg-transparent border-b border-white/30 focus:border-white text-white text-2xl font-causten font-extrabold outline-none placeholder-white/40"
                />
              </div>
            ) : (
              <p className="text-white text-2xl font-causten font-extrabold">
                ${(parseFloat(budget) || 0).toFixed(2)}
              </p>
            )}
          </div>

          {/* Left to Spend — read-only, recalculated by the backend whenever a liability is added/removed */}
          <div className="flex-1 min-w-0 bg-white/15 rounded-2xl px-4 py-3">
            <p className="text-white/60 text-xs font-causten uppercase tracking-wide mb-0.5">Left to Spend</p>
            <p className="text-white text-2xl font-causten font-extrabold">${available.toFixed(2)}</p>
          </div>
        </div>

        {/* Summary line — value comes directly from the backend */}
        <p className="text-white/40 text-xs font-causten mt-3">
          {daysRemaining} days remaining this month
        </p>
      </div>

      {/* Add Liability card — overlaps the header, mirrors Daily Log's quick-add */}
      <div className="relative z-10 mx-5 -mt-5">
        <ExpenseForm
          label="Add a liability"
          namePlaceholder="Name (optional)"
          categories={categories}
          onRequestNewCategory={() => setShowCategoryForm(true)}
          onSubmit={handleAddLiability}
          alwaysShowDetails
        />
      </div>

      {/* ── Content ────────────────────────────────────────────────────────── */}
      <div className="mx-4 space-y-4 mt-6">

        {/* Monthly Liabilities list */}
        <div className="bg-white rounded-2xl shadow-lg px-5 py-5">
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="text-xs font-causten font-bold text-gray-400 uppercase tracking-widest">Monthly Liabilities</p>
              <p className="text-gray-300 text-xs mt-0.5">{currentMonthLabel}</p>
            </div>
            <button
              onClick={handleRestoreLiabilities}
              className="text-xs font-causten font-bold text-brand-dark-violet"
            >
              Restore last month
            </button>
          </div>

          {liabilities.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-gray-300 text-sm">No liabilities added yet</p>
              <p className="text-gray-300 text-xs mt-1">Starting a new month? Tap "Restore last month" above to bring your old bills back.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {liabilities.map(l => (
                <ExpenseListItem
                  key={l.id}
                  primaryText={l.name}
                  categoryName={l.categoryName}
                  categoryColor={l.categoryColor}
                  amount={l.amount}
                  onClick={() => setEditing(l)}
                />
              ))}
              {/* Total row — display-only sum of the liabilities array */}
              <div className="flex justify-between items-center pt-2">
                <p className="text-xs text-gray-400 font-semibold">Total liabilities</p>
                <p className="text-brand-dark-violet font-causten font-bold">${totalLiabilities.toFixed(2)}</p>
              </div>
            </div>
          )}
        </div>

      </div>

      {editing && (
        <EditExpenseSheet
          expense={{ id: editing.id, amount: editing.amount, categoryId: editing.categoryId, name: editing.name }}
          categories={categories}
          namePlaceholder="Name (optional)"
          onRequestNewCategory={() => setShowCategoryForm(true)}
          onSave={handleUpdateLiability}
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
  );
};

export default MonthlyBudget;
