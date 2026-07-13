import { useNavigate, useLocation } from 'react-router-dom';
import { navItems } from '../assets/FrontendAsset/asset';
import { TbChevronsRight, TbChevronsLeft } from "react-icons/tb";
import { TbMoneybag } from "react-icons/tb"; 
import { TbLogout } from "react-icons/tb";  
import { useUser } from '../Context/UserContext';
const NavBar = ({isOpen,setIsOpen}) => {
    const navigate = useNavigate();
    const location = useLocation();
    const {user, logout} = useUser();

    const handleLogout = () => {
        logout();   
        navigate('/login');
    };
    return (
        <>
            {/* Desktop */}

            <aside
                className={`hidden md:flex md:flex-col fixed top-10 left-0 h-[calc(100vh-2.5rem)] bg-white shadow-md z-50 overflow-hidden transition-all duration-300 ease-in-out ${
                    isOpen ? 'w-80' : 'w-20'
                }`}
            >
                {/* Logo + toggle — "Balance >>" when open, chevron centered when collapsed */}
                <div className="flex items-center justify-between mx-3 mt-3 h-12">
                    {/* Logo — always mounted, animates width/opacity for a smooth open/close */}
                    <div className={`flex items-center gap-2 pl-2 overflow-hidden transition-all duration-300 ease-in-out ${
                        isOpen ? 'w-full opacity-100' : 'w-0 opacity-0'
                    }`}>
                        <TbMoneybag className='w-6 h-6 text-brand-dark-violet shrink-0' />
                        <span className='text-xl font-bold text-brand-dark-violet whitespace-nowrap'>
                            Balance
                        </span>
                    </div>

                    {/* Toggle button */}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="flex items-center p-3 rounded-lg text-gray-500 hover:text-brand-dark-violet hover:bg-gray-50 active:scale-90 transition shrink-0"
                    >
                        {isOpen ? <TbChevronsLeft className="w-5 h-5" /> : <TbChevronsRight className="w-5 h-5" />}
                    </button>
                </div>

                {/* Profile — under the logo */}
                <div className="mx-3 mt-2">
                    <button
                        title={!isOpen ? user.name : undefined}
                        className={`flex items-center gap-3 py-3 rounded-lg transition hover:bg-gray-50 w-full ${
                            isOpen
                            ? 'px-2'
                            : 'px-0 justify-center'
                        }`}
                    >
                        <div className="w-10 h-10 rounded-full bg-brand-dark-violet/10 flex items-center justify-center shrink-0">
                            <span className='text-brand-dark-violet font-bold'>
                                {user.name.charAt(0).toUpperCase()}
                            </span>
                        </div>

                        {isOpen && (
                            <div className="text-left min-w-0">
                                <p className='font-semibold text-brand-dark-violet truncate'>{user.name}</p>
                                <p onClick={()=> navigate('/profile')} className='text-xs text-gray-400 hover:text-brand-dark-violet'>View Profile</p>
                            </div>
                        )}
                    </button>
                </div>

                {/* divider between profile and nav items */}
                <div className="border-b border-gray-200 mx-3 mt-3 m-5" />

                <div className="flex flex-col gap-1 px-3 py-2">

                    {navItems.map((item)=>{
                        const active = location.pathname === item.path ;
                        return (
                            <button
                                onClick={ ()=> navigate(item.path)}
                                key={item.name}
                                title={!isOpen ? item.name : undefined}
                                className={`group flex items-center gap-3 w-full py-4 rounded-lg font-semibold active:scale-[0.97] transition duration-200 ${
                                isOpen ? 'px-5' : 'px-0 justify-center'
                                } ${
                                active
                                ? 'bg-brand-dark-violet/10 text-brand-dark-violet border-1-4 border-brand-gradient'
                                : 'border-1-4 border-transparent text-gray-500 hover:text-brand-dark-violet hover:bg-gray-50'
                                }`}
                            >
                                {item.Icon && (
                                    <item.Icon
                                    className='w-5 h-5 fill-current transition duration-200 group-hover:scale-125 shrink-0'
                                    />
                                )}
                                    {isOpen && <span>{item.name}</span>}
                            </button>
                        )
                    })}
                </div>
                <div className="px-3 py-2 mt-auto">

                    <button
                        onClick={handleLogout}
                        className={`group flex items-center py-4 font-semibold text-gray-500 gap-3 w-full rounded-lg hover:text-brand-dark-violet hover:bg-gray-50 active:scale-[0.97] transition duration-200 whitespace-nowrap overflow-hidden ${
                            isOpen ? 'px-5' : 'px-0 justify-center'
                        }`}
                    >
                        <span><TbLogout className='w-5 h-5 fill-current transition duration-200 group-hover:scale-100 shrink-0'></TbLogout></span>
                        {isOpen && <span>Log Out</span>}
                    </button>
                </div>
            </aside>

            {/* Mobile */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-200 shadow-lg z-50 rounded-t-2xl">
                <div className="flex py-2.5">
                    {navItems.map((item) => (
                        <button
                            key={item.name}
                            onClick={() => navigate(item.path)}
                            className={`
                                group flex flex-col items-center justify-center
                                flex-1 py-1.5 active:scale-90 transition duration-200 transform

                                ${
                                    location.pathname === item.path
                                        ? 'text-brand-dark-violet'
                                        : 'text-gray-500 hover:text-brand-dark-violet hover:scale-105'
                                }
                            `}
                        >
                            {item.Icon && (
                                <item.Icon className="w-6 h-6 fill-current transition duration-200 group-hover:scale-110 group-hover:text-brand-dark-violet" />
                            )}
                            <span
                                className={`font-medium text-xs sm:text-sm mt-1 ${
                                    location.pathname === item.path
                                        ? 'border-primary-600'
                                        : 'border-transparent'
                                }`}
                            >
                                {item.name}
                            </span>
                        </button>
                    ))}
                </div>
            </div>
        </>
    )
};

export default NavBar;