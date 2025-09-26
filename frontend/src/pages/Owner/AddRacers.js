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
  const [allTeams, setAllTeams] = useState([]); // For debugging
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [debugInfo, setDebugInfo] = useState(''); // For debugging
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        setError('');
        setDebugInfo('Fetching teams...');
        
        const teamData = await getTeams();
        setAllTeams(teamData); // Store all teams for debugging
        
        console.log('All teams:', teamData);
        console.log('Current user ID:', userId);
        console.log('User ID type:', typeof userId);
        
        if (!teamData || teamData.length === 0) {
          setError('No teams found in the system. Please contact administrator.');
          setDebugInfo('No teams returned from API');
          return;
        }
        
        // More detailed debugging
        const debugTeamInfo = teamData.map(team => ({
          teamName: team.name,
          teamId: team._id,
          ownerId: team.owner._id || team.owner,
          ownerType: typeof (team.owner._id || team.owner),
          ownerData: team.owner,
          matches: (team.owner._id || team.owner) === userId,
          matchesString: (team.owner._id || team.owner).toString() === userId.toString()
        }));
        
        console.log('Team debug info:', debugTeamInfo);
        
        // Try both direct comparison and string comparison
        const userTeams = teamData.filter(team => {
          const ownerId = team.owner._id || team.owner;
          return ownerId === userId || ownerId.toString() === userId.toString();
        });
        
        console.log('Filtered user teams:', userTeams);
        setTeams(userTeams);
        
        if (userTeams.length === 0) {
          // Provide more detailed debug information
          const teamOwners = teamData.map(team => ({
            name: team.name,
            owner: team.owner,
            ownerId: team.owner._id || team.owner
          }));
          
          setDebugInfo(`
            Debug Info:
            - Your User ID: ${userId}
            - Total teams: ${teamData.length}
            - Team owners: ${JSON.stringify(teamOwners, null, 2)}
            - User teams found: ${userTeams.length}
          `);
          
          setError('No teams found for your account. Please register a team first.');
        } else {
          setDebugInfo(`
            Found ${userTeams.length} team(s) for your account:
            ${userTeams.map(team => `- ${team.name} (${team.country}) - ID: ${team._id}`).join('\n            ')}
          `);
        }
        
      } catch (err) {
        console.error('Error fetching teams:', err);
        setError(`Failed to load teams: ${err.message || 'Please try again.'}`);
        setDebugInfo(`API Error: ${err.message}`);
      }
    };

    if (userId) {
      fetchTeams();
    } else {
      setError('Authentication required. Please login again.');
      setDebugInfo('No user ID found in localStorage');
    }
  }, [userId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // Validation
    if (!name.trim()) {
      setError('Racer name is required');
      setLoading(false);
      return;
    }

    if (!age || parseInt(age) < 16 || parseInt(age) > 65) {
      setError('Age must be between 16 and 65');
      setLoading(false);
      return;
    }

    if (!country.trim()) {
      setError('Country is required');
      setLoading(false);
      return;
    }

    if (!racingNumber || parseInt(racingNumber) < 1 || parseInt(racingNumber) > 999) {
      setError('Racing number must be between 1 and 999');
      setLoading(false);
      return;
    }

    if (!teamId) {
      setError('Team selection is required');
      setLoading(false);
      return;
    }

    try {
      const racerData = {
        name: name.trim(),
        age: parseInt(age),
        country: country.trim(),
        racingNumber: parseInt(racingNumber),
        profilePicture: profilePicture.trim(),
        teamId
      };

      console.log('Creating racer with data:', racerData);
      const racer = await createRacer(racerData);
      console.log('Racer created successfully:', racer);
      
      setSuccess('Racer added successfully!');
      setTimeout(() => {
        navigate('/owner/dashboard');
      }, 1500);
    } catch (err) {
      console.error('Error creating racer:', err);
      setError(err.msg || 'Failed to add racer. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Add New Racer</h1>
        
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

        {teams.length === 0 && !loading ? (
          <div className="text-center py-8">
            <div className="text-gray-500 mb-4">
              <h2 className="text-xl mb-2">No Teams Available</h2>
              <p>You need to register a team before adding racers.</p>
            </div>
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => navigate('/owner/team-register')}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Register Team
              </button>
              <button
                onClick={() => window.location.reload()}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Refresh Page
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Racer Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter racer name"
                  required
                  disabled={loading}
                  maxLength={50}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Age *
                </label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter age"
                  min="16"
                  max="65"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Country *
                </label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter country"
                  required
                  disabled={loading}
                  maxLength={50}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Racing Number *
                </label>
                <input
                  type="number"
                  value={racingNumber}
                  onChange={(e) => setRacingNumber(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter racing number"
                  min="1"
                  max="999"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Profile Picture URL (optional)
              </label>
              <input
                type="url"
                value={profilePicture}
                onChange={(e) => setProfilePicture(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://example.com/photo.jpg"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Team *
              </label>
              <select
                value={teamId}
                onChange={(e) => setTeamId(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={loading || teams.length === 0}
              >
                <option value="">Select a team</option>
                {teams.map(team => (
                  <option key={team._id} value={team._id}>
                    {team.name} ({team.country})
                  </option>
                ))}
              </select>
              {teams.length > 0 && (
                <p className="text-sm text-gray-500 mt-1">
                  {teams.length} team(s) available
                </p>
              )}
            </div>

            <div className="flex gap-4">
              <button 
                type="submit" 
                className={`flex-1 p-3 bg-blue-500 text-white rounded font-medium hover:bg-blue-600 ${
                  loading || teams.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                disabled={loading || teams.length === 0}
              >
                {loading ? 'Adding Racer...' : 'Add Racer'}
              </button>
              
              <button 
                type="button"
                onClick={() => navigate('/owner/dashboard')}
                className="px-6 py-3 bg-gray-500 text-white rounded font-medium hover:bg-gray-600"
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AddRacers;