// src/features/chat/components/ChatSidebar.tsx
import React, { useCallback, useState } from 'react';
import { useAuthStore } from '../../auth/store/authStore';
import { useChatStore } from '../store/chatStore';
import { debounce } from 'lodash';
import { useNavigate } from 'react-router-dom';
import UserList from './UserList';
import type { Chat } from '../types/chatInterface';
import type { User } from '../../user/store/userStore';
import { FaUserCircle } from 'react-icons/fa';

interface ChatSidebarProps {
    onClose: () => void;
}

interface ChatUser extends User {
    id: string;
    name: string;
    email: string;
    profilePicture?: string;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({ onClose }) => {
    const { user, logout } = useAuthStore();
    const { accessChat } = useChatStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredUsers, setFilteredUsers] = useState<ChatUser[]>([]);
    const navigate = useNavigate();

    const debouncedSearch = useCallback(
        debounce((query: string) => {
            // Get all users from the chat store
            const { chats } = useChatStore.getState();
            
            // Extract unique users from chats
            const allUsers = chats.reduce((acc: ChatUser[], chat: Chat) => {
                chat.users.forEach((chatUser: User) => {
                    // Only add users that aren't the current user and aren't already in the array
                    if (chatUser.id !== user?.id && !acc.some(u => u.id === chatUser.id)) {
                        acc.push({
                            id: chatUser.id,
                            name: chatUser.name,
                            email: chatUser.email,
                            profilePicture: chatUser.profilePicture
                        });
                    }
                });
                return acc;
            }, []);

            // Filter users based on search query
            const filtered = allUsers.filter((chatUser) => {
                const searchTerm = query.toLowerCase();
                return (
                    chatUser.name.toLowerCase().includes(searchTerm) ||
                    chatUser.email.toLowerCase().includes(searchTerm)
                );
            });

            setFilteredUsers(filtered);
        }, 300),
        [user?.id]
    );

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        setSearchQuery(query);
        if (query.trim()) {
            debouncedSearch(query);
        } else {
            setFilteredUsers([]);
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
            <div className="flex justify-end">
                <button
                    onClick={onClose}
                    className="text-white bg-red-600 hover:bg-red-700 px-2 py-1 rounded"
                >
                    Close
                </button>
            </div>

            {user ? (
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {user.profilePicture ? (
                            <img
                                src={user.profilePicture}
                                alt="Profile"
                                className="w-10 h-10 rounded-full object-cover"
                            />
                        ) : (
                            <FaUserCircle className="w-10 h-10 text-gray-400" />
                        )}
                        <span className="text-lg font-semibold">{user.name}</span>
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

            <input
                type="text"
                value={searchQuery}
                onChange={handleSearch}
                placeholder="Search users..."
                className="w-full p-2 rounded-lg bg-teal-700 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-300"
            />

            <div className="flex-1">
                <h3 className="text-lg font-bold mb-2">
                    {searchQuery ? 'Search Results' : 'All Users'}
                </h3>
                {searchQuery ? (
                    <div className="space-y-2">
                        {filteredUsers.map((chatUser) => (
                            <div
                                key={chatUser.id}
                                onClick={() => handleUserClick(chatUser.id)}
                                className="flex items-center gap-3 p-2 rounded-lg hover:bg-teal-700 cursor-pointer transition-colors"
                            >
                                {chatUser.profilePicture ? (
                                    <img
                                        src={chatUser.profilePicture}
                                        alt={chatUser.name}
                                        className="w-10 h-10 rounded-full object-cover"
                                    />
                                ) : (
                                    <FaUserCircle className="w-10 h-10 text-gray-400" />
                                )}
                                <div>
                                    <div className="font-medium">{chatUser.name}</div>
                                    <div className="text-sm text-gray-300">{chatUser.email}</div>
                                </div>
                            </div>
                        ))}
                        {filteredUsers.length === 0 && (
                            <p className="text-gray-400 text-center">No users found</p>
                        )}
                    </div>
                ) : (
                    <UserList onUserClick={handleUserClick} className="flex-1" />
                )}
            </div>
        </div>
    );
};

export default ChatSidebar;