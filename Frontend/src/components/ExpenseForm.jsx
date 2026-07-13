import { useEffect, useState } from "react";
import { TbX } from "react-icons/tb";
import CategoryChips from "./CategoryChips";

// Local YYYY-MM-DD — avoids toISOString(), which can shift the calendar day
// in timezones ahead of UTC
const todayStr = () => {
  const d = new Date();
  const pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

// Amount-first quick-add card, shared by any page that needs to log an expense.
// By default category/name only appear once an amount has been typed, keeping the
// common case — just entering a number — as fast as possible. Pass
// `alwaysShowDetails` for cases where the category matters before the amount does
// (e.g. a budget expense needs to be tagged with a category to make sense at all).
// Pass `bare` to drop the card chrome when the form is embedded inside another card.
// Pass `prefill` ({ amount, category_id, name, key }) to load values into the form
// from outside, e.g. tapping a preset; `key` must change per tap so the same
// preset can be applied twice in a row.
// Pass `dark` when the form sits on a brand-dark-violet surface — text goes
// white and the fields become frosted (white at low opacity).
// Pass `showDate` to add a date picker (defaults to today, capped at today —
// spending can be backdated but never logged into the future).
const ExpenseForm = ({
  label,
  namePlaceholder = 'Note (optional)',
  categories,
  onRequestNewCategory,
  onSubmit,
  submitLabel = '+ ADD',
  alwaysShowDetails = false,
  bare = false,
  prefill = null,
  dark = false,
  showDate = false
}) => {
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [name, setName] = useState('');
  const [date, setDate] = useState(todayStr());

  useEffect(() => {
    if (!prefill) return;
    setAmount(prefill.amount != null ? String(prefill.amount) : '');
    setCategoryId(prefill.category_id != null ? String(prefill.category_id) : '');
    setName(prefill.name || '');
  }, [prefill]);

  const handleAdd = async () => {
    if (!amount || isNaN(parseFloat(amount))) return;

    const ok = await onSubmit({
      amount: parseFloat(amount),
      category_id: categoryId || null,
      name,
      // Clamp to today even if the browser let a future date through
      ...(showDate ? { date: date && date <= todayStr() ? date : todayStr() } : {})
    });
    if (ok === false) return;

    setAmount('');
    setCategoryId('');
    setName('');
    setDate(todayStr());
  };

  return (
    <div className={bare ? '' : 'bg-white rounded-2xl shadow-lg px-5 pt-5 pb-4'}>
      <div className="flex items-stretch gap-2">
        <div className="flex-1 min-w-0">
          {label && (
            <p className={`text-sm font-causten font-bold uppercase tracking-widest mb-4 ${dark ? 'text-white/60' : 'text-brand-dark-violet/80'}`}>
              {label}
            </p>
          )}

          <div className="flex items-center gap-2">
            <span className={`text-4xl font-causten font-extrabold ${dark ? 'text-white' : 'text-brand-dark-violet'}`}>$</span>
            <input
              type="number"
              inputMode="decimal"
              placeholder="0.00"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
              className={`flex-1 text-4xl font-causten font-extrabold border-none outline-none bg-transparent min-w-0 ${
                dark ? 'text-white placeholder-white/25' : 'text-brand-dark-violet placeholder-brand-dark-violet/30'
              }`}
            />
          </div>
        </div>

        <button
          onClick={handleAdd}
          disabled={!amount}
          className={`self-stretch shrink-0 w-20 rounded-xl font-causten font-bold text-sm disabled:opacity-20 enabled:hover:-translate-y-0.5 enabled:hover:shadow-md transition-all duration-150 active:scale-95 ${
            dark ? 'bg-white text-brand-dark-violet' : 'bg-brand-dark-violet text-white'
          }`}
        >
          {submitLabel}
        </button>
      </div>

      {(alwaysShowDetails || amount) ? (
        <div className={`mt-3 border-t pt-3 space-y-2 ${dark ? 'border-white/10' : 'border-brand-dark-violet/10'}`}>
          <CategoryChips
            categories={categories}
            value={categoryId}
            onChange={setCategoryId}
            onRequestNew={onRequestNewCategory}
            dark={dark}
          />
          <div className="relative">
            <input
              type="text"
              placeholder={namePlaceholder}
              value={name}
              onChange={e => setName(e.target.value)}
              className={`w-full rounded-xl pl-3 pr-9 py-2.5 text-sm outline-none focus:ring-2 transition-shadow ${
                dark
                  ? 'bg-white/30 text-white placeholder-white/60 focus:ring-white/40'
                  : 'bg-brand-dark-violet/5 text-brand-dark-violet placeholder-brand-dark-violet/40 focus:ring-brand-dark-violet/15'
              }`}
            />
            {name && (
              <button
                onClick={() => setName('')}
                aria-label="Clear note"
                className={`absolute right-3 top-1/2 -translate-y-1/2 active:scale-90 transition-all duration-150 ${
                  dark ? 'text-white/40 hover:text-white' : 'text-brand-dark-violet/40 hover:text-brand-dark-violet'
                }`}
              >
                <TbX className="w-4 h-4" />
              </button>
            )}
          </div>
          {showDate && (
            <input
              type="date"
              value={date}
              max={todayStr()}
              onChange={e => setDate(e.target.value)}
              aria-label="Date of expense"
              className={`w-full rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 transition-shadow ${
                dark
                  ? 'bg-white/30 text-white focus:ring-white/40'
                  : 'bg-brand-dark-violet/5 text-brand-dark-violet focus:ring-brand-dark-violet/15'
              }`}
            />
          )}
        </div>
      ) : null}
    </div>
  );
};

export default ExpenseForm;
