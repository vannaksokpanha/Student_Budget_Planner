import { useNavigate, useLocation } from 'react-router-dom';

const NavBar = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const navItems = [
        { name: 'HOME', path: '/home', icon: '' },
        { name: 'EXPENSES', path: '/expenses', icon: '' },
        { name: 'SAVINGS', path: '/savings', icon: '' },
        { name: 'SUMMARY', path: '/summary', icon: '' },
        { name: 'PROFILE', path: '/profile', icon: '' }
    ];

    return (
        <>
            {/* Desktop */}
            <div className="hidden md:block bg-white shadow-md top-0">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="flex justify-around py-4">
                        {navItems.map((item) => (
                            <button
                                key={item.name}
                                onClick={() => navigate(item.path)}
                                className={`px-6 py-2 font-semibold transition ${
                                    location.pathname === item.path
                                        ? 'text-blue-600 border-b-2 border-blue-600'
                                        : 'text-gray-500 hover:text-blue-500'
                                }`}
                            >
                                {item.name}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Mobile */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-50">
                <div className="flex py-2">
                    {navItems.map((item) => (
                        <button
                            key={item.name}
                            onClick={() => navigate(item.path)}
                            className={`
                                flex flex-col items-center justify-center
                                flex-1 py-2
                                ${
                                    location.pathname === item.path
                                        ? 'text-blue-600'
                                        : 'text-gray-500'
                                }
                            `}
                        >
                            <span>{item.icon}</span>
                            <span className="text-[12px] sm:text-[14px] mt-1 ">
                                {item.name}
                            </span>
                        </button>
                    ))}
                </div>
            </div>
        </>
    );
};

export default NavBar;