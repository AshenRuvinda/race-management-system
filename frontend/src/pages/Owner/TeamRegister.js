import React, { useState } from 'react';
import { createTeam } from '../../api/teamApi';
import { useNavigate } from 'react-router-dom';

const TeamRegister = () => {
  const [name, setName] = useState('');
  const [logo, setLogo] = useState('');
  const [country, setCountry] = useState('');
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createTeam({ name, logo, country }, token);
      navigate('/owner/dashboard');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Register Team</h1>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
        <div className="mb-4">
          <label className="block text-sm font-medium">Team Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 p-2 border rounded w-full"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium">Logo URL</label>
          <input
            type="text"
            value={logo}
            onChange={(e) => setLogo(e.target.value)}
            className="mt-1 p-2 border rounded w-full"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium">Country</label>
          <input
            type="text"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="mt-1 p-2 border rounded w-full"
            required
          />
        </div>
        <button type="submit" className="bg-blue-500 text-white p-2 rounded">
          Register Team
        </button>
      </form>
    </div>
  );
};

export default TeamRegister;
