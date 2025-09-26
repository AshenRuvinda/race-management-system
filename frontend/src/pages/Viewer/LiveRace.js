import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Trophy, Flag, Clock, Zap, Car, Wifi, WifiOff, 
  Play, Pause, RotateCcw, Volume2, VolumeX, AlertTriangle 
} from 'lucide-react';
// Comment out your API imports temporarily
// import { 
//   getRaceById, 
//   getRaceEntries, 
//   getEvents 
// } from '../../api/raceApi';

const LiveRace = ({ raceId: propRaceId }) => {
  const { raceId: paramRaceId } = useParams();
  
  // For debugging - let's use a real race ID from the database or auto-select the first one
  const raceId = propRaceId || paramRaceId;

  // State management
  const [race, setRace] = useState(null);
  const [raceEntries, setRaceEntries] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [debugInfo, setDebugInfo] = useState('');

  // Test direct axios calls instead of your API functions
  const fetchRaceData = useCallback(async () => {
    const debug = [];
    debug.push(`Starting fetch with raceId: ${raceId || 'undefined'}`);
    debug.push(`Type: ${typeof raceId}, Length: ${raceId?.length}`);
    
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    debug.push(`API_URL: ${API_URL}`);
    
    // Get authentication token from localStorage
    const token = localStorage.getItem('token');
    debug.push(`Token found: ${token ? 'Yes' : 'No'}`);
    debug.push(`Token preview: ${token ? token.substring(0, 20) + '...' : 'None'}`);
    
    // Setup headers with auth token - your middleware expects Authorization: Bearer TOKEN
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      debug.push(`Auth header set: Bearer ${token.substring(0, 10)}...`);
    } else {
      debug.push('No token available - requests may fail with 401');
    }
    
    let actualRaceId = raceId; // This will be updated if we auto-select a race
    
    try {
      setLoading(true);
      setError('');
      
      // Test 1: Check what's working and what's not
      debug.push('Testing server connectivity and checking available races...');
      try {
        // First, let's try a simple GET to see if it's specifically a CORS issue with certain endpoints
        const healthResponse = await fetch(`${API_URL}/api/health`);
        debug.push(`Health check status: ${healthResponse.status}`);
        
        if (healthResponse.ok) {
          const healthData = await healthResponse.json();
          debug.push(`Health check successful: ${JSON.stringify(healthData)}`);
        }
        
        // Now try the races endpoint
        const testResponse = await fetch(`${API_URL}/api/races`, { 
          headers,
          method: 'GET'
        });
        debug.push(`Races endpoint status: ${testResponse.status}`);
        debug.push(`Races endpoint ok: ${testResponse.ok}`);
        
        if (testResponse.ok) {
          const racesData = await testResponse.json();
          debug.push(`Available races: ${JSON.stringify(racesData, null, 2)}`);
          
          // If we don't have a raceId OR the raceId is invalid, use the first available race
          if ((!actualRaceId || actualRaceId === '1') && Array.isArray(racesData) && racesData.length > 0) {
            const firstRace = racesData[0];
            actualRaceId = firstRace._id;
            debug.push(`Using first available race ID: ${actualRaceId}`);
            // Set the race data immediately since we have it
            setRace(firstRace);
          } else if (!actualRaceId) {
            debug.push('No raceId provided and no races found.');
            debug.push('Suggestion: Create test data using POST /api/debug/test-race');
          }
          
        } else if (testResponse.status === 401) {
          debug.push(`Authentication failed - token might be invalid or expired`);
          const errorText = await testResponse.text();
          debug.push(`Auth error details: ${errorText}`);
        } else {
          debug.push(`Races endpoint failed with status: ${testResponse.status}`);
          const errorText = await testResponse.text();
          debug.push(`Error details: ${errorText}`);
        }
      } catch (serverError) {
        debug.push(`Server connectivity test failed: ${serverError.message}`);
        debug.push(`This looks like a CORS issue. Your server CORS config allows:`);
        debug.push(`- http://localhost:3000`);
        debug.push(`- http://localhost:3001`);
        debug.push(`- ${process.env.FRONTEND_URL || 'FRONTEND_URL env var'}`);
        debug.push(`Current frontend is running on: ${window.location.origin}`);
        
        if (window.location.origin !== 'http://localhost:3000' && window.location.origin !== 'http://localhost:3001') {
          debug.push(`❌ CORS MISMATCH: Your frontend (${window.location.origin}) is not in the allowed origins list`);
          debug.push(`Fix: Add ${window.location.origin} to your server's CORS allowedOrigins array`);
        }
      }
      
      // Test 2: If we have a valid raceId now, try to fetch specific race data
      if (actualRaceId && actualRaceId !== '1') {
        debug.push(`Attempting direct fetch for race ID: ${actualRaceId}`);
        try {
          const raceUrl = `${API_URL}/api/races/${actualRaceId}`;
          debug.push(`Race URL: ${raceUrl}`);
          
          const raceResponse = await fetch(raceUrl, { headers });
          debug.push(`Race response status: ${raceResponse.status}`);
          debug.push(`Race response ok: ${raceResponse.ok}`);
          
          if (raceResponse.ok) {
            const raceData = await raceResponse.json();
            debug.push(`Race data received: ${JSON.stringify(raceData, null, 2)}`);
            setRace(raceData);
          } else if (raceResponse.status === 401) {
            debug.push(`Race fetch - Authentication required`);
          } else if (raceResponse.status === 400) {
            debug.push(`Race fetch - Bad request, race ID might not exist or be in wrong format`);
          } else if (raceResponse.status === 404) {
            debug.push(`Race fetch - Race not found (404)`);
          } else {
            const errorText = await raceResponse.text();
            debug.push(`Race fetch failed: ${raceResponse.status} - ${errorText}`);
          }
        } catch (raceError) {
          debug.push(`Race fetch error: ${raceError.message}`);
        }
        
        // Test 3: Try entries for the valid race ID
        debug.push(`Attempting to fetch entries for race ${actualRaceId}...`);
        try {
          const entriesUrl = `${API_URL}/api/races/${actualRaceId}/entries`;
          debug.push(`Entries URL: ${entriesUrl}`);
          
          const entriesResponse = await fetch(entriesUrl, { headers });
          debug.push(`Entries response status: ${entriesResponse.status}`);
          
          if (entriesResponse.ok) {
            const entriesData = await entriesResponse.json();
            debug.push(`Entries data received: ${JSON.stringify(entriesData, null, 2)}`);
            setRaceEntries(Array.isArray(entriesData) ? entriesData : []);
          } else if (entriesResponse.status === 401) {
            debug.push(`Entries fetch - Authentication required`);
          } else if (entriesResponse.status === 404) {
            debug.push(`Entries fetch - Not found (404)`);
          } else {
            const errorText = await entriesResponse.text();
            debug.push(`Entries fetch failed: ${entriesResponse.status} - ${errorText}`);
          }
        } catch (entriesError) {
          debug.push(`Entries fetch error: ${entriesError.message}`);
        }
        
        // Test 4: Try events for the valid race ID
        debug.push(`Attempting to fetch events for race ${actualRaceId}...`);
        try {
          const eventsUrl = `${API_URL}/api/events/${actualRaceId}`;
          debug.push(`Events URL: ${eventsUrl}`);
          
          const eventsResponse = await fetch(eventsUrl, { headers });
          debug.push(`Events response status: ${eventsResponse.status}`);
          
          if (eventsResponse.ok) {
            const eventsData = await eventsResponse.json();
            debug.push(`Events data received: ${JSON.stringify(eventsData, null, 2)}`);
            setEvents(Array.isArray(eventsData) ? eventsData : []);
          } else if (eventsResponse.status === 401) {
            debug.push(`Events fetch - Authentication required`);
          } else if (eventsResponse.status === 404) {
            debug.push(`Events fetch - Not found (404)`);
          } else if (eventsResponse.status === 500) {
            debug.push(`Events fetch - Server error (check database connection)`);
            const errorText = await eventsResponse.text();
            debug.push(`Server error details: ${errorText}`);
          } else {
            const errorText = await eventsResponse.text();
            debug.push(`Events fetch failed: ${eventsResponse.status} - ${errorText}`);
          }
        } catch (eventsError) {
          debug.push(`Events fetch error: ${eventsError.message}`);
        }
      } else {
        debug.push(`No valid race ID available - skipping race-specific requests`);
      }
      
      debug.push('Fetch attempts completed');
      setDebugInfo(debug.join('\n'));
      
    } catch (err) {
      debug.push(`Unexpected error: ${err.message || 'Unknown error'}`);
      console.error('Full error:', err);
      setError(`Error: ${err.message || 'Unknown error'}`);
      setDebugInfo(debug.join('\n'));
    } finally {
      setLoading(false);
    }
  }, [raceId]);

  useEffect(() => {
    fetchRaceData();
  }, [fetchRaceData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-lg">Loading Live Race...</p>
          <p className="mt-2 text-sm text-gray-400">Race ID: {raceId}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-red-900 border border-red-700 rounded-lg p-6 max-w-4xl w-full">
          <div className="text-center mb-6">
            <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Debug Information</h2>
            <p className="text-red-300 mb-4">{error}</p>
          </div>
          
          <div className="bg-black bg-opacity-50 p-4 rounded text-white text-sm font-mono overflow-auto max-h-96">
            <h3 className="text-green-400 mb-2">Debug Log:</h3>
            <pre className="whitespace-pre-wrap">{debugInfo}</pre>
          </div>
          
          <div className="flex gap-2 mt-4">
            <button 
              onClick={fetchRaceData}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Retry
            </button>
            <button 
              onClick={() => window.location.reload()}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
              Reload Page
            </button>
          </div>
          
          <div className="mt-4 p-4 bg-yellow-900 bg-opacity-50 rounded text-yellow-200 text-sm">
            <h4 className="font-bold mb-2">Troubleshooting Steps:</h4>
            <ol className="list-decimal list-inside space-y-1">
              <li><strong>Authentication Issue (401):</strong> You need to log in first. Check if token exists in localStorage.</li>
              <li><strong>Race ID Format (400):</strong> Your race ID "1" might need to be a MongoDB ObjectId format.</li>
              <li><strong>Server Error (500):</strong> Check your backend logs and database connection.</li>
              <li>Check if your API server is running on the correct port</li>
              <li>Verify the race ID exists in your database</li>
              <li>Ensure your API routes match the expected endpoints</li>
              <li>Check browser network tab for failed requests</li>
              <li>Verify MongoDB connection and collection names</li>
            </ol>
            
            <div className="mt-4 p-3 bg-blue-900 bg-opacity-50 rounded">
              <h5 className="font-bold text-blue-300">Quick Fixes:</h5>
              <ul className="mt-2 space-y-1 text-sm">
                <li>• <strong>For Auth:</strong> Log in through your app's login page first</li>
                <li>• <strong>For Race ID:</strong> Use a real ObjectId from your MongoDB races collection</li>
                <li>• <strong>For Server Error:</strong> Check your backend console for detailed error messages</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If we get here, data loaded successfully
  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-green-900 bg-opacity-50 border border-green-700 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-green-400 mb-4">Success! Data Loaded</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-black bg-opacity-50 p-4 rounded">
              <h3 className="font-bold text-blue-400 mb-2">Race Data</h3>
              <pre className="text-xs overflow-auto max-h-32">
                {JSON.stringify(race, null, 2)}
              </pre>
            </div>
            
            <div className="bg-black bg-opacity-50 p-4 rounded">
              <h3 className="font-bold text-green-400 mb-2">Entries ({raceEntries.length})</h3>
              <pre className="text-xs overflow-auto max-h-32">
                {JSON.stringify(raceEntries.slice(0, 2), null, 2)}
              </pre>
            </div>
            
            <div className="bg-black bg-opacity-50 p-4 rounded">
              <h3 className="font-bold text-purple-400 mb-2">Events ({events.length})</h3>
              <pre className="text-xs overflow-auto max-h-32">
                {JSON.stringify(events.slice(0, 2), null, 2)}
              </pre>
            </div>
          </div>
        </div>

        <div className="bg-black bg-opacity-50 p-4 rounded text-sm font-mono">
          <h3 className="text-yellow-400 mb-2">Debug Info:</h3>
          <pre className="whitespace-pre-wrap">{debugInfo}</pre>
        </div>

        <div className="mt-6 text-center">
          <div className="space-x-4">
            <button 
              onClick={fetchRaceData}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            >
              Refresh Data
            </button>
            
            <button 
              onClick={async () => {
                try {
                  const token = localStorage.getItem('token');
                  const headers = {
                    'Content-Type': 'application/json',
                  };
                  if (token) {
                    headers['Authorization'] = `Bearer ${token}`;
                  }
                  
                  const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/debug/test-race`, {
                    method: 'POST',
                    headers
                  });
                  
                  if (response.ok) {
                    const result = await response.json();
                    alert('Test race created successfully! Race ID: ' + result._id);
                    fetchRaceData();
                  } else {
                    const error = await response.text();
                    alert('Failed to create test race: ' + error);
                  }
                } catch (err) {
                  alert('Error creating test race: ' + err.message);
                }
              }}
              className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
            >
              Create Test Race
            </button>
          </div>
        </div>

        <div className="mt-4 p-4 bg-blue-900 bg-opacity-50 rounded text-blue-200 text-sm">
          <h4 className="font-bold mb-2">Next Steps:</h4>
          <p>Once you see this success screen, I can restore the full LiveRace UI with the working data structure.</p>
        </div>
      </div>
    </div>
  );
};

export default LiveRace;