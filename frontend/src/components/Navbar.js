import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  
  const handleLogout = () => { 
    logout(); 
    navigate('/login'); 
  };
  
  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  return (
    <nav className="flex justify-between items-center p-4 bg-gray-900/60">
      <Link to="/" className="text-2xl font-bold text-neon">TaskManager</Link>
      <div className="flex items-center space-x-4">
        {user ? (
          <>
            <div className="flex items-center space-x-4">
              <button 
                onClick={toggleTheme} 
                className="p-2 rounded-full hover:bg-gray-700/50 transition-colors"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>
              
              <Link to="/profile" className="flex items-center space-x-2 group">
                <div className="relative group">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-semibold shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-105">
                    {getInitials(user?.name)}
                  </div>
                  <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full opacity-0 group-hover:opacity-20 blur transition duration-300"></div>
                </div>
                <div className="flex flex-col items-start">
                  <span className="font-medium group-hover:text-neon transition-colors">{user?.name || user?.email || 'User'}</span>
                  <span className="text-xs opacity-70">View Profile</span>
                </div>
              </Link>
            </div>
            <button 
              onClick={handleLogout} 
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-red-500 to-pink-600 text-white font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 active:translate-y-0 active:shadow-inner"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link 
              to="/login" 
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 active:translate-y-0 active:shadow-inner"
            >
              Login
            </Link>
            <Link 
              to="/register" 
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 active:translate-y-0 active:shadow-inner"
            >
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
