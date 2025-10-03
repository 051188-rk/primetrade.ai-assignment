import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => { logout(); navigate('/login'); };
  return (
    <nav className="flex justify-between items-center p-4 bg-gray-900/60">
      <Link to="/" className="text-2xl font-bold text-neon">TaskManager</Link>
      <div>
        {user ? (
          <button onClick={handleLogout} className="px-3 py-1 rounded border border-neutral-700">Logout</button>
        ) : (
          <>
            <Link to="/login" className="mr-4">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
