import React from 'react';
const NotFoundPage: React.FC = () => {
    return (
        <div className="flex items-center justify-center min-h-screen bg-teal-900 text-white">
            <div className="text-center">
                <h1 className="text-4xl font-bold">404 - Page Not Found</h1>
                <p className="mt-4">Sorry, the page you're looking for doesn’t exist.</p>
                <a href="/" className="mt-6 inline-block text-amber-300 hover:text-amber-400">
                    Go back to Login
                </a>
            </div>
        </div>
    );
};

export default NotFoundPage;