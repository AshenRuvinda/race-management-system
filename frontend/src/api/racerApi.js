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

export const createRacer = async (racerData) => {
  try {
    const response = await api.post('/api/racers/create', racerData);
    return response.data;
  } catch (error) {
    console.error('Create racer error:', error);
    throw error.response?.data || { msg: 'Failed to create racer' };
  }
};

export const getRacers = async () => {
  try {
    const response = await api.get('/api/racers');
    return response.data;
  } catch (error) {
    console.error('Get racers error:', error);
    throw error.response?.data || { msg: 'Failed to fetch racers' };
  }
};

export const updateRacer = async (racerId, racerData) => {
  try {
    const response = await api.put(`/api/racers/${racerId}`, racerData);
    return response.data;
  } catch (error) {
    console.error('Update racer error:', error);
    throw error.response?.data || { msg: 'Failed to update racer' };
  }
};