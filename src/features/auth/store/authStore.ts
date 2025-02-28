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
  isLoading: false,
  error: null,
  
  login: async (credentials: LoginCredentials) => {
    set({ isLoading: true, error: null });
    try {
      const { user, token } = await authService.login(credentials);
      localStorage.setItem('token', token);
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Login failed';
      set({ error: message, isLoading: false });
    }
  },

  register: async (userData: RegisterData) => {
    set({ isLoading: true, error: null });
    try {
      const { user, token } = await authService.register(userData);
      localStorage.setItem('token', token);
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Registration failed';
      set({ error: message, isLoading: false });
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, isAuthenticated: false });
  },

  sendOTP: async (otpRequest: OTPRequest) => {
    // console.log("Calling backend API for OTP:", otpRequest.email);
    set({ isLoading: true, error: null });
    try {
      await authService.sendOTP(otpRequest);
      set({ isLoading: false });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to send OTP';
      set({ error: message, isLoading: false });
    }
  },

  verifyOTP: async (otpData: OTPVerification & { newPassword: string }) => {
    set({ isLoading: true, error: null });
    try {
      await authService.verifyOTP(otpData);
      set({ isLoading: false });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Password reset failed';
      set({ error: message, isLoading: false });
    }
  },

  googleLogin: async () => {
    set({ isLoading: true, error: null });
    try {
      await authService.googleLogin();
      set({ isLoading: false });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Google login failed';
      set({ error: message, isLoading: false });
    }
  }
}));
