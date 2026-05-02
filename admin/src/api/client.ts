import axios from 'axios';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || '/api',
});

let getToken: (() => string | null) | null = null;
let onUnauthorized: (() => void) | null = null;

export function configureApiClient(options: {
  getToken: () => string | null;
  onUnauthorized: () => void;
}) {
  getToken = options.getToken;
  onUnauthorized = options.onUnauthorized;
}

client.interceptors.request.use((config) => {
  const token = getToken?.();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      onUnauthorized?.();
    }
    return Promise.reject(error);
  },
);

export default client;
