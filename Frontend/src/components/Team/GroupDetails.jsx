import React, { useState } from 'react';
import {
  Share2, MoreVertical, FlaskConical, Plus,
  Users, CreditCard, ArrowLeft, UserMinus, ReceiptText, Trash2
} from 'lucide-react';

const TABS = ["Savings Plan", "Members"];

// One member row: name, role, and — for the owner only, on everyone but
// themselves — a button to remove that member from the group.
const MemberRow = ({ member, canManage, onRemove }) => (
  <div className="flex items-center justify-between gap-3 border-b border-gray-50 px-6 py-4 last:border-b-0">
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-200 text-sm font-semibold text-gray-600">
        {member.name?.charAt(0)?.toUpperCase() || "?"}
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-900">{member.name}</p>
        <p className="text-xs capitalize text-gray-400">{member.role}</p>
      </div>
    </div>

    {canManage && member.role !== 'owner' && (
      <button
        onClick={() => onRemove(member.userId)}
        className="flex items-center gap-1.5 text-sm font-medium text-red-500 hover:text-red-600"
      >
        <UserMinus size={16} />
        Remove
      </button>
    )}
  </div>
);

const MembersPanel = ({ members, isOwner, onRemoveMember }) => (
  <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
    {members.length === 0 && (
      <p className="px-6 py-6 text-center text-sm text-gray-400">No members yet.</p>
    )}
    {members.map((member) => (
      <MemberRow
        key={member.userId}
        member={member}
        canManage={isOwner}
        onRemove={onRemoveMember}
      />
    ))}
  </div>
);

