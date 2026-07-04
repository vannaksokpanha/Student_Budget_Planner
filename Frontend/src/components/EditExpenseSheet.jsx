import { useState } from "react";
import { TbX } from "react-icons/tb";

// Shared edit bottom sheet for an existing expense — mirrors Daily Log's
// original "Edit Expense" sheet. `showDate` controls whether the Date field
// appears (Daily Log entries are dated; Budget expenses aren't). `showRepeatToggle`
// adds the Budget page's "repeats every month" switch, which moves an item
// between the Monthly Bills and Planned This Month sections.
const EditExpenseSheet = ({
  expense,
  categories,
  namePlaceholder = 'Note (optional)',
  showDate = false,
  showRepeatToggle = false,
  onRequestNewCategory,
  onSave,
  onDelete,
  onClose
}) => {
  const [amount, setAmount] = useState(expense.amount);
  const [categoryId, setCategoryId] = useState(expense.categoryId ? String(expense.categoryId) : '');
  const [name, setName] = useState(expense.name || '');
  const [date, setDate] = useState(expense.date || '');
  // Which budget section the expense lives in: true = Monthly Bill, false = one-off.
  // Sent back on Save; the page translates it to the expense_type the API expects.
  const [isBill, setIsBill] = useState(!!expense.isBill);

  const handleCategoryChange = (e) => {
    if (e.target.value === '__add_new__') {
      onRequestNewCategory?.();
      return;
    }
    setCategoryId(e.target.value);
  };

  const handleSave = async () => {
    await onSave(expense.id, {
      amount: parseFloat(amount) || 0,
      category_id: categoryId || null,
      name,
      ...(showDate ? { date } : {}),
      ...(showRepeatToggle ? { isBill } : {})
    });
    onClose();
  };

  const handleDelete = async () => {
    await onDelete(expense.id);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-55" onClick={onClose} />
      <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-60 px-5 pt-5 pb-10 shadow-2xl">
        <div className="flex justify-between items-center mb-5">
          <p className="font-causten font-bold text-brand-dark-violet text-lg">Edit Expense</p>
          <button onClick={onClose}>
            <TbX className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Amount</p>
            <div className="flex items-center gap-1 border-b border-gray-100 pb-2">
              <span className="text-2xl font-causten font-bold text-brand-dark-violet">$</span>
              <input
                type="number"
                inputMode="decimal"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="flex-1 text-2xl font-causten font-bold text-brand-dark-violet border-none outline-none bg-transparent"
              />
            </div>
          </div>

          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Category</p>
            <select
              value={categoryId}
              onChange={handleCategoryChange}
              className="w-full text-sm text-brand-dark-violet border-b border-gray-100 pb-2 outline-none bg-transparent appearance-none p-0"
            >
              <option value="">Uncategorized</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              <option value="__add_new__">+ Add new category</option>
            </select>
          </div>

          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">{namePlaceholder}</p>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder={namePlaceholder}
              className="w-full text-sm text-brand-dark-violet border-b border-gray-100 pb-2 outline-none bg-transparent placeholder-gray-300"
            />
          </div>

          {showDate && (
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Date</p>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full text-sm text-brand-dark-violet border-b border-gray-100 pb-2 outline-none bg-transparent"
              />
            </div>
          )}

          {showRepeatToggle && (
            <button onClick={() => setIsBill(v => !v)} className="w-full flex justify-between items-center gap-3">
              <div className="text-left">
                <p className="text-sm font-semibold text-brand-dark-violet">Repeats every month</p>
                <p className="text-xs text-gray-300 mt-0.5">
                  {isBill
                    ? 'Monthly bill — comes back when you reuse last month.'
                    : 'One-off — lives in this month only.'}
                </p>
              </div>
              <div className={`w-11 h-6 rounded-full p-0.5 transition-colors shrink-0 ${isBill ? 'bg-brand-dark-violet' : 'bg-gray-200'}`}>
                <div className={`w-5 h-5 bg-white rounded-full transition-transform ${isBill ? 'translate-x-5' : ''}`} />
              </div>
            </button>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={handleDelete}
            className="flex-1 py-3 rounded-xl border border-red-200 text-red-400 font-causten font-bold text-sm"
          >
            Delete
          </button>
          <button
            onClick={handleSave}
            className="flex-2 py-3 rounded-xl bg-brand-dark-violet text-white font-causten font-bold text-sm"
          >
            Save
          </button>
        </div>
      </div>
    </>
  );
};

export default EditExpenseSheet;
