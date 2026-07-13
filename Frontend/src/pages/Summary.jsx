import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
<<<<<<< HEAD
import { TbChevronLeft, TbChevronRight } from "react-icons/tb";
=======
import { TbChevronLeft, TbChevronRight, TbWallet, TbReceipt, TbPigMoney, TbShoppingCart } from "react-icons/tb";
>>>>>>> 5162e95e6a751d48b635acf7198717970c9b032c
import ExpenseListItem from '../components/ExpenseListItem';
import EditExpenseSheet from '../components/EditExpenseSheet';
import CategoryManager from '../components/CategoryManager';
import NotificationBell from '../components/NotificationBell';

import { API } from '../utils/api';

// Budget-page expense types (bills + planned) vs everyday Daily Spending — they
// live in different tables/endpoints, so edits route by this
const BUDGET_TYPES = ['Monthly Bill', 'Expected Expense'];
const isBudgetType = (t) => BUDGET_TYPES.includes(t);

const mapCategory = (c) => ({ id: c.category_id, name: c.name, color: c.color });

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

// Local YYYY-MM-DD — avoids toISOString(), which converts to UTC first and can
// shift the calendar day in timezones ahead of/behind UTC
const toDateString = (date) => {
  const pad = n => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

// First/last day of the month containing `date`, as YYYY-MM-DD strings
const monthRange = (date) => {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return [toDateString(start), toDateString(end)];
};

const Summary = () => {
  // Day-filtered expense report
  const [reportDate, setReportDate] = useState(toDateString(new Date()));
  const [dayExpenses, setDayExpenses] = useState([]);

  // Month-filtered category breakdown; monthDate is any day inside the month
  const [monthDate, setMonthDate] = useState(new Date());
  const [monthExpenses, setMonthExpenses] = useState([]);

  // Current month's budget numbers (income, planned, savings, spent, left) —
  // pre-calculated by the backend, drives the Left to Spend card
  const [budgetNumbers, setBudgetNumbers] = useState(null);

  // Tap-to-edit: the expense currently open in the edit sheet (null = closed),
  // plus the category list its picker needs
  const [categories, setCategories] = useState([]);
  const [editing, setEditing] = useState(null);
  const [showCategoryForm, setShowCategoryForm] = useState(false);

  const navigate = useNavigate();
  const userName = localStorage.getItem('userName') || 'there';

  // Auth guard on mount, then fetch the current month's budget numbers and the
  // category list (for the edit sheet's picker)
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || !isTokenValid(token)) {
      navigate('/login', { replace: true });
      return;
    }
    fetch(`${API}/monthly-budget`, { headers: authHeader() })
      .then(r => r.json())
      .then(data => setBudgetNumbers(data))
      .catch(() => setBudgetNumbers(null));
    fetch(`${API}/categories`, { headers: authHeader() })
      .then(r => r.json())
      .then(data => setCategories(Array.isArray(data) ? data.map(mapCategory) : []))
      .catch(() => setCategories([]));
  }, [navigate]);

  // Fetch the picked day's expenses
  useEffect(() => {
    fetch(`${API}/summary/expenses?start=${reportDate}&end=${reportDate}`, { headers: authHeader() })
      .then(r => r.json())
      .then(data => setDayExpenses(Array.isArray(data) ? data : []))
      .catch(() => setDayExpenses([]));
  }, [reportDate]);

  // Fetch the picked month's expenses
  useEffect(() => {
    const [start, end] = monthRange(monthDate);
    fetch(`${API}/summary/expenses?start=${start}&end=${end}`, { headers: authHeader() })
      .then(r => r.json())
      .then(data => setMonthExpenses(Array.isArray(data) ? data : []))
      .catch(() => setMonthExpenses([]));
  }, [monthDate]);

  // ── Tap-to-edit ──────────────────────────────────────────────────────────────

  // Re-pull everything an edit can touch: the day list, the month breakdown, and
  // the Monthly Overview numbers. Keeps this page in sync after a save/delete;
  // the Daily Log and Budget pages refetch on their own when next visited.
  const reloadDay = () =>
    fetch(`${API}/summary/expenses?start=${reportDate}&end=${reportDate}`, { headers: authHeader() })
      .then(r => r.json())
      .then(data => setDayExpenses(Array.isArray(data) ? data : []))
      .catch(() => {});
  const reloadMonth = () => {
    const [start, end] = monthRange(monthDate);
    return fetch(`${API}/summary/expenses?start=${start}&end=${end}`, { headers: authHeader() })
      .then(r => r.json())
      .then(data => setMonthExpenses(Array.isArray(data) ? data : []))
      .catch(() => {});
  };
  const reloadBudget = () =>
    fetch(`${API}/monthly-budget`, { headers: authHeader() })
      .then(r => r.json())
      .then(data => setBudgetNumbers(data))
      .catch(() => {});
  const reloadAll = () => Promise.all([reloadDay(), reloadMonth(), reloadBudget()]);

  // Open the edit sheet for a tapped row, normalising the backend shape into
  // what EditExpenseSheet expects (plus `type`, which routes the save/delete)
  const openEditor = (e) => setEditing({
    id: e.expense_id,
    amount: parseFloat(e.amount),
    categoryId: e.Category?.category_id || null,
    name: e.expense_description || '',
    date: e.expense_date,
    type: e.expense_type
  });

  // Save an edited expense to the endpoint that owns it. Budget items keep their
  // section (expense_type) and paid status; daily items keep their date.
  const handleSaveEdit = async (id, { amount, category_id, name, date }) => {
    const type = editing?.type;
    const url = isBudgetType(type)
      ? `${API}/monthly-budget/expenses/${id}`
      : `${API}/daily-log/${id}`;
    const body = isBudgetType(type)
      ? { amount, category_id, expense_description: name, expense_type: type }
      : { amount, category_id, expense_description: name, expense_date: date };
    const res = await fetch(url, { method: 'PUT', headers: authHeader(), body: JSON.stringify(body) });
    if (res.ok) await reloadAll();
  };

  const handleDeleteEdit = async (id) => {
    const url = isBudgetType(editing?.type)
      ? `${API}/monthly-budget/expenses/${id}`
      : `${API}/daily-log/${id}`;
    const res = await fetch(url, { method: 'DELETE', headers: authHeader() });
    if (res.ok) await reloadAll();
  };

  const handleAddCategory = async ({ name, color }) => {
    const res = await fetch(`${API}/categories`, {
      method: 'POST', headers: authHeader(), body: JSON.stringify({ name, color })
    });
    if (!res.ok) return;
    const created = await res.json();
    setCategories(prev => [...prev, mapCategory(created)].sort((a, b) => a.name.localeCompare(b.name)));
  };

  const handleDeleteCategory = async (id) => {
    const res = await fetch(`${API}/categories/${id}`, { method: 'DELETE', headers: authHeader() });
    if (!res.ok) return;
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  // ── Derived display values ──────────────────────────────────────────────────

  const dayTotal = dayExpenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);

  // The day report's two groups: budget items ticked off as paid that day vs
  // spending logged on the Daily Log page
  const dayBills = dayExpenses.filter(e => BUDGET_TYPES.includes(e.expense_type));
  const dayPocket = dayExpenses.filter(e => !BUDGET_TYPES.includes(e.expense_type));
  const dayBillsTotal = dayBills.reduce((sum, e) => sum + parseFloat(e.amount), 0);
  const dayPocketTotal = dayPocket.reduce((sum, e) => sum + parseFloat(e.amount), 0);

  // Per-category totals for the picked month, largest first
  const monthTotal = monthExpenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);
  const byCategory = Object.values(
    monthExpenses.reduce((acc, e) => {
      const key = e.Category?.category_id ?? 'none';
      acc[key] = acc[key] || {
        name: e.Category?.name || 'Uncategorized',
        color: e.Category?.color || '#D1D5DB',
        total: 0
      };
      acc[key].total += parseFloat(e.amount);
      return acc;
    }, {})
  ).sort((a, b) => b.total - a.total);

  // Left to Spend card — always the CURRENT month (unlike the sections below,
  // which follow the pickers), because it's the user's live pool right now
  const income = parseFloat(budgetNumbers?.monthly_income) || 0;
  const reservedPlanned = parseFloat(budgetNumbers?.total_planned) || 0;
  const reservedSavings = parseFloat(budgetNumbers?.total_savings) || 0;
  const spentSoFar = parseFloat(budgetNumbers?.spent_this_month) || 0;
  const leftToSpend = parseFloat(budgetNumbers?.available) || 0;
  const showPool = income > 0;
  const currentMonthLabel = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Share of income for the allocation bar's segments (clamped to ≥0)
  const allocPct = (value) => (income > 0 ? Math.max(0, (value / income) * 100) : 0);

  const monthLabel = monthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const isCurrentMonth =
    monthDate.getFullYear() === new Date().getFullYear() &&
    monthDate.getMonth() === new Date().getMonth();

  const shiftMonth = (delta) => {
    setMonthDate(d => new Date(d.getFullYear(), d.getMonth() + delta, 1));
  };

  return (
    <div className="min-h-screen bg-brand-white pb-24">

      {/* Header */}
      <div
        className="relative px-5 pt-12 pb-10 min-h-45 bg-brand-base"
        style={{ backgroundImage: 'linear-gradient(to bottom, rgba(0, 92, 255, 0.3), rgba(245, 245, 245, 0.3))' }}
      >
        <div className="absolute top-12 right-5 flex items-center gap-3">
          <NotificationBell />
          <button
            onClick={() => navigate('/profile')}
            className="w-12 h-12 rounded-full bg-white/20 active:scale-90 transition-all duration-150 flex items-center justify-center shrink-0"
          >
            <span className="text-white font-causten font-bold text-base">
              {userName.charAt(0).toUpperCase()}
            </span>
          </button>
        </div>

        <div className="mb-6 pr-16">
          <p className="text-white/60 text-sm font-causten">Your</p>
          <h1 className="text-white text-3xl font-causten font-extrabold tracking-tight">Summary</h1>
        </div>

        {/* Monthly Overview — the live pool for the current month: income minus
            everything reserved (bills, planned, savings) and spent so far.
            Rendered straight onto the gradient header (no card) because its
            inputs span every page and this is the month's headline number. */}
        {showPool && (
          <div className="mt-2">
            <div className="mb-3">
              <p className="font-causten font-bold text-white text-xl">Monthly Overview</p>
              <p className="text-xs text-white/60 font-causten font-bold mt-0.5">{currentMonthLabel}</p>
            </div>

            {[
              { label: 'Monthly income', value: income, minus: false, Icon: TbWallet },
              { label: 'Bills & planned', value: reservedPlanned, minus: true, Icon: TbReceipt },
              { label: 'Savings', value: reservedSavings, minus: true, Icon: TbPigMoney },
              { label: 'Pocket spending', value: spentSoFar, minus: true, Icon: TbShoppingCart }
            ].map(({ label, value, minus, Icon }) => (
              <div key={label} className="flex justify-between items-center py-1.5">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-sm text-white/80 font-semibold truncate">{label}</p>
                </div>
                <p className="text-sm text-white font-causten font-bold shrink-0">
                  {minus ? '− ' : ''}${value.toFixed(2)}
                </p>
              </div>
            ))}

            {/* Left-to-spend bar — starts full and drains as this month's income
                gets committed (bills, savings, spending); the filled part is
                what's still left to spend */}
            <div className="mt-3 h-2 rounded-full overflow-hidden bg-white/15">
              <div
                className="h-full rounded-full bg-brand-light-pink transition-all duration-500"
                style={{ width: `${allocPct(Math.max(0, leftToSpend))}%` }}
              />
            </div>

            <div className="flex justify-between items-center pt-3 mt-3 border-t border-white/20">
              <p className="text-xs text-white/70 font-semibold uppercase tracking-widest">Left to spend</p>
              <p className="text-white font-causten font-extrabold text-2xl">${leftToSpend.toFixed(2)}</p>
            </div>
          </div>
        )}
      </div>

      {/* Expense Report — filtered by day */}
      <div className="relative z-10 mx-5 -mt-5">
        <div className="bg-white rounded-2xl shadow-lg px-5 py-5">
          <div className="flex justify-between items-center gap-3 mb-4">
            <p className="font-causten font-bold text-brand-dark-violet text-xl">
              Expense Report
            </p>
            <input
              type="date"
              value={reportDate}
              max={toDateString(new Date())}
              onChange={e => e.target.value && setReportDate(e.target.value)}
              className="text-sm text-brand-dark-violet font-causten font-bold bg-transparent outline-none"
            />
          </div>

          {dayExpenses.length === 0 ? (
            <p className="text-brand-dark-violet/45 text-sm text-center py-4">Nothing recorded on this day.</p>
          ) : (
            <div>
              {/* Bills & Planned — budget items ticked off as paid on this day.
                  Full-bleed tinted band so the two groups read as distinct blocks */}
              {dayBills.length > 0 && (
                <div>
                  <div className="-mx-5 px-5 py-2 bg-brand-light-violet flex justify-between items-center">
                    <p className="text-[10px] font-causten font-bold text-brand-dark-violet uppercase tracking-widest">
                      Bills & Planned
                    </p>
                    <p className="text-xs font-causten font-bold text-brand-dark-violet">
                      ${dayBillsTotal.toFixed(2)}
                    </p>
                  </div>
                  {dayBills.map(e => (
                    <ExpenseListItem
                      key={e.expense_id}
                      primaryText={e.expense_description || e.Category?.name || 'Uncategorized'}
                      categoryName={e.Category?.name || 'Uncategorized'}
                      categoryColor={e.Category?.color || '#D1D5DB'}
                      amount={parseFloat(e.amount)}
                      onClick={() => openEditor(e)}
                    />
                  ))}
                </div>
              )}

              {/* Pocket Spending — everyday expenses logged on the Daily Log page */}
              {dayPocket.length > 0 && (
                <div className={dayBills.length > 0 ? 'mt-4' : ''}>
                  <div className="-mx-5 px-5 py-2 bg-brand-light-pink flex justify-between items-center">
                    <p className="text-[10px] font-causten font-bold text-brand-dark-violet uppercase tracking-widest">
                      Pocket Spending
                    </p>
                    <p className="text-xs font-causten font-bold text-brand-dark-violet">
                      ${dayPocketTotal.toFixed(2)}
                    </p>
                  </div>
                  {dayPocket.map(e => (
                    <ExpenseListItem
                      key={e.expense_id}
                      primaryText={e.expense_description || e.Category?.name || 'Uncategorized'}
                      categoryName={e.Category?.name || 'Uncategorized'}
                      categoryColor={e.Category?.color || '#D1D5DB'}
                      amount={parseFloat(e.amount)}
                      onClick={() => openEditor(e)}
                    />
                  ))}
                </div>
              )}

              <div className="flex justify-between items-center pt-3 mt-3 border-t border-gray-100">
                <p className="text-xs text-brand-dark-violet/60 font-semibold">
                  Total · {dayExpenses.length} {dayExpenses.length === 1 ? 'expense' : 'expenses'}
                </p>
                <p className="text-brand-dark-violet font-causten font-bold">${dayTotal.toFixed(2)}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Spending by Category — filtered by month */}
      <div className="mx-5 mt-4">
        <div className="bg-white rounded-2xl shadow-lg px-5 py-5">
          <div className="flex justify-between items-center gap-3 mb-4">
            <p className="font-causten font-bold text-brand-dark-violet text-xl">
              Spending by Category
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => shiftMonth(-1)}
                aria-label="Previous month"
                className="text-brand-dark-violet/60 hover:text-brand-dark-violet active:scale-90 transition-all duration-150"
              >
                <TbChevronLeft className="w-4 h-4" />
              </button>
              <p className="text-sm text-brand-dark-violet font-causten font-bold whitespace-nowrap w-28 text-center">
                {monthLabel}
              </p>
              <button
                onClick={() => shiftMonth(1)}
                disabled={isCurrentMonth}
                aria-label="Next month"
                className="text-brand-dark-violet/60 hover:text-brand-dark-violet active:scale-90 transition-all duration-150 disabled:opacity-20"
              >
                <TbChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {byCategory.length === 0 ? (
            <p className="text-brand-dark-violet/45 text-sm text-center py-4">No spending this month.</p>
          ) : (
            <div className="space-y-3">
              {byCategory.map(cat => {
                const pct = monthTotal > 0 ? (cat.total / monthTotal) * 100 : 0;
                return (
                  <div key={cat.name}>
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                        <p className="text-brand-dark-violet font-semibold text-sm truncate">{cat.name}</p>
                      </div>
                      <p className="text-sm shrink-0">
                        <span className="text-brand-dark-violet font-causten font-bold">${cat.total.toFixed(2)}</span>
                        <span className="text-brand-dark-violet/45 text-xs ml-1.5">{pct.toFixed(0)}%</span>
                      </p>
                    </div>
                    <div className="w-full h-2 rounded-full bg-gray-100">
                      <div
                        className="h-2 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, backgroundColor: cat.color }}
                      />
                    </div>
                  </div>
                );
              })}
              <div className="flex justify-between items-center pt-3 mt-1 border-t border-gray-100">
                <p className="text-xs text-brand-dark-violet/60 font-semibold">Total this month</p>
                <p className="text-brand-dark-violet font-causten font-bold">${monthTotal.toFixed(2)}</p>
              </div>
            </div>
          )}
        </div>
      </div>

<<<<<<< HEAD
=======
      {/* Tap-to-edit sheet — same shared sheet Daily Log uses. Budget items
          (bills/planned) have no date field; daily spending does. */}
      {editing && (
        <EditExpenseSheet
          expense={{ id: editing.id, amount: editing.amount, categoryId: editing.categoryId, name: editing.name, date: editing.date }}
          categories={categories}
          namePlaceholder={isBudgetType(editing.type) ? 'Description' : 'Note (optional)'}
          showDate={!isBudgetType(editing.type)}
          onRequestNewCategory={() => setShowCategoryForm(true)}
          onSave={handleSaveEdit}
          onDelete={handleDeleteEdit}
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

>>>>>>> 5162e95e6a751d48b635acf7198717970c9b032c
    </div>
  );
};

export default Summary;
