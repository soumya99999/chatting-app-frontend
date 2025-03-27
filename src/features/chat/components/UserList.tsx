// src/features/user/components/UserList.tsx
import React, { useEffect } from 'react';
import { useUserStore } from '../../user/store/userStore';
import { useAuthStore } from '../../auth/store/authStore';
import { FaUserCircle } from 'react-icons/fa';

interface UserListProps {
    onUserClick: (userId: string) => void;
    className?: string;
}

const UserList: React.FC<UserListProps> = ({ onUserClick, className }) => {
    const { users, loadingUsers, error, fetchAllUsers, clearError } = useUserStore();
    const { user } = useAuthStore(); // Current user

    useEffect(() => {
        if (user) {
            fetchAllUsers();
        }
    }, [fetchAllUsers, user]);

    // Filter out the current user from the list
    const filteredUsers = user ? users.filter((u) => u.id !== user.id) : users;

    return (
        <div className={className}>
            {loadingUsers && !users.length ? (
                <p>Loading users...</p>
            ) : error ? (
                <p className="text-red-400">
                    Error: {error}
                    <button onClick={clearError} className="ml-2 text-blue-500">
                        Clear
                    </button>
                </p>
            ) : filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                    <div
                        key={user.id}
                        onClick={() => onUserClick(user.id)}
                        className="flex items-center gap-2 py-2 cursor-pointer hover:bg-teal-700 rounded-lg transition-colors"
                    >
                        {user.profilePicture ? (
                            <img
                                src={user.profilePicture}
                                alt={user.name}
                                className="w-8 h-8 rounded-full object-cover"
                            />
                        ) : (
                            <FaUserCircle className="w-8 h-8 text-gray-400" />
                        )}
                        <span>{user.name}</span>
                    </div>
                ))
            ) : (
                <p>No users found</p>
            )}
        </div>
    );
};

export default UserList;