import { 
  LoginCredentials, 
  RegisterData, 
  AuthResponse,
  OTPRequest,
  OTPVerification
} from '../types/authTypes';

const API_BASE_URL = 'http://localhost:8081/api/auth';

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials),
        credentials: 'include'
      });
      console.log(response);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      return response.json();
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  async register(userData: RegisterData): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });

    if (!response.ok) {
      throw new Error('Registration failed');
    }

    return response.json();
  },

  async sendOTP(email: OTPRequest): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/forgot-password/send-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(email)
    });

    if (!response.ok) {
      console.log("Issue in the OTP");
      throw new Error('Failed to send OTP');
    }
  },

  async verifyOTP(otpData: OTPVerification & { newPassword: string }): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/forgot-password/verify-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(otpData)
    });

    if (!response.ok) {
      throw new Error('Password reset failed');
    }
  },

  async googleLogin(): Promise<void> {
    window.location.href = `${API_BASE_URL}/google-login`;
  }
};
