// components/GroupList.jsx
import React from 'react';

const GroupList = ({ groups, activeGroupId, onGroupSelect }) => {
  if (groups.length === 0) {
    return <p className="px-5 py-4 text-sm text-gray-400">No groups yet.</p>;
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {groups.map((group) => {
        const isActive = group.id === activeGroupId;
        return (
          <button
            key={group.id}
            onClick={() => onGroupSelect(group.id)}
            className={`block w-full text-left px-5 py-4 border-l-[3px] transition-colors ${
              isActive
                ? "border-indigo-700 bg-indigo-50/60"
                : "border-transparent hover:bg-gray-50"
            }`}
          >
            <div className="flex items-start justify-between gap-2 ">
              <span className="text-[15px] font-semibold text-gray-900">
                {group.name}
              </span>
              {group.time && (
                <span className="whitespace-nowrap text-xs text-gray-400">
                  {group.time}  
                </span>
              )}
            </div>

            {group.message && (
              <p className="mt-1 truncate text-sm text-gray-500">
                {group.message}
              </p>
            )}

            {typeof group.progress === "number" && (
              <div className="mt-3 flex items-center gap-2">
                <div className="h-1.5 flex-1 rounded-full bg-gray-200">
                  <div
                    className="h-full rounded-full bg-indigo-800"
                    style={{ width: `${group.progress}%` }}
                  />
                </div>
                <span className="text-xs font-semibold text-indigo-700">
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
                  <span className="-ml-1.5 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-indigo-700 text-[10px] font-semibold text-white">
                    +{group.extra}
                  </span>
                )}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default GroupList;