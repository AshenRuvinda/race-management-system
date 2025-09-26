import React, { useState, useEffect } from 'react';
import { createRacer } from '../../api/racerApi';
import { getTeams } from '../../api/teamApi';
import { useNavigate } from 'react-router-dom';

const AddRacers = () => {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [country, setCountry] = useState('');
  const [racingNumber, setRacingNumber] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  const [teamId, setTeamId] = useState('');
  const [teams, setTeams] = useState([]);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const teamData = await getTeams(token);
        setTeams(teamData.filter(team => team.owner === localStorage.getItem('userId')));
      } catch (err) {
        console.error(err);
      }
    };
    fetchTeams();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createRacer({ name, age, country, racingNumber, profilePicture, teamId }, token);
      navigate('/owner/dashboard');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Add Racer</h1>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
        <div className="mb-4">
          <label className="block text-sm font-medium">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 p-2 border rounded w-full"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium">Age</label>
          <input
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            className="mt-1 p-2 border rounded w-full"
            required
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
        <div className="mb-4">
          <label className="block text-sm font-medium">Racing Number</label>
          <input
            type="number"
            value={racingNumber}
            onChange={(e) => setRacingNumber(e.target.value)}
            className="mt-1 p-2 border rounded w-full"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium">Profile Picture URL</label>
          <input
            type="text"
            value={profilePicture}
            onChange={(e) => setProfilePicture(e.target.value)}
            className="mt-1 p-2 border rounded w-full"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium">Team</label>
          <select
            value={teamId}
            onChange={(e) => setTeamId(e.target.value)}
            className="mt-1 p-2 border rounded w-full"
            required
          >
            <option value="">Select Team</option>
            {teams.map(team => (
              <option key={team._id} value={team._id}>{team.name}</option>
            ))}
          </select>
        </div>
        <button type="submit" className="bg-blue-500 text-white p-2 rounded">
          Add Racer
        </button>
      </form>
    </div>
  );
};

export default AddRacers;
