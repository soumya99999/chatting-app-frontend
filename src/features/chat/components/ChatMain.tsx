// src/features/chat/components/ChatMain.tsx
import React, { useEffect, useState, useRef } from 'react';
import { useChatStore } from '../store/chatStore';
import { useUserStore } from '../../user/store/userStore';
import EmojiPicker, { EmojiClickData, EmojiStyle } from 'emoji-picker-react';
import { GiphyFetch } from '@giphy/js-fetch-api';
import type { IGif } from '@giphy/js-types';
import { Message } from '../types/chatInterface';
import debounce from 'lodash/debounce';

// Initialize GiphyFetch with API key from .env
const giphy = new GiphyFetch(import.meta.env.VITE_GIPHY_API_KEY as string);

// Custom CSS to hide scrollbar and style EmojiPicker
const customStyles = `
    .hide-scrollbar {
        -ms-overflow-style: none;
        scrollbar-width: none;
    }
    .picker-container {
        width: 26%;
    }
    .hide-scrollbar::-webkit-scrollbar {
        display: none;
    }
    .picker-container .EmojiPickerReact {
        background-color: #1f2937 !important; /* bg-gray-800 */
        border: none !important;
        border-radius: 0.5rem !important; /* rounded-lg */
    }
    .picker-container .EmojiPickerReact .epr-body {
        background-color: #1f2937 !important;
    }
    .picker-container .EmojiPickerReact .epr-header {
        background-color: #1f2937 !important;
    }
    .picker-container .EmojiPickerReact .epr_-orqfm8 {
        background-color: #4a4e69 !important;
    }
    .picker-container .EmojiPickerReact .epr-body::-webkit-scrollbar {
        display: none;
    }
    .picker-container .EmojiPickerReact .epr-emoji-category-label {
        background-color: #1f2937 !important;
    }
    .picker-container .epr-emoji-category-label {
        color: #ffffff !important; /* White text for categories */
    }
`;

interface ChatMainProps {
    className?: string;
}

