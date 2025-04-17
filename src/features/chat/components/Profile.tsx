import React from 'react';
import { useAuthStore } from '../../auth/store/authStore';
import { FaUserCircle, FaBell } from 'react-icons/fa';

const Profile: React.FC = () => {
    const { user } = useAuthStore();

    return (
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
                {user?.profilePicture ? (
                    <img
                        src={user.profilePicture}
                        alt="Profile"
                        className="w-10 h-10 rounded-full object-cover"
                    />
                ) : (
                    <FaUserCircle className="w-10 h-10 text-gray-400" />
                )}
                <span className="text-lg font-semibold">{user?.name}</span>
            </div>
            <button className="relative p-2 text-gray-400 hover:text-amber-300 transition-colors">
                <FaBell className="w-5 h-5" />
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
        </div>
    );
};

export default Profile; 