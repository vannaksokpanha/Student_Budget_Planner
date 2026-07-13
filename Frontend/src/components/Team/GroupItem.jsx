// One group as a white tap tile — same card language as the app's preset and
// expense tiles: lift + dark-violet outline on hover, press shrink, and the
// selected group keeps a soft violet fill so it reads as "open" even without
// hover. Two rows: identity (avatar + name + saved/target) over a full-width
// progress bar.
const GroupItem = ({ group, isActive, onSelect }) => {
  const hasAmounts = group.currentAmount != null || group.targetAmount != null;
  const hasProgress = typeof group.progress === "number";

  return (
    <button
      onClick={() => onSelect(group.id)}
      className={`block w-full text-left rounded-xl shadow-sm px-4 py-3.5
                  hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98] transition-all duration-150
                  outline-4 ${isActive
                    ? 'bg-brand-light-violet outline-transparent'
                    : 'bg-white outline-transparent hover:outline-brand-dark-violet'}`}
    >
      {/* Row 1 — identity on the left, saved / target on the right */}
      <div className="flex items-center gap-3">
        {/* Group initial — same circle language as the app's avatars */}
        <div className="w-9 h-9 rounded-full bg-brand-light-pink flex items-center justify-center shrink-0">
          <span className="text-brand-dark-violet font-causten font-bold text-sm">
            {group.name?.charAt(0)?.toUpperCase() || '?'}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <span className="block font-causten font-bold text-brand-dark-violet text-[15px] truncate">
            {group.name}
          </span>
          {group.createdBy && (
            <p className="truncate text-xs text-brand-dark-violet/45">
              Created by {group.createdBy}
            </p>
          )}
        </div>

        {hasAmounts && (
          <p className="shrink-0 whitespace-nowrap text-sm font-causten font-bold text-brand-dark-violet">
            ${Number(group.currentAmount ?? 0).toLocaleString()}
            <span className="font-normal text-brand-dark-violet/45">
              {' '}/ ${Number(group.targetAmount ?? 0).toLocaleString()}
            </span>
          </p>
        )}
      </div>

      {/* Row 2 — full-width progress; emerald once fully funded */}
      {hasProgress && (
        <div className="mt-3 flex items-center gap-2">
          <div className="h-1.5 flex-1 rounded-full bg-brand-dark-violet/10">
            <div
              className="h-full rounded-full bg-brand-dark-violet transition-all duration-500"
              style={{ width: `${Math.min(group.progress, 100)}%` }}
            />
          </div>
          <span className="shrink-0 text-xs font-causten font-bold text-brand-dark-violet">
            {group.progress}%
          </span>
        </div>
      )}

      {group.avatars && (
        <div className="mt-3 flex items-center">
          {group.avatars.map((src, i) => (
            <img
              key={i}
              src={src}
              alt=""
              className="-ml-1.5 first:ml-0 h-6 w-6 rounded-full border-2 border-white object-cover"
            />
          ))}
          {group.extra && (
            <span className="-ml-1.5 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-brand-dark-violet text-[10px] font-semibold text-white">
              +{group.extra}
            </span>
          )}
        </div>
      )}
    </button>
  );
};

export default GroupItem;
