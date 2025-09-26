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

export const createTeam = async (teamData) => {
  try {
    const response = await api.post('/api/teams/create', teamData);
    return response.data;
  } catch (error) {
    console.error('Create team error:', error);
    throw error.response?.data || { msg: 'Failed to create team' };
  }
};

export const getTeams = async () => {
  try {
    const response = await api.get('/api/teams');
    return response.data;
  } catch (error) {
    console.error('Get teams error:', error);
    throw error.response?.data || { msg: 'Failed to fetch teams' };
  }
};

export const updateTeam = async (teamId, teamData) => {
  try {
    const response = await api.put(`/api/teams/${teamId}`, teamData);
    return response.data;
  } catch (error) {
    console.error('Update team error:', error);
    throw error.response?.data || { msg: 'Failed to update team' };
  }
};