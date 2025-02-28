import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../features/auth/store/authStore';
import useAuthForm from '../features/auth/hooks/useAuthForm';
import AuthLayout from '../layouts/AuthLayout/AuthLayout';
import AuthForm from '../features/auth/components/AuthForm';
import AuthInput from '../features/auth/components/AuthInput';
import AuthButton from '../features/auth/components/AuthButton';
import { FaGoogle } from 'react-icons/fa';

const SignUpPage: React.FC = () => {
  const { formState, errors, handleChange, validateForm } = useAuthForm({
    name: '',
    email: '',
    password: '',
    profilePicture: ''
  });
  const { register, googleLogin, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    try {
      await register({
        name: formState.name,
        email: formState.email,
        password: formState.password,
        profilePicture: formState.profilePicture
      });
      navigate('/login');
    } catch (error) {
      console.error('Registration error:', error);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await googleLogin();
      navigate('/chat');
    } catch (error) {
      console.error('Google login error:', error);
    }
  };

  return (
    <AuthLayout title="Sign Up">
      <AuthForm onSubmit={handleSubmit}>
        <AuthInput
          type="text"
          name="name"
          placeholder="Name"
          value={formState.name}
          onChange={handleChange}
          error={errors.name}
          required
        />
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
        />
        <AuthInput
          type="text"
          name="profilePicture"
          placeholder="Profile Picture URL (optional)"
          value={formState.profilePicture}
          onChange={handleChange}
        />
        <div className="mt-4 text-center">
          <span className="text-white">Already have an account? </span>
          <Link to="/login" className="text-amber-300 hover:text-amber-400">
            Log In
          </Link>
        </div>
        <AuthButton type="submit" disabled={isLoading}>
          {isLoading ? 'Signing up...' : 'Sign Up'}
        </AuthButton>

        <div className="flex justify-center mt-4">
          <AuthButton
            type="button"
            onClick={handleGoogleLogin}
            className="flex items-center justify-center bg-white/20 hover:bg-white/30"
          >
            <FaGoogle className="mr-2" />
            Sign Up with Google
          </AuthButton>
        </div>
      </AuthForm>
    </AuthLayout>
  );
};

export default SignUpPage;
