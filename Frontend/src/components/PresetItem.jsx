import { useState } from "react";
import { TbX } from "react-icons/tb";
import ConfirmDialog from "./ConfirmDialog";
import { getCategoryIcon } from "../utils/categoryIcon";

// One Quick Access preset as a compact white tap tile — icon, amount, and
// the note/category in small type, sized to sit four across a phone screen.
// Tapping the tile hands the preset back to the parent (which prefills the
// expense form for review); the corner × asks for confirmation, then deletes.
const PresetItem = ({ preset, onUse, onDelete }) => {
  const [confirming, setConfirming] = useState(false);

  const displayName = preset.note || preset.categoryName || `$${preset.amount.toFixed(2)} preset`;
  const CategoryIcon = getCategoryIcon(preset.categoryName);

  // Hover: lifts slightly and draws a semi-thick dark-violet outline —
  // the tile stays white, so the text never changes color
  return (
    <div className="group relative rounded-xl shadow-sm bg-white hover:-translate-y-0.5 hover:shadow-md transition-all duration-150 outline-4 outline-transparent hover:outline-brand-dark-violet">
      <button
        onClick={() => onUse(preset)}
        className="w-full flex flex-col items-center justify-center gap-0.5 px-1.5 py-2.5 text-center active:scale-95 transition-transform"
      >
        <CategoryIcon className="w-4 h-4" style={{ color: preset.categoryColor }} />
        <p className="text-brand-dark-violet font-causten font-bold text-sm leading-tight">
          ${preset.amount.toFixed(2)}
        </p>
        <div className="min-w-0 max-w-full">
          {preset.note && (
            <p className="text-brand-dark-violet text-[11px] font-causten font-bold leading-tight truncate">
              {preset.note}
            </p>
          )}
          <p className="text-brand-dark-violet/50 text-[9px] leading-tight truncate">
            {preset.categoryName || 'Uncategorized'}
          </p>
        </div>
      </button>
      <button
        onClick={() => setConfirming(true)}
        className="absolute top-1 right-1 p-0.5 text-brand-dark-violet/30 group-hover:text-brand-dark-violet/60 hover:text-red-400 transition-colors"
      >
        <TbX className="w-3 h-3" />
      </button>

      {confirming && (
        <ConfirmDialog
          itemName={displayName}
          note="This won't affect expenses you've already recorded."
          onConfirm={() => {
            setConfirming(false);
            onDelete(preset.id);
          }}
          onCancel={() => setConfirming(false)}
        />
      )}
    </div>
  );
};

export default PresetItem;
