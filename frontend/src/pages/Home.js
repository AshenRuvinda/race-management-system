import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="p-6 text-center">
      <h1 className="text-4xl font-bold mb-4">Welcome to Race Management System</h1>
      <p className="text-lg mb-6">Manage races, teams, and racers with real-time updates.</p>
      <div className="space-x-4">
        <Link to="/login" className="bg-blue-500 text-white p-2 rounded">
          Login
        </Link>
        <Link to="/register" className="bg-green-500 text-white p-2 rounded">
          Register
        </Link>
        <Link to="/live/1" className="bg-purple-500 text-white p-2 rounded">
          Watch Live Race
        </Link>
      </div>
    </div>
  );
};

export default Home;