// Sub-component for expense table
// Everyone can open any row to view its items; myUserId only changes the
// label/whether the add form shows once inside (SetExpense.jsx enforces
// that server-side too, so this is just about the button's wording here).
const ExpenseTable = ({ expenses, onViewHistory, myUserId, onSetExpense, isOwner, onDeleteContribution }) => {
  return (
    <div className="mt-6 overflow-hidden rounded-2xl border border-gray-100 bg-white">
      <div className="flex items-center justify-between px-6 py-5">
        <h2 className="text-lg font-bold text-gray-900">Expense Breakdown</h2>
        <button
          onClick={onViewHistory}
          className="text-sm font-semibold text-indigo-700 hover:text-indigo-800"
        >
          View All History
        </button>
      </div>

      {/* Table only fits comfortably from md up — phones get a stacked card list below. */}
      <table className="hidden w-full text-left md:table">
        <thead>
          <tr className="border-y border-gray-100 bg-gray-50/60 text-xs font-semibold uppercase tracking-wide text-gray-400">
            <th className="px-6 py-3">Contributor</th>
            <th className="px-6 py-3">Reason</th>
            <th className="px-6 py-3">Amount</th>
            <th className="px-6 py-3">Status</th>
            <th className="px-6 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {expenses.length === 0 && (
            <tr>
              <td colSpan={5} className="px-6 py-6 text-center text-sm text-gray-400">
                No expenses yet.
              </td>
            </tr>
          )}
          {expenses.map((row) => (
            <tr key={row.id} className="border-b border-gray-50">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-200 text-sm font-semibold text-gray-600">
                    {row.name?.charAt(0)?.toUpperCase() || "?"}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{row.name}</p>
                    <p className="text-xs text-gray-400">{row.date}</p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 text-sm text-gray-700">{row.reason}</td>
              <td className="px-6 py-4 text-sm font-bold text-gray-900">{row.amount}</td>
              <td className="px-6 py-4">
                <span className={`inline-flex items-center gap-1.5 text-sm font-medium ${row.status === 'Pending' ? 'text-amber-600' : 'text-emerald-600'}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${row.status === 'Pending' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                  {row.status}
                </span>
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-4">
                  <button
                    onClick={() => onSetExpense(row.id)}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-700 hover:text-indigo-800"
                  >
                    <ReceiptText size={16} />
                    {row.contributorId === myUserId ? "Set Expense" : "View"}
                  </button>
                  {isOwner && (
                    <button
                      onClick={() => onDeleteContribution(row.id)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="divide-y divide-gray-50 md:hidden">
        {expenses.length === 0 && (
          <div className="px-6 py-6 text-center text-sm text-gray-400">No expenses yet.</div>
        )}
        {expenses.map((row) => (
          <div key={row.id} className="px-6 py-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-200 text-sm font-semibold text-gray-600">
                  {row.name?.charAt(0)?.toUpperCase() || "?"}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-gray-900">{row.name}</p>
                  <p className="text-xs text-gray-400">{row.date}</p>
                </div>
              </div>
              <p className="shrink-0 text-sm font-bold text-gray-900">{row.amount}</p>
            </div>

            <p className="mt-2 text-sm text-gray-700">{row.reason}</p>

            <div className="mt-2 flex items-center justify-between gap-2">
              <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${row.status === 'Pending' ? 'text-amber-600' : 'text-emerald-600'}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${row.status === 'Pending' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                {row.status}
              </span>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => onSetExpense(row.id)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-700 hover:text-indigo-800"
                >
                  <ReceiptText size={14} />
                  {row.contributorId === myUserId ? "Set Expense" : "View"}
                </button>
                {isOwner && (
                  <button
                    onClick={() => onDeleteContribution(row.id)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const GroupDetails = ({
  group,
  expenses,
  members = [],
  myUserId,
  activeTab,
  onTabChange,
  onAddContribution,
  onViewHistory,
  onShare,
  onBack,
  onRemoveMember,
  onSetExpense,
  onLeaveGroup,
  onDeleteGroup,
  onDeleteContribution
}) => {
  const [menuOpen, setMenuOpen] = useState(false);

  if (!group) {
    return (
      <div className="flex h-full items-center justify-center text-gray-400">
        Select a group to see details
      </div>
    );
  }

  const activeExpenses = expenses.filter((e) => e.groupId === group.id);

  return (
    <>
      {/* header */}
      <div className="flex items-center justify-between border-b border-gray-100 px-8 py-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex lg:hidden items-center justify-center h-9 w-9 shrink-0 rounded-full text-gray-500 hover:bg-gray-100"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-indigo-600 to-purple-800 text-white">
            <FlaskConical size={22} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {group.name}
            </h1>
            <p className="text-sm text-gray-500">
              Created by {group.createdBy || "—"}
              {group.createdAt ? ` • ${group.createdAt}` : ""}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-5 text-gray-400">
          <button onClick={onShare} className="hover:text-gray-600">
            <Share2 size={20} />
          </button>
          <div className="relative">
            <button onClick={() => setMenuOpen((open) => !open)} className="hover:text-gray-600">
              <MoreVertical size={20} />
            </button>

            {menuOpen && (
              <>
                {/* Click anywhere outside the menu to dismiss it. */}
                <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 top-full z-50 mt-2 w-44 overflow-hidden rounded-xl border border-gray-100 bg-white py-1 shadow-lg">
                  {group.myRole === 'owner' ? (
                    <button
                      onClick={() => { setMenuOpen(false); onDeleteGroup(); }}
                      className="block w-full px-4 py-2.5 text-left text-sm font-medium text-red-500 hover:bg-gray-50"
                    >
                      Delete Group
                    </button>
                  ) : (
                    <button
                      onClick={() => { setMenuOpen(false); onLeaveGroup(); }}
                      className="block w-full px-4 py-2.5 text-left text-sm font-medium text-red-500 hover:bg-gray-50"
                    >
                      Leave Group
                    </button>
                  )}
                  <button
                    onClick={() => setMenuOpen(false)}
                    className="block w-full px-4 py-2.5 text-left text-sm font-medium text-gray-600 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* tabs */}
      <div className="flex gap-8 border-b border-gray-100 px-8">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={`-mb-px border-b-2 pb-3 pt-4 text-sm font-semibold transition-colors ${
              activeTab === tab
                ? "border-indigo-800 text-indigo-800"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="px-8 py-8">
        {activeTab === "Savings Plan" && (
          <>
            {/* goal card */}
            <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-indigo-950 via-purple-900 to-purple-700 p-8 text-white">
              <div className="absolute -right-10 -top-10 h-56 w-56 rounded-full bg-white/5" />
              <div className="absolute -right-20 top-16 h-40 w-40 rounded-full bg-white/5" />

              <p className="relative text-sm text-indigo-200">Total Group Goal</p>
              <div className="relative mt-2 flex items-baseline gap-3">
                <span className="text-4xl font-bold tracking-tight">
                  ${group.currentAmount?.toLocaleString() ?? "0"}
                </span>
                <span className="text-indigo-200">
                  of ${group.targetAmount?.toLocaleString() ?? "0"}
                </span>
              </div>

              <div className="relative mt-8 flex items-center justify-between text-sm">
                <span className="text-indigo-100">
                  {group.progress ?? 0}% Completed
                </span>
                <span className="text-indigo-100">
                  ${((group.targetAmount || 0) - (group.currentAmount || 0)).toLocaleString()} Left
                </span>
              </div>
              <div className="relative mt-2 h-2 w-full rounded-full bg-white/20">
                <div
                  className="h-full rounded-full bg-white"
                  style={{ width: `${group.progress ?? 0}%` }}
                />
              </div>

              {group.myRole === 'owner' && (
                <button
                  onClick={onAddContribution}
                  className="relative mt-8 flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-indigo-800 hover:bg-indigo-50 transition-colors"
                >
                  <Plus size={18} />
                  Add Contribution
                </button>
              )}
            </div>

            {/* stat cards */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-gray-100 bg-indigo-50/40 p-5">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Users size={16} />
                  {group.contributorCount ?? 0} Contributors
                </div>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-indigo-50/40 p-5">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <CreditCard size={16} />
                  Avg. Per Person
                </div>
                <div className="mt-4 text-2xl font-bold text-gray-900">
                  ${group.avgPerPerson?.toLocaleString() ?? "0"}
                </div>
              </div>
            </div>

            {/* expense breakdown */}
            <ExpenseTable
              expenses={activeExpenses}
              onViewHistory={onViewHistory}
              myUserId={myUserId}
              onSetExpense={onSetExpense}
              isOwner={group.myRole === 'owner'}
              onDeleteContribution={onDeleteContribution}
            />
          </>
        )}

        {activeTab === "Members" && (
          <MembersPanel
            members={members}
            isOwner={group.myRole === 'owner'}
            onRemoveMember={onRemoveMember}
          />
        )}
      </div>
    </>
  );
};

export default GroupDetails;