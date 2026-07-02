import { useState } from "react";

// Amount-first quick-add card, shared by any page that needs to log an expense.
// By default category/name only appear once an amount has been typed, keeping the
// common case — just entering a number — as fast as possible. Pass
// `alwaysShowDetails` for cases where the category matters before the amount does
// (e.g. a budget expense needs to be tagged with a category to make sense at all).
// Pass `bare` to drop the card chrome when the form is embedded inside another card.
const ExpenseForm = ({
  label,
  namePlaceholder = 'Note (optional)',
  categories,
  onRequestNewCategory,
  onSubmit,
  submitLabel = '+ ADD',
  alwaysShowDetails = false,
  bare = false
}) => {
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [name, setName] = useState('');

  const handleCategoryChange = (e) => {
    if (e.target.value === '__add_new__') {
      onRequestNewCategory?.();
      return;
    }
    setCategoryId(e.target.value);
  };

  const handleAdd = async () => {
    if (!amount || isNaN(parseFloat(amount))) return;

    const ok = await onSubmit({
      amount: parseFloat(amount),
      category_id: categoryId || null,
      name
    });
    if (ok === false) return;

    setAmount('');
    setCategoryId('');
    setName('');
  };

  return (
    <div className={bare ? '' : 'bg-white rounded-2xl shadow-lg px-5 pt-5 pb-4'}>
      <div className="flex items-stretch gap-2">
        <div className="flex-1 min-w-0">
          {label && (
            <p className="text-xs font-causten font-bold text-gray-400 uppercase tracking-widest mb-4">
              {label}
            </p>
          )}

          <div className="flex items-center gap-2">
            <span className="text-4xl font-causten font-extrabold text-brand-dark-violet">$</span>
            <input
              type="number"
              inputMode="decimal"
              placeholder="0.00"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
              className="flex-1 text-4xl font-causten font-extrabold text-brand-dark-violet placeholder-gray-200 border-none outline-none bg-transparent min-w-0"
            />
          </div>
        </div>

        <button
          onClick={handleAdd}
          disabled={!amount}
          className="self-stretch shrink-0 w-20 bg-brand-dark-violet text-white rounded-xl font-causten font-bold text-sm disabled:opacity-20 transition-opacity active:scale-95"
        >
          {submitLabel}
        </button>
      </div>

      {(alwaysShowDetails || amount) ? (
        <div className="mt-3 border-t border-gray-100 pt-3 space-y-2">
          <select
            value={categoryId}
            onChange={handleCategoryChange}
            className="w-full text-sm text-gray-400 border-none outline-none bg-transparent focus:text-brand-dark-violet appearance-none p-0"
          >
            <option value="">Category (optional)</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            <option value="__add_new__">+ Add new category</option>
          </select>
          <input
            type="text"
            placeholder={namePlaceholder}
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full text-sm text-gray-400 border-none outline-none bg-transparent placeholder-gray-400 focus:text-brand-dark-violet"
          />
        </div>
      ) : null}
    </div>
  );
};

export default ExpenseForm;
