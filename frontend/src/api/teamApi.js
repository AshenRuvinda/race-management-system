import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

export const createTeam = async (teamData, token) => {
  const response = await axios.post(`${API_URL}/api/teams/create`, teamData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const getTeams = async (token) => {
  const response = await axios.get(`${API_URL}/api/teams`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const updateTeam = async (teamId, teamData, token) => {
  const response = await axios.put(`${API_URL}/api/teams/${teamId}`, teamData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};
