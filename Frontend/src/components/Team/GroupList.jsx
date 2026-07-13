import GroupItem from './GroupItem';

// The scrollable stack of group tiles under the panel's search bar, split
// into the groups you run and the ones you've joined. Each tile is a
// GroupItem; spacing/padding lives here so the tiles' hover outlines have
// room to render without clipping.
// Always renders its header; falls back to an empty-state line when the
// section has no groups, so the user can see both roles they could fill.
const Section = ({ label, groups, emptyMessage, activeGroupId, onGroupSelect }) => (
  <div>
    <p className="text-xs font-causten font-bold uppercase tracking-widest text-brand-dark-violet/60 mb-2">
      {label}
    </p>
    {groups.length === 0 ? (
      <p className="text-sm text-brand-dark-violet/45">{emptyMessage}</p>
    ) : (
      <div className="space-y-3">
        {groups.map((group) => (
          <GroupItem
            key={group.id}
            group={group}
            isActive={group.id === activeGroupId}
            onSelect={onGroupSelect}
          />
        ))}
      </div>
    )}
  </div>
);

const GroupList = ({ groups, activeGroupId, onGroupSelect }) => {
  const hosting = groups.filter(g => g.myRole === 'owner');
  const contributing = groups.filter(g => g.myRole !== 'owner');

  return (
    <div className="flex-1 overflow-y-auto px-5 py-2 space-y-5">
      <Section
        label="Hosting"
        groups={hosting}
        emptyMessage="You're not hosting any group yet — create one to start."
        activeGroupId={activeGroupId}
        onGroupSelect={onGroupSelect}
      />
      <Section
        label="Contributing"
        groups={contributing}
        emptyMessage="You're not contributing to any group yet — join one with an invite token."
        activeGroupId={activeGroupId}
        onGroupSelect={onGroupSelect}
      />
    </div>
  );
};

export default GroupList;
