import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, Home, Map, BarChart3,  AlertCircle, Ambulance } from 'lucide-react';

interface NavOption {
  label: string;
  path: string;
  icon: React.ReactNode;
  description: string;
}

const AdminNavbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navOptions: NavOption[] = [
  {
    label: 'Dashboard',
    path: '/adminDB',
    icon: <Home size={20} />,
    description: 'System Overview & Status'
  },
  {
    label: 'Hotspot Prediction',
    path: '/adminDB/hps',
    icon: <Map size={20} />,
    description: 'Predicted High-Demand Zones'
  },
  {
    label: 'Ambulances',
    path: '/adminDB/resources',
    icon: <Ambulance size={20} />,
    description: 'Ambulance Availability & Status'
  },
  {
    label: 'Dispatch',
    path: '/adminDB/disp',
    icon: <AlertCircle size={20} />,
    description: 'Emergency Dispatch Management'
  },
];


  const isActive = (path: string): boolean => {
    return location.pathname === path;
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    sessionStorage.clear();
    navigate('/');
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-gradient-to-r from-red-900 via-red-800 to-red-900 shadow-2xl">
      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center justify-between h-20 px-8">
        {/* Logo Section */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-lg transform -rotate-45">
              <img src='/Logo.png' style={{borderRadius:"8px"}} className="text-red-900 transform rotate-45" />
            </div>
          </div>
          <div>
            <h1 className="text-white font-bold text-xl tracking-tight">Smart Ambulance System</h1>
            <p className="text-red-100 text-xs">Emergency Medical Response</p>
          </div>
        </div>

        {/* Center Navigation */}
        <div className="flex items-center gap-1">
          {navOptions.map((option) => (
            <button
              key={option.path}
              onClick={() => handleNavigation(option.path)}
              className={`relative px-4 py-2 mx-1 rounded-lg font-medium text-sm transition-all duration-300 flex items-center gap-2 group ${
                isActive(option.path)
                  ? 'bg-white text-red-900 shadow-lg'
                  : 'text-white hover:bg-red-700/50'
              }`}
              title={option.description}
            >
              {option.icon}
              <span className="hidden lg:inline">{option.label}</span>
              {isActive(option.path) && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white rounded-full"></div>
              )}
            </button>
          ))}
        </div>

        {/* Right Section - Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-red-700 text-white font-medium transition-all duration-300 border border-white/20 hover:border-white/50"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden flex items-center justify-between h-16 px-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-lg transform -rotate-45">
            <img src='/Logo.png' style={{borderRadius:"8px"}} className="text-red-900 transform rotate-45" />
          </div>
          <h1 className="text-white font-bold text-lg">Smart Ambulance</h1>
        </div>

        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="text-white hover:bg-red-700 p-2 rounded-lg transition-colors"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-red-800 border-t border-red-700 shadow-lg animate-fadeIn">
          {navOptions.map((option) => (
            <button
              key={option.path}
              onClick={() => handleNavigation(option.path)}
              className={`w-full text-left px-4 py-3 border-b border-red-700 transition-all duration-300 flex items-center gap-3 ${
                isActive(option.path)
                  ? 'bg-white/20 text-white font-medium'
                  : 'text-red-100 hover:bg-red-700'
              }`}
            >
              <span className="text-white">{option.icon}</span>
              <div>
                <p className="font-medium">{option.label}</p>
                <p className="text-xs opacity-75">{option.description}</p>
              </div>
            </button>
          ))}
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-3 text-red-100 hover:bg-red-700 transition-colors flex items-center gap-3 font-medium"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </nav>
  );
};

export default AdminNavbar;