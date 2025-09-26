import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

export const createRace = async (raceData, token) => {
  const response = await axios.post(`${API_URL}/api/races/create`, raceData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const getRaceEntries = async (raceId) => {
  const response = await axios.get(`${API_URL}/api/races/${raceId}/entries`);
  return response.data;
};

export const getEvents = async (raceId) => {
  const response = await axios.get(`${API_URL}/api/events/${raceId}`);
  return response.data;
};
