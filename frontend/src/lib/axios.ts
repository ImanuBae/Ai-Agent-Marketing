import axios from 'axios';

const rawBaseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const apiBaseURL = rawBaseURL.endsWith('/') ? rawBaseURL : `${rawBaseURL}/`;

const api = axios.create({
  baseURL: apiBaseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to add the auth token to every request
api.interceptors.request.use(
  (config) => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (token && config.headers) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    } catch (e) {
      console.error("Interceptor error", e);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
