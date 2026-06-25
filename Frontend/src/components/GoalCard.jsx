import { LiaPiggyBankSolid } from 'react-icons/lia';

export default function GoalCard({ goal, index, onOpenModal, onDelete }) {
  const current = Number(goal.current_amount);
  const target = Number(goal.target_amount);
  const percentage = target > 0 ? Math.min((current / target) * 100, 100).toFixed(1) : 0;

  return (
    <div className="w-[95%] bg-white rounded-3xl px-5 py-5 shadow-md flex items-center gap-4 relative">

      {/* Delete button */}
      <button
        onClick={() => onDelete(goal.goal_id)}
        className="absolute top-3 right-3 text-gray-300 hover:text-red-400 transition-colors text-lg"
      >
        ✕
      </button>

      {/* Left: Icon + Goal label + Goal name */}
      <div className="flex flex-col items-center gap-1 min-w-17.5">
        <LiaPiggyBankSolid className="w-12 h-12 text-brand-dark-violet" />
        <span className="text-[10px] text-gray-400 font-causten font-semibold uppercase tracking-widest">
          Goal #{index + 1}
        </span>
        <span className="text-sm font-causten font-extrabold text-brand-dark-violet uppercase leading-tight text-center">
          {goal.goal_name}
        </span>
      </div>

      {/* Right: Percentage + Progress bar + Buttons */}
      <div className="flex flex-col flex-1 gap-2">

        <span className="text-base font-causten font-bold text-brand-dark-violet">
          {percentage}% / 100%
        </span>

        {/* Progress bar */}
        <div className="w-full h-2 rounded-full bg-brand-dark-violet/20">
          <div
            className="h-2 rounded-full bg-brand-light-pink transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-2 mt-1">
          <button
            onClick={() => onOpenModal(goal, 'deduct')}
            className="flex-1 py-2 rounded-lg border-2 border-brand-dark-violet text-brand-dark-violet
                       text-[10px] font-causten font-bold hover:bg-brand-dark-violet hover:text-white transition-colors"
          >
            DEDUCT SAVINGS
          </button>
          <button
            onClick={() => onOpenModal(goal, 'add')}
            className="flex-1 py-2 rounded-lg bg-brand-dark-violet text-white
                       text-[10px] font-causten font-bold hover:bg-brand-dark-violet/90 transition-colors"
          >
            ADD SAVINGS
          </button>
        </div>

      </div>
    </div>
  );
}
