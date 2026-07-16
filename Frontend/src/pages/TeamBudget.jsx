import { useEffect, useState } from "react";
import { useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '../Context/UserContext';
import GroupDetails from '../components/Team/GroupDetails';
import GroupPanel from '../components/Team/GroupPanel';
import CreateGroup from '../components/Team/CreateGroup';
import JoinGroup from '../components/Team/JoinGroup';
import NotificationBell from '../components/NotificationBell';

// Relative path, not an absolute localhost URL — Vite's dev proxy forwards
// /api to the backend, and that's what still works when this is served
// through the ngrok tunnel from another device (see ngrok.yml).
const API = '/api';
const authHeader = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('token')}`
});

// Normalises a raw contribution row from the API into the shape the UI expects.
// status can be null on rows added before that column existed.
const mapContribution = (c) => ({
  id: c.id,
  groupId: c.groupId,
  contributorId: c.contributorId,
  name: c.contributorName,
  date: new Date(c.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
  reason: c.reason,
  amount: `$${c.amount.toFixed(2)}`,
  status: c.status || '—'
});

// Reads the user id out of the JWT payload (same technique MonthlyBudget.jsx
// uses) so we know which Expense Breakdown row belongs to the viewer.
const getMyUserId = () => {
  try {
    const token = localStorage.getItem('token');
    return JSON.parse(atob(token.split('.')[1])).id;
  } catch {
    return null;
  }
};

const mapMember = (m) => ({
  userId: m.userId,
  name: m.name,
  role: m.role
});

const TeamBudget = () => {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(null);
  const [groups, setGroups] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [members, setMembers] = useState([]);
  const [activeGroupId, setActiveGroupId] = useState(null);
  const [activeTab, setActiveTab] = useState("Savings Plan");
  const [searchQuery, setSearchQuery] = useState("");
  // Below the lg breakpoint the panel and details never show at once —
  // picking a group drills into the detail view, "back" returns to the list.
  const [showDetailOnMobile, setShowDetailOnMobile] = useState(false);
  const [toast, setToast] = useState(null);
  // Create / Join are bottom sheets on this page rather than separate routes
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useUser();
  const myUserId = getMyUserId();

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 2500);
  };

  const fetchGroups = async () => {
    try {
      const res = await fetch(`${API}/team-budget/groups`, {
        headers: authHeader(),
      })

      if (res.status === 401 || res.status === 403){
        logout();
        navigate('/login');
        return;
      }
      if (!res.ok) {
        throw new Error('Failed to load groups');
      }
      const data = await res.json();
      setGroups(data);
      setActiveGroupId((current) => {
        if (data.some(g => g.id === current)) return current;
        // On first load, prefer the group CreateGroup/JoinGroup just sent us
        // here for, instead of always falling back to the first in the list.
        const newGroupId = location.state?.newGroupId;
        if (newGroupId && data.some(g => g.id === newGroupId)) return newGroupId;
        return data[0]?.id ?? null;
      });
      setReady(true);
    }
    catch(err){
      setError('Could not load your groups. Please try again.');
      setReady(true)
    }
  };

  useEffect(() => {
    fetchGroups();
  }, [navigate]);

  // Coming back from a sub-page (e.g. adding a contribution) on mobile should
  // return straight to the group's detail view, not fall back to the list.
  useEffect(() => {
    if (location.state?.showDetailOnMobile) {
      setShowDetailOnMobile(true);
    }
  }, []);

  const fetchExpenses = async () => {
    if (!activeGroupId) return;

    try {
      const res = await fetch(`${API}/team-budget/groups/${activeGroupId}/expenses`, {
        headers: authHeader(),
      });

      if (res.status === 401 || res.status === 403){
        logout();
        navigate('/login');
        return;
      }
      if (!res.ok) return;

      const data = await res.json();
      setExpenses(data.map(mapContribution));
    }
    catch(err){
      console.error('Failed to load group expenses:', err);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [activeGroupId, navigate]);

  const fetchMembers = async () => {
    if (!activeGroupId) return;

    try {
      const res = await fetch(`${API}/team-budget/groups/${activeGroupId}/members`, {
        headers: authHeader(),
      });

      if (res.status === 401 || res.status === 403){
        logout();
        navigate('/login');
        return;
      }
      if (!res.ok) return;

      const data = await res.json();
      setMembers(data.map(mapMember));
    }
    catch(err){
      console.error('Failed to load group members:', err);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [activeGroupId]);

  if (error) return <div className="min-h-screen flex items-center justify-center"><h1 className="text-2xl font-bold">{error}</h1></div>;

  const activeGroup = groups.find((g) => g.id === activeGroupId) || null;

  const filteredGroups = searchQuery
    ? groups.filter(g => g.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : groups;

  const handleGroupSelect = (groupId) => {
    setActiveGroupId(groupId);
    setShowDetailOnMobile(true);
  };

  const handleBackToList = () => {
    setShowDetailOnMobile(false);
  };

  const handleCreateGroup = () => {
    setShowCreate(true);
  };

  const handleJoinGroup = () => {
    setShowJoin(true);
  };

  // Shared success path for both sheets: close, refresh the list, and open the
  // group that was just created/joined.
  const handleGroupJoined = async (newGroupId) => {
    setShowCreate(false);
    setShowJoin(false);
    await fetchGroups();
    if (newGroupId) {
      setActiveGroupId(newGroupId);
      setShowDetailOnMobile(true);
    }
  };

  const handleAddContribution = () => {
    navigate(`/group/${activeGroupId}/contribute`);
  };

  const handleViewHistory = () => {
    navigate(`/group/${activeGroupId}/history`);
  };

  const handleSetExpense = (expenseId) => {
    navigate(`/group/${activeGroupId}/expense/${expenseId}/items`);
  };

  const handleShare = async () => {
    if (!activeGroup) return;

    const token = activeGroup.token;
    try {
      await navigator.clipboard.writeText(token);
      showToast('Invite token copied!');
    } catch (err) {
      // Clipboard access can be blocked (permissions, non-HTTPS context).
      console.error('Failed to copy invite token:', err);
      showToast('Could not copy invite token');
    }
  };

  const handleLeaveGroup = async () => {
    if (!activeGroup) return;

    try {
      const res = await fetch(`${API}/team-budget/groups/${activeGroup.id}/members/me`, {
        method: 'DELETE',
        headers: authHeader()
      });
      if (!res.ok) {
        const data = await res.json();
        showToast(data.message || 'Could not leave group');
        return;
      }

      setGroups((prev) => prev.filter((g) => g.id !== activeGroup.id));
      setActiveGroupId(null);
      setShowDetailOnMobile(false);
      showToast('Left group');
    } catch (err) {
      showToast('Could not leave group');
    }
  };

  const handleDeleteGroup = async () => {
    if (!activeGroup) return;

    try {
      const res = await fetch(`${API}/team-budget/groups/${activeGroup.id}`, {
        method: 'DELETE',
        headers: authHeader()
      });
      if (!res.ok) {
        const data = await res.json();
        showToast(data.message || 'Could not delete group');
        return;
      }

      setGroups((prev) => prev.filter((g) => g.id !== activeGroup.id));
      setActiveGroupId(null);
      setShowDetailOnMobile(false);
      showToast('Group deleted');
    } catch (err) {
      showToast('Could not delete group');
    }
  };

  const handleDeleteContribution = async (expenseId) => {
    if (!activeGroup) return;

    try {
      const res = await fetch(`${API}/team-budget/groups/${activeGroup.id}/expenses/${expenseId}`, {
        method: 'DELETE',
        headers: authHeader()
      });
      if (!res.ok) {
        const data = await res.json();
        showToast(data.message || 'Could not remove contribution');
        return;
      }

      // Removing a contribution changes the group's totals too.
      fetchExpenses();
      fetchGroups();
      showToast('Contribution removed');
    } catch (err) {
      showToast('Could not remove contribution');
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!activeGroup) return;

    try {
      const res = await fetch(`${API}/team-budget/groups/${activeGroup.id}/members/${userId}`, {
        method: 'DELETE',
        headers: authHeader()
      });
      if (!res.ok) {
        const data = await res.json();
        showToast(data.message || 'Could not remove member');
        return;
      }

      // Removing a member also deletes their contributions on the backend,
      // so the expense list and the group's totals need refreshing too.
      fetchMembers();
      fetchExpenses();
      fetchGroups();
      showToast('Member removed');
    } catch (err) {
      showToast('Could not remove member');
    }
  };

  return (
    <div className="min-h-screen bg-white pb-24 font-causten">

      {/* ── Header — same gradient hero as the other pages ─────────────────── */}
      <div
        className="relative px-5 pt-12 pb-10 min-h-45 bg-brand-base"
        style={{ backgroundImage: 'linear-gradient(to bottom, rgba(0, 92, 255, 0.3), rgba(245, 245, 245, 0.3))' }}
      >
        {/* Bell + profile avatar */}
        <div className="absolute top-12 right-5 flex items-center gap-3">
          <NotificationBell />
          <button
            onClick={() => navigate('/profile')}
            className="w-12 h-12 rounded-full bg-white hover:bg-white/90 active:scale-90 transition-all duration-150 flex items-center justify-center shrink-0"
          >
            <span className="text-brand-dark-violet font-causten font-bold text-base">
              {user?.name?.charAt(0)?.toUpperCase() || '?'}
            </span>
          </button>
        </div>

        {/* Page title */}
        <div className="mb-3 pr-16">
          <p className="text-white/60 text-base font-causten">Budget with your</p>
          <h1 className="text-white text-3xl font-causten font-extrabold tracking-tight">Teams</h1>
        </div>
      </div>

      {/* ── Content sheet: group list + details. Gated on `ready` so it never
          renders with empty data before groups load; the header above paints
          immediately, so there's no white flash. ──────────────────────────── */}
      {ready && (
      <div className="relative z-10 bg-white flex flex-col lg:flex-row lg:items-start">
        <div className={`${showDetailOnMobile ? 'hidden' : 'block'} lg:block`}>
          <GroupPanel
            groups={filteredGroups}
            activeGroupId={activeGroupId}
            onGroupSelect={handleGroupSelect}
            onSearch={setSearchQuery}
            onCreateGroup={handleCreateGroup}
            onJoinGroup={handleJoinGroup}
          />
        </div>

        <div className={`${showDetailOnMobile ? 'block' : 'hidden'} lg:block w-full ml-0 flex-1 lg:w-auto`}>
          <GroupDetails
          group={activeGroup}
          expenses={expenses}
          members={members}
          myUserId={myUserId}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onAddContribution={handleAddContribution}
          onViewHistory={handleViewHistory}
          onShare={handleShare}
          onBack={handleBackToList}
          onRemoveMember={handleRemoveMember}
          onSetExpense={handleSetExpense}
          onLeaveGroup={handleLeaveGroup}
          onDeleteGroup={handleDeleteGroup}
          onDeleteContribution={handleDeleteContribution}
        />
        </div>
      </div>
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-brand-dark-violet px-4 py-2.5 text-sm font-causten font-bold text-white shadow-lg">
          {toast}
        </div>
      )}

      {showCreate && (
        <CreateGroup onClose={() => setShowCreate(false)} onSuccess={handleGroupJoined} />
      )}
      {showJoin && (
        <JoinGroup onClose={() => setShowJoin(false)} onSuccess={handleGroupJoined} />
      )}
    </div>
  );
};

export default TeamBudget;