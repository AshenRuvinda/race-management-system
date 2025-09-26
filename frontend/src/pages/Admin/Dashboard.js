import React, { useEffect, useState } from 'react';
import { getTeams } from '../../api/teamApi';
import { getRacers } from '../../api/racerApi';
import TeamCard from '../../components/TeamCard';
import RacerCard from '../../components/RacerCard';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [teams, setTeams] = useState([]);
  const [racers, setRacers] = useState([]);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const teamData = await getTeams(token);
        const racerData = await getRacers(token);
        setTeams(teamData);
        setRacers(racerData);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, [token]);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1>
      <Link to="/admin/race-create" className="bg-blue-500 text-white p-2 rounded mb-4 inline-block">
        Create New Race
      </Link>
      <h2 className="text-2xl font-semibold mb-2">Teams</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {teams.map(team => (
          <TeamCard key={team._id} team={team} />
        ))}
      </div>
      <h2 className="text-2xl font-semibold mb-2 mt-6">Racers</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {racers.map(racer => (
          <RacerCard key={racer._id} racer={racer} />
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
