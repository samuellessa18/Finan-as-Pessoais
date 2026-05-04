import axios from 'axios';
import axiosRetry from 'axios-retry';

export const envUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const apiBaseURL = envUrl.endsWith('/api/v1') ? envUrl : `${envUrl}/api/v1`;

export const api = axios.create({
  baseURL: apiBaseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 🔄 RESILIÊNCIA: Retry automático para erros de rede ou 5xx
axiosRetry(api, {
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) => {
    return axiosRetry.isNetworkOrIdempotentRequestError(error) || error.response?.status === 500;
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.message === 'Network Error') {
      console.error('🚨 ERRO DE REDE: Tentativas esgotadas.');
    }
    return Promise.reject(error);
  }
);
