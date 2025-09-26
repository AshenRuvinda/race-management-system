import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MapPin, Users, Flag, Settings, Plus, X, 
  AlertTriangle, CheckCircle, Clock, Car, Zap
} from 'lucide-react';
import { createRace } from '../../api/raceApi'; // Adjust path based on your folder structure
import axios from 'axios';

// You'll need to add this function to your API service file
const getRacers = async () => {
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  const api = axios.create({
    baseURL: API_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Add request interceptor to include token
  api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  const response = await api.get('/api/racers');
  return response.data;
};

const RaceCreate = () => {
  const [formData, setFormData] = useState({
    venue: '',
    totalLaps: '',
    defaultTyreType: 'medium',
    startingGrid: []
  });
  
  const [availableRacers, setAvailableRacers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingRacers, setFetchingRacers] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showRacerSelector, setShowRacerSelector] = useState(false);

  // React Router navigation hook
  const navigate = useNavigate();

  // Improved fetch function using axios
  const fetchRacers = async () => {
    try {
      console.log('Fetching racers...');
      const token = localStorage.getItem('token');
      console.log('Token exists:', !!token);
      
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }
      
      const racers = await getRacers();
      
      console.log('Response data:', racers);
      
      if (!Array.isArray(racers)) {
        console.error('Invalid racers data format:', racers);
        throw new Error('Invalid data format received from server. Expected an array of racers.');
      }
      
      setAvailableRacers(racers);
      
      if (racers.length === 0) {
        setError('No racers available. Please create some racers first before creating a race.');
      }
      
    } catch (err) {
      console.error('Error fetching racers:', err);
      
      if (axios.isAxiosError(err)) {
        if (err.response) {
          // Server responded with error status
          const status = err.response.status;
          const errorData = err.response.data;
          
          if (status === 401) {
            setError('Authentication failed. Please log in again.');
          } else if (status === 403) {
            setError('Access denied. You need proper permissions to view racers.');
          } else if (status === 404) {
            setError('Racers endpoint not found. Please check your API configuration.');
          } else if (status >= 500) {
            setError('Server error. Please try again later or contact support.');
          } else {
            setError(errorData?.msg || errorData?.message || errorData?.error || `Request failed with status ${status}`);
          }
        } else if (err.request) {
          // Request was made but no response received
          setError('Network error: Cannot connect to server. Please check your internet connection and that the API server is running.');
        } else {
          // Something else happened
          setError(`Request setup error: ${err.message}`);
        }
      } else {
        setError(err.message || 'Failed to load available racers. Please refresh the page and try again.');
      }
    } finally {
      setFetchingRacers(false);
    }
  };

  // Fetch available racers on component mount
  useEffect(() => {
    fetchRacers();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear any existing error when user starts typing
    if (error) setError('');
  };

  const addRacerToGrid = (racer) => {
    if (formData.startingGrid.find(r => r._id === racer._id)) {
      return; // Racer already in grid
    }
    
    setFormData(prev => ({
      ...prev,
      startingGrid: [...prev.startingGrid, racer]
    }));
  };

  const removeRacerFromGrid = (racerId) => {
    setFormData(prev => ({
      ...prev,
      startingGrid: prev.startingGrid.filter(r => r._id !== racerId)
    }));
  };

  const moveRacerPosition = (racerId, direction) => {
    const currentIndex = formData.startingGrid.findIndex(r => r._id === racerId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= formData.startingGrid.length) return;

    const newGrid = [...formData.startingGrid];
    [newGrid[currentIndex], newGrid[newIndex]] = [newGrid[newIndex], newGrid[currentIndex]];
    
    setFormData(prev => ({
      ...prev,
      startingGrid: newGrid
    }));
  };

  const validateForm = () => {
    if (!formData.venue.trim()) {
      throw new Error('Race venue is required');
    }
    
    if (!formData.totalLaps || parseInt(formData.totalLaps) < 1) {
      throw new Error('Total laps must be at least 1');
    }
    
    if (parseInt(formData.totalLaps) > 200) {
      throw new Error('Total laps cannot exceed 200');
    }
    
    if (formData.startingGrid.length < 2) {
      throw new Error('At least 2 racers are required for a race');
    }
    
    if (formData.startingGrid.length > 30) {
      throw new Error('Maximum 30 racers allowed per race');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      // Validate data
      validateForm();
      
      // Prepare submission data
      const submitData = {
        venue: formData.venue.trim(),
        totalLaps: parseInt(formData.totalLaps),
        defaultTyreType: formData.defaultTyreType,
        startingGrid: formData.startingGrid.map(racer => racer._id)
      };
      
      console.log('Submitting race data:', submitData);
      
      // Use the API service function
      const result = await createRace(submitData);
      
      console.log('Race created successfully:', result);
      setSuccess('Race created successfully! Redirecting to Race Control...');
      
      // Navigate to race control page after a brief delay
      // The race ID should be in result.race._id or result._id depending on your API response
      const raceId = result.race?._id || result._id || result.id;
      
      console.log('Extracted race ID for navigation:', raceId);
      console.log('Full result object:', result);
      
      if (!raceId) {
        console.error('No race ID found in response:', result);
        setError('Race created but navigation failed: No race ID returned from server');
        return;
      }
      
      setTimeout(() => {
        console.log('Attempting navigation to:', `/admin/race-control/${raceId}`);
        try {
          navigate(`/admin/race-control/${raceId}`);
          console.log('Navigation call completed');
        } catch (navError) {
          console.error('Navigation error:', navError);
          setError('Race created successfully, but navigation failed. Please manually navigate to race control.');
        }
      }, 2000);
      
    } catch (err) {
      console.error('Error creating race:', err);
      
      // Handle different error formats
      let errorMessage = 'An unexpected error occurred while creating the race';
      
      if (axios.isAxiosError(err)) {
        if (err.response?.data) {
          errorMessage = err.response.data.msg || err.response.data.message || err.response.data.error || errorMessage;
        } else if (err.request) {
          errorMessage = 'Network error: Cannot connect to server. Please check your connection.';
        } else {
          errorMessage = `Request error: ${err.message}`;
        }
      } else if (err.msg || err.message) {
        errorMessage = err.msg || err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const filteredRacers = availableRacers.filter(racer =>
    racer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    racer.team?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    racer.racingNumber.toString().includes(searchTerm)
  );

  const getTyreColor = (tyreType) => {
    switch (tyreType) {
      case 'soft': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'hard': return 'bg-gray-500';
      default: return 'bg-gray-300';
    }
  };

  const handleRetry = () => {
    setError('');
    setFetchingRacers(true);
    fetchRacers();
  };

  const handleDebug = () => {
    console.log('=== DEBUG INFO ===');
    console.log('- Token:', localStorage.getItem('token') ? 'Present' : 'Missing');
    console.log('- Available racers:', availableRacers.length);
    console.log('- Error:', error);
    console.log('- Fetching state:', fetchingRacers);
    console.log('- Current URL:', window.location.href);
    console.log('- API Base URL:', process.env.REACT_APP_API_URL || 'http://localhost:5000');
    console.log('- Full racers endpoint:', `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/racers`);
    console.log('- Full create race endpoint:', `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/races/create`);
    
    // Test if we can reach the server at all
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    const testApi = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add token for test requests
    const token = localStorage.getItem('token');
    if (token) {
      testApi.defaults.headers.Authorization = `Bearer ${token}`;
    }

    testApi.get('/api/health').then(response => {
      console.log('- Health check status:', response.status);
      console.log('- Health check data:', response.data);
    }).catch(err => {
      console.log('- Health check failed:', err.message);
      if (axios.isAxiosError(err) && err.response) {
        console.log('- Health check error response:', err.response.status, err.response.data);
      }
    });
    
    // Test racers endpoint specifically
    testApi.get('/api/racers').then(response => {
      console.log('- Direct racers test status:', response.status);
      console.log('- Direct racers test data length:', response.data?.length);
    }).catch(err => {
      console.log('- Direct racers test failed:', err.message);
      if (axios.isAxiosError(err) && err.response) {
        console.log('- Direct racers test error response:', err.response.status, err.response.data);
      }
    });
    
    alert('Debug info logged to console. Press F12 to view detailed information including API endpoint tests.');
  };

  if (fetchingRacers) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <span className="mt-4 block text-gray-600">Loading racers...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Flag className="h-8 w-8 text-blue-500" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Create New Race</h1>
                <p className="text-gray-600 mt-1">Set up a new racing event with participants</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </button>
          </div>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <span>{error}</span>
                <div className="mt-3 flex space-x-2">
                  <button
                    onClick={handleRetry}
                    className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                  >
                    Retry
                  </button>
                  <button
                    onClick={handleDebug}
                    className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700"
                  >
                    Debug Info
                  </button>
                </div>
              </div>
              <button 
                onClick={() => setError('')}
                className="ml-2 text-red-500 hover:text-red-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-6 flex items-center">
            <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <div className="space-y-6">
          {/* Race Details */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              Race Details
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Race Venue *
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    name="venue"
                    value={formData.venue}
                    onChange={handleInputChange}
                    placeholder="e.g., Monaco Grand Prix Circuit"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Laps *
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="number"
                    name="totalLaps"
                    value={formData.totalLaps}
                    onChange={handleInputChange}
                    placeholder="e.g., 50"
                    min="1"
                    max="200"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Default Tyre Compound
                </label>
                <div className="relative">
                  <Zap className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <select
                    name="defaultTyreType"
                    value={formData.defaultTyreType}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                  >
                    <option value="soft">Soft (Red) - Fast, Low Durability</option>
                    <option value="medium">Medium (Yellow) - Balanced</option>
                    <option value="hard">Hard (White) - Slow, High Durability</option>
                  </select>
                </div>
                <div className="mt-2 flex items-center space-x-4">
                  {['soft', 'medium', 'hard'].map(tyre => (
                    <div key={tyre} className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${getTyreColor(tyre)}`}></div>
                      <span className="text-sm capitalize text-gray-600">{tyre}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Starting Grid */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Starting Grid ({formData.startingGrid.length} racers)
              </h2>
              <button
                type="button"
                onClick={() => setShowRacerSelector(!showRacerSelector)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Racers
              </button>
            </div>

            {/* Racer Selector */}
            {showRacerSelector && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Search racers by name, team, or number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                {filteredRacers.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Car className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                    <p>{searchTerm ? 'No racers found matching your search' : 'No racers available'}</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto">
                    {filteredRacers.map(racer => {
                      const isSelected = formData.startingGrid.find(r => r._id === racer._id);
                      return (
                        <button
                          key={racer._id}
                          type="button"
                          onClick={() => addRacerToGrid(racer)}
                          disabled={isSelected}
                          className={`flex items-center space-x-3 p-3 rounded-lg border-2 text-left transition-all ${
                            isSelected 
                              ? 'border-green-300 bg-green-50 text-green-700 cursor-not-allowed' 
                              : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                          }`}
                        >
                          <span className="bg-gray-800 text-white px-2 py-1 rounded text-sm font-mono">
                            {racer.racingNumber}
                          </span>
                          <div>
                            <div className="font-semibold">{racer.name}</div>
                            <div className="text-sm text-gray-600">{racer.team?.name || 'No Team'}</div>
                          </div>
                          {isSelected && (
                            <CheckCircle className="h-5 w-5 text-green-500 ml-auto" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Current Starting Grid */}
            {formData.startingGrid.length === 0 ? (
              <div className="text-center py-12 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                <Users className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                <p className="text-lg font-medium">No racers selected</p>
                <p className="text-sm">Add at least 2 racers to create a race</p>
              </div>
            ) : (
              <div className="space-y-3">
                {formData.startingGrid.map((racer, index) => (
                  <div
                    key={racer._id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                        index === 0 ? 'bg-yellow-500' :
                        index === 1 ? 'bg-gray-400' :
                        index === 2 ? 'bg-amber-600' :
                        'bg-gray-600'
                      }`}>
                        {index + 1}
                      </div>
                      
                      <span className="bg-gray-800 text-white px-2 py-1 rounded text-sm font-mono">
                        {racer.racingNumber}
                      </span>
                      
                      <div>
                        <div className="font-semibold">{racer.name}</div>
                        <div className="text-sm text-gray-600">{racer.team?.name || 'No Team'}</div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => moveRacerPosition(racer._id, 'up')}
                        disabled={index === 0}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Move up"
                      >
                        ▲
                      </button>
                      <button
                        type="button"
                        onClick={() => moveRacerPosition(racer._id, 'down')}
                        disabled={index === formData.startingGrid.length - 1}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Move down"
                      >
                        ▼
                      </button>
                      <button
                        type="button"
                        onClick={() => removeRacerFromGrid(racer._id)}
                        className="p-1 text-red-400 hover:text-red-600"
                        title="Remove from grid"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {formData.startingGrid.length < 2 && (
                  <p className="flex items-center text-amber-600">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    At least 2 racers required to create a race
                  </p>
                )}
                {formData.startingGrid.length >= 2 && (
                  <p className="flex items-center text-green-600">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Ready to create race with {formData.startingGrid.length} racers
                  </p>
                )}
              </div>
              
              <div className="flex space-x-3">
                {/* Test Navigation Button */}
                <button
                  type="button"
                  onClick={() => {
                    console.log('Testing navigation...');
                    try {
                      navigate('/admin/race-control/test-id');
                      console.log('Test navigation completed');
                    } catch (error) {
                      console.error('Test navigation failed:', error);
                      alert('Navigation test failed - check console');
                    }
                  }}
                  className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 flex items-center text-sm"
                >
                  Test Nav
                </button>
                
                <button
                  type="button"
                  onClick={() => navigate('/admin/dashboard')}
                  className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 flex items-center"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading || formData.startingGrid.length < 2}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating Race...
                    </>
                  ) : (
                    <>
                      <Flag className="h-4 w-4 mr-2" />
                      Create Race
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RaceCreate;