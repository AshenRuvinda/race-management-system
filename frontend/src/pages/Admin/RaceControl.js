import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const RaceControl = ({ raceId }) => {
  const [positionChanges, setPositionChanges] = useState([]);
  const navigate = useNavigate();

  const handlePositionChange = (racerId, newPosition) => {
    fetch('/api/races/position', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
      body: JSON.stringify({ raceId, racerId, newPosition }),
    }).then(res => res.json())
      .then(data => setPositionChanges([...positionChanges, data]));
  };

  const handleLap = (racerId, lapTime) => {
    fetch('/api/races/lap', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
      body: JSON.stringify({ raceId, racerId, lapTime }),
    }).then(res => res.json());
  };

  const handlePitStop = (racerId, tyreType, pitTime) => {
    fetch('/api/races/pitstop', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
      body: JSON.stringify({ raceId, racerId, tyreType, pitTime }),
    }).then(res => res.json());
  };

  const handleDNF = (racerId) => {
    fetch('/api/races/dnf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
      body: JSON.stringify({ raceId, racerId }),
    }).then(res => res.json());
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Race Control</h1>
      <div className="bg-gray-100 p-4 rounded-lg">
        <h2 className="text-xl font-semibold">Position Updates</h2>
        {/* Drag-and-drop or input for position changes */}
        <div className="mt-4">
          <button onClick={() => handlePitStop('racerId', 'medium', 5.0)} className="bg-blue-500 text-white p-2 rounded">
            Mark Pit Stop
          </button>
          <button onClick={() => handleDNF('racerId')} className="bg-red-500 text-white p-2 rounded ml-2">
            Mark DNF
          </button>
        </div>
      </div>
    </div>
  );
};

export default RaceControl;
