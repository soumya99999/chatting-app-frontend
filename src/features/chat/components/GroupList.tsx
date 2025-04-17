import React from 'react';
import { useChatStore } from '../store/chatStore';
import { FaUsers } from 'react-icons/fa';

interface GroupListProps {
    onGroupClick: (groupId: string) => void;
    className?: string;
}

const GroupList: React.FC<GroupListProps> = ({ onGroupClick, className }) => {
    const { chats } = useChatStore();

    // Filter only group chats
    const groupChats = chats.filter(chat => chat.isGroupChat);

    return (
        <div className={className}>
            {groupChats.length > 0 ? (
                groupChats.map((chat) => (
                    <div
                        key={chat._id}
                        onClick={() => onGroupClick(chat._id)}
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
                ))
            ) : (
                <p className="text-gray-400 text-center">No groups found</p>
            )}
        </div>
    );
};

export default GroupList;