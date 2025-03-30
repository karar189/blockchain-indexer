import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

interface Credentials {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  fullName: string;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
}

const api = axios.create({
  baseURL: 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: unknown) => Promise.reject(error)
);

export const login = async (credentials: Credentials) => {
  try {
    const response = await api.post('/auth/login', credentials);
    return response;
  } catch (error) {
    console.log('Login error details:', error);
    throw error;
  }
};

export const register = async (data: RegisterData) => {
  try {
    const response = await api.post('/auth/register', data);
    // If the registration is successful, store the token automatically
    if (response.data && response.data.accessToken) {
      localStorage.setItem('token', response.data.accessToken);
    }
    return response;
  } catch (error) {
    console.log('Registration error details:', error);
    throw error;
  }
};

export const getProfile = async () => {
  try {
    return await api.get<User>('/auth/profile');
  } catch (error: unknown) {
    console.log('Get profile error details:', error);
    if (error instanceof AxiosError && error.response) {
      throw error;
    }
    return { data: null as unknown as User };
  }
};

export const logout = () => {
  localStorage.removeItem('token');
};

export default api;