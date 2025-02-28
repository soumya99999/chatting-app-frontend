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
  token: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  sendOTP: (otpRequest: OTPRequest) => Promise<void>;
  verifyOTP: (otpData: OTPVerification & { newPassword: string }) => Promise<void>;
  googleLogin: () => Promise<void>;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}
