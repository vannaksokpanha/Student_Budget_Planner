import { useState } from "react";
import { TbTrash, TbX } from "react-icons/tb";

// Fixed palette offered when creating a new category — keeps color picking to a single tap
const CATEGORY_COLORS = [
  '#FF6B6B', '#FFA94D', '#FFD43B', '#69DB7C', '#38D9A9',
  '#4DABF7', '#748FFC', '#B197FC', '#F783AC', '#868E96'
];

// Bottom sheet for viewing/deleting a user's categories and creating new ones.
// Shared across any page that lets the user manage the category pool.
const CategoryManager = ({ categories, onAdd, onDelete, onClose }) => {
  const [name, setName] = useState('');
  const [color, setColor] = useState(CATEGORY_COLORS[0]);
  const [error, setError] = useState('');

  const handleAdd = async () => {
    if (!name.trim()) return;
    setError('');

    const ok = await onAdd({ name: name.trim(), color });
    if (ok === false) {
      setError('Failed to add category. Please try again.');
      return;
    }

    setName('');
    setColor(CATEGORY_COLORS[0]);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-65" onClick={onClose} />
      <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-70 px-5 pt-5 pb-10 shadow-2xl">
        <div className="flex justify-between items-center mb-5">
          <p className="font-causten font-bold text-brand-dark-violet text-lg">Categories</p>
          <button onClick={onClose} className="active:scale-90 transition-transform duration-150">
            <TbX className="w-5 h-5 text-brand-dark-violet/60" />
          </button>
        </div>

        {categories.length > 0 && (
          <div className="space-y-2 mb-5 max-h-40 overflow-y-auto">
            {categories.map(c => (
              <div key={c.id} className="flex justify-between items-center py-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                  <p className="text-brand-dark-violet text-sm">{c.name}</p>
                </div>
                <button onClick={() => onDelete(c.id)} className="active:scale-90 transition-transform duration-150">
                  <TbTrash className="w-4 h-4 text-brand-dark-violet/45 hover:text-red-400 transition-colors" />
                </button>
              </div>
            ))}
          </div>
        )}

        <p className="text-xs font-causten font-bold text-brand-dark-violet/60 uppercase tracking-widest mb-3">Add New</p>

        <div className="space-y-4">
          <div>
            <p className="text-xs text-brand-dark-violet/60 uppercase tracking-wider mb-1">Name</p>
            <input
              type="text"
              autoFocus
              placeholder="e.g. Rent"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full text-sm text-brand-dark-violet border-b border-gray-100 pb-2 outline-none bg-transparent placeholder-brand-dark-violet/40"
            />
          </div>

          <div>
            <p className="text-xs text-brand-dark-violet/60 uppercase tracking-wider mb-2">Color</p>
            <div className="flex flex-wrap gap-2">
              {CATEGORY_COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  style={{ backgroundColor: c }}
                  className={`w-7 h-7 rounded-full active:scale-95 transition-transform duration-150 ${color === c ? 'ring-2 ring-offset-2 ring-brand-dark-violet scale-110' : ''}`}
                  aria-label={c}
                />
              ))}
            </div>
          </div>
        </div>

        {error && (
          <p className="mt-4 text-xs text-red-400 font-causten text-center">{error}</p>
        )}
        <button
          onClick={handleAdd}
          disabled={!name.trim()}
          className="w-full mt-4 py-3 rounded-xl bg-brand-dark-violet text-white font-causten font-bold disabled:opacity-20 enabled:hover:bg-brand-base enabled:hover:-translate-y-0.5 enabled:hover:shadow-md active:scale-95 transition-all duration-150"
        >
          Add Category
        </button>
      </div>
    </>
  );
};

export default CategoryManager;
