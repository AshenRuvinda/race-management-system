import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

export const createRacer = async (racerData, token) => {
  const response = await axios.post(`${API_URL}/api/racers/create`, racerData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const getRacers = async (token) => {
  const response = await axios.get(`${API_URL}/api/racers`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const updateRacer = async (racerId, racerData, token) => {
  const response = await axios.put(`${API_URL}/api/racers/${racerId}`, racerData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};
