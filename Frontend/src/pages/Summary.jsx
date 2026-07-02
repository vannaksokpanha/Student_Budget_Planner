import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

const PIE_COLORS = ['#6367FF', '#454790', '#005CFF', '#FFDBFD', '#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3'];

const isTokenValid = (token) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
};

const Summary = () => {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || !isTokenValid(token)) {
      return navigate("/login", { replace: true });
    }
    const init = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/home/home", {
          headers: { Authorization: `Bearer ${token}` },
          cache: 'no-store'
        });
        if (!res.ok) {
          setError('Unauthorized');
          return;
        }
        const expRes = await fetch("http://localhost:3000/api/expenses", {
          headers: { Authorization: `Bearer ${token}` },
          cache: 'no-store'
        });
        if (expRes.ok) {
          const data = await expRes.json();
          setExpenses(data);
        }
        setReady(true);
      } catch {
        navigate("/login", { replace: true });
      }
    };
    init();
  }, [navigate]);

  const incomeData = (() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const incomeRecords = [];
    const baseIncome = 80;
    let runningTotal = 0;
    for (let d = 1; d <= daysInMonth; d++) {
      const dailyDelta = baseIncome + ((d * 7) % 21);
      runningTotal += dailyDelta;
      incomeRecords.push({
        day: d,
        income: Math.round(runningTotal * 100) / 100,
      });
    }
    return incomeRecords;
  })();

  const outcomeData = (() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const dailyTotals = {};
    for (let d = 1; d <= daysInMonth; d++) {
      dailyTotals[d] = 0;
    }
    expenses.forEach(e => {
      if (e.expense_date) {
        const d = new Date(e.expense_date);
        if (d.getMonth() === month && d.getFullYear() === year) {
          dailyTotals[d.getDate()] = (dailyTotals[d.getDate()] || 0) + parseFloat(e.amount);
        }
      }
    });
    let runningTotal = 0;
    const result = [];
    for (let d = 1; d <= daysInMonth; d++) {
      runningTotal += dailyTotals[d] || 0;
      result.push({
        day: d,
        outcome: runningTotal,
      });
    }
    return result;
  })();

  const pieData = (() => {
    const byCategory = {};
    expenses.forEach(e => {
      const cat = e.category || 'Uncategorized';
      byCategory[cat] = (byCategory[cat] || 0) + parseFloat(e.amount);
    });
    if (Object.keys(byCategory).length === 0) {
      return [
        { name: 'Food & Drink', value: 320 },
        { name: 'Transportation', value: 150 },
        { name: 'Groceries', value: 280 },
        { name: 'Bills', value: 200 },
        { name: 'Rental Fee', value: 500 },
        { name: 'Other', value: 100 },
      ];
    }
    return Object.entries(byCategory).map(([name, value]) => ({ name, value }));
  })();

  const totalIncome = incomeData.length > 0 ? incomeData[incomeData.length - 1].income : 0;
  const totalOutcome = outcomeData.length > 0 ? outcomeData[outcomeData.length - 1].outcome : 0;

  if (error) return <div className="min-h-screen flex items-center justify-center"><h1 className="text-2xl font-bold">{error}</h1></div>;
  if (!ready) return null;

  return (
    <div className="min-h-screen bg-brand-white pb-24">
      <div
        className="px-5 pt-12 pb-10 bg-brand-base"
        style={{ backgroundImage: 'linear-gradient(to bottom, rgba(0, 92, 255, 0.3), rgba(245, 245, 245, 0.3))' }}
      >
        <p className="text-white/60 text-sm font-causten">Your</p>
        <h1 className="text-white text-3xl font-causten font-extrabold tracking-tight">Summary</h1>
      </div>

      <div className="mx-4 space-y-4 -mt-5">
        <div className="bg-white rounded-2xl shadow-lg px-5 py-5">
          <p className="text-xs font-causten font-bold text-gray-400 uppercase tracking-widest mb-1">Total Balance</p>
          <p className="text-4xl font-causten font-extrabold text-brand-dark-violet">
            ${(totalIncome - totalOutcome).toFixed(2)}
          </p>
          <div className="flex gap-4 mt-1">
            <p className="text-xs text-emerald-500 font-semibold">
              Income: ${totalIncome.toFixed(2)}
            </p>
            <p className="text-xs text-red-400 font-semibold">
              Outcome: ${totalOutcome.toFixed(2)}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg px-5 py-5">
          <p className="text-xs font-causten font-bold text-gray-400 uppercase tracking-widest mb-4">Income</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={incomeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#aaa' }} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#aaa' }} tickLine={false} axisLine={false} />
              <Tooltip />
              <Line type="monotone" dataKey="income" stroke="#6367FF" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl shadow-lg px-5 py-5">
          <p className="text-xs font-causten font-bold text-gray-400 uppercase tracking-widest mb-4">Outcome</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={outcomeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#aaa' }} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#aaa' }} tickLine={false} axisLine={false} />
              <Tooltip />
              <Line type="monotone" dataKey="outcome" stroke="#FF6B6B" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl shadow-lg px-5 py-5">
          <p className="text-xs font-causten font-bold text-gray-400 uppercase tracking-widest mb-4">Spending by Category</p>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                innerRadius={40}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {pieData.map((_, i) => (
                  <Cell key={`cell-${i}`} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Summary;
