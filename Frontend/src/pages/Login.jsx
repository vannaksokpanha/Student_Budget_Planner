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
        <div className="flex-1 bg-blue-500 flex flex-col items-center justify-center p-12 border-r border-white/20">
          <div className="text-center">
            <h1 className='text-6xl font-bold text-white mb-4'>Balance</h1>
            <p className='text-xl text-white/80 mb-1'>Bills are tucked away</p>
            <p className='text-lg text-white/60'>The rest is yours to play</p>
          </div>
        </div>
        {/* Right Side */}
        <div className="flex-2 bg-blue-500 flex items-center justify-center p-8"> 
          <div className="w-full max-w-md">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-12 border border-white/10">
              <div className="text-center mb-10">
                <h2 className='text-2xl text-white/80 mb-2'>Welcome Back</h2>
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
                    className='w-full px-4 py-3 bg-white/5 border border-white/5 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/20'
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
                    className='w-full px-4 py-3 bg-white/5 border border-white/5 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/20'
                  />
                  {<p className='text-red-300 text-sm mt-1'>{error.password}</p>}
                </div>

                <button
                  name='bbb'
                  type='submit'
                  disabled={loading}
                  className='w-full py-3 bg-white/20 hover:bg-white/30 rounded-lg font-semibold text-white transition-colors'
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
                  className='w-full py-3 bg-white/20 hover:bg-white/30 rounded-lg font-semibold text-white transition-colors'
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
      <div className='md:hidden min-h-screen flex items-center justify-center p-4 bg-blue-500'>
        <div className="w-full max-w-sm">

          {/* Header */}
          <div className="text-center mb-8">
            <h2 className='text-5xl font-bold text-white'>Balance</h2>
            <p className="text-white mt-2">Bills are tucked away</p>
            <p className="text-white/70 text-sm">The rest is yours to play</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className='space-y-3'> {/* removed action="" */}
            <input
              placeholder='Enter your email'
              type='email'
              name='email'
              value={values.email}
              onChange={handleInput}
              className='w-full px-4 py-3 bg-white/10 border border-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/20'
            />
            {error.email && <p className='text-red-300 text-xs mt-1'>{error.email}</p>}
            <input
              placeholder='Enter your password'
              type='password'
              name='password'
              value={values.password}
              onChange={handleInput}
              className='w-full px-4 py-3 bg-white/10 border border-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/20'
            />
            {error.password && <p className='text-red-300 text-xs mt-1'>{error.password}</p>}

            <button
              type='submit'
              disabled={loading}
              className='w-full py-3 text-white bg-white/20 hover:bg-white/30 rounded-lg font-semibold transition-colors'
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
              className='w-full py-3 text-white bg-white/20 hover:bg-white/30 rounded-lg font-semibold transition-colors'
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
