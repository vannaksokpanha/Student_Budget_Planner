import { useState } from 'react'
import { API } from '../utils/api';
import { signupValidation } from '../validations/auth/signUp.js'
import { Link } from 'react-router-dom'

const Signup = () => {
  const [values, setValues] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })

  const [error, setError] = useState({})
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationErrors = signupValidation(values);
    setError(validationErrors);

    if (Object.keys(validationErrors).length !== 0) return;

    try {
      setLoading(true);
      const res = await fetch(`${API}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (res.status === 409) {
          setError(prev => ({ ...prev, email: data.message || 'Email already exists' }));
        }

        console.error(data);
        return;
      }

      setValues({ name: '', email: '', password: '', confirmPassword: '' });
      setError({});
      setLoading(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }


  const handleInput = (event) => {
    setValues(prev => ({ ...prev, [event.target.name]: event.target.value }))
  }

  return (
    <div className='min-h-screen bg-blue-300'>


      {/* Desktop (>=md) */}
      <div className="hidden md:flex min-h-screen">
        {/* Left side */}
        <div className="flex-1 bg-blue-500 flex flex-col items-center justify-center p-12 border-r border-white/20">
          <div className="text-center">
            <h1 className='text-6xl font-bold text-white mb-4'>Balance</h1>
            <p className='text-xl text-white/80 mb-1'>Bills are tucked away</p>
            <p className='text-lg text-white/60'>The rest is yours to play</p>
          </div>
        </div>
        {/* Right Side */}
        <div className="flex-2 bg-blue-500 flex items-center justify-center p-8 ">
          <div className="w-full max-w-md">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-12 border border-white/10">
              <div className=" mt-1">
                <Link to='/login' className='absolute top-4 left-4 text-white/80 hover:text-white flex items-center gap-1 text-sm transition-colors'><h1>Back</h1></Link>
              </div>
              <div className="text-center mb-10">
                <h2 className='text-2xl text-white/80 mb-2'>Create Account</h2>
                <p className='text-lg text-white/80'>Sign up to get started</p>
              </div>
              <form onSubmit={handleSubmit} className='space-y-6'>
                <div>
                  <input
                    placeholder='Enter your full name'
                    name='name'
                    type='text'
                    value={values.name}
                    onChange={handleInput}
                    className='w-full px-4 py-3 bg-white/5 border border-white/5 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/20'
                  />
                  {error.name && <p className='text-red-300 text-sm mt-1'>{error.name}</p>}
                </div>
                <div>
                  <input
                    placeholder='Enter your email'
                    name='email'
                    type='text'
                    required
                    value={values.email}
                    onChange={handleInput}
                    className='w-full px-4 py-3 bg-white/5 border border-white/5 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/20'
                  />
                  {error.email && <p className='text-red-300 text-sm mt-1'>{error.email}</p>}
                </div>
                <div>
                  <input
                    placeholder='Enter your password'
                    name='password'
                    type='password'
                    required
                    value={values.password}
                    onChange={handleInput}
                    className='w-full px-4 py-3 bg-white/5 border border-white/5 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/20'
                  />
                  {error.password && <p className='text-red-300 text-sm mt-1'>{error.password}</p>}
                </div>
                <div>
                  <input
                    placeholder='Confirm your password'
                    name='confirmPassword'
                    type='password'
                    required
                    value={values.confirmPassword}
                    onChange={handleInput}
                    className='w-full px-4 py-3 bg-white/5 border border-white/5 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/20'
                  />
                  {error.confirmPassword && <p className='text-red-300 text-sm mt-1'>{error.confirmPassword}</p>}
                </div>

                <button
                  type='submit'
                  disabled={loading}
                  className='w-full py-3 bg-white/20 hover:bg-white/30 hover:-translate-y-0.5 hover:shadow-md rounded-lg font-semibold text-white transition-all duration-150'
                >
                  {loading ? 'Signing up...' : 'Sign up'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile (<md) */}
      <div className='md:hidden min-h-screen flex items-center justify-center p-4 bg-brand-base bg-linear-to-b from-brand-blue/30 to-brand-white/30 h-64'>
        <div className="w-full max-w-sm">

          {/* Header */}
          <div className=" mt-1">
                <Link to='/login' className='absolute top-4 left-4 text-white/80 hover:text-white flex items-center gap-1 text-sm transition-colors'><h1>Back</h1></Link>
              </div>
          <div className="text-center mb-8">
            <h2 className='text-4xl font-causten font-extrabold text-white'>SIGN UP TO BALANCE</h2>
            <p className="text-white mt-2">Bills are tucked away</p>
            <p className="text-white/70 text-sm">The rest is yours to play</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className='space-y-3'>
            <input
              placeholder='Enter your full name'
              type='text'
              name='name'
              required
              value={values.name}
              onChange={handleInput}
              className='w-full px-4 py-3 bg-white border border-white/10 rounded-lg text-brand-dark-violet placeholder-brand-dark-violet/30 focus:outline-none focus:ring-2 focus:ring-white/20'
            />
            {error.name && <p className='text-red-300 text-xs mt-1'>{error.name}</p>}

            <input
              placeholder='Enter your email'
              type='email'
              name='email'
              required
              value={values.email}
              onChange={handleInput}
              className='w-full px-4 py-3 bg-white border border-white/10 rounded-lg text-brand-dark-violet placeholder-brand-dark-violet/30 focus:outline-none focus:ring-2 focus:ring-white/20'
            />
            {error.email && <p className='text-red-300 text-xs mt-1'>{error.email}</p>}

            <input
              placeholder='Enter your password'
              type='password'
              name='password'
              required
              value={values.password}
              onChange={handleInput}
              className='w-full px-4 py-3 bg-white border border-white/10 rounded-lg text-brand-dark-violet placeholder-brand-dark-violet/30 focus:outline-none focus:ring-2 focus:ring-white/20'
            />
            {error.password && <p className='text-red-300 text-xs mt-1'>{error.password}</p>}

            <input
              placeholder='Confirm your password'
              type='password'
              name='confirmPassword'
              required
              value={values.confirmPassword}
              onChange={handleInput}
              className='w-full px-4 py-3 bg-white border border-white/10 rounded-lg text-brand-dark-violet placeholder-brand-dark-violet/30 focus:outline-none focus:ring-2 focus:ring-white/20'
            />
            {error.confirmPassword && <p className='text-red-300 text-xs mt-1'>{error.confirmPassword}</p>}

            <button
              type='submit'
              disabled={loading}
              className='w-full border-brand-dark-violet py-3 text-brand-dark-violet bg-brand-light-pink hover:text-white hover:bg-brand-dark-violet hover:-translate-y-0.5 hover:shadow-md rounded-lg font-semibold transition-all duration-150'
            >
              {loading ? 'Signing up...' : 'Sign up'}
            </button>
          </form>

        </div>
      </div>

    </div>
  )
}

export default Signup

