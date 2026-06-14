const SetUp = () => {
  return (
    
    <div className='md:hidden min-h-screen flex items-center justify-center p-4 bg-brand-base bg-gradient-to-b from-[#005CFF]/30 to-[#F5F5F5]/30 h-64'>
        <div className="w-full max-w-sm">
            {/* Header */}
            <div className="text-left">
                <h1 className="text-5xl text-white font-causten font-extrabold">SET UP YOUR BUDGET AND GET STARTED!</h1>
                <form className="">
                    <p className="text-xl text-white font-causten font-semibold mt-7">What's your monthly income?</p>
                    <input
                     placeholder='Enter amount'
                     type='number'
                     budget='budget'
                     required
                     className=" w-full px-4 py-3 bg-white border border-white/10 rounded-lg font-causten text-lg text-brand-dark-violet placeholder-brand-dark-violet/30 focus:outline-none focus:ring-2 focus:ring-white/20"
                    />

                    <p className="text-xl text-white font-causten font-semibold mt-7">Set your preferred monthly budget</p>
                    <input
                     placeholder='Enter amount'
                     type='number'
                     budget='budget'
                     required
                     className=" w-full px-4 py-3 bg-white border border-white/10 rounded-lg font-causten text-lg text-brand-dark-violet placeholder-brand-dark-violet/30 focus:outline-none focus:ring-2 focus:ring-white/20"
                    />

                    <button
                    type='submit'
                    className=" mt-7 w-full text-lg px-4 py-3 bg-brand-light-pink hover:bg-brand-dark-violet rounded-lg text-center font-semibold hover:text-white transition-colors ease-in-out"
                    >
                        Get started
                    </button>
                </form>
            </div>
        </div>
    </div>
  )
}

export default SetUp;