import React from 'react';
import { motion } from 'framer-motion';

interface AuthLayoutProps {
    children: React.ReactNode;
    title: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title }) => {
    return (
        <div className="relative flex items-center justify-center min-h-screen bg-teal-900 overflow-hidden">
            {/* Floating Decorative Elements */}
            <motion.div
                initial={{ x: -100, y: -100, scale: 0.5, opacity: 0.5 }}
                animate={{ x: [0, 20, -20, 0], y: [0, 30, -30, 0], scale: [0.5, 1, 0.5] }}
                transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
                className="absolute top-20 left-10 w-40 h-40 bg-teal-400/20 backdrop-blur-lg rounded-full"
            ></motion.div>

            <motion.div
                initial={{ x: 100, y: 100, scale: 0.5, opacity: 0.5 }}
                animate={{ x: [0, -30, 30, 0], y: [0, -20, 20, 0], scale: [0.5, 1.2, 0.5] }}
                transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                className="absolute bottom-20 right-10 w-32 h-32 bg-amber-400/20 backdrop-blur-lg rounded-full"
            ></motion.div>

            <motion.div
                initial={{ x: 0, y: 0, scale: 0.5, opacity: 0.5 }}
                animate={{ x: [0, 40, -40, 0], y: [0, 50, -50, 0], scale: [0.5, 1.3, 0.5] }}
                transition={{ repeat: Infinity, duration: 7, ease: "easeInOut" }}
                className="absolute top-1/3 left-1/4 w-36 h-36 bg-cyan-400/20 backdrop-blur-lg rounded-full"
            ></motion.div>

            {/* Main Content */}
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="relative w-full max-w-md p-6"
            >
                <div className="absolute inset-0 bg-white/10 backdrop-blur-xl rounded-3xl shadow-lg"></div>

                <div className="relative z-10 p-6 rounded-3xl bg-white/20 backdrop-blur-lg shadow-xl">
                    <h2 className="text-3xl font-bold mb-6 text-center text-white">{title}</h2>
                    {children}
                </div>
            </motion.div>
        </div>
    );
};

export default AuthLayout;