const ChatMain: React.FC<ChatMainProps> = ({ className }) => {
    const { selectedChat, messages, sendMessage, onlineUsers, typingUsers, setTyping, markMessageAsRead, markMessageDelivered } = useChatStore();
    const { currentUser } = useUserStore();
    const [newMessage, setNewMessage] = useState('');
    const [activePicker, setActivePicker] = useState<'emoji' | 'sticker' | 'gif'>('emoji');
    const [gifSearch, setGifSearch] = useState('');
    const [gifs, setGifs] = useState<IGif[]>([]);
    const [isPickerOpen, setIsPickerOpen] = useState(false);
    const [markedMessages, setMarkedMessages] = useState<Set<string>>(new Set());
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messageContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = () => {
        if (newMessage.trim() && selectedChat && currentUser) {
            sendMessage(selectedChat._id, newMessage, 'text');
            setNewMessage('');
        }
    };

    const handleEmojiClick = (emojiObject: EmojiClickData) => {
        setNewMessage(prev => prev + emojiObject.emoji);
        setIsPickerOpen(false);
    };

    const handleStickerClick = (stickerUrl: string) => {
        if (selectedChat && currentUser) {
            sendMessage(selectedChat._id, stickerUrl, 'sticker');
            setIsPickerOpen(false);
        }
    };

    const handleGifClick = (gif: IGif) => {
        if (selectedChat && currentUser) {
            sendMessage(selectedChat._id, gif.images.original.url, 'gif');
            setIsPickerOpen(false);
        }
    };

    const fetchGifs = async () => {
        try {
            const { data } = await giphy.search(gifSearch || 'funny', { limit: 10 });
            setGifs(data);
        } catch (error) {
            console.error('Error fetching GIFs:', error);
        }
    };

    useEffect(() => {
        if (isPickerOpen && activePicker === 'gif') fetchGifs();
    }, [gifSearch, isPickerOpen, activePicker]);

    useEffect(() => {
        if (selectedChat) {
            const timeout = setTimeout(() => {
                if (newMessage.trim()) {
                    setTyping(selectedChat._id, true);
                } else {
                    setTyping(selectedChat._id, false);
                }
            }, 300);
            return () => clearTimeout(timeout);
        }
    }, [newMessage, selectedChat, setTyping]);

    const otherUser = selectedChat?.users.find((user) => user.id !== currentUser?.id);
    // console.log("Other user:", otherUser, "Current user:", currentUser, "Online users:", onlineUsers);
    const isOnline = otherUser && onlineUsers.has(otherUser.id);
    // console.log("Is online:", isOnline);
    const isTyping = otherUser && typingUsers.has(otherUser.id);

    const stickers = [
        'https://via.placeholder.com/100?text=Sticker1',
        'https://via.placeholder.com/100?text=Sticker2',
    ];

    const markMessagesRead = debounce(() => {
        if (selectedChat && currentUser && messageContainerRef.current) {
            const container = messageContainerRef.current;
            const chatId = selectedChat._id;
            if (!chatId) {
                console.error("Chat ID is undefined");
                return;
            }
            // const now = Date.now();
            const visibleMessages = new Set<string>(); // Track messages marked in this batch

            messages.forEach((msg) => {
                if (msg.senderId !== currentUser.id && !msg.readBy.includes(currentUser.id) && !markedMessages.has(msg._id)) {
                    const messageId = msg._id;
                    if (!messageId) {
                        console.error("Message ID is undefined for message:", msg);
                        return;
                    }
                    const messageElement = container.querySelector(`[data-message-id="${messageId}"]`);
                    if (messageElement && isElementInViewport(messageElement)) {
                        if (!visibleMessages.has(messageId)) { // Prevent marking the same message multiple times in one batch
                            markMessageAsRead(messageId, chatId);
                            setMarkedMessages(prev => new Set(prev).add(messageId));
                            visibleMessages.add(messageId);
                            console.log(`Marked message ${messageId} as read`);
                        }
                    }
                }
            });
        }
    }, 500); // Increased debounce to 500ms for stability

    const markMessagesDelivered = debounce(() => {
        if (selectedChat && currentUser && messageContainerRef.current) {
            const container = messageContainerRef.current;
            const chatId = selectedChat._id;
            if (!chatId) {
                console.error("Chat ID is undefined");
                return;
            }
            // const now = Date.now();
            const visibleMessages = new Set<string>(); // Track messages marked in this batch

            messages.forEach((msg) => {
                if (msg.senderId !== currentUser.id && !msg.deliveredBy.includes(currentUser.id) && !markedMessages.has(msg._id)) {
                    const messageId = msg._id;
                    if (!messageId) {
                        console.error("Message ID is undefined for message:", msg);
                        return;
                    }
                    const messageElement = container.querySelector(`[data-message-id="${messageId}"]`);
                    if (messageElement && isElementInViewport(messageElement)) {
                        if (!visibleMessages.has(messageId)) { // Prevent marking the same message multiple times in one batch
                            markMessageDelivered(messageId, chatId);
                            setMarkedMessages(prev => new Set(prev).add(messageId));
                            visibleMessages.add(messageId);
                            console.log(`Marked message ${messageId} as delivered`);
                        }
                    }
                }
            });
        }
    }, 500); // Increased debounce to 500ms for stability

    const isElementInViewport = (el: Element): boolean => {
        const rect = el.getBoundingClientRect();
        const containerRect = messageContainerRef.current?.getBoundingClientRect() || rect;
        return (
            rect.top >= containerRect.top &&
            rect.bottom <= containerRect.bottom
        );
    };

    useEffect(() => {
        markMessagesRead();
        markMessagesDelivered();
    }, [messages, selectedChat, currentUser]);

    useEffect(() => {
        const container = messageContainerRef.current;
        if (container) {
            container.addEventListener('scroll', markMessagesRead);
            container.addEventListener('scroll', markMessagesDelivered);
            return () => {
                container.removeEventListener('scroll', markMessagesRead);
                container.removeEventListener('scroll', markMessagesDelivered);
            };
        }
    }, [selectedChat]);

    useEffect(() => {
        setMarkedMessages(new Set()); // Reset marked messages when chat changes
    }, [selectedChat]);

    const renderReadReceipt = (msg: Message) => {
        if (msg.senderId !== currentUser?.id) return ''; // Only show for sender's messages
        const otherUserId = otherUser?.id || '';

        if (!msg.deliveredBy.includes(otherUserId)) {
            return <span className="sent-receipt">✓</span>; // Single tick (gray) if not delivered
        } else if (!msg.readBy.includes(otherUserId)) {
            return <span className="delivered-receipt">✓✓</span>; // Double tick (gray) if delivered but not read
        } else {
            return <span className="read-receipt">✓✓</span>; // Blue-filled double tick if read
        }
    };

    return (
        <div className={`p-4 flex flex-col bg-teal-900 text-white h-screen ${className || ''}`}>
            <style>{customStyles}</style>
            <style>{readReceiptStyles}</style>
            {selectedChat ? (
                <>
                    <div className="p-2 bg-teal-800 text-white font-semibold rounded-t-lg flex items-center">
                        <span>Chat with {otherUser?.name || 'Unknown User'}</span>
                        <span className={`ml-2 text-sm ${isOnline ? 'text-green-400' : 'text-gray-400'}`}>
                            {isOnline ? 'Online' : 'Offline'}
                        </span>
                        {isTyping && (
                            <span className="ml-2 text-sm text-gray-300 animate-pulse">
                                Typing...
                            </span>
                        )}
                    </div>
                    <div ref={messageContainerRef} className="flex-1 overflow-y-auto p-4 hide-scrollbar">
                        {messages.length > 0 ? (
                            messages.map((msg, index) => (
                                <div
                                    key={`${msg._id}-${index}`}
                                    data-message-id={msg._id}
                                    className={`flex mb-4 ${msg.senderId === currentUser?.id ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-xs p-3 rounded-lg shadow-md ${msg.senderId === currentUser?.id
                                            ? 'bg-amber-300 text-gray-900'
                                            : 'bg-teal-700 text-white'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            {msg.contentType === 'text' && <span>{msg.content}</span>}
                                            {msg.contentType === 'sticker' && (
                                                <img src={msg.content} alt="Sticker" className="max-w-full h-auto" />
                                            )}
                                            {msg.contentType === 'gif' && (
                                                <img src={msg.content} alt="GIF" className="max-w-full h-auto" />
                                            )}
                                        </div>
                                        <div className="text-xs flex items-center mt-2 opacity-75">
                                            {new Date(msg.timestamp).toLocaleTimeString()}
                                            {msg.senderId === currentUser?.id && (
                                                <div className="text-xs ml-2">{renderReadReceipt(msg)}</div>
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
                                        className={`flex-1 p-2 text-white ${activePicker === 'emoji' ? 'bg-teal-700' : 'hover:bg-teal-600'}`}
                                    >
                                        Emoji
                                    </button>
                                    <button
                                        onClick={() => setActivePicker('sticker')}
                                        className={`flex-1 p-2 text-white ${activePicker === 'sticker' ? 'bg-amber-600' : 'hover:bg-amber-500'}`}
                                    >
                                        Stickers
                                    </button>
                                    <button
                                        onClick={() => setActivePicker('gif')}
                                        className={`flex-1 p-2 text-white ${activePicker === 'gif' ? 'bg-gray-600' : 'hover:bg-gray-500'}`}
                                    >
                                        GIFs
                                    </button>
                                </div>
                                <div className="p-2 max-h-72 overflow-y-auto hide-scrollbar">
                                    {activePicker === 'emoji' && (
                                        <EmojiPicker onEmojiClick={handleEmojiClick} emojiStyle={EmojiStyle.NATIVE} />
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

// Add or update custom CSS for read receipts
const readReceiptStyles = `
    .sent-receipt {
        color: #666; /* Gray for Sent (single tick) */
    }
    .delivered-receipt {
        color: #666; /* Gray for Delivered (double tick) */
    }
    .read-receipt {
        color: #007bff; /* Blue for Read (double tick, filled) - customizable to teal if preferred, e.g., #14b8a6 */
    }
`;

export default ChatMain;