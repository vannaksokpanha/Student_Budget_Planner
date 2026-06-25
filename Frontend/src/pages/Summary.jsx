import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar'

const Summary = () => {
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
          setError('Unauthorized');
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
    <div className="md:hidden min-h-screen pt-10 pb-28 bg-brand-base bg-linear-to-b from-brand-blue/30 to-brand-white/30">
      <div className="text-center">
        <h1 className="text-3xl text-white font-causten font-bold">SUMMARY</h1>
      </div>
      <NavBar />
    </div>
  )
}

export default Summary;
