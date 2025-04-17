import React, { useCallback, useState } from 'react';
import { useAuthStore } from '../../auth/store/authStore';
import { useChatStore } from '../store/chatStore';
import { debounce } from 'lodash';
import { useNavigate } from 'react-router-dom';
import UserList from './UserList';
import GroupList from './GroupList';
import { FaUserCircle, FaBell, FaUsers, FaSearch } from 'react-icons/fa';
import type { Chat } from '../types/chatInterface';
import type { User } from '../../user/store/userStore';

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
    const { accessChat, chats } = useChatStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredUsers, setFilteredUsers] = useState<ChatUser[]>([]);
    const [filteredGroups, setFilteredGroups] = useState<Chat[]>([]);
    const [activeTab, setActiveTab] = useState<'users' | 'groups'>('users');
    const navigate = useNavigate();

    const debouncedSearch = useCallback(
        debounce((query: string) => {
            if (activeTab === 'users') {
                // Get all users from the chat store
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
            } else {
                // Filter groups based on search query
                const filtered = chats.filter((chat) => {
                    if (!chat.isGroupChat) return false;
                    const searchTerm = query.toLowerCase();
                    return (
                        chat.chatName?.toLowerCase().includes(searchTerm) ||
                        chat.users.some(user => 
                            user.name.toLowerCase().includes(searchTerm) ||
                            user.email.toLowerCase().includes(searchTerm)
                        )
                    );
                });
                setFilteredGroups(filtered);
            }
        }, 300),
        [user?.id, chats, activeTab]
    );

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        setSearchQuery(query);
        if (query.trim()) {
            debouncedSearch(query);
        } else {
            setFilteredUsers([]);
            setFilteredGroups([]);
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

    const handleGroupClick = async (groupId: string) => {
        try {
            await accessChat('', groupId);
        } catch (error) {
            console.error('Error accessing group chat:', error);
        }
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

            {/* Profile Section */}
            {user && (
                <div className="flex flex-col items-center gap-2 mb-4">
                    <div className="relative">
                        {user.profilePicture ? (
                            <img
                                src={user.profilePicture}
                                alt="Profile"
                                className="w-16 h-16 rounded-full object-cover"
                            />
                        ) : (
                            <FaUserCircle className="w-16 h-16 text-gray-400" />
                        )}
                        <button className="absolute top-0 right-0 p-1 bg-teal-700 rounded-full">
                            <FaBell className="w-4 h-4 text-amber-300" />
                        </button>
                    </div>
                    <span className="text-lg font-semibold">{user.name}</span>
                    <button
                        onClick={handleLogout}
                        className="text-sm text-amber-300 hover:text-amber-400 transition-colors cursor-pointer"
                    >
                        Logout
                    </button>
                </div>
            )}

            {/* Search Component */}
            <div className="relative mb-4">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearch}
                    placeholder={`Search ${activeTab === 'users' ? 'users' : 'groups'}...`}
                    className="w-full p-2 pl-10 rounded-lg bg-teal-700 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-300"
                />
                <FaSearch className="absolute left-3 top-3 text-gray-400" />
            </div>

            {/* Tabs */}
            <div className="flex border-b border-teal-700 mb-4">
                <button
                    onClick={() => {
                        setActiveTab('users');
                        setSearchQuery('');
                        setFilteredUsers([]);
                        setFilteredGroups([]);
                    }}
                    className={`flex-1 p-2 text-white ${
                        activeTab === 'users' ? 'bg-teal-700' : 'hover:bg-teal-600'
                    }`}
                >
                    Users
                </button>
                <button
                    onClick={() => {
                        setActiveTab('groups');
                        setSearchQuery('');
                        setFilteredUsers([]);
                        setFilteredGroups([]);
                    }}
                    className={`flex-1 p-2 text-white ${
                        activeTab === 'groups' ? 'bg-teal-700' : 'hover:bg-teal-600'
                    }`}
                >
                    Groups
                </button>
            </div>

            {/* Content Area */}
            <div className="flex-1">
                {activeTab === 'users' ? (
                    searchQuery ? (
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
                        <UserList onUserClick={handleUserClick} className="flex-1 overflow-y-auto max-h-[calc(75vh-250px)] pr-1 hide-scrollbar" />
                    )
                ) : (
                    searchQuery ? (
                        <div className="space-y-2">
                            {filteredGroups.map((chat) => (
                                <div
                                    key={chat._id}
                                    onClick={() => handleGroupClick(chat._id)}
                                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-teal-700 cursor-pointer transition-colors"
                                >
                                    <div className="relative">
                                        {chat.chatName ? (
                                            <div className="w-10 h-10 rounded-full bg-teal-600 flex items-center justify-center">
                                                <span className="text-white font-semibold">
                                                    {chat.chatName.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                        ) : (
                                            <FaUsers className="w-10 h-10 text-gray-400" />
                                        )}
                                    </div>
                                    <div>
                                        <div className="font-medium">{chat.chatName || 'Group Chat'}</div>
                                        <div className="text-sm text-gray-300">
                                            {chat.users.length} members
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {filteredGroups.length === 0 && (
                                <p className="text-gray-400 text-center">No groups found</p>
                            )}
                        </div>
                    ) : (
                        <GroupList onGroupClick={handleGroupClick} className="flex-1 max-h-[calc(100vh-250px)] overflow-y-auto pr-1 hide-scrollbar" />
                    )
                )}
            </div>
        </div>
    );
};

export default ChatSidebar;