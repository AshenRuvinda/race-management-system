import React, { useState, useEffect, useCallback } from 'react';
import { 
  Trophy, Users, Clock, MapPin, Flag, AlertTriangle, 
  Play, Square, Settings, Timer, Car, Zap, Target,
  ArrowUp, ArrowDown, RotateCcw, Ban, CheckCircle
} from 'lucide-react';

const RaceControl = ({ raceId = "sample_race_id" }) => {
  const [race, setRace] = useState(null);
  const [raceEntries, setRaceEntries] = useState([]);
  const [events, setEvents] = useState([]);
  const [lapTimes, setLapTimes] = useState({});
  const [pitStops, setPitStops] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedRacer, setSelectedRacer] = useState(null);
  const [activeTab, setActiveTab] = useState('positions');

  // Mock data for demonstration
  const mockRace = {
    _id: raceId,
    venue: "Monaco Grand Prix",
    totalLaps: 78,
    status: "ongoing",
    currentLap: 45
  };

  const mockRaceEntries = [
    {
      _id: "entry1",
      position: 1,
      racer: { 
        _id: "racer1", 
        name: "Lewis Hamilton", 
        racingNumber: 44,
        team: { name: "Mercedes", country: "Germany" }
      },
      tyreType: "medium",
      status: "active",
      lapsBehind: 0,
      gap: "0.000",
      lastLapTime: 78.234
    },
    {
      _id: "entry2", 
      position: 2,
      racer: { 
        _id: "racer2", 
        name: "Max Verstappen", 
        racingNumber: 1,
        team: { name: "Red Bull Racing", country: "Austria" }
      },
      tyreType: "hard",
      status: "active", 
      lapsBehind: 0,
      gap: "+2.456",
      lastLapTime: 78.891
    },
    {
      _id: "entry3",
      position: 3, 
      racer: { 
        _id: "racer3", 
        name: "Charles Leclerc", 
        racingNumber: 16,
        team: { name: "Ferrari", country: "Italy" }
      },
      tyreType: "soft",
      status: "active",
      lapsBehind: 0, 
      gap: "+5.234",
      lastLapTime: 79.123
    },
    {
      _id: "entry4",
      position: 4,
      racer: { 
        _id: "racer4", 
        name: "Lando Norris", 
        racingNumber: 4,
        team: { name: "McLaren", country: "UK" }
      },
      tyreType: "medium",
      status: "DNF",
      lapsBehind: 2,
      gap: "+2 LAPS",
      lastLapTime: null
    }
  ];

  const mockEvents = [
    {
      _id: "event1",
      type: "lap_completed",
      data: { racerId: "racer1", lapTime: 78.234 },
      createdAt: new Date(Date.now() - 30000).toISOString()
    },
    {
      _id: "event2", 
      type: "position_change",
      data: { racerId: "racer2", oldPosition: 1, newPosition: 2 },
      createdAt: new Date(Date.now() - 60000).toISOString()
    },
    {
      _id: "event3",
      type: "pit_stop", 
      data: { racerId: "racer3", tyreType: "soft", pitTime: 3.2 },
      createdAt: new Date(Date.now() - 120000).toISOString()
    }
  ];

  // Initialize with mock data
  useEffect(() => {
    setRace(mockRace);
    setRaceEntries(mockRaceEntries);
    setEvents(mockEvents);
    setLoading(false);
  }, []);

  // Action handlers
  const handlePositionChange = useCallback((racerId, newPosition) => {
    setRaceEntries(prev => {
      const updated = [...prev];
      const racer = updated.find(r => r.racer._id === racerId);
      if (racer) {
        const oldPosition = racer.position;
        racer.position = newPosition;
        
        // Add event
        const newEvent = {
          _id: Date.now(),
          type: "position_change",
          data: { racerId, oldPosition, newPosition },
          createdAt: new Date().toISOString()
        };
        setEvents(prev => [newEvent, ...prev]);
      }
      return updated.sort((a, b) => a.position - b.position);
    });
  }, []);

  const handleLapTime = useCallback((racerId, lapTime) => {
    const newEvent = {
      _id: Date.now(),
      type: "lap_completed", 
      data: { racerId, lapTime },
      createdAt: new Date().toISOString()
    };
    setEvents(prev => [newEvent, ...prev]);
    
    setRaceEntries(prev => prev.map(entry => 
      entry.racer._id === racerId 
        ? { ...entry, lastLapTime: lapTime }
        : entry
    ));
  }, []);

  const handlePitStop = useCallback((racerId, tyreType, pitTime) => {
    const newEvent = {
      _id: Date.now(),
      type: "pit_stop",
      data: { racerId, tyreType, pitTime },
      createdAt: new Date().toISOString()
    };
    setEvents(prev => [newEvent, ...prev]);
    
    setRaceEntries(prev => prev.map(entry =>
      entry.racer._id === racerId
        ? { ...entry, tyreType }
        : entry
    ));
  }, []);

  const handleDNF = useCallback((racerId) => {
    const newEvent = {
      _id: Date.now(), 
      type: "dnf",
      data: { racerId },
      createdAt: new Date().toISOString()
    };
    setEvents(prev => [newEvent, ...prev]);
    
    setRaceEntries(prev => prev.map(entry =>
      entry.racer._id === racerId
        ? { ...entry, status: "DNF" }
        : entry
    ));
  }, []);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
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
              <h1 className="text-3xl font-bold text-gray-900">{race?.venue}</h1>
              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                <div className="flex items-center">
                  <Flag className="h-4 w-4 mr-1" />
                  Lap {race?.currentLap} / {race?.totalLaps}
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
              race?.status === 'ongoing' ? 'bg-green-100 text-green-800' :
              race?.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {race?.status?.toUpperCase()}
            </div>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center">
              <Settings className="h-4 w-4 mr-2" />
              Settings
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
                    <button className="text-sm text-blue-600 hover:text-blue-800">
                      Auto-refresh: ON
                    </button>
                  </div>
                  
                  {raceEntries.map((entry, index) => (
                    <div
                      key={entry._id}
                      className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
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
                            <div className="text-sm text-gray-600">{entry.racer.team?.name}</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <div className={`w-4 h-4 rounded-full ${getTyreColor(entry.tyreType)}`}></div>
                          <span className="text-sm capitalize">{entry.tyreType}</span>
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
                  ))}
                </div>
              )}

              {activeTab === 'timing' && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Timing & Scoring</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-3">Pos</th>
                          <th className="text-left p-3">Driver</th>
                          <th className="text-left p-3">Team</th>
                          <th className="text-left p-3">Laps</th>
                          <th className="text-left p-3">Gap</th>
                          <th className="text-left p-3">Last Lap</th>
                          <th className="text-left p-3">Best Lap</th>
                          <th className="text-left p-3">Tyres</th>
                        </tr>
                      </thead>
                      <tbody>
                        {raceEntries.map(entry => (
                          <tr key={entry._id} className="border-b hover:bg-gray-50">
                            <td className="p-3 font-semibold">{entry.position}</td>
                            <td className="p-3">{entry.racer.name}</td>
                            <td className="p-3">{entry.racer.team?.name}</td>
                            <td className="p-3">{race?.currentLap - (entry.lapsBehind || 0)}</td>
                            <td className="p-3 font-mono">{formatGap(entry.gap)}</td>
                            <td className="p-3 font-mono">{entry.lastLapTime ? formatTime(entry.lastLapTime) : '--:--:---'}</td>
                            <td className="p-3 font-mono">1:16.234</td>
                            <td className="p-3">
                              <div className="flex items-center space-x-2">
                                <div className={`w-3 h-3 rounded-full ${getTyreColor(entry.tyreType)}`}></div>
                                <span className="capitalize">{entry.tyreType}</span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'events' && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Race Events</h3>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {events.map(event => (
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
                        </div>
                      </div>
                    ))}
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
                </div>

                <div className="space-y-3">
                  <button 
                    onClick={() => {
                      const lapTime = prompt('Enter lap time (seconds):');
                      if (lapTime) handleLapTime(selectedRacer, parseFloat(lapTime));
                    }}
                    className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700"
                  >
                    <Timer className="h-4 w-4" />
                    <span>Record Lap Time</span>
                  </button>

                  <button 
                    onClick={() => {
                      const newPos = prompt('Enter new position:');
                      if (newPos) handlePositionChange(selectedRacer, parseInt(newPos));
                    }}
                    className="w-full flex items-center justify-center space-x-2 bg-green-600 text-white p-3 rounded-lg hover:bg-green-700"
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
                          if (pitTime) handlePitStop(selectedRacer, tyre, parseFloat(pitTime));
                        }}
                        className={`flex items-center justify-center space-x-1 p-2 rounded text-white text-sm ${
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
                      if (confirm('Mark this driver as DNF?')) {
                        handleDNF(selectedRacer);
                      }
                    }}
                    className="w-full flex items-center justify-center space-x-2 bg-red-600 text-white p-3 rounded-lg hover:bg-red-700"
                  >
                    <Ban className="h-4 w-4" />
                    <span>Mark DNF</span>
                  </button>
                </div>
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
                <span className="font-semibold">{race?.totalLaps}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Current Lap</span>
                <span className="font-semibold">{race?.currentLap}</span>
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
                <span className="font-semibold">{Math.round((race?.currentLap / race?.totalLaps) * 100)}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RaceControl;