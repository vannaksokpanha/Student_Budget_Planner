import { TbX, TbPlus, TbMinus } from 'react-icons/tb';

// One savings goal: amount-first layout — saved so far is the headline, the
// remaining details (target, %, deadline) support it. Matches the flat white
// card style used across the app.
export default function GoalCard({ goal, onOpenModal, onDelete }) {
  const current = Number(goal.current_amount);
  const target = Number(goal.target_amount);
  const pct = target > 0 ? Math.min((current / target) * 100, 100) : 0;
  const reached = target > 0 && current >= target;

  const deadline = goal.target_date
    ? new Date(goal.target_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : null;

  return (
    <div className="w-full bg-white rounded-2xl shadow-lg px-5 py-4">

      {/* Name row — name left, delete right */}
      <div className="flex justify-between items-start gap-3">
        <div className="min-w-0">
          <p className="font-causten font-bold text-brand-dark-violet text-lg truncate">
            {goal.goal_name}
          </p>
          {deadline && (
            <p className="text-gray-300 text-xs mt-0.5">Target date · {deadline}</p>
          )}
        </div>
        <button
          onClick={() => onDelete(goal.goal_id)}
          aria-label={`Delete ${goal.goal_name}`}
          className="text-gray-300 hover:text-red-400 transition-colors shrink-0 mt-1"
        >
          <TbX className="w-4 h-4" />
        </button>
      </div>

      {/* Amounts — saved so far leads, target and % follow */}
      <div className="flex justify-between items-end mt-3">
        <div className="flex items-baseline gap-1.5 min-w-0">
          <p className="text-brand-dark-violet font-causten font-extrabold text-2xl">
            ${current.toFixed(2)}
          </p>
          <p className="text-gray-400 text-sm font-causten truncate">of ${target.toFixed(2)}</p>
        </div>
        <span
          className={`shrink-0 text-xs font-causten font-bold rounded-full px-2.5 py-1 ${
            reached
              ? 'bg-emerald-100 text-emerald-600'
              : 'bg-brand-light-pink text-brand-dark-violet'
          }`}
        >
          {reached ? 'Reached 🎉' : `${Math.round(pct)}%`}
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 rounded-full bg-brand-dark-violet/10 mt-2 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${reached ? 'bg-emerald-400' : 'bg-brand-light-pink'}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-3">
        <button
          onClick={() => onOpenModal(goal, 'deduct')}
          className="flex-1 py-2 rounded-xl border border-brand-dark-violet/20 text-brand-dark-violet
                     text-xs font-causten font-bold flex items-center justify-center gap-1
                     hover:bg-brand-dark-violet/5 transition-colors"
        >
          <TbMinus className="w-3.5 h-3.5" /> Withdraw
        </button>
        <button
          onClick={() => onOpenModal(goal, 'add')}
          className="flex-1 py-2 rounded-xl bg-brand-dark-violet text-white
                     text-xs font-causten font-bold flex items-center justify-center gap-1
                     hover:bg-brand-base transition-colors"
        >
          <TbPlus className="w-3.5 h-3.5" /> Add savings
        </button>
      </div>
    </div>
  );
}
