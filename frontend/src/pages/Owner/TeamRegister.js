import React, { useState } from 'react';
import { createTeam } from '../../api/teamApi';
import { useNavigate } from 'react-router-dom';

const TeamRegister = () => {
  const [name, setName] = useState('');
  const [logo, setLogo] = useState('');
  const [country, setCountry] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // Basic validation
    if (!name.trim()) {
      setError('Team name is required');
      setLoading(false);
      return;
    }

    if (!country.trim()) {
      setError('Country is required');
      setLoading(false);
      return;
    }

    try {
      const teamData = {
        name: name.trim(),
        logo: logo.trim(),
        country: country.trim()
      };

      await createTeam(teamData);
      setSuccess('Team registered successfully!');
      
      // Navigate after a short delay to show success message
      setTimeout(() => {
        navigate('/owner/dashboard');
      }, 1500);

    } catch (err) {
      console.error('Team registration error:', err);
      setError(err.msg || 'Failed to register team. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="card">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Register Team</h1>
        
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Team Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input"
              placeholder="Enter team name"
              required
              disabled={loading}
              maxLength={50}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Logo URL (optional)
            </label>
            <input
              type="url"
              value={logo}
              onChange={(e) => setLogo(e.target.value)}
              className="input"
              placeholder="https://example.com/logo.png"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Country *
            </label>
            <input
              type="text"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="input"
              placeholder="Enter country"
              required
              disabled={loading}
              maxLength={50}
            />
          </div>

          <div className="flex gap-2">
            <button 
              type="submit" 
              className={`btn-primary flex-1 ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={loading}
            >
              {loading ? 'Registering...' : 'Register Team'}
            </button>
            
            <button 
              type="button"
              onClick={() => navigate('/owner/dashboard')}
              className="btn-secondary"
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

export default TeamRegister;