import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { TbPencil } from "react-icons/tb";
import NavBar from '../components/NavBar';
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

// Normalises a raw expense row from the API into the shape the UI expects.
// isBill decides which section the item renders in; paid drives the tick circle.
const mapExpense = (e) => ({
  id: e.expense_id,
  name: e.expense_description || e.Category?.name || 'Uncategorized',
  categoryId: e.Category?.category_id || null,
  categoryName: e.Category?.name || 'Uncategorized',
  categoryColor: e.Category?.color || '#D1D5DB',
  amount: parseFloat(e.amount),
  isBill: e.expense_type === 'Monthly Bill',
  paid: !!e.paid_at
});

const mapCategory = (c) => ({
  id: c.category_id,
  name: c.name,
  color: c.color
});

// ─── Section Card ─────────────────────────────────────────────────────────────

// One budget section (Monthly Bills or Planned This Month): header, tick-off
// checklist, and total row. Adding happens in the page's universal add card.
const BudgetSection = ({
  title,
  subtitle,
  headerAction,
  items,
  emptyText,
  totalLabel,
  onItemClick,
  onTogglePaid
}) => (
  <div className="bg-white rounded-2xl shadow-lg px-5 py-5">
    <div className="flex justify-between items-start gap-3 mb-4">
      <div>
        <p className="text-xs font-causten font-bold text-gray-400 uppercase tracking-widest">{title}</p>
        <p className="text-gray-300 text-xs mt-0.5">{subtitle}</p>
      </div>
      {headerAction}
    </div>

    {items.length === 0 ? (
      <p className="text-gray-300 text-sm text-center py-3">{emptyText}</p>
    ) : (
      <div>
        {items.map(item => (
          <ExpenseListItem
            key={item.id}
            primaryText={item.name}
            categoryName={item.categoryName}
            categoryColor={item.categoryColor}
            amount={item.amount}
            paid={item.paid}
            onTogglePaid={() => onTogglePaid(item)}
            onClick={() => onItemClick(item)}
          />
        ))}
        {/* Total row — display-only sum of this section's items */}
        <div className="flex justify-between items-center pt-3">
          <p className="text-xs text-gray-400 font-semibold">{totalLabel}</p>
          <p className="text-brand-dark-violet font-causten font-bold">
            ${items.reduce((sum, i) => sum + i.amount, 0).toFixed(2)}
          </p>
        </div>
      </div>
    )}

  </div>
);

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

  // This month's budget expenses (both sections in one list; isBill splits them)
  const [expenses, setExpenses] = useState([]);
  const [editing, setEditing] = useState(null);

  // Universal add form: whether it's open, and which section the new expense joins
  const [addOpen, setAddOpen] = useState(false);
  const [addType, setAddType] = useState('planned'); // 'bill' | 'planned'

  // User's custom categories, shared across the app
  const [categories, setCategories] = useState([]);

  // Whether the Categories manager sheet is open
  const [showCategoryForm, setShowCategoryForm] = useState(false);

  const navigate = useNavigate();
  const userName = localStorage.getItem('userName') || 'there';

  // ── Initial Data Load ──────────────────────────────────────────────────────

  // On mount: verify auth, then fetch the budget summary and expenses in parallel
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || !isTokenValid(token)) {
      navigate('/login', { replace: true });
      return;
    }

    const headers = authHeader();

    Promise.all([
      fetch(`${API}/monthly-budget`, { headers }).then(r => r.json()),
      fetch(`${API}/monthly-budget/expenses`, { headers }).then(r => r.json()),
      fetch(`${API}/categories`, { headers }).then(r => r.json())
    ]).then(([data, exps, cats]) => {
      // Budget summary — all values pre-calculated by the backend
      if (data?.monthly_income) setBudget(String(data.monthly_income));
      setAvailable(parseFloat(data?.available) || 0);
      setDaysRemaining(data?.days_remaining || 0);

      // Expenses list
      setExpenses(Array.isArray(exps) ? exps.map(mapExpense) : []);

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

  // Adds a new budget expense; isBill decides the section (Monthly Bill vs
  // Expected Expense). The backend recalculates allowance values and returns
  // them alongside the created record so no second fetch is needed
  const handleAddExpense = async ({ amount, category_id, name }, isBill) => {
    const selectedCategory = categories.find(c => c.id === Number(category_id));

    const res = await fetch(`${API}/monthly-budget/expenses`, {
      method: 'POST',
      headers: authHeader(),
      body: JSON.stringify({
        amount,
        category_id: category_id || null,
        expense_description: name || selectedCategory?.name || '',
        expense_type: isBill ? 'Monthly Bill' : 'Expected Expense'
      })
    });

    if (!res.ok) return false;

    const created = await res.json();

    // Append the new expense to the list
    setExpenses(prev => [...prev, mapExpense(created)]);

    // Update derived values returned by the backend
    setAvailable(parseFloat(created.new_available) || 0);
    setDaysRemaining(created.new_days_remaining || 0);
  };

  // Ticks an expense off as paid (or unticks it). Status only — the money was
  // reserved when the expense was added, so available/allowance don't change
  const handleTogglePaid = async (item) => {
    const res = await fetch(`${API}/monthly-budget/expenses/${item.id}/paid`, {
      method: 'PUT',
      headers: authHeader(),
      body: JSON.stringify({ paid: !item.paid })
    });
    if (!res.ok) return;
    const data = await res.json();

    setExpenses(prev => prev.map(e => e.id === item.id ? mapExpense(data) : e));
  };

  // Creates a new custom category, which then shows up in the add form's picker
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

  // Deletes a category; any expenses tagged with it fall back to "Uncategorized"
  // on the backend, so the expenses list is re-fetched to reflect that
  const handleDeleteCategory = async (id) => {
    const res = await fetch(`${API}/categories/${id}`, {
      method: 'DELETE',
      headers: authHeader()
    });
    if (!res.ok) return;

    setCategories(prev => prev.filter(c => c.id !== id));

    const exps = await fetch(`${API}/monthly-budget/expenses`, { headers: authHeader() }).then(r => r.json());
    setExpenses(Array.isArray(exps) ? exps.map(mapExpense) : []);
  };

  // Deletes an expense; the backend recalculates and returns updated values
  const handleDelete = async (id) => {
    const res = await fetch(`${API}/monthly-budget/expenses/${id}`, {
      method: 'DELETE',
      headers: authHeader()
    });
    if (!res.ok) return;
    const data = await res.json();

    setExpenses(prev => prev.filter(e => e.id !== id));

    // Update derived values returned by the backend
    setAvailable(parseFloat(data.new_available) || 0);
    setDaysRemaining(data.new_days_remaining || 0);
  };

  // Saves an edited expense; isBill comes from the edit sheet's "repeats every
  // month" toggle and is translated to the expense_type the API expects
  const handleUpdateExpense = async (id, { amount, category_id, name, isBill }) => {
    const res = await fetch(`${API}/monthly-budget/expenses/${id}`, {
      method: 'PUT',
      headers: authHeader(),
      body: JSON.stringify({
        amount,
        category_id,
        expense_description: name,
        expense_type: isBill ? 'Monthly Bill' : 'Expected Expense'
      })
    });
    if (!res.ok) return;
    const data = await res.json();

    setExpenses(prev => prev.map(e => e.id === id ? mapExpense(data) : e));
    setAvailable(parseFloat(data.new_available) || 0);
    setDaysRemaining(data.new_days_remaining || 0);
  };

  // Brings last month's Monthly Bills into the current month (skipping anything
  // that would duplicate an expense already added this month). One-offs from
  // last month are never copied — they died with their month
  const handleRestoreBills = async () => {
    const res = await fetch(`${API}/monthly-budget/expenses/restore`, {
      method: 'POST',
      headers: authHeader()
    });
    if (!res.ok) return;
    const data = await res.json();

    if (Array.isArray(data.expenses)) {
      setExpenses(data.expenses.map(mapExpense));
      setAvailable(parseFloat(data.new_available) || 0);
      setDaysRemaining(data.new_days_remaining || 0);
    }
  };

  // ── Derived Display Values ─────────────────────────────────────────────────

  // The two sections, split from the single expenses list
  const bills = expenses.filter(e => e.isBill);
  const planned = expenses.filter(e => !e.isBill);

  // Section totals for the summary strip — display-only sums
  const totalBills = bills.reduce((sum, e) => sum + e.amount, 0);
  const totalPlanned = planned.reduce((sum, e) => sum + e.amount, 0);

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

          {/* Left to Spend — read-only, recalculated by the backend whenever an expense is added/removed */}
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

      {/* ── Content: summary strip + the two budget sections ───────────────── */}
      <div className="relative z-10 mx-4 -mt-5 space-y-4">

        {/* Spending summary — three equal areas: bills, planned, combined total */}
        <div className="bg-white rounded-2xl shadow-lg py-4 grid grid-cols-3 divide-x divide-gray-300">
          <div className="text-center px-2 min-w-0">
            <p className="text-[10px] font-causten font-bold text-gray-400 uppercase tracking-widest">Bills</p>
            <p className="text-brand-dark-violet font-causten font-extrabold text-lg mt-1 truncate">${totalBills.toFixed(2)}</p>
          </div>
          <div className="text-center px-2 min-w-0">
            <p className="text-[10px] font-causten font-bold text-gray-400 uppercase tracking-widest">Planned</p>
            <p className="text-brand-dark-violet font-causten font-extrabold text-lg mt-1 truncate">${totalPlanned.toFixed(2)}</p>
          </div>
          <div className="text-center px-2 min-w-0">
            <p className="text-[10px] font-causten font-bold text-gray-400 uppercase tracking-widest">Total</p>
            <p className="text-brand-dark-violet font-causten font-extrabold text-lg mt-1 truncate">${(totalBills + totalPlanned).toFixed(2)}</p>
          </div>
        </div>

        {/* Universal add — one full-width button; a segmented switch picks the section */}
        {addOpen ? (
          <div className="bg-brand-light-violet rounded-2xl shadow-lg px-5 py-5">
            <div className="flex justify-between items-center mb-3">
              <p className="text-xs font-causten font-bold text-gray-400 uppercase tracking-widest">Add an expense</p>
              <button onClick={() => setAddOpen(false)} className="text-sm font-causten font-bold text-brand-dark-violet">
                Cancel
              </button>
            </div>
            <div className="flex bg-brand-dark-violet/10 rounded-xl p-1 mb-4">
              <button
                onClick={() => setAddType('bill')}
                className={`flex-1 py-2 rounded-lg text-sm font-causten font-bold transition-colors ${
                  addType === 'bill' ? 'bg-white text-brand-dark-violet shadow' : 'text-gray-400'
                }`}
              >
                Monthly Bill
              </button>
              <button
                onClick={() => setAddType('planned')}
                className={`flex-1 py-2 rounded-lg text-sm font-causten font-bold transition-colors ${
                  addType === 'planned' ? 'bg-white text-brand-dark-violet shadow' : 'text-gray-400'
                }`}
              >
                Planned This Month
              </button>
            </div>
            <ExpenseForm
              bare
              namePlaceholder="Name (optional)"
              categories={categories}
              onRequestNewCategory={() => setShowCategoryForm(true)}
              onSubmit={vals => handleAddExpense(vals, addType === 'bill')}
              alwaysShowDetails
            />
          </div>
        ) : (
          <button
            onClick={() => setAddOpen(true)}
            className="w-full py-4 bg-brand-dark-violet text-white rounded-2xl shadow-lg font-causten font-bold text-sm active:scale-95 transition-transform"
          >
            + Add an expense
          </button>
        )}

        <BudgetSection
          title="Monthly Bills"
          subtitle={`Repeats every month · ${currentMonthLabel}`}
          headerAction={
            <button
              onClick={handleRestoreBills}
              className="text-xs font-causten font-bold text-brand-dark-violet shrink-0"
            >
              Reuse last month's
            </button>
          }
          items={bills}
          emptyText="No bills yet — add rent, wifi, subscriptions, or reuse last month's."
          totalLabel="Total bills"
          onItemClick={setEditing}
          onTogglePaid={handleTogglePaid}
        />

        <BudgetSection
          title="Planned This Month"
          subtitle="One-offs — won't carry to next month"
          items={planned}
          emptyText="Nothing planned yet — add one-off spending you know is coming."
          totalLabel="Total planned"
          onItemClick={setEditing}
          onTogglePaid={handleTogglePaid}
        />

      </div>

      {editing && (
        <EditExpenseSheet
          expense={{ id: editing.id, amount: editing.amount, categoryId: editing.categoryId, name: editing.name, isBill: editing.isBill }}
          categories={categories}
          namePlaceholder="Name (optional)"
          showRepeatToggle
          onRequestNewCategory={() => setShowCategoryForm(true)}
          onSave={handleUpdateExpense}
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

      <NavBar />
    </div>
  );
};

export default MonthlyBudget;
