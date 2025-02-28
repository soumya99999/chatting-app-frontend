import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../features/auth/store/authStore';
import useAuthForm from '../features/auth/hooks/useAuthForm';
import AuthLayout from '../layouts/AuthLayout/AuthLayout';
import AuthForm from '../features/auth/components/AuthForm';
import AuthInput from '../features/auth/components/AuthInput';
import AuthButton from '../features/auth/components/AuthButton';
import { validateEmail, validatePassword } from '../features/auth/utils/validation';

const ForgotPasswordPage: React.FC = () => {
  const [step, setStep] = useState<'request' | 'reset'>('request');
  const { formState, errors, handleChange} = useAuthForm({
    email: '',
    otp: '',
    newPassword: ''
  });
  const { sendOTP, verifyOTP, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("OTP request started..."); // Debug log
    const emailError = validateEmail(formState.email);
  if (emailError) {
    console.log("Validation failed:", emailError);
    alert(emailError); // Show error message
    return;
  }
  
    try {
      console.log("Calling sendOTP function...");
      await sendOTP({ email: formState.email });
      setStep('reset');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to send OTP';
      console.error('OTP request error:', message);
      alert(message);
    }
  };
  

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Reset password process started...");

  // Validate password before resetting
  const passwordError = validatePassword(formState.newPassword);
  if (passwordError) {
    console.log("Validation failed:", passwordError);
    alert(passwordError); // Show error message
    return;
  }
    try {
      await verifyOTP({
        email: formState.email,
        otp: formState.otp,
        newPassword: formState.newPassword
      });
      console.log(formState);
      navigate('/login');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Password reset failed';
      console.error('Password reset error:', message);
      alert(message);
    }
  };

  return (
    <AuthLayout title="Reset Password">
      {step === 'request' ? (
        <AuthForm onSubmit={handleRequestOtp}>
          <AuthInput
            type="email"
            name="email"
            placeholder="Email"
            value={formState.email}
            onChange={handleChange}
            error={errors.email}
            required
          />
          <AuthButton type="submit" disabled={isLoading}>
            {isLoading ? 'Sending OTP...' : 'Send OTP'}
          </AuthButton>
        </AuthForm>
      ) : (
        <AuthForm onSubmit={handleResetPassword}>
          <AuthInput
            type="text"
            name="otp"
            placeholder="OTP"
            value={formState.otp}
            onChange={handleChange}
            error={errors.otp}
            required
          />
          <AuthInput
            type="password"
            name="newPassword"
            placeholder="New Password"
            value={formState.newPassword}
            onChange={handleChange}
            error={errors.newPassword}
            required
          />
          <AuthButton type="submit" disabled={isLoading}>
            {isLoading ? 'Resetting password...' : 'Reset Password'}
          </AuthButton>
        </AuthForm>
      )}
    </AuthLayout>
  );
};

export default ForgotPasswordPage;
