import { useState } from 'react'
import { Link,useNavigate } from 'react-router-dom'
import { validation } from '../validations/auth/loginValidation.js'
const Login = () => {
  const navigate = useNavigate();

  const [values, setValues] = useState({
    email: '',
    password: ''
  })

  const [error, setError] = useState({})
  const [loading ,setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault();

     const validationErrors = validation(values);
     setError(validationErrors);

    if(Object.keys(validationErrors).length !== 0){
      return;
    }

    try {
      setLoading(true);

      const res = await fetch('http://localhost:3000/api/auth/login' , {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(values)

      })
      const data = await res.json();

      if (res.ok){
        localStorage.setItem('token', data.token)   // store token in local storage 
        localStorage.setItem('userName', data.user.name) 
        navigate('/home')
      }
      else {
        setError({ email: data.message });
      }
    }
    catch (err){
      console.error(err)
      setError({ email: 'Something went wrong' });
    } 
    finally {
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
        <div className="flex-1 bg-brand-base bg-linear-to-b from-brand-blue/30 to-brand-white/30 flex flex-col items-center justify-center p-12 border-r border-white/20">
          <div className="text-center">
            <h1 className='text-7xl font-causten font-extrabold text-white '>Balance</h1>
            <p className='text-xl font-causten font-semibold text-white/80 '>Bills are tucked away</p>
            <p className='text-lg font-causten font-semibold text-white/60'>The rest is yours to play</p>
          </div>
        </div>
        {/* Right Side */}
        <div className="flex-2 bg-white flex items-center justify-center p-8"> 
          <div className="w-full max-w-md">
            <div className="bg-brand-base bg-linear-to-b from-brand-blue/30 to-brand-white/30 backdrop-blur-sm rounded-xl p-12 border border-white/10">
              <div className="text-center mb-10">
                <h2 className='text-4xl font-causten font-bold text-white '>Welcome Back</h2>
                <p className='text-lg text-white/80'>Sign in to your account</p>
              </div>
              <form onSubmit={handleSubmit} className='space-y-6'>
                <div>
                  <input
                    placeholder='Enter your email'
                    name='email'
                    type='email' 
                    value={values.email}  
                    onChange={handleInput}
                    className='w-full px-4 py-3 bg-white border border-white/5 rounded-lg text-brand-dark-violet placeholder-brand-dark-violet/30 focus:outline-none focus:ring-2 focus:ring-white/20'
                  />
                  {error.email && <p className='text-red-300 text-sm mt-1'>{error.email}</p>}
                </div>
                <div>
                  <input
                    placeholder='Enter your password'
                    name='password'
                    type='password'
                    value={values.password}
                    onChange={handleInput}
                    className='w-full px-4 py-3 bg-white border border-white/5 rounded-lg text-brand-dark-violet placeholder-brand-dark-violet/30 focus:outline-none focus:ring-2 focus:ring-white/20'
                  />
                  {<p className='text-red-300 text-sm mt-1'>{error.password}</p>}
                </div>

                <button
                  name='bbb'
                  type='submit'
                  disabled={loading}
                  className='w-full py-3 bg-white/20 hover:bg-brand-dark-violet rounded-lg font-semibold text-white transition-colors'
                >
                  {loading ? 'Signing in...' : 'Sign in'}
                </button>

                <div className="flex items-center gap-3 my-2">
                  <div className="flex-1 h-px bg-white/70"></div>
                  <span className='text-white/90 text-lg'>OR</span>
                  <div className="flex-1 h-px bg-white/70"></div>
                </div>
                <button
                  type='button'
                  className='w-full py-3 bg-brand-light-pink hover:bg-brand-dark-violet rounded-lg font-semibold text-brand-dark-violet hover:text-white transition-colors'
                >
                  <span className='text-lg'>CONTINUE WITH GOOGLE</span>
                </button>
                <p className='text-center text-white/60 text-sm pt-2'>
                  Don't have an account?{' '}
                  <Link to="/signup" className="text-white font-semibold hover:underline">
                    Sign up
                  </Link>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile (<md) */}
      <div className='md:hidden min-h-screen flex items-center justify-center p-4 bg-brand-base bg-linear-to-b from-brand-blue/30 to-brand-white/30 h-64'>
        <div className="w-full max-w-sm">

          {/* Header */}
          <div className="text-center mb-8">
            <h2 className='text-6xl font-causten font-extrabold text-white'>Balance</h2>
            <p className="text-white font-causten font-semibold ">Bills are tucked away,</p>
            <p className="text-white/70 font-causten font-semibold ">The rest is yours to play.</p>
          </div> 

          {/* Form */}
          <form onSubmit={handleSubmit} className='space-y-3'> {/* removed action="" */}
            <input
              placeholder='Enter your email'
              type='email'
              name='email'
              value={values.email}
              onChange={handleInput}
              className='w-full px-4 py-3 bg-white border border-white/10 rounded-lg text-[#0F2854] placeholder-[#0F2854]/30 focus:outline-none focus:ring-2 focus:ring-white/20'
            />
            {error.email && <p className='text-red-300 text-xs mt-1'>{error.email}</p>}
            <input
              placeholder='Enter your password'
              type='password'
              name='password'
              value={values.password}
              onChange={handleInput}
              className='w-full px-4 py-3 bg-white border border-white/10 rounded-lg text-[#0F2854] placeholder-[#0F2854]/30 focus:outline-none focus:ring-2 focus:ring-white/20'
            />
            {error.password && <p className='text-red-300 text-xs mt-1'>{error.password}</p>}

            <button
              type='submit'
              disabled={loading}
              className='w-full py-3 text-white hover:text-white hover:bg-brand-dark-violet bg-white/20 rounded-lg font-causten font-bold transition-colors'
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>

            <div className="flex items-center gap-3 my-2">
              <div className="flex-1 h-px bg-white/70"></div>
              <span className='text-white/80 text-sm'>OR</span>
              <div className="flex-1 h-px bg-white/70"></div>
            </div>

            <button
              type='button'
              className='w-full py-3 text-brand-dark-violet hover:text-white bg-brand-light-pink hover:bg-brand-dark-violet rounded-lg font-semibold transition-colors'
            >
              Continue with Google
            </button>

            <p className='text-center text-white/60 text-xs pt-1'>
              Don't have an account?{' '}
              <Link to="/signup" className="text-white font-semibold hover:underline">
                Sign up
              </Link>
            </p>
          </form>

        </div>
      </div>

    </div>
  )
}

export default Login
