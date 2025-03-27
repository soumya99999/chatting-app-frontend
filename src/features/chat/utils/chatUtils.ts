// src/features/chat/utils/chatUtils.ts
import { useState, useEffect, useRef } from 'react';
import { useChatStore } from '../store/chatStore';
import { useAuthStore } from '../../auth/store/authStore';
import { EmojiClickData } from 'emoji-picker-react';
import { GiphyFetch } from '@giphy/js-fetch-api';
import type { IGif } from '@giphy/js-types';
import debounce from 'lodash/debounce';

// Initialize GiphyFetch with API key from .env
const giphy = new GiphyFetch(import.meta.env.VITE_GIPHY_API_KEY as string);

export const useChatMain = () => {
    const {
        selectedChat,
        messages,
        sendMessage,
        onlineUsers,
        typingUsers,
        setTyping,
        markMessageAsRead,
        markMessageDelivered,
    } = useChatStore();
    const { user } = useAuthStore();
    const [newMessage, setNewMessage] = useState('');
    const [activePicker, setActivePicker] = useState<'emoji' | 'sticker' | 'gif'>('emoji');
    const [gifSearch, setGifSearch] = useState('');
    const [gifs, setGifs] = useState<IGif[]>([]);
    const [isPickerOpen, setIsPickerOpen] = useState(false);
    const [markedMessages, setMarkedMessages] = useState<Set<string>>(new Set());
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messageContainerRef = useRef<HTMLDivElement>(null);

    // Scroll to the bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Fetch GIFs when the GIF picker is active
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

    // Set typing status when the user types
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

    // Mark messages as read or delivered when they're visible
    const markMessagesRead = debounce(() => {
        if (selectedChat && user && messageContainerRef.current) {
            const container = messageContainerRef.current;
            const chatId = selectedChat._id;
            if (!chatId) {
                console.error('Chat ID is undefined');
                return;
            }
            const visibleMessages = new Set<string>();

            messages.forEach((msg) => {
                if (
                    msg.senderId !== user.id && // Message is from other user
                    !msg.readBy.includes(user.id) && // Not already read by current user
                    !markedMessages.has(msg._id) // Not already marked
                ) {
                    const messageId = msg._id;
                    if (!messageId) {
                        console.error('Message ID is undefined for message:', msg);
                        return;
                    }
                    const messageElement = container.querySelector(
                        `[data-message-id="${messageId}"]`
                    );
                    if (messageElement && isElementInViewport(messageElement)) {
                        if (!visibleMessages.has(messageId)) {
                            // Mark as read immediately when visible
                            markMessageAsRead(messageId, chatId);
                            setMarkedMessages((prev) => new Set(prev).add(messageId));
                            visibleMessages.add(messageId);
                            console.log(`Marked message ${messageId} as read`);
                        }
                    }
                }
            });
        }
    }, 100); // Reduced debounce time for faster response

    const markMessagesDelivered = debounce(() => {
        if (selectedChat && user && messageContainerRef.current) {
            const container = messageContainerRef.current;
            const chatId = selectedChat._id;
            if (!chatId) {
                console.error('Chat ID is undefined');
                return;
            }
            const visibleMessages = new Set<string>();

            messages.forEach((msg) => {
                if (
                    msg.senderId !== user.id && // Message is from other user
                    !msg.deliveredBy.includes(user.id) && // Not already delivered to current user
                    !markedMessages.has(msg._id) // Not already marked
                ) {
                    const messageId = msg._id;
                    if (!messageId) {
                        console.error('Message ID is undefined for message:', msg);
                        return;
                    }
                    const messageElement = container.querySelector(
                        `[data-message-id="${messageId}"]`
                    );
                    if (messageElement && isElementInViewport(messageElement)) {
                        if (!visibleMessages.has(messageId)) {
                            markMessageDelivered(messageId, chatId);
                            setMarkedMessages((prev) => new Set(prev).add(messageId));
                            visibleMessages.add(messageId);
                            console.log(`Marked message ${messageId} as delivered`);
                        }
                    }
                }
            });
        }
    }, 100); // Reduced debounce time for faster response

    const isElementInViewport = (el: Element): boolean => {
        const rect = el.getBoundingClientRect();
        const containerRect = messageContainerRef.current?.getBoundingClientRect() || rect;
        return rect.top >= containerRect.top && rect.bottom <= containerRect.bottom;
    };

    useEffect(() => {
        markMessagesRead();
        markMessagesDelivered();
    }, [messages, selectedChat, user]);

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

    // Send a new text message
    const handleSend = () => {
        if (newMessage.trim() && selectedChat && user) {
            sendMessage(selectedChat._id, newMessage, 'text');
            setNewMessage('');
        }
    };

    // Add an emoji to the message input
    const handleEmojiClick = (emojiObject: EmojiClickData) => {
        setNewMessage((prev) => prev + emojiObject.emoji);
        setIsPickerOpen(false);
    };

    // Send a sticker message
    const handleStickerClick = (stickerUrl: string) => {
        if (selectedChat && user) {
            sendMessage(selectedChat._id, stickerUrl, 'sticker');
            setIsPickerOpen(false);
        }
    };

    // Send a GIF message
    const handleGifClick = (gif: IGif) => {
        if (selectedChat && user) {
            sendMessage(selectedChat._id, gif.images.original.url, 'gif');
            setIsPickerOpen(false);
        }
    };

    // Determine the other user in the chat and their online/typing status
    const otherUser = selectedChat?.users.find((u) => u.id !== user?.id);
    const isOnline = otherUser && onlineUsers.has(otherUser.id);
    const isTyping = otherUser && typingUsers.has(otherUser.id);
    // console.log("isTyping : ", isTyping,"otherUser: ",otherUser,"typing Users:",typingUsers);

    // Sample stickers (can be expanded)
    const stickers = [
        'https://via.placeholder.com/100?text=Sticker1',
        'https://via.placeholder.com/100?text=Sticker2',
    ];

    return {
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
    };
};