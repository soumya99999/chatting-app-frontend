import React, { useEffect, useCallback } from 'react';
import { useUserStore } from '../../user/store/userStore';
import { useChatStore } from '../store/chatStore';
import { debounce } from 'lodash';
import { useNavigate } from 'react-router-dom';

interface ChatSidebarProps {
    onClose: () => void; 
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({ onClose }) => {
    const {
        currentUser,
        users,
        searchResults,
        loading,
        error,
        fetchCurrentUser,
        fetchAllUsers,
        searchUsers,
        logout,
    } = useUserStore();
    const { accessChat } = useChatStore();
    const [searchQuery, setSearchQuery] = React.useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchCurrentUser();
        fetchAllUsers();
    }, [fetchCurrentUser, fetchAllUsers]);

    const debouncedSearch = useCallback(
        debounce((query: string) => searchUsers(query), 300),
        [searchUsers]
    );

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        setSearchQuery(query);
        if (query.trim()) {
            debouncedSearch(query);
        } else {
            setSearchQuery('');
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const handleUserClick = (userId: string) => {
        accessChat(userId);
    };

    return (
        <div className="w-1/4 bg-teal-800 p-4 flex flex-col gap-4 overflow-y-auto">
            {/* Close Button */}
            <div className="flex justify-end">
                <button
                    onClick={onClose}
                    className="text-white bg-red-600 hover:bg-red-700 px-2 py-1 rounded"
                >
                    Close
                </button>
            </div>

            {/* Current User Profile */}
            {loading && !currentUser ? (
                <p>Loading profile...</p>
            ) : error ? (
                <p className="text-red-400">Error: {error}</p>
            ) : currentUser ? (
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <img
                            src={currentUser.profilePicture || 'https://via.placeholder.com/40'}
                            alt="Profile"
                            className="w-10 h-10 rounded-full object-cover"
                        />
                        <span className="text-lg font-semibold">{currentUser.name}</span>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="text-sm text-amber-300 hover:text-amber-400 transition-colors cursor-pointer"
                    >
                        Logout
                    </button>
                </div>
            ) : (
                <p>No user data</p>
            )}

            {/* Search Users */}
            <input
                type="text"
                value={searchQuery}
                onChange={handleSearch}
                placeholder="Search users..."
                className="w-full p-2 rounded-lg bg-teal-700 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-300"
            />

            {/* User List */}
            <div className="flex-1">
                <h3 className="text-lg font-bold mb-2">{searchQuery ? 'Search Results' : 'All Users'}</h3>
                {loading && !users.length ? (
                    <p>Loading users...</p>
                ) : error ? (
                    <p className="text-red-400">Error: {error}</p>
                ) : searchQuery && searchResults.length > 0 ? (
                    searchResults.map((user) => (
                        <div
                            key={user.id}
                            onClick={() => handleUserClick(user.id)}
                            className="flex items-center gap-2 py-2 cursor-pointer hover:bg-teal-700 rounded-lg transition-colors"
                        >
                            <img
                                src={user.profilePicture || 'https://via.placeholder.com/30'}
                                alt={user.name}
                                className="w-8 h-8 rounded-full object-cover"
                            />
                            <span>{user.name}</span>
                        </div>
                    ))
                ) : users.length > 0 ? (
                    users.map((user) => (
                        <div
                            key={user.id}
                            onClick={() => handleUserClick(user.id)}
                            className="flex items-center gap-2 py-2 cursor-pointer hover:bg-teal-700 rounded-lg transition-colors"
                        >
                            <img
                                src={user.profilePicture || 'https://via.placeholder.com/30'}
                                alt={user.name}
                                className="w-8 h-8 rounded-full object-cover"
                            />
                            <span>{user.name}</span>
                        </div>
                    ))
                ) : (
                    <p>No users found</p>
                )}
            </div>
        </div>
    );
};

export default ChatSidebar;