import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Trophy, Users, Clock, MapPin, Flag, AlertTriangle, 
  Play, Square, Settings, Timer, Car, Zap, Target,
  ArrowUp, ArrowDown, RotateCcw, Ban, CheckCircle, RefreshCw
} from 'lucide-react';
import { 
  getRaceById, 
  getRaceEntries, 
  getEvents, 
  updatePosition, 
  markLap, 
  markPitStop, 
  markDNF, 
  finalizeRace 
} from '../../api/raceApi'; // Adjust import path as needed

const RaceControl = () => {
  const { raceId } = useParams();
  const navigate = useNavigate();
  
  const [race, setRace] = useState(null);
  const [raceEntries, setRaceEntries] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedRacer, setSelectedRacer] = useState(null);
  const [activeTab, setActiveTab] = useState('positions');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(null);

  // Fetch race data
  const fetchRaceData = useCallback(async () => {
    if (!raceId) {
      setError('No race ID provided');
      setLoading(false);
      return;
    }

    try {
      console.log('Fetching race data for ID:', raceId);
      
      // Fetch race details, entries, and events in parallel
      const [raceData, entriesData, eventsData] = await Promise.all([
        getRaceById(raceId),
        getRaceEntries(raceId),
        getEvents(raceId)
      ]);

      console.log('Race data received:', raceData);
      console.log('Entries data received:', entriesData);
      console.log('Events data received:', eventsData);

      setRace(raceData);
      setRaceEntries(entriesData || []);
      setEvents(eventsData || []);
      setError('');
      
    } catch (err) {
      console.error('Error fetching race data:', err);
      
      let errorMessage = 'Failed to load race data';
      if (err.msg || err.message) {
        errorMessage = err.msg || err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      
      setError(errorMessage);
      
      // If race not found, redirect to dashboard after a delay
      if (errorMessage.includes('not found') || errorMessage.includes('404')) {
        setTimeout(() => {
          navigate('/admin/dashboard');
        }, 3000);
      }
    } finally {
      setLoading(false);
    }
  }, [raceId, navigate]);

  // Initial data fetch
  useEffect(() => {
    fetchRaceData();
  }, [fetchRaceData]);

  // Auto-refresh setup
  useEffect(() => {
    if (autoRefresh && !loading && !error) {
      const interval = setInterval(fetchRaceData, 5000); // Refresh every 5 seconds
      setRefreshInterval(interval);
      return () => clearInterval(interval);
    } else if (refreshInterval) {
      clearInterval(refreshInterval);
      setRefreshInterval(null);
    }
  }, [autoRefresh, loading, error, fetchRaceData]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [refreshInterval]);

  // Action handlers
  const handlePositionChange = useCallback(async (racerId, newPosition) => {
    setActionLoading(true);
    try {
      await updatePosition(raceId, racerId, newPosition);
      await fetchRaceData(); // Refresh data after update
    } catch (err) {
      console.error('Error updating position:', err);
      alert(`Failed to update position: ${err.msg || err.message || 'Unknown error'}`);
    } finally {
      setActionLoading(false);
    }
  }, [raceId, fetchRaceData]);

  const handleLapTime = useCallback(async (racerId, lapTime) => {
    setActionLoading(true);
    try {
      await markLap(raceId, racerId, lapTime);
      await fetchRaceData(); // Refresh data after update
    } catch (err) {
      console.error('Error marking lap time:', err);
      alert(`Failed to record lap time: ${err.msg || err.message || 'Unknown error'}`);
    } finally {
      setActionLoading(false);
    }
  }, [raceId, fetchRaceData]);

  const handlePitStop = useCallback(async (racerId, tyreType, pitTime) => {
    setActionLoading(true);
    try {
      await markPitStop(raceId, racerId, tyreType, pitTime);
      await fetchRaceData(); // Refresh data after update
    } catch (err) {
      console.error('Error marking pit stop:', err);
      alert(`Failed to record pit stop: ${err.msg || err.message || 'Unknown error'}`);
    } finally {
      setActionLoading(false);
    }
  }, [raceId, fetchRaceData]);

  const handleDNF = useCallback(async (racerId) => {
    setActionLoading(true);
    try {
      await markDNF(raceId, racerId);
      await fetchRaceData(); // Refresh data after update
      setSelectedRacer(null); // Deselect DNF racer
    } catch (err) {
      console.error('Error marking DNF:', err);
      alert(`Failed to mark DNF: ${err.msg || err.message || 'Unknown error'}`);
    } finally {
      setActionLoading(false);
    }
  }, [raceId, fetchRaceData]);

  const handleFinalizeRace = useCallback(async () => {
    if (!confirm('Are you sure you want to finalize this race? This action cannot be undone.')) {
      return;
    }

    setActionLoading(true);
    try {
      await finalizeRace(raceId);
      await fetchRaceData(); // Refresh data after update
      alert('Race finalized successfully!');
    } catch (err) {
      console.error('Error finalizing race:', err);
      alert(`Failed to finalize race: ${err.msg || err.message || 'Unknown error'}`);
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

  const formatGap = (gap) => {
    return gap || '+0.000';
  };

  const getSelectedRacerEntry = () => {
    return raceEntries.find(r => r.racer._id === selectedRacer);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <span className="mt-4 block text-gray-600">Loading race data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              <div className="flex-1">
                <h3 className="font-semibold">Error Loading Race</h3>
                <p className="mt-1">{error}</p>
                <div className="mt-3 flex space-x-2">
                  <button
                    onClick={fetchRaceData}
                    className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                  >
                    Retry
                  </button>
                  <button
                    onClick={() => navigate('/admin/dashboard')}
                    className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700"
                  >
                    Back to Dashboard
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!race) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-2xl mx-auto text-center">
          <Car className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-xl font-semibold text-gray-600">Race Not Found</h2>
          <p className="text-gray-500 mt-2">The requested race could not be loaded.</p>
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
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
                  Lap {race.currentLap || 0} / {race.totalLaps}
                </div>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  {raceEntries.filter(r => r.status === 'active').length} Active
                </div>
                <div className="flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  {raceEntries.filter(r => r.status === 'DNF').length} DNF
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              race.status === 'ongoing' ? 'bg-green-100 text-green-800' :
              race.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
              race.status === 'completed' ? 'bg-blue-100 text-blue-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {race.status?.toUpperCase()}
            </div>
            
            <button 
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`flex items-center px-3 py-1 rounded text-sm ${
                autoRefresh ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
              }`}
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${autoRefresh ? 'animate-spin' : ''}`} />
              Auto-refresh: {autoRefresh ? 'ON' : 'OFF'}
            </button>
            
            {race.status === 'ongoing' && (
              <button 
                onClick={handleFinalizeRace}
                disabled={actionLoading}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Finalize Race
              </button>
            )}
            
            <button 
              onClick={() => navigate('/admin/dashboard')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
            >
              <Settings className="h-4 w-4 mr-2" />
              Dashboard
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
                      className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                    >
                      <RefreshCw className="h-4 w-4 mr-1" />
                      Refresh Now
                    </button>
                  </div>
                  
                  {raceEntries.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <Car className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                      <p>No race entries found</p>
                    </div>
                  ) : (
                    raceEntries
                      .sort((a, b) => a.position - b.position)
                      .map((entry, index) => (
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
                              <div className={`w-4 h-4 rounded-full ${getTyreColor(entry.tyreType || 'medium')}`}></div>
                              <span className="text-sm capitalize">{entry.tyreType || 'medium'}</span>
                            </div>
                          </div>

                          <div className="flex items-center space-x-6">
                            <div className="text-right">
                              <div className="text-sm text-gray-600">Gap</div>
                              <div className="font-mono font-semibold">{formatGap(entry.gap)}</div>
                            </div>
                            
                            <div className="text-right">
                              <div className="text-sm text-gray-600">Last Lap</div>
                              <div className="font-mono font-semibold">
                                {entry.lastLapTime ? formatTime(entry.lastLapTime) : '--:--:---'}
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
                    <div className="text-center py-12 text-gray-500">
                      <Timer className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                      <p>No timing data available</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-3">Pos</th>
                            <th className="text-left p-3">Driver</th>
                            <th className="text-left p-3">Team</th>
                            <th className="text-left p-3">Status</th>
                            <th className="text-left p-3">Gap</th>
                            <th className="text-left p-3">Last Lap</th>
                            <th className="text-left p-3">Tyres</th>
                          </tr>
                        </thead>
                        <tbody>
                          {raceEntries
                            .sort((a, b) => a.position - b.position)
                            .map(entry => (
                              <tr key={entry._id} className="border-b hover:bg-gray-50">
                                <td className="p-3 font-semibold">{entry.position}</td>
                                <td className="p-3">{entry.racer.name}</td>
                                <td className="p-3">{entry.racer.team?.name || 'No Team'}</td>
                                <td className="p-3">
                                  <span className={`px-2 py-1 rounded-full text-xs ${
                                    entry.status === 'active' ? 'bg-green-100 text-green-800' :
                                    entry.status === 'DNF' ? 'bg-red-100 text-red-800' :
                                    'bg-gray-100 text-gray-800'
                                  }`}>
                                    {entry.status?.toUpperCase()}
                                  </span>
                                </td>
                                <td className="p-3 font-mono">{formatGap(entry.gap)}</td>
                                <td className="p-3 font-mono">{entry.lastLapTime ? formatTime(entry.lastLapTime) : '--:--:---'}</td>
                                <td className="p-3">
                                  <div className="flex items-center space-x-2">
                                    <div className={`w-3 h-3 rounded-full ${getTyreColor(entry.tyreType || 'medium')}`}></div>
                                    <span className="capitalize">{entry.tyreType || 'medium'}</span>
                                  </div>
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
                  <h3 className="text-lg font-semibold mb-4">Race Events</h3>
                  {events.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <Flag className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                      <p>No race events recorded yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {events
                        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                        .map(event => (
                          <div key={event._id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                            <div className="text-xs text-gray-500 w-16">
                              {new Date(event.createdAt).toLocaleTimeString()}
                            </div>
                            <div className={`w-3 h-3 rounded-full ${
                              event.type === 'lap_completed' ? 'bg-blue-500' :
                              event.type === 'pit_stop' ? 'bg-orange-500' :
                              event.type === 'position_change' ? 'bg-green-500' :
                              'bg-red-500'
                            }`}></div>
                            <div className="flex-1 text-sm">
                              {event.type === 'lap_completed' && 
                                `Lap completed: ${formatTime(event.data.lapTime)}`}
                              {event.type === 'pit_stop' && 
                                `Pit stop: ${event.data.tyreType} tyres (${event.data.pitTime}s)`}
                              {event.type === 'position_change' && 
                                `Position change: P${event.data.oldPosition} → P${event.data.newPosition}`}
                              {event.type === 'dnf' && 'Retired from race'}
                              {!['lap_completed', 'pit_stop', 'position_change', 'dnf'].includes(event.type) &&
                                `${event.type}: ${JSON.stringify(event.data)}`}
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Panel */}
        <div className="col-span-4">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Race Actions</h3>
            
            {selectedRacer && getSelectedRacerEntry() ? (
              <div className="space-y-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="text-sm text-blue-600">Selected Driver</div>
                  <div className="font-semibold">
                    {getSelectedRacerEntry().racer.name}
                  </div>
                  <div className="text-sm text-gray-600">
                    Position: {getSelectedRacerEntry().position} | 
                    Status: {getSelectedRacerEntry().status?.toUpperCase()}
                  </div>
                </div>

                {getSelectedRacerEntry().status === 'active' && (
                  <div className="space-y-3">
                    <button 
                      onClick={() => {
                        const lapTime = prompt('Enter lap time (seconds):');
                        if (lapTime && !isNaN(parseFloat(lapTime))) {
                          handleLapTime(selectedRacer, parseFloat(lapTime));
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
                        const newPos = prompt('Enter new position:');
                        if (newPos && !isNaN(parseInt(newPos))) {
                          handlePositionChange(selectedRacer, parseInt(newPos));
                        }
                      }}
                      disabled={actionLoading}
                      className="w-full flex items-center justify-center space-x-2 bg-green-600 text-white p-3 rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                      <ArrowUp className="h-4 w-4" />
                      <span>Update Position</span>
                    </button>

                    <div className="grid grid-cols-3 gap-2">
                      {['soft', 'medium', 'hard'].map(tyre => (
                        <button
                          key={tyre}
                          onClick={() => {
                            const pitTime = prompt(`Enter pit time for ${tyre} tyres (seconds):`);
                            if (pitTime && !isNaN(parseFloat(pitTime))) {
                              handlePitStop(selectedRacer, tyre, parseFloat(pitTime));
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

                    <button 
                      onClick={() => {
                        if (confirm(`Mark ${getSelectedRacerEntry().racer.name} as DNF?`)) {
                          handleDNF(selectedRacer);
                        }
                      }}
                      disabled={actionLoading}
                      className="w-full flex items-center justify-center space-x-2 bg-red-600 text-white p-3 rounded-lg hover:bg-red-700 disabled:opacity-50"
                    >
                      <Ban className="h-4 w-4" />
                      <span>Mark DNF</span>
                    </button>
                  </div>
                )}
                
                {getSelectedRacerEntry().status !== 'active' && (
                  <div className="text-center text-gray-500 py-4">
                    <p>No actions available for {getSelectedRacerEntry().status} drivers</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <Car className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                <p>Select a driver to manage race actions</p>
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
            <h3 className="text-lg font-semibold mb-4">Race Statistics</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Laps</span>
                <span className="font-semibold">{race.totalLaps}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Current Lap</span>
                <span className="font-semibold">{race.currentLap || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Active Drivers</span>
                <span className="font-semibold">{raceEntries.filter(r => r.status === 'active').length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">DNF</span>
                <span className="font-semibold text-red-600">{raceEntries.filter(r => r.status === 'DNF').length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Progress</span>
                <span className="font-semibold">{Math.round(((race.currentLap || 0) / race.totalLaps) * 100)}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RaceControl;