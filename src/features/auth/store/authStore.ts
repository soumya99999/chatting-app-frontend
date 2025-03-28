// src/features/auth/store/authStore.ts
import { create } from 'zustand';
import { authService } from '../services/authService';
import { 
  LoginCredentials, 
  RegisterData, 
  OTPRequest,
  OTPVerification,
  AuthState 
} from '../types/authTypes';

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  loadingLogin: false,
  loadingRegister: false,
  loadingLogout: false,
  loadingOTP: false,
  loadingVerifyOTP: false,
  loadingGoogleLogin: false,
  loadingFetchUser: false,
  error: null,

  fetchCurrentUser: async () => {
    set({ loadingFetchUser: true, error: null });
    try {
      const user = await authService.fetchCurrentUser();
      set({ user, isAuthenticated: true, loadingFetchUser: false });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to fetch current user';
      set({ user: null, isAuthenticated: false, loadingFetchUser: false, error: message });
    }
  },

  login: async (credentials: LoginCredentials) => {
    set({ loadingLogin: true, error: null });
    try {
      const { user } = await authService.login(credentials);
      set({ user, isAuthenticated: true, loadingLogin: false });
      return user;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Login failed';
      set({ error: message, loadingLogin: false });
      throw error;
    }
  },

  register: async (userData: RegisterData) => {
    set({ loadingRegister: true, error: null });
    try {
      const { user } = await authService.register(userData);
      set({ user, isAuthenticated: true, loadingRegister: false });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Registration failed';
      set({ error: message, loadingRegister: false });
    }
  },

  logout: async () => {
    set({ loadingLogout: true, error: null });
    try {
      await authService.logout();
      set({ user: null, isAuthenticated: false, loadingLogout: false });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Logout failed';
      set({ error: message, loadingLogout: false });
    }
  },

  sendOTP: async (otpRequest: OTPRequest) => {
    set({ loadingOTP: true, error: null });
    try {
      await authService.sendOTP(otpRequest);
      set({ loadingOTP: false });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to send OTP';
      set({ error: message, loadingOTP: false });
    }
  },

  verifyOTP: async (otpData: OTPVerification & { newPassword: string }) => {
    set({ loadingVerifyOTP: true, error: null });
    try {
      await authService.verifyOTP(otpData);
      set({ loadingVerifyOTP: false });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Password reset failed';
      set({ error: message, loadingVerifyOTP: false });
    }
  },

  googleLogin: async () => {
    set({ loadingGoogleLogin: true, error: null });
    try {
      await authService.googleLogin();
      set({ loadingGoogleLogin: false });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Google login failed';
      set({ error: message, loadingGoogleLogin: false });
      throw error;
    }
  },

  handleGoogleCallback: async () => {
    console.log('Starting handleGoogleCallback in authStore...');
    set({ loadingFetchUser: true, error: null });
    try {
      console.log('Calling authService.handleGoogleCallback...');
      const { user } = await authService.handleGoogleCallback();
      console.log('Received user data:', user);
      set({ user, isAuthenticated: true, loadingFetchUser: false });
      console.log('Updated auth store state:', { user, isAuthenticated: true });
    } catch (error: unknown) {
      console.error('Error in handleGoogleCallback:', error);
      const message = error instanceof Error ? error.message : 'Failed to complete Google authentication';
      set({ error: message, loadingFetchUser: false });
      throw error;
    }
  },

  clearError: () => {
    set({ error: null });
  }
}));