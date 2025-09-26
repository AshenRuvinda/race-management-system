import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
  };

  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between">
        <Link to="/" className="text-xl font-bold">Race Management</Link>
        <div>
          {token ? (
            <>
              {role === 'admin' && (
                <Link to="/admin/dashboard" className="mr-4">Admin Dashboard</Link>
              )}
              {role === 'owner' && (
                <Link to="/owner/dashboard" className="mr-4">Owner Dashboard</Link>
              )}
              <button onClick={handleLogout} className="bg-red-500 p-2 rounded">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="mr-4">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
