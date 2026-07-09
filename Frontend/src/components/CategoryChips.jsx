// Horizontal category picker — replaces the native <select>, whose option list
// the browser draws and CSS can't style. Each category is a tappable pill with
// its color dot; tapping the active pill again clears it (category stays
// optional). The row scrolls sideways when there are more chips than width.
// Pass `dark` when the picker sits on a brand-dark-violet surface.
const CategoryChips = ({ categories, value, onChange, onRequestNew, dark = false }) => {
  const selected = String(value || '');
  const base =
    'shrink-0 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-causten font-bold transition-colors';

  // The catch-all "Other" always sits at the end of the row
  const ordered = [
    ...categories.filter(c => c.name.trim().toLowerCase() !== 'other'),
    ...categories.filter(c => c.name.trim().toLowerCase() === 'other')
  ];

  return (
    <div>
      <p className={`text-xs font-causten font-bold uppercase tracking-wider mb-1.5 ${dark ? 'text-white/60' : 'text-gray-400'}`}>
        Category
      </p>
      <div className="flex gap-1.5 overflow-x-auto scrollbar-hide py-0.5">
        {onRequestNew && (
          <button
            type="button"
            onClick={onRequestNew}
            className={`${base} border ${
              dark
                ? 'border-white/30 text-white/60 hover:text-white'
                : 'border-brand-dark-violet/20 text-brand-dark-violet/60 hover:text-brand-dark-violet'
            }`}
          >
            + New
          </button>
        )}
        {ordered.map(c => {
          const active = selected === String(c.id);
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => onChange(active ? '' : String(c.id))}
              className={`${base} ${
                active
                  ? dark
                    ? 'bg-white text-brand-dark-violet'
                    : 'bg-brand-dark-violet text-white'
                  : dark
                    ? 'bg-white/30 text-white hover:bg-white/45'
                    : 'bg-brand-dark-violet/5 text-brand-dark-violet hover:bg-brand-light-violet'
              }`}
            >
              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
              {c.name}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryChips;
