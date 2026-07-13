// components/GroupPanel.jsx
import React from 'react';
import { Search, Plus, LogIn } from 'lucide-react';
import GroupList from './GroupList';

const GroupPanel = ({
  groups,
  activeGroupId,
  onGroupSelect,
  onSearch,
  onCreateGroup,
  onJoinGroup
}) => {
  return (
    <div className="flex flex-col w-full ml-0 bg-white lg:w-[320px] lg:ml-0 lg:border-r lg:border-brand-dark-violet/10">
      <div className="p-5 pb-3 mt-4">
        <div className="flex gap-2">
          <button
            onClick={onCreateGroup}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand-dark-violet py-3 text-sm font-causten font-bold text-white hover:bg-brand-base hover:-translate-y-0.5 hover:shadow-md active:scale-95 transition-all duration-150"
          >
            <Plus size={16} />
            New group
          </button>

          <button
            onClick={onJoinGroup}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-brand-dark-violet/20 py-3 text-sm font-causten font-bold text-brand-dark-violet hover:border-brand-dark-violet hover:-translate-y-0.5 hover:shadow-md active:scale-95 transition-all duration-150"
          >
            <LogIn size={16} />
            Join group
          </button>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <div className="flex flex-1 items-center gap-3 rounded-xl bg-white border border-brand-dark-violet/30 px-3 py-2.5 focus-within:ring-2 focus-within:ring-brand-dark-violet/15 transition-shadow">
            <Search className="text-brand-dark-violet/40 shrink-0" size={18} />
            <input
              type="text"
              placeholder="Search groups..."
              aria-label="Search groups"
              onChange={(e) => onSearch?.(e.target.value)}
              className="w-full bg-transparent text-sm text-brand-dark-violet placeholder-brand-dark-violet/40 outline-none"
            />
          </div>
        </div>

        <div className="mt-5">
          <p className="font-causten font-bold text-brand-dark-violet text-xl">Your Groups</p>
          <p className="text-brand-dark-violet/45 text-xs mt-0.5">
            {groups.length === 0
              ? 'Shared pools you create or join'
              : `${groups.length} ${groups.length === 1 ? 'group' : 'groups'} · tap one to open it`}
          </p>
        </div>
      </div>

      <GroupList
        groups={groups}
        activeGroupId={activeGroupId}
        onGroupSelect={onGroupSelect}
      />
    </div>
  );
};

export default GroupPanel;  