import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const login = async (credentials) => {
  try {
    const response = await api.post('/users/login/', credentials);
    const { access } = response.data;
    localStorage.setItem('token', access);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Login failed');
  }
};

export const register = async (userData) => {
  try {
    const response = await api.post('/users/register/', userData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Registration failed');
  }
};

export const logout = () => {
  localStorage.removeItem('token');
};

export const getCurrentUser = async () => {
  try {
    const response = await api.get('/users/me/');  // Updated endpoint
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Failed to get user profile');
  }
}; 