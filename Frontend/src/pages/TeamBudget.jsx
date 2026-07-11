import { useEffect, useState } from "react";
import { useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '../Context/UserContext';
import GroupDetails from '../components/Team/GroupDetails';
import GroupPanel from '../components/Team/GroupPanel';

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
  if (!ready) return null;

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
    navigate("/create-group");
  };

  const handleJoinGroup = () => {
    navigate("/join-group");
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
    <div className="flex flex-col lg:flex-row h-screen bg-gray-50 font-sans">
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

      <div className={`${showDetailOnMobile ? 'block' : 'hidden'} lg:block w-full ml-0 flex-1 overflow-y-auto lg:w-auto`}>
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

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-medium text-white shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
};

export default TeamBudget;