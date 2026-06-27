import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar'
import GoalCard from "../components/GoalCard";
import { MdBeachAccess, MdWineBar, MdLaptopMac, MdPhoneAndroid } from 'react-icons/md';
import { RiFirstAidKitLine } from 'react-icons/ri';

const Savings = () => {
  const [ready, setReady] = useState();
  const [error, setError] = useState(null);
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

  // EFFECT 1: Auth Guard
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
          setError('Unauthorized');
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

  // EFFECT 2: Data Retrieval Guard (Only runs AFTER the user passes Effect 1 cleanly)
  useEffect(() => {
    if (!ready) return;

    const fetchGoalsData = async () => {
      const token = localStorage.getItem('token');
      try {
        const goalsRes = await fetch("http://localhost:3000/api/savings", {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (goalsRes.ok) {
          const data = await goalsRes.json();
          setGoals(data);
        } else {
          console.error("Backend endpoint returned error status:", goalsRes.status);
        }
      } catch (err) {
        console.error("Database server connection failed:", err);
      }
    };
    fetchGoalsData();
  }, [ready]);

  const suggestions = [
    { label: 'Fun Vacation',    Icon: MdBeachAccess },
    { label: 'Fancy Dinner',    Icon: MdWineBar },
    { label: 'New Laptop',      Icon: MdLaptopMac },
    { label: 'New Phone',       Icon: MdPhoneAndroid },
    { label: 'Emergency Fund',  Icon: RiFirstAidKitLine },
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

    setUpdating(true);
    const token = localStorage.getItem('token');
    const amount = updateAction === 'deduct' ? -Number(updateAmount) : Number(updateAmount);

    try {
      const res = await fetch(`http://localhost:3000/api/savings/${selectedGoal.goal_id}`, {
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
      const res = await fetch(`http://localhost:3000/api/savings/${goalToDelete}`, {
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
      const res = await fetch("http://localhost:3000/api/savings", {
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

  if (error) return (
    <div className="min-h-screen flex items-center justify-center">
      <h1 className="text-2xl font-bold">{error}</h1>
    </div>
  );
  if (!ready) return null;

  return (
<<<<<<< HEAD
    <>
    
    <div className="md:hidden min-h-screen pt-14 bg-brand-base bg-linear-to-b from-brand-blue/30 to-brand-white/30">
=======
    <div className="md:hidden min-h-screen pt-10 pb-28 bg-brand-base bg-linear-to-b from-brand-blue/30 to-brand-white/30">
>>>>>>> b249bd7de2fe9039426848ac5c8d3d568446f508
      <div className="text-center">
        <h1 className="text-3xl text-white font-causten font-bold">SAVINGS</h1>
      </div>

      {/* Summary Card */}
      <section className="flex flex-col items-center mt-8 mb-4">
        <div className="flex justify-between items-center w-[95%] h-[200px] rounded-3xl bg-white px-6 py-6 shadow-xl">
          <div className="text-5xl">piggy bank</div>
          <div className="flex flex-col ml-8 pr-5">
            <div className="flex text-2xl mb-4 font-causten font-bold text-brand-dark-violet leading-tight">
              KEEP TRACK ON YOUR SAVINGS PROGRESS!
            </div>
            <div>
              <span className="text-xl font-bold text-brand-dark-violet">35%</span>
              <span className="text-lg ml-2 font-causten font-bold text-sm text-gray-600">/ 100%</span>
              <div className="w-full min-h-2 rounded-3xl bg-brand-dark-violet/30"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Suggestions Section */}
      <section className="flex flex-col items-center mt-6">
        <div className="w-[95%] mb-3">
          <h2 className="font-causten font-bold text-white text-xl">PEOPLE OFTEN SAVE FOR</h2>
        </div>
        <div className="w-[95%] flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {suggestions.map((s) => (
            <button
              key={s.label}
              onClick={() => openModalWithSuggestion(s.label)}
              className="shrink-0 bg-white rounded-2xl px-4 py-4 flex flex-col items-center gap-2 shadow-md min-w-24"
            >
              <s.Icon className="w-10 h-10 text-gray-400" />
              <span className="text-[10px] font-causten font-bold text-brand-dark-violet text-center uppercase leading-tight">
                {s.label}
              </span>
            </button>
          ))}
        </div>
      </section>
<<<<<<< HEAD
      <NavBar />
      

    </div>

    <div className="bottom-nav fixed bottom-3 left-1/2 -translate-x-1/2 w-[calc(100%-1rem)] sm:w-[calc(100%-2rem)] max-w-[520px] bg-white flex justify-around py-2.5 pb-3.5 rounded-t-[24px] rounded-b-[24px] shadow-[0_-4px_20px_rgba(0,0,0,0.08)] z-[100] md:bottom-5">
          <a className="nav-item flex flex-col items-center gap-1 cursor-pointer text-gray-400 text-xs font-semibold transition-all duration-300 no-underline px-2 py-1 border-none bg-transparent hover:text-[#4A5CFF]" onClick={() => navigate('/home')}>
            <i className="fas fa-home text-lg"></i>
            <span>Home</span>
          </a>
          <a className="nav-item flex flex-col items-center gap-1 cursor-pointer text-gray-400 text-xs font-semibold transition-all duration-300 no-underline px-2 py-1 border-none bg-transparent hover:text-[#4A5CFF]" onClick={() => navigate('/expenses')}>
            <i className="fas fa-credit-card text-lg"></i>
            <span>Expenses</span>
          </a>
          <a className="nav-item flex flex-col items-center gap-1 cursor-pointer text-[#4A5CFF] text-xs font-semibold transition-all duration-300 no-underline px-2 py-1 border-none bg-transparent hover:text-[#4A5CFF]" onClick={() => navigate('/savings')}>
            <i className="fas fa-piggy-bank text-lg"></i>
            <span>Savings</span>
          </a>
          <a className="nav-item flex flex-col items-center gap-1 cursor-pointer text-gray-400 text-xs font-semibold transition-all duration-300 no-underline px-2 py-1 border-none bg-transparent hover:text-[#4A5CFF]" onClick={() => navigate('/summary')}>
            <i className="fas fa-chart-pie text-lg"></i>
            <span>Summary</span>
          </a>
          <a className="nav-item flex flex-col items-center gap-1 cursor-pointer text-gray-400 text-xs font-semibold transition-all duration-300 no-underline px-2 py-1 border-none bg-transparent hover:text-[#4A5CFF]" onClick={() => navigate('/profile')}>
            <i className="fas fa-user text-lg"></i>
            <span>Profile</span>
          </a>
        </div>
    </>
    
  )
}
=======
>>>>>>> b249bd7de2fe9039426848ac5c8d3d568446f508

      {/* Goals Section */}
      <section className="flex flex-col items-center">
        <div className="w-[95%] mb-3 mt-5 flex justify-between items-center">
          <h2 className="font-causten font-bold text-white text-2xl">YOUR GOALS</h2>
        </div>

        <div className="w-full flex flex-col items-center gap-4">
          {goals.length === 0 ? (
            <p className="text-white/60 text-sm italic mt-4">No active savings goals found.</p>
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

      {/* Floating + Button centered above NavBar */}
      <button
        onClick={openModal}
        className="fixed bottom-[72px] left-1/2 -translate-x-1/2 z-50
                   w-14 h-14 rounded-full bg-brand-dark-violet text-white text-3xl
                   flex items-center justify-center shadow-xl
                   hover:scale-110 active:scale-95 transition-transform duration-200"
        aria-label="Add new savings goal"
      >
        +
      </button>

      <NavBar />

      {/* Add / Deduct Savings Modal */}
      {updateModal && selectedGoal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-t-3xl shadow-2xl overflow-hidden">

            {/* Coloured header */}
            <div className="bg-brand-dark-violet px-6 pt-6 pb-8">
              <div className="w-10 h-1 rounded-full bg-white/30 mx-auto mb-4" />
              <p className="text-white/60 text-xs font-causten font-semibold uppercase tracking-widest mb-1">
                {updateAction === 'add' ? 'Adding to' : 'Deducting from'}
              </p>
              <h2 className="text-white text-2xl font-causten font-extrabold uppercase mb-4">
                {selectedGoal.goal_name}
              </h2>

              {/* Current vs Target */}
              <div className="flex justify-between items-end mb-2">
                <div>
                  <p className="text-white/50 text-xs font-causten">Saved so far</p>
                  <p className="text-white text-xl font-causten font-bold">
                    ${Number(selectedGoal.current_amount).toFixed(2)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-white/50 text-xs font-causten">Target</p>
                  <p className="text-white text-xl font-causten font-bold">
                    ${Number(selectedGoal.target_amount).toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 rounded-full bg-white/20">
                <div
                  className="h-2 rounded-full bg-brand-light-pink transition-all duration-500"
                  style={{
                    width: `${Math.min((Number(selectedGoal.current_amount) / Number(selectedGoal.target_amount)) * 100, 100)}%`
                  }}
                />
              </div>
              <p className="text-white/50 text-xs font-causten mt-1 text-right">
                {Math.min((Number(selectedGoal.current_amount) / Number(selectedGoal.target_amount)) * 100, 100).toFixed(1)}%
              </p>
            </div>

            {/* Input section */}
            <div className="px-6 pt-5 pb-10 flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                  Amount ($)
                </label>
                <input
                  type="number"
                  value={updateAmount}
                  onChange={e => setUpdateAmount(e.target.value)}
                  placeholder="0.00"
                  min="0"
                  className="border-2 border-gray-200 rounded-xl px-4 py-3 text-brand-dark-violet
                             font-causten focus:outline-none focus:border-brand-dark-violet transition-colors"
                />
              </div>

              {updateError && <p className="text-red-500 text-sm font-causten">{updateError}</p>}

              <div className="flex gap-3">
                <button
                  onClick={() => setUpdateModal(false)}
                  disabled={updating}
                  className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-500
                             font-causten font-bold hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateGoal}
                  disabled={updating}
                  className="flex-1 py-3 rounded-xl bg-brand-dark-violet text-white
                             font-causten font-bold hover:bg-brand-dark-violet/90 transition-colors
                             disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {updating ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Confirm'
                  )}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {goalToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-[80%] max-w-sm bg-white rounded-2xl px-6 py-8 shadow-2xl flex flex-col gap-4">
            <h2>Delete Goal?</h2>
            <p>This will permanently remove the goal from your savings.</p>
            <div className="flex gap-3">
              <button onClick={() => setGoalToDelete(null)}>Cancel</button>
              <button onClick={handleDeleteGoal}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Goal Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm"
          onClick={closeModal}
        >
          <div
            className="w-full max-w-md bg-white rounded-t-3xl px-6 pt-6 pb-10 shadow-2xl
                        animate-slide-up"
            onClick={e => e.stopPropagation()}
          >
            {/* Drag handle */}
            <div className="w-10 h-1 rounded-full bg-gray-300 mx-auto mb-5" />

            <h2 className="font-causten font-bold text-brand-dark-violet text-2xl mb-6">
              NEW SAVINGS GOAL
            </h2>

            <div className="flex flex-col gap-4">
              {/* Goal Name */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">
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
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">
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
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                  Current Savings ($) <span className="normal-case text-gray-400 font-normal">(optional)</span>
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
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                  Target Date <span className="normal-case text-gray-400 font-normal">(optional)</span>
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
                  className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-500
                             font-causten font-bold hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddGoal}
                  disabled={submitting}
                  className="flex-1 py-3 rounded-xl bg-brand-dark-violet text-white
                             font-causten font-bold hover:bg-brand-dark-violet/90 transition-colors
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