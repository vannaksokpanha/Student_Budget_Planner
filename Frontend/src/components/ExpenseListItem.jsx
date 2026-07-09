import { TbCheck } from "react-icons/tb";

// Shared tap-to-edit row for any list of logged expenses — visual style matches
// the Budget page's flat, divided list. Tapping the row opens whatever edit
// sheet the parent renders; there's no inline delete icon since delete lives
// inside that edit sheet instead.
//
// Pass `onTogglePaid` (plus `paid`) to also show a tick-off circle on the right —
// used by the Budget page, where items double as a paid checklist. The circle is
// its own button so ticking doesn't open the edit sheet.
const ExpenseListItem = ({ primaryText, categoryName, categoryColor, secondaryText, date, amount, paid = false, onTogglePaid, onClick }) => {
  return (
    <div className="w-[calc(100%+2.5rem)] flex items-center gap-3 py-2.5 px-5 -mx-5 rounded-lg border-b border-gray-50 last:border-0 transition-colors hover:bg-brand-light-violet">
      <button
        onClick={onClick}
        className={`flex-1 min-w-0 flex justify-between items-center gap-3 text-left ${paid ? 'opacity-40' : ''}`}
      >
        <div className="min-w-0">
          <p className="text-brand-dark-violet font-normal text-base truncate">{primaryText}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: categoryColor }} />
            <p className="text-gray-300 text-sm">{categoryName}</p>
          </div>
          {secondaryText && <p className="text-gray-300 text-sm mt-0.5">{secondaryText}</p>}
          {date && <p className="text-gray-300 text-sm mt-0.5">{date}</p>}
        </div>
        <p className="text-brand-dark-violet font-causten font-bold shrink-0">${amount.toFixed(2)}</p>
      </button>

      {onTogglePaid && (
        <button
          onClick={onTogglePaid}
          aria-label={paid ? 'Mark as not paid' : 'Mark as paid'}
          className={`shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
            paid
              ? 'bg-emerald-400 border-emerald-400 text-white'
              : 'border-gray-200 text-transparent hover:border-emerald-300'
          }`}
        >
          <TbCheck className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default ExpenseListItem;
