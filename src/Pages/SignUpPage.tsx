import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../features/auth/store/authStore';
import useAuthForm from '../features/auth/hooks/useAuthForm';
import AuthLayout from '../layouts/AuthLayout/AuthLayout';
import AuthForm from '../features/auth/components/AuthForm';
import AuthInput from '../features/auth/components/AuthInput';
import AuthButton from '../features/auth/components/AuthButton';
import { FaGoogle, FaImage, FaUserCircle } from 'react-icons/fa';

const SignUpPage: React.FC = () => {
  const { formState, errors, handleChange, validateForm } = useAuthForm({
    name: '',
    email: '',
    password: '',
    profilePicture: ''
  });
  const { register, googleLogin, loadingRegister } = useAuthStore();
  const navigate = useNavigate();
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }

      // Check file type
      if (!file.type.match(/^image\/(jpeg|png|gif)$/)) {
        alert('Only JPG, PNG and GIF images are allowed');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
        handleChange({
          target: {
            name: 'profilePicture',
            value: reader.result as string
          }
        } as React.ChangeEvent<HTMLInputElement>);
      };
      reader.readAsDataURL(file);
    }
  };

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
      // Show error message to user
      alert(error instanceof Error ? error.message : 'Registration failed. Please try again.');
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
        <div className="flex flex-col items-center mb-4">
          <div className="relative">
            {previewImage ? (
              <img
                src={previewImage}
                alt="Profile Preview"
                className="w-24 h-24 rounded-full object-cover mb-2"
              />
            ) : (
              <FaUserCircle className="w-24 h-24 text-gray-400 mb-2" />
            )}
            <label
              htmlFor="profile-picture"
              className="absolute bottom-0 right-0 bg-teal-600 p-2 rounded-full cursor-pointer hover:bg-teal-700 transition-colors"
            >
              <FaImage className="text-white" />
            </label>
            <input
              id="profile-picture"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </div>
          <span className="text-sm text-gray-300">Click to upload profile picture</span>
        </div>

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
        <div className="mt-4 text-center">
          <span className="text-white">Already have an account? </span>
          <Link to="/login" className="text-amber-300 hover:text-amber-400">
            Log In
          </Link>
        </div>
        <AuthButton type="submit" disabled={loadingRegister}>
          {loadingRegister ? 'Signing up...' : 'Sign Up'}
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
