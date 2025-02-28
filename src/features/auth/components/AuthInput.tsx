import React from 'react';

interface AuthInputProps {
  type: string;
  name: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  required?: boolean;
}

const AuthInput: React.FC<AuthInputProps> = ({ 
  type, 
  name, 
  placeholder, 
  value, 
  onChange, 
  error,
  required = false 
}) => {
  return (
    <div className="mb-4">
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        className={`w-full p-3 border rounded-lg bg-white/30 placeholder-gray-200 text-white focus:outline-none focus:ring-2 focus:ring-amber-400 ${
          error ? 'border-red-500' : ''
        }`}
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

export default AuthInput;
