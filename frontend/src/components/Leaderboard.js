import React, { useEffect, useState } from 'react';
import socket from '../api/socket';

const Leaderboard = ({ raceId }) => {
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    socket.on('raceUpdate', ({ raceId: updatedRaceId, event }) => {
      if (updatedRaceId === raceId) {
        // Fetch updated race entries
        fetch(`/api/races/${raceId}/entries`)
          .then(res => res.json())
          .then(data => setEntries(data));
      }
    });

    // Initial fetch
    fetch(`/api/races/${raceId}/entries`)
      .then(res => res.json())
      .then(data => setEntries(data));

    return () => socket.off('raceUpdate');
  }, [raceId]);

  return (
    <div className="bg-gray-800 text-white p-4 rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Leaderboard</h2>
      <table className="w-full">
        <thead>
          <tr>
            <th>Position</th>
            <th>Racer</th>
            <th>Team</th>
            <th>Tyre</th>
            <th>Laps</th>
            <th>Gap</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {entries.map(entry => (
            <tr key={entry.racer._id}>
              <td>{entry.position}</td>
              <td>{entry.racer.name}</td>
              <td>{entry.racer.team.name}</td>
              <td>{entry.tyreType}</td>
              <td>{entry.lapCount}</td>
              <td>{entry.gap}</td>
              <td>{entry.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Leaderboard;
