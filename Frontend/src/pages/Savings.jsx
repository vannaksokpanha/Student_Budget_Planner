import { useEffect, useState } from "react";
import { API } from '../utils/api';
import { useNavigate } from 'react-router-dom';
import GoalCard from "../components/GoalCard";
import NotificationBell from '../components/NotificationBell';
import { TbBeach, TbGlassFull, TbDeviceLaptop, TbDeviceMobile, TbFirstAidKit, TbX } from 'react-icons/tb';
import { LiaPiggyBankSolid } from 'react-icons/lia';

// Local JWT expiry check — same synchronous guard the other pages use, so the
// page paints immediately instead of blanking on an async round-trip
const isTokenValid = (token) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
};

const Savings = () => {
  const [loaded, setLoaded] = useState(false);
  const [goals, setGoals] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ goal_name: "", target_amount: "", target_date: "", current_amount: "" });
  const [formError, setFormError] = useState(null);
  const [goalToDelete, setGoalToDelete] = useState(null);
  const [updateModal, setUpdateModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [updateAction, setUpdateAction] = useState(null);
  const [updateAmount, setUpdateAmount] = useState('');
  const [updateError, setUpdateError] = useState(null);
  const [updating, setUpdating] = useState(false);
  const navigate = useNavigate();
  const userName = localStorage.getItem('userName') || 'there';

  // Synchronous auth guard, then load goals. Renders the page right away so the
  // header paints without a white flash; `loaded` gates only the content area.
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || !isTokenValid(token)) {
      navigate('/login', { replace: true });
      return;
    }
    fetch(`${API}/savings`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => (res.ok ? res.json() : []))
      .then(data => setGoals(Array.isArray(data) ? data : []))
      .catch(err => console.error('Failed to load savings goals:', err))
      .finally(() => setLoaded(true));
  }, [navigate]);

  // ----- FIX: define closestGoal so the hero section doesn't throw -----
  const closestGoal = goals.length > 0 ? goals[0] : null;

  const suggestions = [
    { label: 'Fun Vacation',    Icon: TbBeach },
    { label: 'Fancy Dinner',    Icon: TbGlassFull },
    { label: 'New Laptop',      Icon: TbDeviceLaptop },
    { label: 'New Phone',       Icon: TbDeviceMobile },
    { label: 'Emergency Fund',  Icon: TbFirstAidKit },
  ];

  const openModal = () => {
    setForm({ goal_name: "", target_amount: "", target_date: "", current_amount: "" });
    setFormError(null);
    setShowModal(true);
  };

  const openModalWithSuggestion = (goalName) => {
    setForm({ goal_name: goalName, target_amount: "", target_date: "", current_amount: "" });
    setFormError(null);
    setShowModal(true);
  };

  const closeModal = () => {
    if (submitting) return;
    setShowModal(false);
  };

  const handleFormChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleOpenUpdateModal = (goal, action) => {
    setSelectedGoal(goal);
    setUpdateAction(action);
    setUpdateAmount('');
    setUpdateError(null);
    setUpdateModal(true);
  };

  const handleUpdateGoal = async () => {
    if (!updateAmount || isNaN(updateAmount) || Number(updateAmount) <= 0)
      return setUpdateError('Please enter a valid amount.');

    // Catch over-withdrawing before it ever reaches the server
    if (updateAction === 'deduct' && Number(updateAmount) > Number(selectedGoal.current_amount))
      return setUpdateError(`You only have $${Number(selectedGoal.current_amount).toFixed(2)} saved in this goal.`);

    setUpdating(true);
    const token = localStorage.getItem('token');
    const amount = updateAction === 'deduct' ? -Number(updateAmount) : Number(updateAmount);

    try {
      const res = await fetch(`${API}/savings/${selectedGoal.goal_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount }),
      });

      if (res.ok) {
        const updatedGoal = await res.json();
        setGoals(prev => prev.map(g => g.goal_id === updatedGoal.goal_id ? updatedGoal : g));
        setUpdateModal(false);
      } else {
        const data = await res.json().catch(() => ({}));
        setUpdateError(data.error || 'Failed to update goal.');
      }
    } catch (err) {
      console.error('Update failed:', err);
      setUpdateError('Connection error. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const confirmDelete = (goalId) => {
    setGoalToDelete(goalId);
  };

  const handleDeleteGoal = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API}/savings/${goalToDelete}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setGoals(prev => prev.filter(g => g.goal_id !== goalToDelete));
        setGoalToDelete(null);
      } else {
        console.error('Failed to delete goal:', res.status);
      }
    } catch (err) {
      console.error('Delete request failed:', err);
    }
  };

  const handleAddGoal = async () => {
    if (!form.goal_name.trim()) return setFormError("Please enter a goal name.");
    if (!form.target_amount || isNaN(form.target_amount) || Number(form.target_amount) <= 0)
      return setFormError("Please enter a valid target amount.");
    if (form.current_amount && (isNaN(form.current_amount) || Number(form.current_amount) < 0))
      return setFormError("Current savings must be a positive number.");

    setFormError(null);
    setSubmitting(true);

    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API}/savings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          goal_name: form.goal_name.trim(),
          target_amount: Number(form.target_amount),
          target_date: form.target_date || null,
          current_amount: Number(form.current_amount) || 0,
        }),
      });

      if (res.ok) {
        const newGoal = await res.json();
        setGoals(prev => [...prev, newGoal]);
        setShowModal(false);
      } else {
        const data = await res.json().catch(() => ({}));
        setFormError(data.error || data.message || "Failed to create goal. Please try again.");
      }
    } catch (err) {
      console.error("Failed to add goal:", err);
      setFormError("Connection error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Hero headline: everything saved across all goals combined
  const totalSaved = goals.reduce((sum, g) => sum + Number(g.current_amount), 0);
  const totalTarget = goals.reduce((sum, g) => sum + Number(g.target_amount), 0);

  // What the hero's progress bar tracks: total saved against the summed
  // targets, capped at 100%, empty when there are no goals yet
  const heroPct =
    goals.length === 0 ? 0 : totalTarget > 0 ? Math.min((totalSaved / totalTarget) * 100, 100) : 100;

  return (
    <div className="min-h-screen bg-brand-white pb-24 md:pb-6">

      {/* Header */}
      <div
        className="relative px-5 md:px-8 pt-12 md:pt-10 pb-10 min-h-45 bg-brand-base"
        style={{ backgroundImage: 'linear-gradient(to bottom, rgba(0, 92, 255, 0.3), rgba(245, 245, 245, 0.3))' }}
      >
        <div className="absolute top-12 right-5 md:right-8 flex items-center gap-3">
          <div className="h-12 flex flex-col justify-center text-right">
            <p className="text-white/60 text-xs font-causten font-bold uppercase tracking-widest leading-none mb-1">Active Goals</p>
            <p className="text-white text-xl font-causten font-extrabold leading-none">{goals.length}</p>
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

        <div className="mb-6 md:mb-8 md:flex md:justify-between md:items-end pr-40">
          <div>
            <p className="text-white/60 text-base font-causten">Hi, {userName}</p>
            <h1 className="text-white text-3xl md:text-4xl font-causten font-extrabold tracking-tight">Savings</h1>
          </div>
          <button
            onClick={openModal}
            className="hidden md:inline-flex items-center gap-2 mt-4 px-6 py-2.5 rounded-xl bg-white/20 text-white
                       font-causten font-bold text-sm hover:bg-white/30 transition-colors shrink-0"
          >
            + New Goal
          </button>
        </div>

        {/* Next-goal hero */}
        <div className="relative bg-white/15 rounded-2xl px-4 md:px-6 pt-9 pb-11 text-center md:max-w-xl md:mx-auto">
          {closestGoal ? (
            <>
              <p className="text-white/60 text-lg font-causten font-bold uppercase tracking-wide mb-2">
                Total saved · {goals.length} {goals.length === 1 ? 'goal' : 'goals'}
              </p>
              <p className="text-white text-5xl font-causten font-extrabold tracking-tight">
                ${totalSaved.toFixed(2)}
              </p>
              {totalTarget > 0 && (
                <p className="text-white/60 text-sm font-causten mt-2">
                  of ${totalTarget.toFixed(2)} · {Math.round((totalSaved / totalTarget) * 100)}%
                </p>
              )}
            </>
          ) : (
            <>
              <p className="text-white/60 text-lg font-causten font-bold uppercase tracking-wide mb-2">No goals yet</p>
              <p className="text-white text-3xl font-causten font-extrabold tracking-tight">Save for something</p>
              <p className="text-white/60 text-sm font-causten mt-2">Tap + to create your first goal</p>
            </>
          )}
          <div className="absolute left-4 right-4 bottom-4 h-1.5 rounded-full bg-white/20 overflow-hidden">
            <div
              className="h-full rounded-full bg-brand-light-pink transition-all duration-500"
              style={{ width: `${heroPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* White sheet — rounded top corners rise over the header color */}
      <div className="relative z-10 -mt-6 md:-mt-4 bg-brand-white rounded-t-3xl pt-1">

      {/* Suggestions Section */}
      <section className="mx-5 md:mx-8 mt-6">
        <p className="font-causten font-bold text-brand-dark-violet text-xl mb-2">
          People often save for
        </p>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide md:grid md:grid-cols-5 md:overflow-visible">
          {suggestions.map((s) => (
            <button
              key={s.label}
              onClick={() => openModalWithSuggestion(s.label)}
              className="shrink-0 md:shrink bg-white rounded-xl shadow-sm hover:bg-brand-dark-violet hover:shadow-md transition-all group px-4 py-3 flex flex-col items-center gap-1.5 min-w-24 md:min-w-0 active:scale-95"
            >
              <s.Icon className="w-8 h-8 text-brand-dark-violet" />
              <span className="text-[10px] font-causten font-bold text-brand-dark-violet text-center uppercase leading-tight">
                {s.label}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Goals Section */}
      <section className="mx-5 md:mx-8 mt-6">
        <div className="flex justify-between items-center mb-3">
          <p className="font-causten font-bold text-brand-dark-violet text-xl">Your Goals</p>
          {goals.length > 0 && (
            <p className="text-xs text-brand-dark-violet/60">{goals.length} active</p>
          )}
        </div>

        <div className="flex flex-col md:grid md:grid-cols-2 gap-4">
          {goals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 gap-4 md:col-span-2">
              <div className="bg-brand-light-pink rounded-full p-6">
                <LiaPiggyBankSolid className="w-16 h-16 text-brand-dark-violet" />
              </div>
              <div className="text-center">
                <p className="text-brand-dark-violet font-causten font-bold text-base">No goals yet</p>
                <p className="text-gray-300 text-xs mt-1">Click "New Goal" to start saving toward something</p>
              </div>
            </div>
          ) : (
            goals.map((item, i) => (
              <GoalCard
                key={item.goal_id}
                goal={item}
                index={i}
                onOpenModal={handleOpenUpdateModal}
                onDelete={confirmDelete}
              />
            ))
          )}
        </div>
      </section>

      </div>

      {/* Floating + Button — mobile only */}
      <button
        onClick={openModal}
        className="md:hidden fixed bottom-18 left-1/2 -translate-x-1/2 z-50
                   w-14 h-14 rounded-full bg-brand-dark-violet text-white text-3xl
                   flex items-center justify-center shadow-xl
                   hover:scale-110 active:scale-95 transition-transform duration-200"
        aria-label="Add new savings goal"
      >
        +
      </button>

      {/* Add / Deduct Savings Modal */}
      {updateModal && selectedGoal && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white md:rounded-2xl rounded-t-3xl shadow-2xl overflow-hidden">

            {/* Coloured header */}
            <div className="bg-brand-dark-violet px-6 pt-6 pb-8">
              <div className="w-10 h-1 rounded-full bg-white/30 mx-auto md:hidden mb-4" />
              <p className="text-white/60 text-xs font-causten font-semibold uppercase tracking-widest mb-1">
                {updateAction === 'add' ? 'Adding to' : 'Deducting from'}
              </p>
              <button onClick={() => !updating && setUpdateModal(false)}>
                <TbX className="w-5 h-5 text-brand-dark-violet/60" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Where the goal stands: saved / target over its progress bar */}
              <div>
                <div className="flex justify-between items-baseline mb-1">
                  <p className="text-xs text-brand-dark-violet/80 uppercase tracking-wider">Saved so far</p>
                  <p className="text-xs text-brand-dark-violet/80 uppercase tracking-wider">Target</p>
                </div>
                <div className="flex justify-between items-baseline mb-2">
                  <p className="font-causten font-bold text-brand-dark-violet">
                    ${Number(selectedGoal.current_amount).toFixed(2)}
                  </p>
                  <p className="font-causten font-bold text-brand-dark-violet">
                    ${Number(selectedGoal.target_amount).toFixed(2)}
                  </p>
                </div>
                <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-brand-base transition-all duration-500"
                    style={{
                      width: `${Math.min((Number(selectedGoal.current_amount) / Number(selectedGoal.target_amount)) * 100, 100)}%`
                    }}
                  />
                </div>
              </div>

              <div>
                <p className="text-sm text-brand-dark-violet/80 uppercase tracking-wider mb-1">Amount</p>
                <div className="flex items-center gap-1 border-b border-gray-100 pb-2">
                  <span className="text-2xl font-causten font-bold text-brand-dark-violet">$</span>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={updateAmount}
                    onChange={e => setUpdateAmount(e.target.value)}
                    placeholder="0.00"
                    min="0"
                    className="flex-1 text-2xl font-causten font-bold text-brand-dark-violet border-none outline-none bg-transparent placeholder-brand-dark-violet/30"
                  />
                </div>
                <p className="text-xs text-brand-dark-violet/45 font-causten mt-1.5">
                  {updateAction === 'add'
                    ? "Comes out of this month's budget — your allowance will adjust."
                    : "Goes back into this month's budget."}
                </p>
              </div>
            </div>

            {updateError && (
              <p className="mt-4 text-sm text-red-400 font-causten text-center">{updateError}</p>
            )}
            <button
              onClick={handleUpdateGoal}
              disabled={updating || !updateAmount}
              className="w-full mt-4 py-3 rounded-xl bg-brand-dark-violet text-white font-causten font-bold hover:bg-brand-base hover:-translate-y-0.5 hover:shadow-md active:scale-95 transition-all duration-150 disabled:opacity-20 flex items-center justify-center gap-2"
            >
              {updating ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                updateAction === 'add' ? 'Add to savings' : 'Withdraw'
              )}
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {goalToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-[80%] max-w-sm bg-white rounded-2xl px-6 py-8 shadow-2xl flex flex-col gap-3">
            <h2 className="font-causten font-bold text-brand-dark-violet text-xl">Delete Goal?</h2>
            <p className="text-sm text-brand-dark-violet/75 font-causten">This will permanently remove the goal from your savings.</p>
            <div className="flex gap-3 mt-2">
              <button
                onClick={() => setGoalToDelete(null)}
                className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-brand-dark-violet/75 font-causten font-bold hover:border-brand-dark-violet hover:-translate-y-0.5 hover:shadow-md active:scale-95 transition-all duration-150"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteGoal}
                className="flex-1 py-3 rounded-xl bg-red-500 text-white font-causten font-bold hover:bg-red-600 hover:-translate-y-0.5 hover:shadow-md active:scale-95 transition-all duration-150"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Goal Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={closeModal}
        >
          <div
            className="w-full max-w-md bg-white md:rounded-2xl rounded-t-3xl px-6 pt-6 pb-10 shadow-2xl
                        animate-slide-up"
            onClick={e => e.stopPropagation()}
          >
            {/* Drag handle — hidden on desktop */}
            <div className="w-10 h-1 rounded-full bg-gray-300 mx-auto md:hidden mb-5" />

            <h2 className="font-causten font-bold text-brand-dark-violet text-2xl mb-6">
              NEW SAVINGS GOAL
            </h2>

            <div className="flex flex-col gap-4">
              {/* Goal Name */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-brand-dark-violet/75 uppercase tracking-widest">
                  Goal Name
                </label>
                <input
                  type="text"
                  name="goal_name"
                  value={form.goal_name}
                  onChange={handleFormChange}
                  placeholder="e.g. New Laptop, Emergency Fund"
                  className="border-2 border-gray-200 rounded-xl px-4 py-3 text-brand-dark-violet
                             font-causten focus:outline-none focus:border-brand-dark-violet transition-colors"
                />
              </div>

              {/* Target Amount */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-brand-dark-violet/75 uppercase tracking-widest">
                  Target Amount ($)
                </label>
                <input
                  type="number"
                  name="target_amount"
                  value={form.target_amount}
                  onChange={handleFormChange}
                  placeholder="0.00"
                  min="0"
                  className="border-2 border-gray-200 rounded-xl px-4 py-3 text-brand-dark-violet
                             font-causten focus:outline-none focus:border-brand-dark-violet transition-colors"
                />
              </div>

              {/* Current Savings */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-brand-dark-violet/75 uppercase tracking-widest">
                  Current Savings ($) <span className="normal-case text-brand-dark-violet/60 font-normal">(optional)</span>
                </label>
                <input
                  type="number"
                  name="current_amount"
                  value={form.current_amount}
                  onChange={handleFormChange}
                  placeholder="0.00"
                  min="0"
                  className="border-2 border-gray-200 rounded-xl px-4 py-3 text-brand-dark-violet
                             font-causten focus:outline-none focus:border-brand-dark-violet transition-colors"
                />
              </div>

              {/* Target Date */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-brand-dark-violet/75 uppercase tracking-widest">
                  Target Date <span className="normal-case text-brand-dark-violet/60 font-normal">(optional)</span>
                </label>
                <input
                  type="date"
                  name="target_date"
                  value={form.target_date}
                  onChange={handleFormChange}
                  className="border-2 border-gray-200 rounded-xl px-4 py-3 text-brand-dark-violet
                             font-causten focus:outline-none focus:border-brand-dark-violet transition-colors"
                />
              </div>

              {/* Error message */}
              {formError && (
                <p className="text-red-500 text-sm font-causten">{formError}</p>
              )}

              {/* Actions */}
              <div className="flex gap-3 mt-2">
                <button
                  onClick={closeModal}
                  disabled={submitting}
                  className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-brand-dark-violet/75
                             font-causten font-bold hover:border-brand-dark-violet hover:-translate-y-0.5 hover:shadow-md active:scale-95 transition-all duration-150 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddGoal}
                  disabled={submitting}
                  className="flex-1 py-3 rounded-xl bg-brand-dark-violet text-white
                             font-causten font-bold hover:bg-brand-base hover:-translate-y-0.5 hover:shadow-md active:scale-95 transition-all duration-150
                             disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Goal"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Savings;