import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// Create axios instance with default config
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

export const createAudit = async (auditData) => {
  try {
    const response = await api.post('/audits/create/', auditData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to create audit');
  }
};

export const getAudits = async () => {
  try {
    const response = await api.get('/audits/list/');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch audits');
  }
};

export const getAudit = async (id) => {
  try {
    const response = await api.get(`/audits/list/${id}/`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch audit');
  }
};

export const updateAudit = async (id, auditData) => {
  try {
    const response = await api.put(`/audits/list/${id}/`, auditData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update audit');
  }
};

export const deleteAudit = async (id) => {
  try {
    await api.delete(`/audits/list/${id}/`);
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to delete audit');
  }
}; 