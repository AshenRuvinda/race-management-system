import React, { useEffect, useState } from 'react';
import { getTeams } from '../../api/teamApi';
import { getRacers } from '../../api/racerApi';
import TeamCard from '../../components/TeamCard';
import RacerCard from '../../components/RacerCard';
import Loader from '../../components/Loader';
import { Link } from 'react-router-dom';

const OwnerDashboard = () => {
  const [teams, setTeams] = useState([]);
  const [racers, setRacers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        // Fetch teams and racers in parallel
        const [teamData, racerData] = await Promise.all([
          getTeams(),
          getRacers()
        ]);

        console.log('User ID:', userId);
        console.log('All teams:', teamData);
        console.log('All racers:', racerData);

        // Filter teams owned by current user
        const userTeams = teamData.filter(team => {
          const ownerId = team.owner._id || team.owner;
          return ownerId === userId;
        });
        setTeams(userTeams);

        // Filter racers that belong to user's teams
        const userTeamIds = userTeams.map(team => team._id);
        const userRacers = racerData.filter(racer => {
          const teamId = racer.team._id || racer.team;
          return userTeamIds.includes(teamId);
        });
        setRacers(userRacers);

        console.log('Filtered teams:', userTeams);
        console.log('Filtered racers:', userRacers);
      } catch (err) {
        console.error('Dashboard data fetch error:', err);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchData();
    } else {
      setError('Authentication required. Please login again.');
      setLoading(false);
    }
  }, [userId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="card max-w-md mx-auto">
        <div className="text-center">
          <div className="text-red-600 mb-4">{error}</div>
          <button 
            onClick={() => window.location.reload()} 
            className="btn-primary"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Owner Dashboard</h1>
          <div className="flex gap-2">
            <Link to="/owner/team-register" className="btn-primary">
              Register Team
            </Link>
            {teams.length > 0 && (
              <Link to="/owner/add-racers" className="btn-secondary">
                Add Racers
              </Link>
            )}
          </div>
        </div>

        {teams.length === 0 && (
          <div className="text-center py-8">
            <div className="text-gray-500 mb-4">
              <h2 className="text-xl mb-2">No Teams Registered</h2>
              <p>Start by registering your first team to participate in races.</p>
            </div>
          </div>
        )}

        {teams.length > 0 && (
          <>
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Your Teams ({teams.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {teams.map(team => (
                  <TeamCard key={team._id} team={team} />
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Your Racers ({racers.length})
              </h2>
              {racers.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-500 mb-4">
                    <p>No racers added yet. Add racers to your teams to get started.</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {racers.map(racer => (
                    <RacerCard key={racer._id} racer={racer} />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default OwnerDashboard;