// components/GroupPanel.jsx
import React from 'react';
import { Search, Plus, LogIn } from 'lucide-react';
import GroupList from './GroupList';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../Context/UserContext'; 

const GroupPanel = ({
  groups,
  activeGroupId,
  onGroupSelect,
  onSearch,
  onCreateGroup,
  onJoinGroup
}) => {
  const navigate = useNavigate();
  const { user } = useUser();

  return (
    <div className="flex flex-col w-full ml-0 bg-white lg:w-[320px] lg:ml-0 lg:border-r lg:border-gray-200">
      <div className="p-5 pb-3 mt-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/profile")}
            className="flex lg:hidden items-center justify-center h-10 w-10 shrink-0 rounded-full bg-gray-200 text-white font-bold"
          >
            {user?.name?.charAt(0)}
          </button>

          <div className="flex flex-1 items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5">
            <Search className="text-gray-400 shrink-0" size={18} />
            <input
              type="text"
              placeholder="Search groups..."
              aria-label="Search groups"
              onChange={(e) => onSearch?.(e.target.value)}
              className="w-full bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none"
            />
          </div>
        </div>
        <div className="mt-6 flex gap-2">
          <button
            onClick={onCreateGroup}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            <Plus size={16} />
            New group
          </button>

          <button
            onClick={onJoinGroup}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            <LogIn size={16} />
            Join group
          </button>
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