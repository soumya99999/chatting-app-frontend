import React from 'react';
import { motion } from 'framer-motion';

interface AuthButtonProps {
  type?: 'button' | 'submit' | 'reset';
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

const AuthButton: React.FC<AuthButtonProps> = ({ 
  type = 'button', 
  onClick, 
  children, 
  className = '',
  disabled = false
}) => {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`w-full p-3 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 transition ${className} ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      }`}
    >
      {children}
    </motion.button>
  );
};

export default AuthButton;
