import axios from 'axios';
import { BASE_URL } from '../constants/constants';
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';

export function isTokenValid(token: string | null): boolean {
  if (!token) return false;

  try {
    const decoded: any = jwtDecode(token);
    console.log(decoded);
    return decoded.exp > Date.now() / 1000;
  } catch {
    return false;
  }
}

export async function refreshAccessToken() {
  try {
    const { data } = await axios.get(`${BASE_URL}/auth/refresh`, {
      withCredentials: true
    });

    return data.accessToken;
  } catch {
    logoutUser();
    return null;
  }
}

export function logoutUser() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('role');
  window.location.href = '/auth';
}
