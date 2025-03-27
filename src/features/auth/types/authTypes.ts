// src/features/auth/types/authTypes.ts
export interface User {
  id: string;
  name: string;
  email: string;
  profilePicture?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  profilePicture?: string;
}

export interface OTPRequest {
  email: string;
}

export interface OTPVerification {
  email: string;
  otp: string;
}

export interface AuthResponse {
  user: User;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loadingLogin: boolean;
  loadingRegister: boolean;
  loadingLogout: boolean;
  loadingOTP: boolean;
  loadingVerifyOTP: boolean;
  loadingGoogleLogin: boolean;
  loadingFetchUser: boolean;
  error: string | null;
  fetchCurrentUser: () => Promise<void>;
  login: (credentials: LoginCredentials) => Promise<User>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  sendOTP: (otpRequest: OTPRequest) => Promise<void>;
  verifyOTP: (otpData: OTPVerification & { newPassword: string }) => Promise<void>;
  googleLogin: () => Promise<void>;
  clearError: () => void;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}