import React from 'react';

interface AuthFormProps {
    onSubmit: (e: React.FormEvent) => void;
    children: React.ReactNode;
}

const AuthForm: React.FC<AuthFormProps> = ({ onSubmit, children }) => {
    return (
        <form onSubmit={onSubmit} className="grid gap-4">
            {children}
        </form>
    );
};

export default AuthForm;
