// src/pages/AuthCallback.tsx
import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../features/auth/store/authStore';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { handleGoogleCallback, user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    console.log('AuthCallback component mounted');
    console.log('Current location:', location);
    console.log('Current user state:', { user, isAuthenticated });

    const handleCallback = async () => {
      try {
        console.log('Starting callback handling...');
        // Check for success parameter in URL
        const params = new URLSearchParams(location.search);
        const success = params.get('success');
        const error = params.get('error');

        console.log('URL parameters:', { success, error });

        if (error) {
          console.error('Authentication error:', error);
          navigate('/login', { state: { error: 'Authentication failed. Please try again.' } });
          return;
        }

        if (success === 'true') {
          console.log('Success parameter found, handling Google callback...');
          // Handle successful Google authentication
          await handleGoogleCallback();
          console.log('Google callback handled, checking user state...');
          
          // Wait for user state to be updated
          if (user && isAuthenticated) {
            console.log('User authenticated successfully:', user);
            navigate('/chat');
          } else {
            console.error('User state not updated properly:', { user, isAuthenticated });
            navigate('/login', { state: { error: 'Authentication state not properly set' } });
          }
        } else {
          console.error('No success parameter found');
          navigate('/login', { state: { error: 'Authentication failed. Please try again.' } });
        }
      } catch (error) {
        console.error('Error handling callback:', error);
        navigate('/login', { state: { error: 'An error occurred during authentication' } });
      }
    };

    handleCallback();
  }, [handleGoogleCallback, navigate, location.search, user, isAuthenticated]);

  return (
    <div className="min-h-screen bg-teal-900 text-white flex items-center justify-center">
      <div className="text-xl">Processing Google Authentication...</div>
    </div>
  );
};

export default AuthCallback;