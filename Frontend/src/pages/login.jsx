import { useState } from 'react'


const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(true)

  const handleSubmit = async (event) => {
    event.preventDefault()
    const data = { 
      email,
      password,
      rememberMe,
    }
    try{
      const response = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      const result = await response.json();
      console.log(result);
    }
    catch(error){
      console.error('Login error:', error)
    }
    
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.16),_transparent_35%),linear-gradient(135deg,_#0f172a_0%,_#111827_45%,_#1e293b_100%)] px-4 py-8 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center">
        <div className="grid w-full overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 shadow-2xl shadow-slate-950/40 backdrop-blur-xl lg:grid-cols-[1.1fr_0.9fr]">
          <div className="relative hidden flex-col justify-between overflow-hidden p-10 lg:flex">
            <div className="absolute inset-0 bg-[linear-gradient(160deg,_rgba(14,165,233,0.22),_rgba(15,23,42,0.08)_45%,_transparent)]" />
            <div className="relative z-10 max-w-lg">
              <span className="inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">
                Student Budget Planner
              </span>
              <h1 className="mt-6 text-5xl font-semibold leading-tight text-white">
                Keep your money organized without the clutter.
              </h1>
              <p className="mt-5 text-base leading-7 text-slate-300">
                Track spending, watch your balances, and stay in control of your
                budget from one clean dashboard.
              </p>
            </div>

            <div className="relative z-10 grid gap-4 text-sm text-slate-300">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                Plan monthly expenses and see what is left at a glance.
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                Simple sign in flow ready to connect to your backend later.
              </div>
            </div>
          </div>

          <div className="bg-slate-950/80 p-6 sm:p-10 lg:p-12">
            <div className="mx-auto max-w-md">
              <div className="mb-8 lg:hidden">
                <span className="inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">
                  Student Budget Planner
                </span>
                <h1 className="mt-4 text-3xl font-semibold text-white">
                  Sign in to your account
                </h1>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Manage budgets, track expenses, and keep everything in one
                  place.
                </p>
              </div>

              <div className="mb-8 hidden lg:block">
                <h2 className="text-3xl font-semibold text-white">Welcome back</h2>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Enter your details to continue to your dashboard.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-medium text-slate-200"
                  >
                    Email address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-400/60 focus:bg-white/8 focus:ring-4 focus:ring-cyan-400/10"
                    autoComplete="email"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-medium text-slate-200"
                  >
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter your password"
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-400/60 focus:bg-white/8 focus:ring-4 focus:ring-cyan-400/10"
                    autoComplete="current-password"
                    required
                  />
                </div>

                <div className="flex items-center justify-between gap-4 text-sm text-slate-300">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(event) => setRememberMe(event.target.checked)}
                      className="h-4 w-4 rounded border-white/20 bg-white/5 text-cyan-400 focus:ring-cyan-400"
                    />
                    Remember me
                  </label>

                  <a
                    href="#"
                    className="font-medium text-cyan-300 transition hover:text-cyan-200"
                  >
                    Forgot password?
                  </a>
                </div>

                <button
                  type="submit"
                  className="inline-flex w-full items-center justify-center rounded-2xl bg-cyan-400 px-4 py-3 font-semibold text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:bg-cyan-300 focus:outline-none focus:ring-4 focus:ring-cyan-400/20"
                >
                  Sign in
                </button>
              </form>

              <p className="mt-8 text-center text-sm text-slate-400">
                New here?{' '}
                <a href="#" className="font-medium text-cyan-300 hover:text-cyan-200">
                  Create an account
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}



export default Login
