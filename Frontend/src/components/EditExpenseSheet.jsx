import { useState } from "react";
import { TbX } from "react-icons/tb";
import ConfirmDialog from "./ConfirmDialog";
import CategoryChips from "./CategoryChips";

// Shared edit bottom sheet for an existing expense — mirrors Daily Log's
// original "Edit Expense" sheet. `showDate` controls whether the Date field
// appears (Daily Log entries are dated; Budget expenses aren't).
const EditExpenseSheet = ({
  expense,
  categories,
  namePlaceholder = 'Note (optional)',
  showDate = false,
  onRequestNewCategory,
  onSave,
  onDelete,
  onClose
}) => {
  const [amount, setAmount] = useState(expense.amount);
  const [categoryId, setCategoryId] = useState(expense.categoryId ? String(expense.categoryId) : '');
  const [name, setName] = useState(expense.name || '');
  const [date, setDate] = useState(expense.date || '');
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const handleSave = async () => {
    await onSave(expense.id, {
      amount: parseFloat(amount) || 0,
      category_id: categoryId || null,
      name,
      ...(showDate ? { date } : {})
    });
    onClose();
  };

  const handleDelete = async () => {
    await onDelete(expense.id);
    onClose();
  };

  // What the confirmation dialog calls this expense — same fallback chain the
  // list rows use for their primary text
  const displayName =
    name ||
    categories.find(c => String(c.id) === categoryId)?.name ||
    'Uncategorized';

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-55" onClick={onClose} />
      <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-60 px-5 pt-5 pb-10 shadow-2xl">
        <div className="flex justify-between items-center mb-5">
          <p className="font-causten font-bold text-brand-dark-violet text-lg">Edit Expense</p>
          <button onClick={onClose} className="active:scale-90 transition-transform duration-150">
            <TbX className="w-5 h-5 text-brand-dark-violet/60" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-xs text-brand-dark-violet/80 uppercase tracking-wider mb-1">Amount</p>
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

          <CategoryChips
            categories={categories}
            value={categoryId}
            onChange={setCategoryId}
            onRequestNew={onRequestNewCategory}
          />

          <div>
            <p className="text-xs text-brand-dark-violet/80 uppercase tracking-wider mb-1">{namePlaceholder}</p>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder={namePlaceholder}
              className="w-full text-sm text-brand-dark-violet border-b border-gray-100 pb-2 outline-none bg-transparent placeholder-brand-dark-violet/40"
            />
          </div>

          {showDate && (
            <div>
              <p className="text-xs text-brand-dark-violet/80 uppercase tracking-wider mb-1">Date</p>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full text-sm text-brand-dark-violet border-b border-gray-100 pb-2 outline-none bg-transparent"
              />
            </div>
          )}

        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={() => setConfirmingDelete(true)}
            className="flex-1 py-3 rounded-xl bg-red-400 text-white font-causten font-bold text-sm hover:bg-red-500 hover:-translate-y-0.5 hover:shadow-md active:scale-95 transition-all duration-150"
          >
            Delete
          </button>
          <button
            onClick={handleSave}
            className="flex-2 py-3 rounded-xl bg-brand-dark-violet text-white font-causten font-bold text-sm hover:bg-brand-base hover:-translate-y-0.5 hover:shadow-md active:scale-95 transition-all duration-150"
          >
            Save
          </button>
        </div>
      </div>

      {confirmingDelete && (
        <ConfirmDialog
          itemName={displayName}
          note="This can't be undone."
          onConfirm={handleDelete}
          onCancel={() => setConfirmingDelete(false)}
        />
      )}
    </>
  );
};

export default EditExpenseSheet;
