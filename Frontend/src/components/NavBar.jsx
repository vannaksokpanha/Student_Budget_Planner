import { useNavigate, useLocation } from 'react-router-dom';
import { navItems } from '../assets/FrontendAsset/asset';

const NavBar = () => {
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <>
            {/* Desktop — fixed sidebar down the left edge */}
            <div className="hidden md:flex fixed left-0 top-0 bottom-0 w-56 flex-col bg-white shadow-md z-50 px-4 py-8">
                <p className="font-causten font-extrabold text-brand-dark-violet text-xl px-4 mb-8">
                    Budget Planner
                </p>
                <div className="flex flex-col gap-1">
                    {navItems.map((item) => (
                        <button
                            key={item.name}
                            onClick={() => navigate(item.path)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-causten font-bold text-sm transition-colors ${
                                location.pathname === item.path
                                    ? 'bg-brand-dark-violet text-white'
                                    : 'text-gray-500 hover:text-brand-dark-violet hover:bg-brand-light-violet/60'
                            }`}
                        >
                            {item.Icon && <item.Icon className="w-5 h-5 fill-current" />}
                            <span>{item.name}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Mobile */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-200 shadow-lg z-50 rounded-t-2xl">
                <div className="flex py-2.5">
                    {navItems.map((item) => (
                        <button
                            key={item.name}
                            onClick={() => navigate(item.path)}
                            className={`
                                group flex flex-col items-center justify-center
                                flex-1 py-1.5 transition duration-200 transform

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
                                className={`font-medium text-xs sm:text-sm mt-1 border-b ${
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