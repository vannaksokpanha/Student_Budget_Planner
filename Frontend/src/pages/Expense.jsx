import { useEffect, useState, useRef } from "react";
import { useNavigate } from 'react-router-dom';

const catIcons = {
  'Rental Fee': { icon: 'fa-home', bg: '#4A5CFF' },
  'Groceries': { icon: 'fa-shopping-basket', bg: '#10b981' },
  'Food & Drink': { icon: 'fa-utensils', bg: '#f59e0b' },
  'Bills': { icon: 'fa-file-invoice', bg: '#ef4444' },
  'Transportation': { icon: 'fa-car', bg: '#8b5cf6' },
  'Other': { icon: 'fa-ellipsis-h', bg: '#6b7280' }
};

const months = ['JANUARY','FEBRUARY','MARCH','APRIL','MAY','JUNE','JULY','AUGUST','SEPTEMBER','OCTOBER','NOVEMBER','DECEMBER'];

const Expense = () => {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const [tab, setTab] = useState('monthly');
  const [showForm, setShowForm] = useState(false);
  const [expenses, setExpenses] = useState(() => JSON.parse(localStorage.getItem('expenses')) || []);
  const [resultVisible, setResultVisible] = useState(false);

  const dateRef = useRef(null);

  const [form, setForm] = useState({
    category: 'Rental Fee',
    price: '',
    note: '',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    const verify = async () => {
      const token = localStorage.getItem('token')
      if (!token) {
        return navigate("/login", { replace: true });
      }
      try {
        const res = await fetch("http://localhost:3000/api/home/home", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: 'no-store'
        })
        if (!res.ok) {
          setError('Unauthorized access. Please log in again.');

          return;
        }
        setReady(true)
      }
      catch {
        navigate("/login", { replace: true })
      }
    }
    verify();
  }, [navigate])

  useEffect(() => {
    localStorage.setItem('expenses', JSON.stringify(expenses));
  }, [expenses]);

  const setCurrentMonth = () => {
    const d = new Date();
    return `${months[d.getMonth()]}, ${d.getFullYear()}`;
  };

  const handleAddExpense = () => {
    const price = parseFloat(form.price);
    if (!price || price <= 0) {
      alert('Please enter a valid price.');
      return;
    }

    const expense = {
      category: form.category,
      price,
      note: form.note.trim(),
      date: form.date,
      id: Date.now()
    };

    setExpenses(prev => [...prev, expense]);
    setForm({ category: 'Rental Fee', price: '', note: '', date: new Date().toISOString().split('T')[0] });
    setShowForm(false);
    setResultVisible(false);
  };

  const deleteExpense = (id) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
    setResultVisible(false);
  };

  const calculateTotal = () => {
    setResultVisible(true);
  };

  const resetForm = () => {
    setForm({ category: 'Rental Fee', price: '', note: '', date: new Date().toISOString().split('T')[0] });
  };

  const totalMonthly = expenses.reduce((sum, e) => sum + e.price, 0);

  const grouped = {};
  expenses.forEach(e => {
    if (!grouped[e.category]) grouped[e.category] = { count: 0, total: 0, note: '' };
    grouped[e.category].count += 1;
    grouped[e.category].total += e.price;
    grouped[e.category].note = e.note || '-';
  });

  let grandTotal = 0;
  Object.values(grouped).forEach(d => { grandTotal += d.total; });

  const startBudget = 10.00;
  const endBudget = Math.max(0, startBudget - totalMonthly);

  if (error) return <div className="min-h-screen flex items-center justify-center"><h1 className="text-2xl font-bold">{error}</h1></div>;
  if (!ready) return null;

  return (
    <div className="font-sans bg-blue-50 min-h-screen flex justify-center items-start py-5 pb-22.5 md:py-10 md:px-5 md:bg-[#eef0ff]">
      <div className="app w-full mx-auto relative max-w107.5 md:max-w-120">
        {/* Header */}
        <div className="header bg-linear-to-br from-[#4A5CFF] to-[#6A7BFF] px-6 pt-5 pb-15 rounded-b-[28px] relative flex items-center justify-center">
          <div className="back-btn absolute left-5 top-1/2 -translate-y-1/2 text-white text-xl cursor-pointer p-1.5rounded-full hover:bg-white/15 transition-all duration-300" onClick={() => navigate('/home')}>
            <i className="fas fa-arrow-left"></i>
          </div>
          <h1 className="text-white text-[22px] font-bold tracking-[1.2px] max-[380px]:text-lg">EXPENSES</h1>
        </div>

        {/* Toggle Pills */}
        <div className="toggle-wrap flex justify-center -mt-7 relative z-2">
          <div className="toggle-pills flex bg-white/90 backdrop-blur-2.5py-2.5 rounded-[50px] p-1.25 shadow-[0_4px_20px_rgba(74,92,255,0.12)] gap-1">
            <button
              className={`pill px-7 py-2.5 rounded-[50px] cursor-pointer text-sm font-semibold transition-all duration-300 max-[380px]:px-[18px] max-[380px]:py-2 max-[380px]:text-xs ${tab === 'monthly' ? 'bg-[#2A3BCC] text-white shadow-[0_4px_12px_rgba(42,59,204,0.3)]' : 'bg-transparent text-gray-500'}`}
              onClick={() => setTab('monthly')}
            >Monthly Expenses</button>
            <button
              className={`pill px-7 py-2.5 rounded-[50px] cursor-pointer text-sm font-semibold transition-all duration-300 max-[380px]:px-[18px] max-[380px]:py-2 max-[380px]:text-xs ${tab === 'daily' ? 'bg-[#2A3BCC] text-white shadow-[0_4px_12px_rgba(42,59,204,0.3)]' : 'bg-transparent text-gray-500'}`}
              onClick={() => setTab('daily')}
            >Daily Expenses</button>
          </div>
        </div>

        {/* Content */}
        <div className="content px-4 py-5">
          {/* Savings Card */}
          <div className="savings-card bg-gradient-to-br from-[#fce4ec] to-[#f3e5f5] rounded-[18px] px-6 py-5 max-[380px]:p-4 flex items-center justify-between shadow-[0_2px_10px_rgba(0,0,0,0.06)] mb-5">
            <div className="flex items-center gap-3.5">
              <div className="w-[50px] h-[50px] bg-white/70 rounded-full flex items-center justify-center text-[22px] text-[#2A3BCC]">
                <i className="fas fa-piggy-bank"></i>
              </div>
              <div className="info">
                <h3 className="text-[11px] text-gray-500 tracking-[1px] font-bold">SEE WHERE YOUR MONEY GOES!</h3>
                <div className="amount text-[22px] font-extrabold text-gray-900 mt-0.5 max-[380px]:text-lg">$25 <small className="text-sm font-semibold text-gray-500">/ 10%</small></div>
              </div>
            </div>
            <div className="badge bg-white px-4 py-2 rounded-[50px] text-sm font-bold text-[#2A3BCC] shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
              <i className="fas fa-chevron-right"></i>
            </div>
          </div>

          {/* Monthly Content */}
          {tab === 'monthly' && (
            <div id="monthlyContent">
              {!showForm ? (
                <div id="expenseListView">
                  <div className="text-center mb-[18px]">
                    <button
                      className="add-expense-btn bg-gradient-to-br from-[#4A5CFF] to-[#6A7BFF] text-white px-8 py-3.5 rounded-[50px] text-[15px] font-semibold cursor-pointer shadow-[0_6px_20px_rgba(74,92,255,0.3)] hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(74,92,255,0.35)] active:translate-y-0 inline-flex items-center gap-2.5py-2.5 transition-all duration-300"
                      onClick={() => setShowForm(true)}
                    >
                      <i className="fas fa-plus"></i> Add your monthly expense
                    </button>
                  </div>

                  <div className="expense-list flex flex-col gap-2.5py-2.5 mb-[18px]" id="expenseList">
                    {expenses.length === 0 ? (
                      <div className="text-center text-gray-400 px-5 py-[30px]">
                        <i className="fas fa-receipt text-4xl opacity-40 mb-3 block"></i>
                        <p className="text-sm">No expenses yet. Add your first one!</p>
                      </div>
                    ) : (
                      expenses.map(e => {
                        const ci = catIcons[e.category] || catIcons['Other'];
                        return (
                          <div key={e.id} className="expense-item bg-white rounded-[12px] px-[18px] py-3.5 flex items-center gap-3.5 shadow-[0_2px_10px_rgba(0,0,0,0.06)] transition-all duration-300 animate-slide-in">
                            <div className="w-10 h-10 rounded-[12px] flex items-center justify-center text-base text-white shrink-0" style={{ background: ci.bg }}>
                              <i className={`fas ${ci.icon}`}></i>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-semibold text-gray-900">{e.category}</div>
                              <div className="text-xs text-gray-400 mt-0.5 truncate">{e.note || 'No note'}</div>
                            </div>
                            <div className="text-base font-bold text-gray-900 whitespace-nowrap">${e.price.toFixed(2)}</div>
                            <button
                              className="w-[30px] h-[30px] rounded-full bg-red-100 text-red-500 cursor-pointer text-xs flex items-center justify-center transition-all duration-300 shrink-0 hover:bg-red-500 hover:text-white border-none"
                              onClick={() => deleteExpense(e.id)}
                            >
                              <i className="fas fa-times"></i>
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>

                  <button
                    className="calc-btn w-full py-4 bg-gradient-to-br from-[#4A5CFF] to-[#6A7BFF] text-white rounded-[50px] text-base font-bold cursor-pointer shadow-[0_6px_20px_rgba(74,92,255,0.25)] hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(74,92,255,0.35)] transition-all duration-300 tracking-[0.5px] mb-3.5"
                    onClick={calculateTotal}
                  >
                    <i className="fas fa-calculator"></i> CALCULATE
                  </button>

                  <div className={`${resultVisible ? 'flex' : 'hidden'} bg-white rounded-[12px] px-5 py-4 items-center gap-3 shadow-[0_2px_10px_rgba(0,0,0,0.06)] mb-5`} id="resultMsg">
                    <div className="check w-9 h-9 rounded-full bg-emerald-100 text-emerald-500 flex items-center justify-center text-base shrink-0"><i className="fas fa-check"></i></div>
                    <p className="text-[13px] text-gray-500 leading-relaxed">The expense was successfully calculated and meets your remaining budget for daily spending.</p>
                  </div>

                  <div className="monthly-summary bg-white rounded-[18px] p-5 shadow-[0_2px_10px_rgba(0,0,0,0.06)]">
                    <div className="head flex justify-between items-center mb-3.5">
                      <h4 className="text-[13px] text-gray-500 font-semibold tracking-[0.5px]"><i className="fas fa-calendar-alt"></i> YOUR MONTHLY EXPENSES</h4>
                      <span className="month text-sm font-bold text-[#2A3BCC] bg-[#eef0ff] px-3.5 py-1 rounded-[50px]" id="currentMonth">{setCurrentMonth()}</span>
                    </div>
                    <div className="total-amount text-[32px] font-extrabold text-gray-900">
                      <span className="currency text-xl">$</span><span id="monthlyTotalDisplay">{totalMonthly.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div id="addExpenseView">
                  <div className="form-card bg-white rounded-[18px] px-5 py-6 shadow-[0_2px_10px_rgba(0,0,0,0.06)] mb-5">
                    <h2 className="text-lg font-bold text-gray-900 mb-5 text-center"><i className="fas fa-plus-circle"></i> Add New Expense</h2>

                    <div className="mb-4">
                      <label className="block text-[13px] font-semibold text-gray-500 mb-[6px]"><i className="fas fa-tag"></i> Category</label>
                      <select
                        className="w-full px-3.5 py-3 border-2 border-gray-200 rounded-[12px] text-sm font-[inherit] focus:border-[#4A5CFF] bg-[#fafbff] outline-none transition-all duration-300"
                        value={form.category}
                        onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                      >
                        <option value="Rental Fee">Rental Fee</option>
                        <option value="Groceries">Groceries</option>
                        <option value="Food & Drink">Food & Drink</option>
                        <option value="Bills">Bills</option>
                        <option value="Transportation">Transportation</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div className="mb-4">
                      <label className="block text-[13px] font-semibold text-gray-500 mb-[6px]"><i className="fas fa-dollar-sign"></i> Price</label>
                      <input
                        type="number"
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        className="w-full px-3.5 py-3 border-2 border-gray-200 rounded-[12px] text-sm font-[inherit] focus:border-[#4A5CFF] bg-[#fafbff] outline-none transition-all duration-300"
                        value={form.price}
                        onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                      />
                    </div>

                    <div className="mb-4">
                      <label className="block text-[13px] font-semibold text-gray-500 mb-[6px]"><i className="fas fa-pen"></i> Your Note</label>
                      <textarea
                        placeholder="Optional note..."
                        className="w-full px-3.5 py-3 border-2 border-gray-200 rounded-[12px] text-sm font-[inherit] focus:border-[#4A5CFF] bg-[#fafbff] outline-none transition-all duration-300 resize-y min-h-[60px]"
                        value={form.note}
                        onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
                      ></textarea>
                    </div>

                    <div className="mb-4">
                      <label className="block text-[13px] font-semibold text-gray-500 mb-[6px]"><i className="fas fa-calendar"></i> Date</label>
                      <input
                        type="date"
                        className="w-full px-3.5 py-3 border-2 border-gray-200 rounded-[12px] text-sm font-[inherit] focus:border-[#4A5CFF] bg-[#fafbff] outline-none transition-all duration-300"
                        value={form.date}
                        ref={dateRef}
                        onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                      />
                    </div>

                    <div className="flex gap-3 mt-2">
                      <button className="flex-1 py-3.5 rounded-[12px] text-[15px] font-semibold cursor-pointer transition-all duration-300 bg-gray-100 text-gray-500 hover:bg-gray-200" onClick={resetForm}><i className="fas fa-undo"></i> Reset</button>
                      <button className="flex-1 py-3.5 rounded-[12px] text-[15px] font-semibold cursor-pointer transition-all duration-300 bg-gradient-to-br from-[#4A5CFF] to-[#6A7BFF] text-white shadow-[0_4px_14px_rgba(74,92,255,0.25)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(74,92,255,0.35)]" onClick={handleAddExpense}><i className="fas fa-check"></i> Add Expense</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Daily Content */}
          {tab === 'daily' && (
            <div id="dailyContent">
              <div className="budget-cards grid grid-cols-2 gap-3 mb-5">
                <div className="budget-card bg-white rounded-[12px] p-4 shadow-[0_2px_10px_rgba(0,0,0,0.06)] text-center">
                  <div className="label text-xs text-gray-400 font-semibold tracking-[0.3px]">START TODAY</div>
                  <div className="value text-[22px] font-extrabold text-[#4A5CFF] mt-[6px]" id="startToday">${startBudget.toFixed(2)}</div>
                </div>
                <div className="budget-card bg-white rounded-[12px] p-4 shadow-[0_2px_10px_rgba(0,0,0,0.06)] text-center">
                  <div className="label text-xs text-gray-400 font-semibold tracking-[0.3px]">END TODAY</div>
                  <div className="value text-[22px] font-extrabold text-red-500 mt-[6px]" id="endToday">${endBudget.toFixed(2)}</div>
                </div>
              </div>

              <div className="summary-table-wrap bg-white rounded-[18px] overflow-hidden shadow-[0_2px_10px_rgba(0,0,0,0.06)] mb-5">
                <h4 className="px-5 pt-4 text-sm text-gray-500 font-semibold tracking-[0.5px]"><i className="fas fa-table"></i> EXPENSE SUMMARY</h4>
                <table className="summary-table w-full border-collapse text-[13px]">
                  <thead>
                    <tr>
                      <th className="px-3.5 py-3 text-left font-semibold text-gray-400 text-[11px] uppercase tracking-[0.5px] border-b-2 border-gray-100">Category</th>
                      <th className="px-3.5 py-3 text-left font-semibold text-gray-400 text-[11px] uppercase tracking-[0.5px] border-b-2 border-gray-100">Note</th>
                      <th className="px-3.5 py-3 text-left font-semibold text-gray-400 text-[11px] uppercase tracking-[0.5px] border-b-2 border-gray-100">Qty</th>
                      <th className="px-3.5 py-3 text-left font-semibold text-gray-400 text-[11px] uppercase tracking-[0.5px] border-b-2 border-gray-100">Amount</th>
                    </tr>
                  </thead>
                  <tbody id="summaryTableBody">
                    {expenses.length === 0 ? (
                      <tr><td colSpan="4" className="text-center text-gray-400 p-5">No expenses recorded</td></tr>
                    ) : (
                      Object.entries(grouped).map(([cat, data]) => (
                        <tr key={cat}>
                          <td className="px-3.5 py-3 text-gray-900 border-b border-gray-50">{cat}</td>
                          <td className="px-3.5 py-3 text-gray-900 border-b border-gray-50">{data.note}</td>
                          <td className="px-3.5 py-3 text-gray-900 border-b border-gray-50">{data.count}</td>
                          <td className="px-3.5 py-3 text-gray-900 border-b border-gray-50">${data.total.toFixed(2)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
                <div className="px-5 py-3.5 border-t-2 border-[#f3f4f6] flex justify-between items-center">
                  <span className="font-bold text-gray-900 text-sm">TOTAL AMOUNT</span>
                  <span className="font-extrabold text-[#4A5CFF] text-xl" id="totalAmountDisplay">${grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Navigation */}
        <div className="bottom-nav fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white flex justify-around py-2.5 pb-3.5 rounded-t-[24px] shadow-[0_-4px_20px_rgba(0,0,0,0.08)] z-[100] md:max-w-[480px]">
          <a className="nav-item flex flex-col items-center gap-1 cursor-pointer text-gray-400 text-2.5py-2.5 font-semibold transition-all duration-300 no-underline px-3 py-1 border-none bg-transparent hover:text-[#4A5CFF]" onClick={() => navigate('/home')}>
            <i className="fas fa-home text-lg"></i>
            <span>Home</span>
          </a>
          <a className="nav-item flex flex-col items-center gap-1 cursor-pointer text-[#4A5CFF] text-2.5py-2.5 font-semibold transition-all duration-300 no-underline px-3 py-1 border-none bg-transparent">
            <i className="fas fa-credit-card text-lg"></i>
            <span>Expenses</span>
          </a>
          <a className="nav-item flex flex-col items-center gap-1 cursor-pointer text-gray-400 text-2.5py-2.5 font-semibold transition-all duration-300 no-underline px-3 py-1 border-none bg-transparent hover:text-[#4A5CFF]" onClick={() => navigate('/savings')}>
            <i className="fas fa-piggy-bank text-lg"></i>
            <span>Savings</span>
          </a>
          <a className="nav-item flex flex-col items-center gap-1 cursor-pointer text-gray-400 text-2.5py-2.5 font-semibold transition-all duration-300 no-underline px-3 py-1 border-none bg-transparent hover:text-[#4A5CFF]" onClick={() => navigate('/summary')}>
            <i className="fas fa-chart-pie text-lg"></i>
            <span>Summary</span>
          </a>
          <a className="nav-item flex flex-col items-center gap-1 cursor-pointer text-gray-400 text-2.5py-2.5 font-semibold transition-all duration-300 no-underline px-3 py-1 border-none bg-transparent hover:text-[#4A5CFF]" onClick={() => navigate('/profile')}>
            <i className="fas fa-user text-lg"></i>
            <span>Profile</span>
          </a>
        </div>
      </div>
    </div>
  )
}

export default Expense;
