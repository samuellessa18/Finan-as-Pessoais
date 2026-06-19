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

// 🔄 RESILIÊNCIA: Retry automático para erros de rede ou 5xx.
// [FASE 4.6A-bis] Política POR MÉTODO: só métodos HTTP SEGUROS (GET/HEAD/OPTIONS)
// podem repetir. POST/PATCH/PUT/DELETE NUNCA repetem — um retry em nível de rede
// após o servidor já ter processado a requisição duplicaria efeitos colaterais
// (transação, parcelas, Insight, meta, quota e custo LLM futuro). Novos endpoints
// mutantes ficam protegidos automaticamente (sem allowlist a manter).
const SAFE_RETRY_METHODS = ['get', 'head', 'options'];
axiosRetry(api, {
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) => {
    const method = (error.config?.method ?? '').toLowerCase();
    if (!SAFE_RETRY_METHODS.includes(method)) return false; // não repetir métodos mutantes
    return axiosRetry.isNetworkOrIdempotentRequestError(error) || error.response?.status === 500;
  },
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
