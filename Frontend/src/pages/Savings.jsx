 import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar'

const Savings = () => {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const verify = async () => {
      const token = localStorage.getItem('token')
      if (!token) {
        return navigate("/login", { replace: true });
      }
      try {
        const res = await fetch("http://localhost:3000/api/home/home", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: 'no-store'
        })
        if (!res.ok) {
          setError('Unauthorizeddddddddddddddddd');
          return;
        }
        setReady(true)
      }
      catch {
        navigate("/login", { replace: true })
      }
    }
    verify();
  }, [navigate])

  if (error) return <div className="min-h-screen flex items-center justify-center"><h1 className="text-2xl font-bold">{error}</h1></div>;
  if (!ready) return null;

  return (
    <div className="bottom-nav fixed bottom-3 left-1/2 -translate-x-1/2 w-[calc(100%-1rem)] sm:w-[calc(100%-2rem)] max-w-[520px] bg-white flex justify-around py-2.5 pb-3.5 rounded-t-[24px] rounded-b-[24px] shadow-[0_-4px_20px_rgba(0,0,0,0.08)] z-[100] md:bottom-5">
          <a className="nav-item flex flex-col items-center gap-1 cursor-pointer text-gray-400 text-xs font-semibold transition-all duration-300 no-underline px-2 py-1 border-none bg-transparent hover:text-[#4A5CFF]" onClick={() => navigate('/home')}>
            <i className="fas fa-home text-lg"></i>
            <span>Home</span>
          </a>
          <a className="nav-item flex flex-col items-center gap-1 cursor-pointer text-gray-400 text-xs font-semibold transition-all duration-300 no-underline px-2 py-1 border-none bg-transparent hover:text-[#4A5CFF]" onClick={() => navigate('/expenses')}>
            <i className="fas fa-credit-card text-lg"></i>
            <span>Expenses</span>
          </a>
          <a className="nav-item flex flex-col items-center gap-1 cursor-pointer text-[#4A5CFF] text-xs font-semibold transition-all duration-300 no-underline px-2 py-1 border-none bg-transparent hover:text-[#4A5CFF]" onClick={() => navigate('/savings')}>
            <i className="fas fa-piggy-bank text-lg"></i>
            <span>Savings</span>
          </a>
          <a className="nav-item flex flex-col items-center gap-1 cursor-pointer text-gray-400 text-xs font-semibold transition-all duration-300 no-underline px-2 py-1 border-none bg-transparent hover:text-[#4A5CFF]" onClick={() => navigate('/summary')}>
            <i className="fas fa-chart-pie text-lg"></i>
            <span>Summary</span>
          </a>
          <a className="nav-item flex flex-col items-center gap-1 cursor-pointer text-gray-400 text-xs font-semibold transition-all duration-300 no-underline px-2 py-1 border-none bg-transparent hover:text-[#4A5CFF]" onClick={() => navigate('/profile')}>
            <i className="fas fa-user text-lg"></i>
            <span>Profile</span>
          </a>
    </div>
  )
}

export default Savings;
