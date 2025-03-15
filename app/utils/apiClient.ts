import axios from 'axios';
import Cookies from 'js-cookie';
import { BASE_URL, TIMEOUT_SEC } from '../constants/constants';

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: TIMEOUT_SEC * 1000,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: false
});

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

async function refreshAccessToken() {
  try {
    isRefreshing = true;
    const response = await axios.post(`${BASE_URL}/auth/refresh`, null, {
      withCredentials: true
    });

    const newAccessToken = response.data.accessToken;
    if (newAccessToken) {
      Cookies.set('accessToken', newAccessToken, {
        secure: true,
        sameSite: 'Strict'
      });

      refreshSubscribers.forEach(callback => callback(newAccessToken));
      refreshSubscribers = [];
    }

    return newAccessToken;
  } catch (error) {
    console.error('Token refresh failed:', error);
    return null;
  } finally {
    isRefreshing = false;
  }
}

apiClient.interceptors.request.use(config => {
  const accessToken = Cookies.get('accessToken');
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    if (!originalRequest._retry) {
      originalRequest._retry = false;
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(resolve => {
          refreshSubscribers.push(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(apiClient(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      const newToken = await refreshAccessToken();

      if (newToken) {
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
