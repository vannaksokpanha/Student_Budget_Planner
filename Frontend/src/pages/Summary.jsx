import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { TbChevronLeft, TbChevronRight } from "react-icons/tb";
import NavBar from '../components/NavBar';
import ExpenseListItem from '../components/ExpenseListItem';

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

  const navigate = useNavigate();
  const userName = localStorage.getItem('userName') || 'there';

  // Auth guard on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || !isTokenValid(token)) {
      navigate('/login', { replace: true });
    }
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

  // ── Derived display values ──────────────────────────────────────────────────

  const dayTotal = dayExpenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);

  // The day report's two groups: budget items ticked off as paid that day vs
  // spending logged on the Daily Log page
  const BUDGET_TYPES = ['Monthly Bill', 'Expected Expense'];
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
        <button
          onClick={() => navigate('/profile')}
          className="absolute top-12 right-5 w-12 h-12 rounded-full bg-white/20 flex items-center justify-center shrink-0"
        >
          <span className="text-white font-causten font-bold text-base">
            {userName.charAt(0).toUpperCase()}
          </span>
        </button>

        <div className="mb-6 pr-16">
          <p className="text-white/60 text-sm font-causten">Your</p>
          <h1 className="text-white text-3xl font-causten font-extrabold tracking-tight">Summary</h1>
        </div>
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
            <p className="text-gray-300 text-sm text-center py-4">Nothing logged on this day.</p>
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
                    />
                  ))}
                </div>
              )}

              <div className="flex justify-between items-center pt-3">
                <p className="text-xs text-gray-400 font-semibold">
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
                className="text-gray-400 hover:text-brand-dark-violet transition-colors"
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
                className="text-gray-400 hover:text-brand-dark-violet transition-colors disabled:opacity-20"
              >
                <TbChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {byCategory.length === 0 ? (
            <p className="text-gray-300 text-sm text-center py-4">No spending this month.</p>
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
                        <span className="text-gray-300 text-xs ml-1.5">{pct.toFixed(0)}%</span>
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
              <div className="flex justify-between items-center pt-2">
                <p className="text-xs text-gray-400 font-semibold">Total this month</p>
                <p className="text-brand-dark-violet font-causten font-bold">${monthTotal.toFixed(2)}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <NavBar />
    </div>
  );
};

export default Summary;
