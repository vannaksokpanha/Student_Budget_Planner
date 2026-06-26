import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar'
import SavingsCard from '../components/GoalCard'

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
    <>
    
    <div className="md:hidden min-h-screen pt-14 bg-brand-base bg-linear-to-b from-brand-blue/30 to-brand-white/30">
      <div className="text-center">
        <h1 className="text-3xl text-white font-causten font-bold">SAVINGS</h1>
      </div>

      <section className="flex flex-col items-center mt-10">
        <div className="flex justify-between w-[95%] min-h-[270px] rounded-3xl bg-white p-6 shadow-xl">
          <div className="text-5xl">piggy bank</div>
          <div className="flex flex-col ml-20 mr-8">
              <div className="flex text-3xl pt-2 mb-8 font-causten font-bold text-brand-dark-violet ">KEEP TRACK ON YOUR SAVINGS PROGRESS!</div>
              <div >
                <span className="text-3xl font-bold text-brand-dark-violet">
                  35%
                </span>
                <span className="text-xl ml-2 font-causten font-bold text-sm text-gray-600">
                  / 100%
                </span>
                <div className="w-full min-h-4 rounded-3xl bg-brand-dark-violet/30"></div>
                <div className=""></div>
              </div>
          </div>
        </div>
      </section>

      
      <section className="flex flex-col items-center ">
        <div className="w-[95%] mb-3 mt-5 flex justify-between items-center"> 
          <h2 className="font-causten font-bold text-white text-2xl ">YOUR GOALS</h2>
          <button className="group inline-flex items-center justify-center bg-white border-brand-dark-violet/50 border-2 text-brand-dark-violet hover:bg-brand-dark-violet hover:text-white font-medium px-4 py-1 rounded-full transition-all duration-300 ease-in-out hover:shadow-lg hover:shadow-blue-500/30">
            <span class="text-xl leading-none">+</span>
            <span class="text-white max-w-0 overflow-hidden opacity-0 whitespace-nowrap transition-all duration-300 ease-in-out group-hover:max-w-xs group-hover:opacity-100 group-hover:ml-2">
              Add Goal
            </span>
          </button>
        </div>
        
        <div className="flex flex-col items-center "></div>
      </section>
      <NavBar />
      

    </div>

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
    </>
    
  )
}

export default Savings;
