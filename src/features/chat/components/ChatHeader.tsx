import React from 'react';
import { FaUserCircle, FaUsers } from 'react-icons/fa';
import { useChatStore } from '../store/chatStore';
import { useAuthStore } from '../../auth/store/authStore';

interface ChatHeaderProps {
    name: string;
    isGroupChat: boolean;
    profilePicture?: string;
    groupIcon?: string;
    isOnline: boolean;
    isTyping: boolean;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
    name,
    isGroupChat,
    profilePicture,
    groupIcon,
    isOnline
}) => {
    const { selectedChat, typingUsers } = useChatStore();
    const { user } = useAuthStore();

    const getTypingUsers = () => {
        if (!selectedChat || !user) return [];
        const chatTypingUsers = typingUsers.get(selectedChat._id) || new Set();
        return Array.from(chatTypingUsers)
            .filter(id => id !== user.id)
            .map(id => {
                const user = selectedChat.users.find(u => u.id === id);
                return user?.name || 'Someone';
            });
    };

    const typingUsersList = getTypingUsers();
    const isGroupTyping = typingUsersList.length > 0;

    const renderTypingIndicator = () => {
        if (!isGroupTyping) return null;

        if (selectedChat?.isGroupChat) {
            if (typingUsersList.length === 1) {
                return <span className="text-sm text-gray-300 animate-pulse">{typingUsersList[0]} is typing...</span>;
            } else if (typingUsersList.length === 2) {
                return <span className="text-sm text-gray-300 animate-pulse">{typingUsersList.join(' and ')} are typing...</span>;
            } else {
                return <span className="text-sm text-gray-300 animate-pulse">{typingUsersList[0]} and {typingUsersList.length - 1} others are typing...</span>;
            }
        } else {
            return <span className="text-sm text-gray-300 animate-pulse">Typing...</span>;
        }
    };

    return (
        <div className="p-2 bg-teal-800 text-white font-semibold rounded-t-lg flex items-center">
            <div className="relative mr-3">
                {isGroupChat ? (
                    groupIcon ? (
                        <img
                            src={groupIcon}
                            alt="Group Icon"
                            className="w-10 h-10 rounded-full object-cover"
                        />
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-teal-600 flex items-center justify-center">
                            <FaUsers className="w-6 h-6 text-white" />
                        </div>
                    )
                ) : (
                    profilePicture ? (
                        <img
                            src={profilePicture}
                            alt="Profile"
                            className="w-10 h-10 rounded-full object-cover"
                        />
                    ) : (
                        <FaUserCircle className="w-10 h-10 text-gray-400" />
                    )
                )}
            </div>
            <div className="flex flex-col">
                <span>{name}</span>
                <div className="flex items-center gap-2">
                    {!isGroupChat && (
                        <span className={`text-sm ${isOnline ? 'text-green-400' : 'text-gray-400'}`}>
                            {isOnline ? 'Online' : 'Offline'}
                        </span>
                    )}
                    {renderTypingIndicator()}
                </div>
            </div>
        </div>
    );
};

export default ChatHeader; 