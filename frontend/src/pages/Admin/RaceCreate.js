import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Trophy, Users, Clock, MapPin, Flag, AlertTriangle, 
  Play, Square, Settings, Timer, Car, Zap, Target,
  ArrowUp, ArrowDown, RotateCcw, Ban, CheckCircle
} from 'lucide-react';

// API functions
const raceAPI = {
  getRaceById: async (raceId) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`/api/races/${raceId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch race: ${response.status}`);
    }
    return response.json();
  },
  
  getRaceEntries: async (raceId) => {
    const response = await fetch(`/api/races/${raceId}/entries`);
    if (!response.ok) {
      throw new Error(`Failed to fetch race entries: ${response.status}`);
    }
    return response.json();
  },
  
  getEvents: async (raceId) => {
    const response = await fetch(`/api/events/${raceId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch events: ${response.status}`);
    }
    return response.json();
  },
  
  updatePosition: async (raceId, racerId, newPosition) => {
    const token = localStorage.getItem('token');
    const response = await fetch('/api/races/position', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ raceId, racerId, newPosition })
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.msg || 'Failed to update position');
    }
    return response.json();
  },
  
  markLap: async (raceId, racerId, lapTime) => {
    const token = localStorage.getItem('token');
    const response = await fetch('/api/races/lap', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ raceId, racerId, lapTime })
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.msg || 'Failed to record lap time');
    }
    return response.json();
  },
  
  markPitStop: async (raceId, racerId, tyreType, pitTime) => {
    const token = localStorage.getItem('token');
    const response = await fetch('/api/races/pitstop', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ raceId, racerId, tyreType, pitTime })
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.msg || 'Failed to record pit stop');
    }
    return response.json();
  },
  
  markDNF: async (raceId, racerId) => {
    const token = localStorage.getItem('token');
    const response = await fetch('/api/races/dnf', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ raceId, racerId })
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.msg || 'Failed to mark DNF');
    }
    return response.json();
  },
  
  finalizeRace: async (raceId) => {
    const token = localStorage.getItem('token');
    const response = await fetch('/api/races/finalize', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ raceId })
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.msg || 'Failed to finalize race');
    }
    return response.json();
  },

  startRace: async (raceId) => {
    const token = localStorage.getItem('token');
    const response = await fetch('/api/races/start', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ raceId })
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.msg || 'Failed to start race');
    }
    return response.json();
  }
};

