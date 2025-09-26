import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Create axios instance with default config
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

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('userId');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const createRace = async (raceData) => {
  try {
    const response = await api.post('/api/races/create', raceData);
    return response.data;
  } catch (error) {
    console.error('Create race error:', error);
    throw error.response?.data || { msg: 'Failed to create race' };
  }
};

export const getRaces = async () => {
  try {
    const response = await api.get('/api/races');
    return response.data;
  } catch (error) {
    console.error('Get races error:', error);
    throw error.response?.data || { msg: 'Failed to fetch races' };
  }
};

export const getRaceById = async (raceId) => {
  try {
    const response = await api.get(`/api/races/${raceId}`);
    return response.data;
  } catch (error) {
    console.error('Get race by ID error:', error);
    throw error.response?.data || { msg: 'Failed to fetch race' };
  }
};

export const getRaceEntries = async (raceId) => {
  try {
    const response = await api.get(`/api/races/${raceId}/entries`);
    return response.data;
  } catch (error) {
    console.error('Get race entries error:', error);
    throw error.response?.data || { msg: 'Failed to fetch race entries' };
  }
};

export const getEvents = async (raceId) => {
  try {
    const response = await api.get(`/api/events/${raceId}`);
    return response.data;
  } catch (error) {
    console.error('Get events error:', error);
    throw error.response?.data || { msg: 'Failed to fetch events' };
  }
};

export const updatePosition = async (raceId, racerId, newPosition) => {
  try {
    const response = await api.post('/api/races/position', {
      raceId,
      racerId,
      newPosition
    });
    return response.data;
  } catch (error) {
    console.error('Update position error:', error);
    throw error.response?.data || { msg: 'Failed to update position' };
  }
};

export const markLap = async (raceId, racerId, lapTime) => {
  try {
    const response = await api.post('/api/races/lap', {
      raceId,
      racerId,
      lapTime
    });
    return response.data;
  } catch (error) {
    console.error('Mark lap error:', error);
    throw error.response?.data || { msg: 'Failed to mark lap' };
  }
};

export const markPitStop = async (raceId, racerId, tyreType, pitTime) => {
  try {
    const response = await api.post('/api/races/pitstop', {
      raceId,
      racerId,
      tyreType,
      pitTime
    });
    return response.data;
  } catch (error) {
    console.error('Mark pit stop error:', error);
    throw error.response?.data || { msg: 'Failed to mark pit stop' };
  }
};

export const markDNF = async (raceId, racerId) => {
  try {
    const response = await api.post('/api/races/dnf', {
      raceId,
      racerId
    });
    return response.data;
  } catch (error) {
    console.error('Mark DNF error:', error);
    throw error.response?.data || { msg: 'Failed to mark DNF' };
  }
};

export const finalizeRace = async (raceId) => {
  try {
    const response = await api.post('/api/races/finalize', { raceId });
    return response.data;
  } catch (error) {
    console.error('Finalize race error:', error);
    throw error.response?.data || { msg: 'Failed to finalize race' };
  }
};