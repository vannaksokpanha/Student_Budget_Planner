import { useNavigate, useLocation } from 'react-router-dom';
import { navItems } from '../assets/FrontendAsset/asset';

const NavBar = () => {
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <>
            {/* Desktop */}
            <div className="hidden md:block bg-white shadow-md sticky top-0 z-50">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="flex justify-around py-4">
                        {navItems.map((item) => (
                            <button
                                key={item.name}
                                onClick={() => navigate(item.path)}
                                className={`group flex items-center justify-center gap-2 border-b-2 px-5 py-2 font-semibold transition duration-200 ${
                                    location.pathname === item.path
                                        ? 'text-brand-dark-violet border-brand-dark-violet'
                                        : 'border-transparent text-gray-500 hover:text-brand-dark-violet'
                                }`}
                            >
                                {item.Icon && (
                                    <item.Icon className="w-5 h-5 fill-current transition duration-200 group-hover:scale-110 group-hover:text-black" />
                                )}
                                <span>{item.name}</span>
                            </button>
                        ))}
                    </div>
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
