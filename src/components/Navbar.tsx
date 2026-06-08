import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function Navbar() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const links = [
    { to: '/dashboard', label: 'Dashboard', icon: '🏠' },
    { to: '/weight', label: 'Greutate', icon: '⚖️' },
    { to: '/workouts', label: 'Antrenamente', icon: '🏋️' },
    { to: '/workout-coach', label: 'Coach AI', icon: '🏆' },
    { to: '/agent', label: 'Nutriție AI', icon: '🤖' },
    { to: '/profile', label: 'Profil', icon: '👤' },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <nav className="hidden md:flex flex-col w-[240px] h-screen fixed left-0 top-0 bg-[#111111] border-r border-[#2a2a2a] p-4 flex flex-col">
        <div className="text-xl font-bold text-[#f0f0f0] mb-8 px-4 py-2">
          Smart<span className="text-[#22c55e]">Coach</span>
        </div>
        <div className="flex flex-col gap-2 flex-1">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                  isActive
                    ? 'bg-[#1a1a1a] text-[#22c55e] border border-[#2a2a2a]'
                    : 'text-[#9ca3af] hover:bg-[#1a1a1a] hover:text-[#f0f0f0]'
                }`
              }
            >
              <span className="text-xl">{link.icon}</span>
              {link.label}
            </NavLink>
          ))}
        </div>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-[#ef4444] hover:bg-[#ef4444] hover:bg-opacity-10 transition-colors mt-auto w-full text-left"
        >
          <span className="text-xl">🚪</span>
          Ieșire
        </button>
      </nav>

      {/* Mobile Bottom Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-[#111111] border-t border-[#2a2a2a] flex justify-around p-2 z-50">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center p-2 rounded-lg ${
                isActive ? 'text-[#22c55e]' : 'text-[#9ca3af]'
              }`
            }
          >
            <span className="text-2xl">{link.icon}</span>
          </NavLink>
        ))}
        <button 
          onClick={handleLogout}
          className="flex flex-col items-center justify-center p-2 rounded-lg text-[#ef4444] opacity-80"
        >
          <span className="text-2xl">🚪</span>
        </button>
      </nav>
    </>
  );
}
