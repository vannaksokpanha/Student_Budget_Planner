import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { TbArrowLeft, TbMail, TbUser, TbShield, TbLogout, TbChevronRight } from "react-icons/tb";
import { useUser } from "../Context/UserContext";

const isTokenValid = (token) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
};

const Profile = () => {
  const navigate = useNavigate();
  const { user, logout } = useUser();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || !isTokenValid(token)) {
      navigate('/login', { replace: true });
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/user/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch profile');
        const data = await res.json();
        setProfile(data.user);
      } catch {
        navigate('/login', { replace: true });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-dark-violet border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const displayName = profile?.name || user.name;
  const displayEmail = profile?.email || '';

  return (
    <div className="min-h-screen bg-brand-white pb-24">

      {/* Header */}
      <div className="bg-brand-base px-5 pt-12 pb-20">
        <button
          onClick={() => navigate(-1)}
          className="text-white/60 hover:text-white active:scale-95 mb-6 flex items-center gap-1 transition-all duration-150"
        >
          <TbArrowLeft className="w-5 h-5" />
          <span className="text-sm font-causten">Back</span>
        </button>

        <div className="flex flex-col items-center">
          <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mb-4">
            <span className="text-white text-3xl font-causten font-extrabold">
              {displayName.charAt(0).toUpperCase()}
            </span>
          </div>
          <h1 className="text-white text-2xl font-causten font-extrabold">{displayName}</h1>
          <p className="text-white/60 text-sm font-causten mt-1">{displayEmail}</p>
        </div>
      </div>

      {/* Profile options card */}
      <div className="mx-4 -mt-10">
        <div className="bg-white rounded-2xl shadow-lg px-5 py-5 divide-y divide-gray-100">

          <div className="flex items-center gap-4 py-4">
            <div className="w-10 h-10 rounded-full bg-brand-light-pink flex items-center justify-center">
              <TbUser className="w-5 h-5 text-brand-dark-violet" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-causten font-bold text-brand-dark-violet">Name</p>
              <p className="text-sm text-gray-400 truncate">{displayName}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 py-4">
            <div className="w-10 h-10 rounded-full bg-brand-light-pink flex items-center justify-center">
              <TbMail className="w-5 h-5 text-brand-dark-violet" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-causten font-bold text-brand-dark-violet">Email</p>
              <p className="text-sm text-gray-400 truncate">{displayEmail}</p>
            </div>
          </div>

        </div>
      </div>

      {/* Actions */}
      <div className="mx-4 mt-6">
        <div className="bg-white rounded-2xl shadow-lg px-5 py-2 divide-y divide-gray-100">

          <button
            onClick={() => {}}
            className="w-full flex items-center gap-4 py-4 text-left active:scale-[0.98] transition-transform duration-150"
          >
            <div className="w-10 h-10 rounded-full bg-brand-light-pink flex items-center justify-center">
              <TbShield className="w-5 h-5 text-brand-dark-violet" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-causten font-bold text-brand-dark-violet">Change Password</p>
              <p className="text-xs text-gray-400">Update your password</p>
            </div>
            <TbChevronRight className="w-5 h-5 text-gray-300" />
          </button>

        </div>
      </div>

      {/* Logout */}
      <div className="mx-4 mt-6">
        <button
          onClick={handleLogout}
          className="w-full bg-white rounded-2xl shadow-lg px-5 py-4 flex items-center gap-4 text-left hover:bg-red-50 active:scale-[0.98] transition-all duration-150"
        >
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
            <TbLogout className="w-5 h-5 text-red-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-causten font-bold text-red-400">Log Out</p>
            <p className="text-xs text-gray-400">Sign out of your account</p>
          </div>
          <TbChevronRight className="w-5 h-5 text-gray-300" />
        </button>
      </div>

    </div>
  );
};

export default Profile;
