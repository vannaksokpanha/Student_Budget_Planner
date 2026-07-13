// Centered confirmation dialog for destructive actions (deleting a preset,
// an expense, ...). Always asks "Are you sure you want to delete '<itemName>'?"
// so callers just pass the item's display name. Sits above the bottom sheets
// (which use z-55/z-60) so it can be opened from inside one. Tapping the
// backdrop cancels.
const ConfirmDialog = ({
  itemName,
  note,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel
}) => (
  <>
    <div className="fixed inset-0 bg-black/40 z-70" onClick={onCancel} />
    <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-3rem)] max-w-sm bg-white rounded-2xl z-80 p-6 shadow-2xl">
      <p className="font-causten font-bold text-brand-dark-violet text-lg">
        Are you sure you want to delete '{itemName}'?
      </p>
      {note && <p className="text-sm text-brand-dark-violet/60 mt-2">{note}</p>}
      <div className="flex gap-3 mt-6">
        <button
          onClick={onCancel}
          className="flex-1 py-3 rounded-xl border border-gray-200 text-brand-dark-violet/60 font-causten font-bold text-sm hover:bg-gray-50 active:scale-95 transition-all duration-150"
        >
          {cancelLabel}
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 py-3 rounded-xl bg-red-400 text-white font-causten font-bold text-sm hover:bg-red-500 active:scale-95 transition-all duration-150"
        >
          {confirmLabel}
        </button>
      </div>
    </div>
  </>
);

export default ConfirmDialog;
