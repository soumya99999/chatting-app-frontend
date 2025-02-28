// src/features/chat/store/chatStore.ts
import { create } from 'zustand';
import { fetchChats, accessChat } from '../services/chatService';
import { fetchMessages, sendMessage, markMessageAsRead, markMessageDelivered } from '../services/messageService';
import {
    initializeSocket,
    joinChat,
    sendMessageSocket,
    onMessageReceived,
    onMessageStatusUpdate, 
    onUserOnline,
    onUserOffline,
    onUserTyping,
    onUserStoppedTyping,
    startTyping,
    stopTyping
} from '../socket/socket';
import type { Chat, Message } from '../types/chatInterface';
import { useUserStore } from '../../user/store/userStore';

interface ChatState {
    chats: Chat[];
    selectedChat: Chat | null;
    messages: Message[];
    loading: boolean;
    error: string | null;
    onlineUsers: Set<string>;
    typingUsers: Set<string>;
    fetchChats: () => Promise<void>;
    accessChat: (userId: string) => Promise<void>;
    fetchMessages: (chatId: string) => Promise<void>;
    sendMessage: (chatId: string, content: string, contentType?: 'text' | 'sticker' | 'gif') => Promise<void>;
    initializeSocket: (userId: string) => void;
    setTyping: (chatId: string, isTyping: boolean) => void;
    markMessageAsRead: (messageId: string, chatId: string) => Promise<void>;
    markMessageDelivered: (messageId: string, chatId: string) => Promise<void>; // New method
}