const RaceControl = () => {
  const { raceId } = useParams();
  const navigate = useNavigate();
  
  const [race, setRace] = useState(null);
  const [raceEntries, setRaceEntries] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedRacer, setSelectedRacer] = useState(null);
  const [activeTab, setActiveTab] = useState('positions');
  const [refreshInterval, setRefreshInterval] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch race data
  const fetchRaceData = useCallback(async () => {
    if (!raceId) return;
    
    try {
      setError('');
      const [raceData, entriesData, eventsData] = await Promise.all([
        raceAPI.getRaceById(raceId),
        raceAPI.getRaceEntries(raceId),
        raceAPI.getEvents(raceId)
      ]);
      
      setRace(raceData);
      setRaceEntries(entriesData.sort((a, b) => a.position - b.position));
      setEvents(eventsData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      
    } catch (err) {
      console.error('Error fetching race data:', err);
      setError(err.message || 'Failed to load race data. Please try again.');
    }
  }, [raceId]);

  // Initial data load
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchRaceData();
      setLoading(false);
    };
    
    loadData();
  }, [fetchRaceData]);

  // Set up auto-refresh for ongoing races
  useEffect(() => {
    if (race?.status === 'ongoing') {
      const interval = setInterval(fetchRaceData, 5000); // Refresh every 5 seconds
      setRefreshInterval(interval);
      return () => clearInterval(interval);
    } else if (refreshInterval) {
      clearInterval(refreshInterval);
      setRefreshInterval(null);
    }
  }, [race?.status, fetchRaceData, refreshInterval]);

  // Action handlers with API calls
  const handlePositionChange = useCallback(async (racerId, newPosition) => {
    try {
      setActionLoading(true);
      setError('');
      await raceAPI.updatePosition(raceId, racerId, newPosition);
      await fetchRaceData(); // Refresh data after update
    } catch (err) {
      console.error('Error updating position:', err);
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  }, [raceId, fetchRaceData]);

  const handleLapTime = useCallback(async (racerId, lapTime) => {
    try {
      setActionLoading(true);
      setError('');
      await raceAPI.markLap(raceId, racerId, lapTime);
      await fetchRaceData(); // Refresh data after update
    } catch (err) {
      console.error('Error recording lap time:', err);
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  }, [raceId, fetchRaceData]);

  const handlePitStop = useCallback(async (racerId, tyreType, pitTime) => {
    try {
      setActionLoading(true);
      setError('');
      await raceAPI.markPitStop(raceId, racerId, tyreType, pitTime);
      await fetchRaceData(); // Refresh data after update
    } catch (err) {
      console.error('Error recording pit stop:', err);
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  }, [raceId, fetchRaceData]);

  const handleDNF = useCallback(async (racerId) => {
    try {
      setActionLoading(true);
      setError('');
      await raceAPI.markDNF(raceId, racerId);
      await fetchRaceData(); // Refresh data after update
      // Clear selection if DNF driver was selected
      if (selectedRacer === racerId) {
        setSelectedRacer(null);
      }
    } catch (err) {
      console.error('Error marking DNF:', err);
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  }, [raceId, fetchRaceData, selectedRacer]);

  const handleStartRace = useCallback(async () => {
    try {
      setActionLoading(true);
      setError('');
      await raceAPI.startRace(raceId);
      await fetchRaceData(); // Refresh data after update
    } catch (err) {
      console.error('Error starting race:', err);
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  }, [raceId, fetchRaceData]);

  const handleFinalizeRace = useCallback(async () => {
    try {
      setActionLoading(true);
      setError('');
      await raceAPI.finalizeRace(raceId);
      await fetchRaceData(); // Refresh data after update
    } catch (err) {
      console.error('Error finalizing race:', err);
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  }, [raceId, fetchRaceData]);

  const getTyreColor = (tyreType) => {
    switch (tyreType) {
      case 'soft': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500'; 
      case 'hard': return 'bg-gray-500';
      default: return 'bg-gray-300';
    }
  };

  const formatTime = (seconds) => {
    if (!seconds) return '--:--:---';
    const mins = Math.floor(seconds / 60);
    const secs = (seconds % 60).toFixed(3);
    return `${mins}:${secs.padStart(6, '0')}`;
  };

  const formatRelativeTime = (dateString) => {
    const now = new Date();
    const eventTime = new Date(dateString);
    const diffMs = now - eventTime;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Now';
    if (diffMins === 1) return '1 min ago';
    if (diffMins < 60) return `${diffMins} mins ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours === 1) return '1 hour ago';
    return `${diffHours} hours ago`;
  };

  const getEventDescription = (event) => {
    const racer = raceEntries.find(entry => entry.racer._id === event.data.racerId);
    const racerName = racer?.racer.name || 'Unknown Driver';
    
    switch (event.type) {
      case 'lap_completed':
        return `${racerName} completed lap: ${formatTime(event.data.lapTime)}`;
      case 'pit_stop':
        return `${racerName} pit stop: ${event.data.tyreType} tyres (${event.data.pitTime}s)`;
      case 'position_change':
        return `${racerName} position change: P${event.data.oldPosition} → P${event.data.newPosition}`;
      case 'dnf':
        return `${racerName} retired from race`;
      case 'race_completed':
        return 'Race completed';
      case 'race_created':
        return `Race created at ${event.data.venue}`;
      default:
        return 'Unknown event';
    }
  };

  // Calculate race statistics
  const getRaceStats = () => {
    const activeDrivers = raceEntries.filter(entry => entry.status === 'active').length;
    const dnfDrivers = raceEntries.filter(entry => entry.status === 'DNF').length;
    const totalLaps = race?.totalLaps || 0;
    
    // Calculate current lap from lap completion events
    const lapEvents = events.filter(e => e.type === 'lap_completed');
    const currentLap = lapEvents.length > 0 ? Math.min(Math.floor(lapEvents.length / raceEntries.length) + 1, totalLaps) : 1;
    
    return {
      activeDrivers,
      dnfDrivers,
      currentLap,
      totalLaps,
      progress: totalLaps > 0 ? Math.round((currentLap / totalLaps) * 100) : 0
    };
  };

  // Validate lap time input
  const validateLapTime = (time) => {
    const lapTime = parseFloat(time);
    if (isNaN(lapTime) || lapTime <= 0 || lapTime > 300) {
      throw new Error('Lap time must be between 0.1 and 300 seconds');
    }
    return lapTime;
  };

  // Validate position input
  const validatePosition = (position) => {
    const pos = parseInt(position);
    if (isNaN(pos) || pos < 1 || pos > raceEntries.length) {
      throw new Error(`Position must be between 1 and ${raceEntries.length}`);
    }
    return pos;
  };

  // Validate pit time input
  const validatePitTime = (time) => {
    const pitTime = parseFloat(time);
    if (isNaN(pitTime) || pitTime <= 0 || pitTime > 60) {
      throw new Error('Pit time must be between 0.1 and 60 seconds');
    }
    return pitTime;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <span className="mt-4 block text-gray-600">Loading race data...</span>
        </div>
      </div>
    );
  }

  if (!race) {
    return (
      <div className="p-6">
        <div className="text-center text-gray-500">
          <AlertTriangle className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-xl font-semibold mb-2">Race Not Found</h2>
          <p className="mb-4">The requested race could not be found.</p>
          <button 
            onClick={() => navigate('/admin/dashboard')}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const stats = getRaceStats();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Error Banner */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 relative">
          <span className="block sm:inline">{error}</span>
          <button 
            onClick={() => setError('')}
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
          >
            <span className="sr-only">Dismiss</span>
            ×
          </button>
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Trophy className="h-8 w-8 text-yellow-500" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{race.venue}</h1>
              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                <div className="flex items-center">
                  <Flag className="h-4 w-4 mr-1" />
                  Lap {stats.currentLap} / {stats.totalLaps}
                </div>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  {stats.activeDrivers} Active
                </div>
                {stats.dnfDrivers > 0 && (
                  <div className="flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    {stats.dnfDrivers} DNF
                  </div>
                )}
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {refreshInterval ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              race.status === 'ongoing' ? 'bg-green-100 text-green-800' :
              race.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {race.status?.toUpperCase()}
            </div>
            
            {race.status === 'pending' && (
              <button 
                onClick={handleStartRace}
                disabled={actionLoading}
                className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-green-700 disabled:opacity-50"
              >
                <Play className="h-4 w-4 mr-2" />
                Start Race
              </button>
            )}
            
            {race.status === 'ongoing' && (
              <button 
                onClick={() => {
                  if (confirm('Are you sure you want to finalize this race? This action cannot be undone.')) {
                    handleFinalizeRace();
                  }
                }}
                disabled={actionLoading}
                className="bg-red-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-red-700 disabled:opacity-50"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Finalize Race
              </button>
            )}
            
            <button 
              onClick={() => navigate('/admin/dashboard')}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-gray-700"
            >
              <Settings className="h-4 w-4 mr-2" />
              Back
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Main Control Panel */}
        <div className="col-span-8">
          {/* Tab Navigation */}
          <div className="bg-white rounded-lg shadow-sm mb-6">
            <div className="border-b">
              <nav className="flex space-x-8 px-6">
                {[
                  { key: 'positions', label: 'Live Positions', icon: Target },
                  { key: 'timing', label: 'Timing & Scoring', icon: Timer },
                  { key: 'events', label: 'Race Events', icon: Flag }
                ].map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`py-4 px-2 border-b-2 font-medium text-sm flex items-center ${
                      activeTab === tab.key
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <tab.icon className="h-4 w-4 mr-2" />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-6">
              {activeTab === 'positions' && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Live Race Positions</h3>
                    <button 
                      onClick={fetchRaceData}
                      disabled={loading}
                      className="text-sm text-blue-600 hover:text-blue-800 flex items-center disabled:opacity-50"
                    >
                      <RotateCcw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
                      Refresh
                    </button>
                  </div>
                  
                  {raceEntries.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Car className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                      <p>No drivers in this race</p>
                    </div>
                  ) : (
                    raceEntries.map((entry) => (
                      <div
                        key={entry._id}
                        className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all cursor-pointer ${
                          selectedRacer === entry.racer._id 
                            ? 'border-blue-500 bg-blue-50' 
                            : entry.status === 'DNF' 
                              ? 'border-red-200 bg-red-50' 
                              : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedRacer(entry.racer._id)}
                      >
                        <div className="flex items-center space-x-4">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                            entry.position === 1 ? 'bg-yellow-500' :
                            entry.position === 2 ? 'bg-gray-400' :
                            entry.position === 3 ? 'bg-amber-600' :
                            'bg-gray-600'
                          }`}>
                            {entry.position}
                          </div>
                          
                          <div className="flex items-center space-x-3">
                            <span className="bg-gray-800 text-white px-2 py-1 rounded text-sm font-mono">
                              {entry.racer.racingNumber}
                            </span>
                            <div>
                              <div className="font-semibold">{entry.racer.name}</div>
                              <div className="text-sm text-gray-600">{entry.racer.team?.name || 'No Team'}</div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <div className={`w-4 h-4 rounded-full ${getTyreColor(entry.tyreType)}`}></div>
                            <span className="text-sm capitalize">{entry.tyreType}</span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-6">
                          <div className="text-right">
                            <div className="text-sm text-gray-600">Status</div>
                            <div className={`font-semibold ${entry.status === 'DNF' ? 'text-red-600' : 'text-green-600'}`}>
                              {entry.status === 'DNF' ? 'DNF' : 'ACTIVE'}
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-1">
                            {entry.status === 'DNF' && (
                              <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">DNF</span>
                            )}
                            {entry.status === 'active' && (
                              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'timing' && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Timing & Scoring</h3>
                  {raceEntries.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Timer className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                      <p>No timing data available</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-3">Pos</th>
                            <th className="text-left p-3">No.</th>
                            <th className="text-left p-3">Driver</th>
                            <th className="text-left p-3">Team</th>
                            <th className="text-left p-3">Tyres</th>
                            <th className="text-left p-3">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {raceEntries.map(entry => (
                            <tr key={entry._id} className="border-b hover:bg-gray-50">
                              <td className="p-3 font-semibold">{entry.position}</td>
                              <td className="p-3">
                                <span className="bg-gray-800 text-white px-2 py-1 rounded text-xs font-mono">
                                  {entry.racer.racingNumber}
                                </span>
                              </td>
                              <td className="p-3 font-medium">{entry.racer.name}</td>
                              <td className="p-3">{entry.racer.team?.name || 'No Team'}</td>
                              <td className="p-3">
                                <div className="flex items-center space-x-2">
                                  <div className={`w-3 h-3 rounded-full ${getTyreColor(entry.tyreType)}`}></div>
                                  <span className="capitalize">{entry.tyreType}</span>
                                </div>
                              </td>
                              <td className="p-3">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  entry.status === 'DNF' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                                }`}>
                                  {entry.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'events' && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Race Events ({events.length})</h3>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {events.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Flag className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                        <p>No events recorded yet</p>
                      </div>
                    ) : (
                      events.map(event => (
                        <div key={event._id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                          <div className="text-xs text-gray-500 w-20 flex-shrink-0">
                            {formatRelativeTime(event.createdAt)}
                          </div>
                          <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                            event.type === 'lap_completed' ? 'bg-blue-500' :
                            event.type === 'pit_stop' ? 'bg-orange-500' :
                            event.type === 'position_change' ? 'bg-green-500' :
                            event.type === 'dnf' ? 'bg-red-500' :
                            event.type === 'race_completed' ? 'bg-purple-500' :
                            'bg-gray-500'
                          }`}></div>
                          <div className="flex-1 text-sm">
                            {getEventDescription(event)}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Panel */}
        <div className="col-span-4">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Race Actions</h3>
            
            {selectedRacer ? (
              <div className="space-y-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="text-sm text-blue-600">Selected Driver</div>
                  <div className="font-semibold">
                    {raceEntries.find(r => r.racer._id === selectedRacer)?.racer.name}
                  </div>
                  <div className="text-sm text-gray-600">
                    #{raceEntries.find(r => r.racer._id === selectedRacer)?.racer.racingNumber} - 
                    {raceEntries.find(r => r.racer._id === selectedRacer)?.racer.team?.name || 'No Team'}
                  </div>
                </div>

                {race.status === 'ongoing' && (
                  <div className="space-y-3">
                    <button 
                      onClick={() => {
                        const lapTimeStr = prompt('Enter lap time (seconds):');
                        if (lapTimeStr) {
                          try {
                            const lapTime = validateLapTime(lapTimeStr);
                            handleLapTime(selectedRacer, lapTime);
                          } catch (err) {
                            alert(err.message);
                          }
                        }
                      }}
                      disabled={actionLoading}
                      className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      <Timer className="h-4 w-4" />
                      <span>Record Lap Time</span>
                    </button>

                    <button 
                      onClick={() => {
                        const newPosStr = prompt(`Enter new position (1-${raceEntries.length}):`);
                        if (newPosStr) {
                          try {
                            const newPos = validatePosition(newPosStr);
                            handlePositionChange(selectedRacer, newPos);
                          } catch (err) {
                            alert(err.message);
                          }
                        }
                      }}
                      disabled={actionLoading}
                      className="w-full flex items-center justify-center space-x-2 bg-green-600 text-white p-3 rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                      <ArrowUp className="h-4 w-4" />
                      <span>Update Position</span>
                    </button>

                    <div className="space-y-2">
                      <div className="text-sm font-medium text-gray-700">Pit Stop Options</div>
                      <div className="grid grid-cols-3 gap-2">
                        {['soft', 'medium', 'hard'].map(tyre => (
                          <button
                            key={tyre}
                            onClick={() => {
                              const pitTimeStr = prompt(`Enter pit time for ${tyre} tyres (seconds):`);
                              if (pitTimeStr) {
                                try {
                                  const pitTime = validatePitTime(pitTimeStr);
                                  handlePitStop(selectedRacer, tyre, pitTime);
                                } catch (err) {
                                  alert(err.message);
                                }
                              }
                            }}
                            disabled={actionLoading}
                            className={`flex items-center justify-center space-x-1 p-2 rounded text-white text-sm disabled:opacity-50 ${
                              tyre === 'soft' ? 'bg-red-500 hover:bg-red-600' :
                              tyre === 'medium' ? 'bg-yellow-500 hover:bg-yellow-600' :
                              'bg-gray-500 hover:bg-gray-600'
                            }`}
                          >
                            <div className={`w-3 h-3 rounded-full ${getTyreColor(tyre)}`}></div>
                            <span className="capitalize">{tyre}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {raceEntries.find(r => r.racer._id === selectedRacer)?.status !== 'DNF' && (
                      <button 
                        onClick={() => {
                          const racerName = raceEntries.find(r => r.racer._id === selectedRacer)?.racer.name;
                          if (confirm(`Mark ${racerName} as DNF (Did Not Finish)?`)) {
                            handleDNF(selectedRacer);
                          }
                        }}
                        disabled={actionLoading}
                        className="w-full flex items-center justify-center space-x-2 bg-red-600 text-white p-3 rounded-lg hover:bg-red-700 disabled:opacity-50"
                      >
                        <Ban className="h-4 w-4" />
                        <span>Mark DNF</span>
                      </button>
                    )}

                    {raceEntries.find(r => r.racer._id === selectedRacer)?.status === 'DNF' && (
                      <div className="p-3 bg-red-100 rounded-lg">
                        <div className="text-sm text-red-600 font-medium">Driver is DNF</div>
                        <div className="text-sm text-red-500">No actions available</div>
                      </div>
                    )}
                  </div>
                )}

                {race.status === 'pending' && (
                  <div className="p-3 bg-yellow-100 rounded-lg">
                    <div className="text-sm text-yellow-600 font-medium">Race Not Started</div>
                    <div className="text-sm text-yellow-500">Start the race to enable driver actions</div>
                  </div>
                )}

                {race.status === 'completed' && (
                  <div className="p-3 bg-gray-100 rounded-lg">
                    <div className="text-sm text-gray-600 font-medium">Race Completed</div>
                    <div className="text-sm text-gray-500">No actions available</div>
                  </div>
                )}

                {actionLoading && (
                  <div className="flex items-center justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                    <span className="ml-2 text-sm text-gray-600">Processing...</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <Car className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                <p className="text-sm">Select a driver from the positions list to manage race actions</p>
                {raceEntries.length === 0 && (
                  <p className="text-xs mt-2">No drivers available in this race</p>
                )}
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
            <h3 className="text-lg font-semibold mb-4">Race Statistics</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Venue</span>
                <span className="font-semibold">{race.venue}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Laps</span>
                <span className="font-semibold">{stats.totalLaps}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Current Lap</span>
                <span className="font-semibold">{stats.currentLap}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Drivers</span>
                <span className="font-semibold">{raceEntries.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Active Drivers</span>
                <span className="font-semibold text-green-600">{stats.activeDrivers}</span>
              </div>
              {stats.dnfDrivers > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">DNF</span>
                  <span className="font-semibold text-red-600">{stats.dnfDrivers}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Progress</span>
                <span className="font-semibold">{stats.progress}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Events</span>
                <span className="font-semibold">{events.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Created</span>
                <span className="font-semibold text-xs">
                  {new Date(race.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Race Progress Bar */}
            <div className="mt-4">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Race Progress</span>
                <span>{stats.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${stats.progress}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Race Status Card */}
          <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
            <h3 className="text-lg font-semibold mb-4">Race Status</h3>
            <div className="space-y-3">
              <div className={`p-3 rounded-lg ${
                race.status === 'ongoing' ? 'bg-green-50' :
                race.status === 'pending' ? 'bg-yellow-50' :
                'bg-gray-50'
              }`}>
                <div className={`font-semibold ${
                  race.status === 'ongoing' ? 'text-green-800' :
                  race.status === 'pending' ? 'text-yellow-800' :
                  'text-gray-800'
                }`}>
                  {race.status === 'ongoing' ? '🏁 Race in Progress' :
                   race.status === 'pending' ? '⏳ Waiting to Start' :
                   '🏆 Race Completed'}
                </div>
                <div className={`text-sm ${
                  race.status === 'ongoing' ? 'text-green-600' :
                  race.status === 'pending' ? 'text-yellow-600' :
                  'text-gray-600'
                }`}>
                  {race.status === 'ongoing' ? 'Live race management active' :
                   race.status === 'pending' ? 'Ready to start racing' :
                   'Final results recorded'}
                </div>
              </div>

              {refreshInterval && (
                <div className="flex items-center space-x-2 text-sm text-blue-600">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span>Auto-refreshing every 5 seconds</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RaceControl;