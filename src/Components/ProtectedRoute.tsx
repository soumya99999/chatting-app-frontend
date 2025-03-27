import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../features/auth/store/authStore';

interface ProtectedRouteProps {
    children: JSX.Element;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const { user, isAuthenticated, loadingFetchUser, error } = useAuthStore();

    if (loadingFetchUser) {
        return (
            <div className="min-h-screen bg-teal-900 text-white flex items-center justify-center">
                <div className="text-xl">Loading...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-teal-900 text-white flex items-center justify-center">
                <div className="text-red-500 p-4">
                    Error: {error}. Please try refreshing the page or logging in again.
                </div>
            </div>
        );
    }

    if (!isAuthenticated || !user) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;