import axios from 'axios';

export const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api`,
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
      console.error('🚨 ERRO DE REDE: O Frontend não conseguiu alcançar o Backend.');
      console.error('Verifique: 1. VITE_API_URL no Vercel | 2. CORS no Render | 3. Se o Backend está online.');
    }
    return Promise.reject(error);
  }
);
