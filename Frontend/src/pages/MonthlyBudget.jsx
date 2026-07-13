import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { TbPencil, TbArrowBackUp, TbCalendarHeart, TbChevronDown } from "react-icons/tb";
import ExpenseForm from '../components/ExpenseForm';
import CategoryManager from '../components/CategoryManager';
import ExpenseListItem from '../components/ExpenseListItem';
import EditExpenseSheet from '../components/EditExpenseSheet';
import SetupAlert from '../components/SetupAlert';
import NotificationBell from '../components/NotificationBell';

import { API } from '../utils/api';

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
// The chevron collapses the list down to a one-line summary (count + total).
const BudgetSection = ({
  title,
  subtitle,
  headerAction,
  items,
  emptyText,
  totalLabel,
  onItemClick,
  onTogglePaid
}) => {
  const [open, setOpen] = useState(false);

  const total = items.reduce((sum, i) => sum + i.amount, 0);

  return (
    <div className="bg-white rounded-2xl shadow-lg px-5 py-5">
      <div className={`flex justify-between items-start gap-3 ${open ? 'mb-4' : ''}`}>
        <div>
          <p className="font-causten font-bold text-brand-dark-violet text-xl">{title}</p>
          <p className="text-brand-dark-violet/45 text-xs mt-0.5">{subtitle}</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {headerAction}
          <button
            onClick={() => setOpen(v => !v)}
            aria-label={open ? `Collapse ${title}` : `Expand ${title}`}
            className="text-brand-dark-violet/60 hover:text-brand-dark-violet active:scale-90 transition-all duration-150"
          >
            <TbChevronDown className={`w-5 h-5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {open ? (
        items.length === 0 ? (
          <p className="text-brand-dark-violet/45 text-sm text-center py-3">{emptyText}</p>
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
              <p className="text-xs text-brand-dark-violet/60 font-semibold">{totalLabel}</p>
              <p className="text-brand-dark-violet font-causten font-bold">
                ${total.toFixed(2)}
              </p>
            </div>
          </div>
        )
      ) : (
        /* Collapsed — one-line summary so the numbers stay visible */
        <div className="flex justify-between items-center mt-2">
          <p className="text-xs text-brand-dark-violet/60 font-semibold">
            {items.length} {items.length === 1 ? 'item' : 'items'}
          </p>
          <p className="text-brand-dark-violet font-causten font-bold">
            ${total.toFixed(2)}
          </p>
        </div>
      )}
    </div>
  );
};

// ─── Component ────────────────────────────────────────────────────────────────

const MonthlyBudget = () => {
  // ── State ──────────────────────────────────────────────────────────────────

  // The raw monthly budget value the user sets (string to allow empty input)
  const [budget, setBudget] = useState('');
  // Last value confirmed by the server — invalid input snaps back to this
  // instead of lingering in the field looking like it saved
  const [savedBudget, setSavedBudget] = useState('');
  const [editingBudget, setEditingBudget] = useState(false);
  const [budgetSaved, setBudgetSaved] = useState(false);
  // True once the initial fetch lands — the setup banner only renders on a
  // confirmed missing income, never during the loading flash
  const [budgetLoaded, setBudgetLoaded] = useState(false);

  // Calculated by the backend — frontend only displays this, never computes it
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
      // Budget summary — values pre-calculated by the backend
      if (data?.monthly_income) {
        setBudget(String(data.monthly_income));
        setSavedBudget(String(data.monthly_income));
      }
      setDaysRemaining(data?.days_remaining || 0);
      setBudgetLoaded(true);

      // Expenses list
      setExpenses(Array.isArray(exps) ? exps.map(mapExpense) : []);

      // Categories list
      setCategories(Array.isArray(cats) ? cats.map(mapCategory) : []);
    });
  }, [navigate]);

  // ── Handlers ───────────────────────────────────────────────────────────────

  // Saves the monthly income the user typed; the backend recalculates
  // days_remaining and returns it
  const handleSaveBudget = async () => {
    const val = parseFloat(budget);
    // 0 is a valid income ("not set / clear it") — only empty, non-numeric,
    // and negative input is rejected, snapping back to the last saved value
    if (budget === '' || isNaN(val) || val < 0) {
      setBudget(savedBudget);
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

      // Update derived values from the backend response
      setBudget(String(data.monthly_income));
      setSavedBudget(String(data.monthly_income));
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

    // Append the new expense to the list — the header's "available after
    // bills" number recomputes itself from the list
    setExpenses(prev => [...prev, mapExpense(created)]);
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
    setDaysRemaining(data.new_days_remaining || 0);
  };

  // Saves an edited expense; isBill comes from the edit sheet's "repeats every
  // month" toggle and is translated to the expense_type the API expects
  const handleUpdateExpense = async (id, { amount, category_id, name }) => {
    const res = await fetch(`${API}/monthly-budget/expenses/${id}`, {
      method: 'PUT',
      headers: authHeader(),
      body: JSON.stringify({
        amount,
        category_id,
        expense_description: name,
        // Editing never moves an item between sections — it keeps the type it
        // was created with
        expense_type: editing.isBill ? 'Monthly Bill' : 'Expected Expense'
      })
    });
    if (!res.ok) return;
    const data = await res.json();

    setExpenses(prev => prev.map(e => e.id === id ? mapExpense(data) : e));
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

  // Plan-level math only — income minus everything reserved ON THIS PAGE.
  // Savings and daily spending deliberately don't appear here; the live
  // "left to spend" number (which subtracts those too) lives on Summary.
  const monthlyIncome = parseFloat(budget) || 0;
  const availableAfterBills = monthlyIncome - totalBills - totalPlanned;

  // Fraction of monthly income still unreserved — drives the header ring gauge
  const leftPct = monthlyIncome > 0 ? Math.max(0, Math.min(availableAfterBills / monthlyIncome, 1)) : 0;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-brand-white pb-24">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div
        className="relative px-5 pt-12 pb-10 min-h-45 bg-brand-base"
        style={{ backgroundImage: 'linear-gradient(to bottom, rgba(0, 92, 255, 0.3), rgba(245, 245, 245, 0.3))' }}
      >
        {/* Bell + profile avatar */}
        <div className="absolute top-12 right-5 flex items-center gap-3">
          <NotificationBell />
          <button
            onClick={() => navigate('/profile')}
            className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 active:scale-90 transition-all duration-150 flex items-center justify-center shrink-0"
          >
            <span className="text-white font-causten font-bold text-base">
              {userName.charAt(0).toUpperCase()}
            </span>
          </button>
        </div>

        {/* Page title */}
        <div className="mb-3 pr-16">
          <p className="text-white/60 text-base font-causten">Manage your</p>
          <h1 className="text-white text-3xl font-causten font-extrabold tracking-tight">Income</h1>
        </div>

        {/* Stats stacked on the left — ring gauge on the right */}
        <div className="flex items-center justify-between gap-5">

          <div className="flex-1 min-w-0 flex flex-col gap-2">
            {/* Monthly Income — the only value the user can edit */}
            <div className="bg-white/15 rounded-xl px-3 py-2.5">
              <div className="flex items-center gap-1.5 mb-0.5">
                <p className="text-white/60 text-[10px] font-causten font-bold uppercase tracking-widest">Monthly Income</p>
                {budgetSaved && <span className="text-emerald-300 text-xs font-causten font-bold">✓</span>}
                {!editingBudget && (
                  <button onClick={() => setEditingBudget(true)} className="text-white/60 hover:text-white active:scale-90 transition-all duration-150">
                    <TbPencil className="w-3 h-3" />
                  </button>
                )}
              </div>
              {editingBudget ? (
                <div className="flex items-center gap-1">
                  <span className="text-white text-lg font-causten font-extrabold">$</span>
                  <input
                    autoFocus
                    type="number"
                    inputMode="decimal"
                    placeholder="0.00"
                    value={budget}
                    onChange={e => { setBudget(e.target.value); setBudgetSaved(false); }}
                    onBlur={handleSaveBudget}
                    onKeyDown={e => e.key === 'Enter' && e.currentTarget.blur()}
                    className="w-full min-w-0 bg-transparent border-b border-white/30 focus:border-white text-white text-lg font-causten font-extrabold outline-none placeholder-white/40"
                  />
                </div>
              ) : (
                <p className="text-white text-lg font-causten font-extrabold">
                  ${monthlyIncome.toFixed(2)}
                </p>
              )}
            </div>

            {/* Available After Bills — income minus this page's bills + planned,
                so it always reconciles with the numbers shown below */}
            <div className="bg-white/15 rounded-xl px-3 py-2.5">
              <p className="text-white/60 text-[10px] font-causten font-bold uppercase tracking-widest mb-0.5">Available After Bills</p>
              <p className="text-white text-lg font-causten font-extrabold">${availableAfterBills.toFixed(2)}</p>
            </div>
          </div>

          {/* Ring gauge — drains as income gets reserved, orange when low */}
          <div className="shrink-0 flex flex-col items-center">
          <div className="relative w-28 h-28">
            <svg width="100%" height="100%" viewBox="0 0 160 160" className="-rotate-90" aria-hidden="true">
              <circle cx="80" cy="80" r="70" fill="none" strokeWidth="11" stroke="rgba(255,255,255,0.22)" />
              <circle
                cx="80" cy="80" r="70" fill="none"
                strokeWidth="11" strokeLinecap="round"
                pathLength="100" strokeDasharray="100"
                strokeDashoffset={100 * (1 - leftPct)}
                stroke={leftPct < 0.2 ? '#FB923C' : '#FFDBFD'}
                className="transition-all duration-500"
              />
            </svg>
            <div className="absolute inset-0 grid place-items-center text-center">
              <div>
                <p className="text-white text-2xl font-causten font-extrabold leading-none">{Math.round(leftPct * 100)}%</p>
                <p className="text-white/60 text-[8px] font-causten font-bold uppercase tracking-widest mt-1">left this month</p>
              </div>
            </div>
          </div>

          {/* Summary line — value comes directly from the backend */}
          <p className="text-white/40 text-[11px] font-causten text-center w-28 mt-1">
            {daysRemaining} days remaining this month
          </p>
          </div>
        </div>
      </div>

      {/* ── Content: summary strip + the two budget sections ───────────────── */}
      <div className="relative z-10 -mt-6 bg-brand-white rounded-t-3xl px-4 pt-5 space-y-4">

        {/* No income yet — everything on this page derives from it */}
        {budgetLoaded && monthlyIncome === 0 && !editingBudget && (
          <SetupAlert
            message="Start by setting your monthly income — allowance and budget tracking switch on from there."
            actionLabel="Set it"
            onAction={() => { setEditingBudget(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          />
        )}

        {/* Today's date — month carries the emphasis, day + year trail after */}
        <div className="flex items-center gap-2.5 px-1">
          <div className="bg-brand-light-pink rounded-full p-2 shrink-0">
            <TbCalendarHeart className="w-5 h-5 text-brand-dark-violet" />
          </div>
          <div className="flex items-baseline gap-2">
            <h2 className="text-3xl font-causten font-extrabold text-brand-dark-violet">
              {new Date().toLocaleString('en-US', { month: 'long' })}
            </h2>
            <p className="text-lg font-causten font-bold text-brand-dark-violet/60">
              {new Date().getDate()}, {new Date().getFullYear()}
            </p>
          </div>
        </div>

        {/* Spending summary — three equal areas: bills, planned, combined total */}
        <div className="bg-white rounded-2xl shadow-lg py-4 grid grid-cols-3 divide-x divide-gray-300">
          <div className="text-center px-2 min-w-0">
            <p className="text-[10px] font-causten font-bold text-brand-dark-violet/60 uppercase tracking-widest">Bills</p>
            <p className="text-brand-dark-violet font-causten font-extrabold text-lg mt-1 truncate">${totalBills.toFixed(2)}</p>
          </div>
          <div className="text-center px-2 min-w-0">
            <p className="text-[10px] font-causten font-bold text-brand-dark-violet/60 uppercase tracking-widest">Planned</p>
            <p className="text-brand-dark-violet font-causten font-extrabold text-lg mt-1 truncate">${totalPlanned.toFixed(2)}</p>
          </div>
          <div className="text-center px-2 min-w-0">
            <p className="text-[10px] font-causten font-bold text-brand-dark-violet/60 uppercase tracking-widest">Total</p>
            <p className="text-brand-dark-violet font-causten font-extrabold text-lg mt-1 truncate">${(totalBills + totalPlanned).toFixed(2)}</p>
          </div>
        </div>

        {/* Universal add — one full-width button; a segmented switch picks the section */}
        {addOpen ? (
          <div
            className="bg-brand-base rounded-2xl shadow-lg px-5 py-5 origin-top motion-safe:animate-dropdown"
            style={{ backgroundImage: 'linear-gradient(to bottom, rgba(0, 92, 255, 0.3), rgba(245, 245, 245, 0.3))' }}
          >
            <div className="flex justify-between items-center mb-3">
              <p className="text-sm font-causten font-bold text-white uppercase tracking-widest">Add an expense</p>
              <button onClick={() => setAddOpen(false)} className="text-sm font-causten font-bold text-white/80 hover:text-white active:scale-95 transition-all duration-150">
                Cancel
              </button>
            </div>
            <div className="flex bg-white/10 rounded-xl p-1 mb-4">
              <button
                onClick={() => setAddType('bill')}
                className={`flex-1 py-2 rounded-lg text-sm font-causten font-bold active:scale-95 transition-all duration-150 ${
                  addType === 'bill' ? 'bg-white text-brand-dark-violet shadow' : 'text-white/50'
                }`}
              >
                Monthly Bill
              </button>
              <button
                onClick={() => setAddType('planned')}
                className={`flex-1 py-2 rounded-lg text-sm font-causten font-bold active:scale-95 transition-all duration-150 ${
                  addType === 'planned' ? 'bg-white text-brand-dark-violet shadow' : 'text-white/50'
                }`}
              >
                Planned This Month
              </button>
            </div>
            <ExpenseForm
              bare
              dark
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
            className="w-full py-4 bg-brand-dark-violet text-white rounded-2xl shadow-lg font-causten font-bold text-sm hover:bg-brand-base hover:-translate-y-0.5 hover:shadow-xl transition-all duration-150 active:scale-95"
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
              className="flex items-center gap-1 text-xs font-causten font-bold text-brand-dark-violet shrink-0 hover:text-brand-base active:scale-95 transition-all duration-150"
            >
              <TbArrowBackUp className="w-3.5 h-3.5" />
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
          expense={{ id: editing.id, amount: editing.amount, categoryId: editing.categoryId, name: editing.name }}
          categories={categories}
          namePlaceholder="Name (optional)"
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

    </div>
  );
};

export default MonthlyBudget;
