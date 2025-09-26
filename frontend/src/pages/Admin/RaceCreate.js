import React, { useState, useEffect } from 'react';
import { createRace } from '../../api/raceApi';
import { getRacers } from '../../api/racerApi';
import { useNavigate } from 'react-router-dom';

const RaceCreate = () => {
  const [venue, setVenue] = useState('');
  const [totalLaps, setTotalLaps] = useState('');
  const [defaultTyreType, setDefaultTyreType] = useState('medium');
  const [startingGrid, setStartingGrid] = useState([]);
  const [racers, setRacers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRacers = async () => {
      try {
        setError('');
        const racerData = await getRacers();
        console.log('Fetched racers:', racerData);
        setRacers(racerData || []);
      } catch (err) {
        console.error('Error fetching racers:', err);
        setError('Failed to load racers. Please try again.');
      }
    };
    fetchRacers();
  }, []);

  const handleRacerSelection = (racerId) => {
    setStartingGrid(prev => {
      if (prev.includes(racerId)) {
        return prev.filter(id => id !== racerId);
      } else {
        return [...prev, racerId];
      }
    });
  };

  const moveRacerUp = (index) => {
    if (index > 0) {
      const newGrid = [...startingGrid];
      [newGrid[index - 1], newGrid[index]] = [newGrid[index], newGrid[index - 1]];
      setStartingGrid(newGrid);
    }
  };

  const moveRacerDown = (index) => {
    if (index < startingGrid.length - 1) {
      const newGrid = [...startingGrid];
      [newGrid[index], newGrid[index + 1]] = [newGrid[index + 1], newGrid[index]];
      setStartingGrid(newGrid);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // Validation
    if (!venue.trim()) {
      setError('Venue is required');
      setLoading(false);
      return;
    }

    if (!totalLaps || parseInt(totalLaps) < 1 || parseInt(totalLaps) > 200) {
      setError('Total laps must be between 1 and 200');
      setLoading(false);
      return;
    }

    if (startingGrid.length < 2) {
      setError('At least 2 racers are required for a race');
      setLoading(false);
      return;
    }

    try {
      const raceData = {
        venue: venue.trim(),
        totalLaps: parseInt(totalLaps),
        startingGrid,
        defaultTyreType
      };

      console.log('Creating race with data:', raceData);
      const race = await createRace(raceData);
      console.log('Race created successfully:', race);
      
      setSuccess('Race created successfully!');
      setTimeout(() => {
        navigate(`/admin/race-control/${race._id}`);
      }, 1500);
    } catch (err) {
      console.error('Error creating race:', err);
      setError(err.msg || 'Failed to create race. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getRacerById = (racerId) => {
    return racers.find(racer => racer._id === racerId);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Create New Race</h1>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Venue *
              </label>
              <input
                type="text"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter race venue"
                required
                disabled={loading}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Laps *
              </label>
              <input
                type="number"
                value={totalLaps}
                onChange={(e) => setTotalLaps(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter total laps"
                min="1"
                max="200"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Default Tyre Type
            </label>
            <select
              value={defaultTyreType}
              onChange={(e) => setDefaultTyreType(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
              disabled={loading}
            >
              <option value="soft">Soft</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Available Racers */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Available Racers</h3>
              <div className="border rounded-lg max-h-96 overflow-y-auto">
                {racers.length === 0 ? (
                  <p className="p-4 text-gray-500 text-center">No racers available</p>
                ) : (
                  racers.map(racer => (
                    <div
                      key={racer._id}
                      className={`p-3 border-b cursor-pointer hover:bg-gray-50 ${
                        startingGrid.includes(racer._id) ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => handleRacerSelection(racer._id)}
                    >
                      <div className="flex items-center">
                        <div className="flex-grow">
                          <p className="font-medium">{racer.name}</p>
                          <p className="text-sm text-gray-600">
                            #{racer.racingNumber} - {racer.team?.name || 'No Team'}
                          </p>
                        </div>
                        {startingGrid.includes(racer._id) && (
                          <span className="text-blue-500 text-sm">Selected</span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Starting Grid */}
            <div>
              <h3 className="text-lg font-semibold mb-3">
                Starting Grid ({startingGrid.length})
              </h3>
              <div className="border rounded-lg max-h-96 overflow-y-auto">
                {startingGrid.length === 0 ? (
                  <p className="p-4 text-gray-500 text-center">No racers selected</p>
                ) : (
                  startingGrid.map((racerId, index) => {
                    const racer = getRacerById(racerId);
                    return (
                      <div key={racerId} className="p-3 border-b flex items-center justify-between">
                        <div className="flex items-center">
                          <span className="font-bold text-lg mr-3 text-gray-600">
                            {index + 1}.
                          </span>
                          <div>
                            <p className="font-medium">{racer?.name || 'Unknown'}</p>
                            <p className="text-sm text-gray-600">
                              #{racer?.racingNumber} - {racer?.team?.name || 'No Team'}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col gap-1">
                          <button
                            type="button"
                            onClick={() => moveRacerUp(index)}
                            disabled={index === 0 || loading}
                            className="text-xs bg-gray-200 px-2 py-1 rounded disabled:opacity-50"
                          >
                            ↑
                          </button>
                          <button
                            type="button"
                            onClick={() => moveRacerDown(index)}
                            disabled={index === startingGrid.length - 1 || loading}
                            className="text-xs bg-gray-200 px-2 py-1 rounded disabled:opacity-50"
                          >
                            ↓
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button 
              type="submit" 
              className={`flex-1 p-3 bg-blue-500 text-white rounded font-medium hover:bg-blue-600 ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={loading}
            >
              {loading ? 'Creating Race...' : 'Create Race'}
            </button>
            
            <button 
              type="button"
              onClick={() => navigate('/admin/dashboard')}
              className="px-6 py-3 bg-gray-500 text-white rounded font-medium hover:bg-gray-600"
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RaceCreate;