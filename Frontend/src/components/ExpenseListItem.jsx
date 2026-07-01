// Shared tap-to-edit row for any list of logged expenses/liabilities — visual
// style matches the Budget page's flat, divided list. Tapping the row opens
// whatever edit sheet the parent renders; there's no inline delete icon since
// delete lives inside that edit sheet instead.
const ExpenseListItem = ({ primaryText, categoryName, categoryColor, secondaryText, date, amount, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="w-full flex justify-between items-center py-2.5 border-b border-gray-50 last:border-0 text-left"
    >
      <div>
        <p className="text-brand-dark-violet font-semibold text-sm">{primaryText}</p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: categoryColor }} />
          <p className="text-gray-300 text-xs">{categoryName}</p>
        </div>
        {secondaryText && <p className="text-gray-300 text-xs mt-0.5">{secondaryText}</p>}
        {date && <p className="text-gray-300 text-xs mt-0.5">{date}</p>}
      </div>
      <p className="text-brand-dark-violet font-causten font-bold">${amount.toFixed(2)}</p>
    </button>
  );
};

export default ExpenseListItem;
