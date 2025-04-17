import React from 'react';
import { Message } from '../types/chatInterface';
import { useAuthStore } from '../../auth/store/authStore';
import { useChatStore } from '../store/chatStore';

interface ChatBoxProps {
    messages: Message[];
    messageContainerRef: React.RefObject<HTMLDivElement>;
    messagesEndRef: React.RefObject<HTMLDivElement>;
}

const ChatBox: React.FC<ChatBoxProps> = ({
    messages,
    messageContainerRef,
    messagesEndRef
}) => {
    const currentUser = useAuthStore.getState().user;

    // Render read receipt indicators
    const renderReadReceipt = (msg: Message) => {
        if (!currentUser?.id) return null;

        // Only show for messages sent by the current user
        if (msg.senderId !== currentUser.id) return null;

        const selectedChat = useChatStore.getState().selectedChat;
        if (!selectedChat) return null;

        if (selectedChat.isGroupChat) {
            // For group chats, show read status based on all members
            const totalMembers = selectedChat.users.length;
            const readMembers = msg.readBy.length;
            const deliveredMembers = msg.deliveredBy.length;

            if (deliveredMembers < totalMembers) {
                return <span className="sent-receipt">✓</span>;
            } else if (readMembers < totalMembers) {
                return <span className="delivered-receipt">✓✓</span>;
            } else {
                return <span className="read-receipt">✓✓</span>;
            }
        } else {
            // For one-to-one chats
            const otherUserId = selectedChat.users.find(u => u.id !== currentUser.id)?.id;
            if (!otherUserId) return null;

            if (!msg.deliveredBy.includes(otherUserId)) {
                return <span className="sent-receipt">✓</span>;
            } else if (!msg.readBy.includes(otherUserId)) {
                return <span className="delivered-receipt">✓✓</span>;
            } else {
                return <span className="read-receipt">✓✓</span>;
            }
        }
    };

    return (
        <div
            ref={messageContainerRef}
            className="flex-1 overflow-y-auto p-4 hide-scrollbar"
        >
            {messages.length > 0 ? (
                messages.map((msg, index) => (
                    <div
                        key={`${msg._id}-${index}`}
                        data-message-id={msg._id}
                        className={`flex mb-4 ${
                            msg.senderId !== currentUser?.id
                                ? 'justify-start'
                                : 'justify-end'
                        }`}
                    >
                        <div
                            className={`max-w-xs p-3 rounded-lg shadow-md ${
                                msg.senderId !== currentUser?.id
                                    ? 'bg-teal-700 text-white'
                                    : 'bg-amber-300 text-gray-900'
                            }`}
                        >
                            <div className="flex items-center justify-between">
                                {msg.contentType === 'text' && <span>{msg.content}</span>}
                                {msg.contentType === 'sticker' && (
                                    <img
                                        src={msg.content}
                                        alt="Sticker"
                                        className="max-w-full h-auto"
                                    />
                                )}
                                {msg.contentType === 'gif' && (
                                    <img
                                        src={msg.content}
                                        alt="GIF"
                                        className="max-w-full h-auto"
                                    />
                                )}
                            </div>
                            <div className="text-xs flex items-center mt-2 opacity-75">
                                {new Date(msg.timestamp).toLocaleTimeString()}
                                {msg.senderId === currentUser?.id && (
                                    <div className="text-xs ml-2">
                                        {renderReadReceipt(msg)}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))
            ) : (
                <p className="text-center text-gray-300">No messages yet</p>
            )}
            <div ref={messagesEndRef} />
        </div>
    );
};

export default ChatBox; 