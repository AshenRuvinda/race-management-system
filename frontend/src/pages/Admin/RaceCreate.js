import React, { useState, useEffect } from 'react';
import { createRace } from '../../api/raceApi';
import { getRacers } from '../../api/racerApi';
import { useNavigate } from 'react-router-dom';

const RaceCreate = () => {
  const [venue, setVenue] = useState('');
  const [totalLaps, setTotalLaps] = useState(0);
  const [defaultTyreType, setDefaultTyreType] = useState('medium');
  const [startingGrid, setStartingGrid] = useState([]);
  const [racers, setRacers] = useState([]);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchRacers = async () => {
      try {
        const racerData = await getRacers(token);
        setRacers(racerData);
      } catch (err) {
        console.error(err);
      }
    };
    fetchRacers();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const race = await createRace({ venue, totalLaps, startingGrid, defaultTyreType }, token);
      navigate(`/admin/race-control/${race._id}`);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Create Race</h1>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
        <div className="mb-4">
          <label className="block text-sm font-medium">Venue</label>
          <input
            type="text"
            value={venue}
            onChange={(e) => setVenue(e.target.value)}
            className="mt-1 p-2 border rounded w-full"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium">Total Laps</label>
          <input
            type="number"
            value={totalLaps}
            onChange={(e) => setTotalLaps(e.target.value)}
            className="mt-1 p-2 border rounded w-full"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium">Default Tyre Type</label>
          <select
            value={defaultTyreType}
            onChange={(e) => setDefaultTyreType(e.target.value)}
            className="mt-1 p-2 border rounded w-full"
          >
            <option value="soft">Soft</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium">Starting Grid</label>
          <select
            multiple
            value={startingGrid}
            onChange={(e) => setStartingGrid([...e.target.selectedOptions].map(opt => opt.value))}
            className="mt-1 p-2 border rounded w-full"
          >
            {racers.map(racer => (
              <option key={racer._id} value={racer._id}>{racer.name}</option>
            ))}
          </select>
        </div>
        <button type="submit" className="bg-blue-500 text-white p-2 rounded">
          Create Race
        </button>
      </form>
    </div>
  );
};

export default RaceCreate;
