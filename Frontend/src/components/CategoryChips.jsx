import { getCategoryIcon } from '../utils/categoryIcon';

// Horizontal category picker — replaces the native <select>, whose option list
// the browser draws and CSS can't style. Each category is a tappable pill with
// its icon (auto-matched from the name, tinted with the category color);
// tapping the active pill again clears it (category stays optional). The row
// scrolls sideways when there are more chips than width.
// Pass `dark` when the picker sits on a brand-dark-violet surface.
const CategoryChips = ({ categories, value, onChange, onRequestNew, dark = false }) => {
  const selected = String(value || '');
  // Transparent border by default so the hover outline doesn't shift layout
  const base =
    'shrink-0 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-causten font-bold transition-all duration-150 border border-transparent active:scale-95';

  // The catch-all "Other" always sits at the end of the row
  const ordered = [
    ...categories.filter(c => c.name.trim().toLowerCase() !== 'other'),
    ...categories.filter(c => c.name.trim().toLowerCase() === 'other')
  ];

  return (
    <div>
      <p className={`text-xs font-causten font-bold uppercase tracking-wider mb-1.5 ${dark ? 'text-white/60' : 'text-brand-dark-violet/80'}`}>
        Category
      </p>
      <div className="flex gap-1.5 overflow-x-auto scrollbar-hide py-0.5">
        {onRequestNew && (
          <button
            type="button"
            onClick={onRequestNew}
            className={`${base} ${
              dark
                ? 'border-white/30 text-white/60 hover:text-white hover:border-white'
                : 'border-brand-dark-violet/20 text-brand-dark-violet/60 hover:text-brand-dark-violet hover:border-brand-dark-violet'
            }`}
          >
            + New
          </button>
        )}
        {ordered.map(c => {
          const active = selected === String(c.id);
          const Icon = getCategoryIcon(c.name);
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => onChange(active ? '' : String(c.id))}
              className={`${base} ${
                active
                  ? dark
                    ? 'bg-white text-brand-dark-violet hover:border-brand-dark-violet'
                    : 'bg-brand-dark-violet text-white hover:border-brand-dark-violet'
                  : dark
                    ? 'bg-white/30 text-white hover:bg-white/45 hover:border-white'
                    : 'bg-brand-dark-violet/5 text-brand-dark-violet hover:bg-brand-base/10 hover:border-brand-dark-violet'
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" style={{ color: c.color }} />
              {c.name}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryChips;
