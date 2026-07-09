import { useState } from "react";
import { TbX } from "react-icons/tb";
import ConfirmDialog from "./ConfirmDialog";

// One Quick Access preset as a square tap tile, tinted with a faint wash of
// its category color (the tint IS the category indicator — no dot needed).
// Tapping the tile hands the preset back to the parent (which prefills the
// expense form for review); the corner × asks for confirmation, then deletes.
const PresetItem = ({ preset, onUse, onDelete }) => {
  const [confirming, setConfirming] = useState(false);

  const displayName = preset.note || preset.categoryName || `$${preset.amount.toFixed(2)} preset`;

  return (
    <div
      className="relative aspect-square rounded-xl shadow-sm bg-(--tint)/10 hover:bg-(--tint)/25 hover:shadow-md transition-all"
      style={{ '--tint': preset.categoryColor }}
    >
      <button
        onClick={() => onUse(preset)}
        className="w-full h-full flex flex-col items-center justify-center gap-1 p-2.5 text-center active:scale-95 transition-transform"
      >
        <p className="text-brand-dark-violet font-causten font-bold text-base">
          ${preset.amount.toFixed(2)}
        </p>
        <div className="min-w-0 max-w-full">
          {preset.note && (
            <p className="text-brand-dark-violet text-sm font-causten font-bold truncate">
              {preset.note}
            </p>
          )}
          <p className="text-brand-dark-violet/50 text-[10px] truncate">
            {preset.categoryName || 'Uncategorized'}
          </p>
        </div>
      </button>
      <button
        onClick={() => setConfirming(true)}
        className="absolute top-2 right-2 text-brand-dark-violet/30 hover:text-red-400 transition-colors"
      >
        <TbX className="w-3.5 h-3.5" />
      </button>

      {confirming && (
        <ConfirmDialog
          itemName={displayName}
          note="This won't affect expenses you've already logged."
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
