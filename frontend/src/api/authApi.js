import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const register = async (username, password, role) => {
  try {
    const response = await axios.post(`${API_URL}/api/auth/register`, { 
      username, 
      password, 
      role 
    });
    return response.data;
  } catch (error) {
    console.error('Registration error:', error.response?.data || error.message);
    throw error.response?.data || { msg: 'Registration failed' };
  }
};

export const login = async (username, password) => {
  try {
    const response = await axios.post(`${API_URL}/api/auth/login`, { 
      username, 
      password 
    });
    return response.data;
  } catch (error) {
    console.error('Login error:', error.response?.data || error.message);
    throw error.response?.data || { msg: 'Login failed' };
  }
};