import axios from 'axios';
import API_BASE_URL from '../apiConfigure';
import { useAuth } from '../context/AuthContext';

// Usage: const authAxios = useAuthAxios();
export function useAuthAxios() {
  const { token } = useAuth();

  const instance = axios.create({
    baseURL: API_BASE_URL,
    headers: token
      ? { Authorization: `Bearer ${token}` }
      : {},
  });

  return instance;
}