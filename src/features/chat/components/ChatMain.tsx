// src/features/chat/components/ChatMain.tsx
import React from 'react';
import { useChatStore } from '../store/chatStore';
import EmojiPicker, { EmojiStyle } from 'emoji-picker-react';
import { useChatMain } from '../utils/chatUtils';
import { Message } from '../types/chatInterface';
import { useAuthStore } from '../../auth/store/authStore';

interface ChatMainProps {
    className?: string;
}

const ChatMain: React.FC<ChatMainProps> = ({ className }) => {
    const { selectedChat, messages } = useChatStore();
    const {
        newMessage,
        setNewMessage,
        activePicker,
        setActivePicker,
        gifSearch,
        setGifSearch,
        gifs,
        isPickerOpen,
        setIsPickerOpen,
        messagesEndRef,
        messageContainerRef,
        otherUser,
        isOnline,
        isTyping,
        stickers,
        handleSend,
        handleEmojiClick,
        handleStickerClick,
        handleGifClick,
    } = useChatMain();

    // Render read receipt indicators
    const renderReadReceipt = (msg: Message) => {
        const currentUser = useAuthStore.getState().user;
        if (!currentUser?.id) return null;

        // Only show for messages sent by the current user
        if (msg.senderId !== currentUser.id) return null;

        // Get the other user's ID from the chat users
        const otherUserId = selectedChat?.users.find(user => user.id !== currentUser.id)?.id;
        if (!otherUserId) return null;

        if (!msg.deliveredBy.includes(otherUserId)) {
            return <span className="sent-receipt">✓</span>;
        } else if (!msg.readBy.includes(otherUserId)) {
            return <span className="delivered-receipt">✓✓</span>;
        } else {
            return <span className="read-receipt">✓✓</span>;
        }
    };

    return (
        <div className={`p-4 flex flex-col bg-teal-900 text-white h-screen ${className || ''}`}>
            {selectedChat ? (
                <>
                    <div className="p-2 bg-teal-800 text-white font-semibold rounded-t-lg flex items-center">
                        <span>Chat with {otherUser?.name || 'Unknown User'}</span>
                        <span
                            className={`ml-2 text-sm ${
                                isOnline ? 'text-green-400' : 'text-gray-400'
                            }`}
                        >
                            {isOnline ? 'Online' : 'Offline'}
                        </span>
                        {isTyping && (
                            <span className="ml-2 text-sm text-gray-300 animate-pulse">
                                Typing...
                            </span>
                        )}
                    </div>
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
                                        msg.senderId === otherUser?.id
                                            ? 'justify-start'
                                            : 'justify-end'
                                    }`}
                                >
                                    <div
                                        className={`max-w-xs p-3 rounded-lg shadow-md ${
                                            msg.senderId === otherUser?.id
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
                                            {msg.senderId !== otherUser?.id && (
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
                    <div className="mt-4 flex flex-col">
                        {isPickerOpen && (
                            <div className="picker-container absolute bottom-16 left-4 bg-gray-800 rounded-lg shadow-lg w-72">
                                <div className="flex border-b border-gray-700">
                                    <button
                                        onClick={() => setActivePicker('emoji')}
                                        className={`flex-1 p-2 text-white ${
                                            activePicker === 'emoji'
                                                ? 'bg-teal-700'
                                                : 'hover:bg-teal-600'
                                        }`}
                                    >
                                        Emoji
                                    </button>
                                    <button
                                        onClick={() => setActivePicker('sticker')}
                                        className={`flex-1 p-2 text-white ${
                                            activePicker === 'sticker'
                                                ? 'bg-amber-600'
                                                : 'hover:bg-amber-500'
                                        }`}
                                    >
                                        Stickers
                                    </button>
                                    <button
                                        onClick={() => setActivePicker('gif')}
                                        className={`flex-1 p-2 text-white ${
                                            activePicker === 'gif'
                                                ? 'bg-gray-600'
                                                : 'hover:bg-gray-500'
                                        }`}
                                    >
                                        GIFs
                                    </button>
                                </div>
                                <div className="p-2 max-h-72 overflow-y-auto hide-scrollbar">
                                    {activePicker === 'emoji' && (
                                        <EmojiPicker
                                            onEmojiClick={handleEmojiClick}
                                            emojiStyle={EmojiStyle.NATIVE}
                                        />
                                    )}
                                    {activePicker === 'sticker' && (
                                        <div className="grid grid-cols-3 gap-2">
                                            {stickers.map((sticker, index) => (
                                                <img
                                                    key={index}
                                                    src={sticker}
                                                    alt={`Sticker ${index}`}
                                                    className="w-12 h-12 cursor-pointer"
                                                    onClick={() => handleStickerClick(sticker)}
                                                />
                                            ))}
                                        </div>
                                    )}
                                    {activePicker === 'gif' && (
                                        <div>
                                            <input
                                                type="text"
                                                value={gifSearch}
                                                onChange={(e) => setGifSearch(e.target.value)}
                                                placeholder="Search GIFs..."
                                                className="w-full p-2 mb-2 bg-gray-700 text-white rounded"
                                            />
                                            <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto hide-scrollbar">
                                                {gifs.map((gif) => (
                                                    <img
                                                        key={gif.id}
                                                        src={gif.images.fixed_height_small.url}
                                                        alt={gif.title}
                                                        className="w-12 h-12 cursor-pointer"
                                                        onClick={() => handleGifClick(gif)}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                        <div className="flex items-center bg-teal-700 rounded-lg">
                            <div className="relative">
                                <button
                                    onClick={() => setIsPickerOpen(!isPickerOpen)}
                                    className="p-2 hover:cursor-pointer text-teal-300 hover:text-teal-200"
                                >
                                    😊
                                </button>
                            </div>
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Type a message..."
                                className="flex-1 p-2 bg-transparent text-white placeholder-gray-300 border-none focus:outline-none focus:ring-2 focus:ring-amber-300"
                                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            />
                            <button
                                onClick={handleSend}
                                className="p-2 bg-amber-300 text-gray-900 rounded-r-lg hover:bg-amber-400 transition-colors"
                            >
                                Send
                            </button>
                        </div>
                    </div>
                </>
            ) : (
                <p className="flex-1 flex items-center justify-center text-gray-300">
                    Select a chat to start messaging
                </p>
            )}
        </div>
    );
};

export default ChatMain;