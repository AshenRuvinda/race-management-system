import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Leaderboard from '../../components/Leaderboard';
import { getEvents } from '../../api/raceApi';

const LiveRace = () => {
  const { raceId } = useParams();
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const eventData = await getEvents(raceId);
        setEvents(eventData);
      } catch (err) {
        console.error(err);
      }
    };
    fetchEvents();
  }, [raceId]);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Live Race</h1>
      <Leaderboard raceId={raceId} />
      <div className="mt-6">
        <h2 className="text-2xl font-semibold mb-2">Race Events</h2>
        <ul className="bg-white p-4 rounded-lg shadow-md">
          {events.map(event => (
            <li key={event._id} className="mb-2">
              {event.type === 'position_change' && (
                <p>Racer {event.data.racerId} moved to position {event.data.newPosition}</p>
              )}
              {event.type === 'lap_completed' && (
                <p>Racer {event.data.racerId} completed a lap in {event.data.lapTime}s</p>
              )}
              {event.type === 'pit_stop' && (
                <p>Racer {event.data.racerId} pitted for {event.data.tyreType} tyres ({event.data.pitTime}s)</p>
              )}
              {event.type === 'dnf' && (
                <p>Racer {event.data.racerId} marked as DNF</p>
              )}
              {event.type === 'race_completed' && (
                <p>Race completed</p>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default LiveRace;
