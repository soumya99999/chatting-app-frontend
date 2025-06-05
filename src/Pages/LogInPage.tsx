import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../features/auth/store/authStore';
import useAuthForm from '../features/auth/hooks/useAuthForm';
import AuthLayout from '../layouts/AuthLayout/AuthLayout';
import AuthForm from '../features/auth/components/AuthForm';
import AuthInput from '../features/auth/components/AuthInput';
import AuthButton from '../features/auth/components/AuthButton';

const LogInPage: React.FC = () => {
  const { formState, errors, handleChange, validateForm } = useAuthForm({
    email: '',
    password: ''
  });
  const { login, loadingLogin } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    console.log("Submitting started");
    e.preventDefault();
    if (!validateForm()){
      console.log("validate form = ",validateForm);
      return;
    }

    try {
      console.log("form State :", formState);
      const user = await login(formState);
      console.log("Logged in successfully with user:", user);
      
      // Navigate immediately after successful login
      navigate('/chat');
    } catch (error) {
      console.error('Login error:', error);
      alert(error instanceof Error ? error.message : 'Login failed. Please try again.');
    }
  };

  return (
    <AuthLayout title="Log In">
      <AuthForm onSubmit={handleSubmit}>
        <AuthInput
          type="email"
          name="email"
          placeholder="Email"
          value={formState.email}
          onChange={handleChange}
          error={errors.email}
          required
        />
        <AuthInput
          type="password"
          name="password"
          placeholder="Password"
          value={formState.password}
          onChange={handleChange}
          error={errors.password}
          required
          autocomplete="current-password"
        />
        <div className="mt-4 text-center">
          <Link to="/forgot-password" className="text-amber-300 hover:text-amber-400">
            Forgot Password?
          </Link>
        </div>
        <div className="mt-4 text-center text-white">
          Don't have an account?{' '}
          <Link to="/signup" className="text-amber-300 hover:text-amber-400">
            Sign Up
          </Link>
        </div>
        <AuthButton type="submit" disabled={loadingLogin}>
          {loadingLogin ? 'Logging in...' : 'Log In'}
        </AuthButton>
      </AuthForm>
    </AuthLayout>
  );
};

export default LogInPage;