export const useChatStore = create<ChatState>((set, get) => ({
    chats: [],
    selectedChat: null,
    messages: [],
    loading: false,
    error: null,
    onlineUsers: new Set(),
    typingUsers: new Set(),

    fetchChats: async () => {
        set({ loading: true, error: null });
        try {
            const chats = await fetchChats();
            set({ chats, loading: false });
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Failed to fetch chats';
            set({ error: message, loading: false });
            throw error;
        }
    },

    accessChat: async (userId: string) => {
        set({ loading: true, error: null });
        try {
            const chat = await accessChat(userId);
            if (!chat || !chat._id) {
                throw new Error('Invalid chat data received');
            }
            console.log("Selected Chat after accessChat:", chat);
            set({ selectedChat: chat, loading: false });
            joinChat(chat._id);
            await get().fetchMessages(chat._id);
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Failed to access chat';
            set({ error: message, loading: false });
            throw error;
        }
    },

    fetchMessages: async (chatId: string) => {
        set({ loading: true, error: null });
        try {
            const messages = await fetchMessages(chatId);
            console.log('Fetched messages:', messages);
            set({ messages, loading: false });
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Failed to fetch messages';
            set({ error: message, loading: false });
            throw error;
        }
    },

    sendMessage: async (chatId: string, content: string, contentType: 'text' | 'sticker' | 'gif' = 'text') => {
        try {
            const user = useUserStore.getState().currentUser;
            if (!user?.id) throw new Error('User not authenticated');
            const message: Message = {
                chatId,
                content,
                contentType,
                senderId: user.id,
                sender: {
                    _id: user.id,
                    name: user.name,
                    email: user.email,
                    profilePicture: user.profilePicture
                },
                timestamp: new Date(),
                deliveredBy: [user.id], // Include deliveredBy for initial state
                readBy: [user.id], // Initially read by sender
                isRead: false,
                _id: '' // Backend will assign _id
            };
            const sentMessage = await sendMessage(message);
            console.log('Sent message:', sentMessage);
            sendMessageSocket(sentMessage);
            set((state) => {
                console.log("Adding sent message to chat:", chatId);
                return { messages: [...state.messages, sentMessage] };
            });
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Failed to send message';
            console.error('Failed to send message:', error);
            set({ error: message });
            throw error;
        }
    },

    initializeSocket: (userId: string) => {
        // console.log("Initializing socket for user:", userId);

        initializeSocket(userId);
        onMessageReceived((message) => {
            console.log("Message received in store:", message);
            const currentChat = get().selectedChat;
            console.log("Current chat:", currentChat);
            if (currentChat && message.chatId === currentChat._id) {
                set((state) => {
                    const isDuplicate = state.messages.some((msg) => msg._id === message._id);
                    if (!isDuplicate) {
                        console.log("Adding new message to chat:", currentChat._id);
                        return { messages: [...state.messages, message] };
                    }
                    console.log("Message already exists, skipping:", message._id);
                    return state;
                });
            } else {
                console.log("Message ignored: Chat not selected or mismatch");
            }
        });

        onUserOnline((onlineUserId: string) => {
            // console.log('User online:', onlineUserId);
            set((state) => ({
                onlineUsers: new Set([...state.onlineUsers, onlineUserId])
            }));
        });

        onMessageStatusUpdate((data) => { // Updated from onMessageRead
            // console.log("Message status update received:", data);
            const currentChat = get().selectedChat;
            if (currentChat && data.chatId === currentChat._id) {
                set((state) => {
                    const updatedMessages = state.messages.map((msg) =>
                        msg._id === data.messageId
                            ? {
                                ...msg,
                                deliveredBy: data.deliveredBy || msg.deliveredBy, // Update deliveredBy
                                readBy: data.readBy || msg.readBy, // Update readBy
                                isRead: data.isRead || msg.isRead // Update isRead
                            }
                            : msg
                    );
                    return { messages: updatedMessages } as Partial<ChatState>;
                });
            }
        });

        onUserOffline((offlineUserId: string) => {
            // console.log('User offline:', offlineUserId);
            set((state) => {
                const newOnlineUsers = new Set(state.onlineUsers);
                newOnlineUsers.delete(offlineUserId);
                return { onlineUsers: newOnlineUsers };
            });
        });

        onUserTyping(({ chatId, userId }) => {
            console.log('User typing in chat:', { chatId, userId });
            const currentChat = get().selectedChat;
            if (currentChat && currentChat._id === chatId) {
                set((state) => ({
                    typingUsers: new Set([...state.typingUsers, userId])
                }));
            }
        });

        onUserStoppedTyping(({ chatId, userId }) => {
            console.log('User stopped typing in chat:', { chatId, userId });
            const currentChat = get().selectedChat;
            if (currentChat && currentChat._id === chatId) {
                set((state) => {
                    const newTypingUsers = new Set(state.typingUsers);
                    newTypingUsers.delete(userId);
                    return { typingUsers: newTypingUsers };
                });
            }
        });
    },

    setTyping: (chatId: string, isTyping: boolean) => {
        const chat = get().selectedChat;
        if (!chat) return;
        const chatUsers = chat.users.map(user => user.id);
        console.log(`Setting typing for chat ${chatId}:`, isTyping);
        if (isTyping) {
            startTyping(chatId, chatUsers);
        } else {
            stopTyping(chatId, chatUsers);
        }
    },

    markMessageAsRead: async (messageId: string, chatId: string) => {
        try {
            const user = useUserStore.getState().currentUser;
            if (!user?.id) throw new Error('User not authenticated');
            console.log("Attempting to mark message as read:", { messageId, chatId, userId: user.id });

            await markMessageAsRead(messageId, chatId, user.id);
            console.log("Successfully marked message as read:", { messageId, chatId, userId: user.id });
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Failed to mark message as read';
            console.error('Failed to mark message as read:', error);
            set({ error: message });
            throw error;
        }
    },

    markMessageDelivered: async (messageId: string, chatId: string) => {
        try {
            const user = useUserStore.getState().currentUser;
            if (!user?.id) throw new Error('User not authenticated');
            console.log("Attempting to mark message as delivered:", { messageId, chatId, userId: user.id });

            await markMessageDelivered(messageId, chatId, user.id);
            console.log("Successfully marked message as delivered:", { messageId, chatId, userId: user.id });
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Failed to mark message as delivered';
            console.error('Failed to mark message as delivered:', error);
            set({ error: message });
            throw error;
        }
    }
}));