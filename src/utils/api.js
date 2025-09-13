import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to ${config.url}`);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const fetchData = (filters = {}) => {
  const params = Object.entries(filters)
    .filter(([key, value]) => value && value.toString().trim())
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
  
  return api.get('/data', { params });
};

export const fetchFilters = () => api.get('/filters');

export const fetchStats = () => api.get('/stats');

export default api;