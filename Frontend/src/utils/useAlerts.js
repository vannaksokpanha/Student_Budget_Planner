import { useEffect, useState } from 'react';
import { API } from './api';

// Computes the current alert list from data the API already serves — nothing
// is stored. Re-runs on every mount (i.e. every page visit), so the list is
// always as fresh as the page it sits on.
//
// Each alert: { id, tone: 'warn' | 'info' | 'good', title, message, to }
// `to` is the route the alert links to.
const authHeader = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('token')}`
});

const useAlerts = () => {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const headers = authHeader();

    Promise.all([
      fetch(`${API}/monthly-budget`, { headers }).then(r => r.ok ? r.json() : null),
      fetch(`${API}/monthly-budget/expenses`, { headers }).then(r => r.ok ? r.json() : []),
      fetch(`${API}/daily-log`, { headers }).then(r => r.ok ? r.json() : []),
      fetch(`${API}/savings`, { headers }).then(r => r.ok ? r.json() : [])
    ]).then(([budget, budgetExpenses, todayLogs, goals]) => {
      const found = [];

      const income = parseFloat(budget?.monthly_income) || 0;
      const allowance = parseFloat(budget?.daily_allowance) || 0;
      const available = parseFloat(budget?.available) || 0;
      const daysRemaining = budget?.days_remaining || 0;

      // 1. No income set — nothing else can be calculated without it
      if (income <= 0) {
        found.push({
          id: 'no-income',
          tone: 'info',
          title: 'Set your monthly income',
          message: 'Your daily allowance can’t be calculated until you set it.',
          to: '/expense'
        });
      }

      // 2. Over today's allowance
      const spentToday = (Array.isArray(todayLogs) ? todayLogs : [])
        .reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
      if (income > 0 && allowance > 0 && spentToday > allowance) {
        found.push({
          id: 'over-allowance',
          tone: 'warn',
          title: 'Over today’s allowance',
          message: `You’ve spent $${spentToday.toFixed(2)} of your $${allowance.toFixed(2)} today — tomorrow absorbs the difference.`,
          to: '/home'
        });
      }

      // 3. Budget running low — mirrors the ring gauge turning orange
      if (income > 0 && available / income < 0.2) {
        found.push({
          id: 'budget-low',
          tone: 'warn',
          title: 'Budget running low',
          message: `Only $${available.toFixed(2)} left to spend this month (${Math.max(0, Math.round((available / income) * 100))}% of income).`,
          to: '/expense'
        });
      }

      // 4. Month over-committed — bills, savings and spending add up to more
      // than income, so the pool is pinned at $0. New deposits over the pool
      // are rejected outright, so this mostly flags overspending or old data.
      const planned = parseFloat(budget?.total_planned) || 0;
      const savings = parseFloat(budget?.total_savings) || 0;
      const spent = parseFloat(budget?.spent_this_month) || 0;
      const overCommitted = planned + savings + spent - income;
      if (income > 0 && overCommitted > 0.005) {
        found.push({
          id: 'over-committed',
          tone: 'warn',
          title: 'Budget over-committed',
          message: `Bills, savings and spending total $${overCommitted.toFixed(2)} more than your income this month.`,
          to: '/expense'
        });
      }

      // 5. Unpaid bills as the month runs out
      const unpaidBills = (Array.isArray(budgetExpenses) ? budgetExpenses : [])
        .filter(e => e.expense_type === 'Monthly Bill' && !e.paid_at);
      if (unpaidBills.length > 0 && daysRemaining <= 7) {
        found.push({
          id: 'unpaid-bills',
          tone: 'warn',
          title: `${unpaidBills.length} unpaid ${unpaidBills.length === 1 ? 'bill' : 'bills'}`,
          message: `${daysRemaining} ${daysRemaining === 1 ? 'day' : 'days'} left this month — don’t forget to pay and tick them off.`,
          to: '/expense'
        });
      }

      // 6. Savings goals reached — one alert per goal, the happy kind
      (Array.isArray(goals) ? goals : [])
        .filter(g => parseFloat(g.target_amount) > 0 &&
                     parseFloat(g.current_amount) >= parseFloat(g.target_amount))
        .forEach(g => found.push({
          id: `goal-${g.goal_id}`,
          tone: 'good',
          title: 'Savings goal reached 🎉',
          message: `“${g.goal_name}” hit its $${parseFloat(g.target_amount).toFixed(2)} target.`,
          to: '/savings'
        }));

      setAlerts(found);
    }).catch(() => setAlerts([]));
  }, []);

  return alerts;
};

export default useAlerts;
