// src/features/auth/services/authService.ts
import axios, { AxiosError } from 'axios';
import { 
  LoginCredentials, 
  RegisterData, 
  AuthResponse,
  OTPRequest,
  OTPVerification,
  User
} from '../types/authTypes';

const API_BASE_URL = 'http://localhost:8081/api/auth';
const USER_BASE_URL = 'http://localhost:8081/api/users';

// Add axios instance with default config
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      console.log('Attempting login with:', credentials.email);
      const response = await axiosInstance.post('/login', credentials);
      console.log('Login response:', response.data);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        console.error('Login error details:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        });
        const message = error.response?.data?.message || 'Login failed';
        throw new Error(message);
      }
      throw new Error('Login failed');
    }
  },

  async register(userData: RegisterData): Promise<AuthResponse> {
    try {
      const formData = new FormData();
      formData.append('name', userData.name);
      formData.append('email', userData.email);
      formData.append('password', userData.password);
      
      // If profilePicture is a base64 string, convert it to a file
      if (userData.profilePicture) {
        const base64Data = userData.profilePicture.split(',')[1];
        const byteCharacters = atob(base64Data);
        const byteArrays = [];
        
        for (let offset = 0; offset < byteCharacters.length; offset += 1024) {
          const slice = byteCharacters.slice(offset, offset + 1024);
          const byteNumbers = new Array(slice.length);
          
          for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
          }
          
          const byteArray = new Uint8Array(byteNumbers);
          byteArrays.push(byteArray);
        }
        
        const blob = new Blob(byteArrays, { type: 'image/jpeg' });
        const file = new File([blob], 'profile-picture.jpg', { type: 'image/jpeg' });
        formData.append('profilePicture', file);
      }

      const response = await axios.post(`${API_BASE_URL}/register`, formData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        const message = error.response?.data?.message || 'Registration failed';
        console.error('Registration error:', message);
        throw new Error(message);
      }
      throw new Error('Registration failed');
    }
  },

  async fetchCurrentUser(): Promise<User> {
    try {
      console.log('Fetching current user...');
      const response = await axiosInstance.get(`${USER_BASE_URL}/current-user`);
      console.log('Current user response:', response.data);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        console.error('Fetch current user error details:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        });
        const message = error.response?.data?.message || 'Failed to fetch current user';
        throw new Error(message);
      }
      throw new Error('Failed to fetch current user');
    }
  },

  async logout(): Promise<void> {
    try {
      await axios.post(`${API_BASE_URL}/logout`, {}, {
        withCredentials: true,
      });
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        const message = error.response?.data?.message || 'Logout failed';
        console.error('Logout error:', message);
        throw new Error(message);
      }
      throw new Error('Logout failed');
    }
  },

  async sendOTP(email: OTPRequest): Promise<void> {
    try {
      await axios.post(`${API_BASE_URL}/forgot-password/send-otp`, email, {
        withCredentials: true,
      });
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        const message = error.response?.data?.message || 'Failed to send OTP';
        console.error('Send OTP error:', message);
        throw new Error(message);
      }
      throw new Error('Failed to send OTP');
    }
  },

  async verifyOTP(otpData: OTPVerification & { newPassword: string }): Promise<void> {
    try {
      await axios.post(`${API_BASE_URL}/forgot-password/verify-otp`, otpData, {
        withCredentials: true,
      });
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        const message = error.response?.data?.message || 'Password reset failed';
        console.error('Verify OTP error:', message);
        throw new Error(message);
      }
      throw new Error('Password reset failed');
    }
  },

  async googleLogin(): Promise<void> {
    try {
      // Redirect to the backend's Google OAuth route
      window.location.href = `${API_BASE_URL}/google`;
    } catch (error) {
      console.error('Error initiating Google login:', error);
      throw new Error('Failed to initiate Google login');
    }
  },

  async handleGoogleCallback(): Promise<AuthResponse> {
    try {
      console.log('Starting handleGoogleCallback in authService...');
      const response = await axiosInstance.get(`${USER_BASE_URL}/current-user`);
      console.log('Current user response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error in handleGoogleCallback:', error);
      if (error instanceof AxiosError) {
        console.error('Axios error details:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        });
        const message = error.response?.data?.message || 'Failed to complete Google authentication';
        throw new Error(message);
      }
      throw new Error('Failed to complete Google authentication');
    }
  },
};