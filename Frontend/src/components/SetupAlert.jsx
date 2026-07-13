import { TbInfoCircle, TbChevronRight } from "react-icons/tb";

// Slim guidance strip shown when a prerequisite isn't set up yet (e.g. no
// monthly income means no daily allowance can exist). One per page at most,
// rendered only while the condition is actually true — it disappears on its
// own the moment the user fixes it. The whole strip is the button.
const SetupAlert = ({ message, actionLabel = 'Fix it', onAction }) => (
  <button
    onClick={onAction}
    className="w-full bg-brand-light-pink rounded-xl shadow-md px-3.5 py-2.5 flex items-center gap-2.5 text-left
               hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98] transition-all duration-150
               outline-4 outline-transparent hover:outline-brand-dark-violet"
  >
    <TbInfoCircle className="w-5 h-5 text-brand-dark-violet shrink-0" />
    <p className="flex-1 min-w-0 text-brand-dark-violet text-sm font-causten font-semibold leading-snug">
      {message}
    </p>
    <span className="shrink-0 flex items-center text-brand-dark-violet font-causten font-bold text-xs uppercase tracking-wider">
      {actionLabel}
      <TbChevronRight className="w-4 h-4" />
    </span>
  </button>
);

export default SetupAlert;
