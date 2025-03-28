import { RouteObject } from 'react-router-dom';
import SignUpPage from '../Pages/SignUpPage';
import LogInPage from '../Pages/LogInPage';
import ForgotPasswordPage from '../Pages/ForgotPasswordPage';
import ChatPage from '../Pages/ChatPage';
import NotFoundPage from '../Pages/NotFoundPage';
import AuthCallback from '../Pages/AuthCallback';
import ProtectedRoute from '../Components/ProtectedRoute';

export const routes: RouteObject[] = [
    { path: '/signup', element: <SignUpPage /> },
    { path: '/login', element: <LogInPage /> },
    { path: '/forgot-password', element: <ForgotPasswordPage /> },
    { path: '/auth/callback', element: <AuthCallback /> },
    {
        path: '/chat',
        element: (
            <ProtectedRoute>
                <ChatPage />
            </ProtectedRoute>
        ),
    },
    { path: '/', element: <LogInPage /> },
    { path: '*', element: <NotFoundPage /> },
];

export default routes;