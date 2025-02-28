import { RouteObject } from 'react-router-dom';
import SignUpPage from '../Pages/SignUpPage';
import LogInPage from '../Pages/LogInPage';
import ForgotPasswordPage from '../Pages/ForgotPasswordPage';
import ChatPage from '../Pages/ChatPage';
import NotFoundPage from '../Pages/NotFoundPage';

// Route Definitions
export const routes: RouteObject[] = [
    {
        path: '/signup',
        element: <SignUpPage />,
    },
    {
        path: '/login',
        element: <LogInPage />,
    },
    {
        path: '/forgot-password',
        element: <ForgotPasswordPage />,
    },
    {
        path: '/chat',
        element: <ChatPage />,
    },
    {
        path: '/',
        element: <LogInPage />, // Default route
    },
    {
        path: '*', // Catch-all for unmatched routes
        element: <NotFoundPage />,
    },
];

export default routes;