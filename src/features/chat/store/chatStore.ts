// src/features/chat/store/chatStore.ts
import { create } from 'zustand';
import { fetchChats, accessChat } from '../services/chatService';
import { fetchMessages, sendMessage, markMessageAsRead, markMessageDelivered } from '../services/messageService';
import {
    initializeSocket,
    joinChat,
    onMessageReceived,
    onMessageStatusUpdate,
    onMessageDelivered,
    onMessageRead,
    onUserOnline,
    onUserOffline,
    onUserTyping,
    onUserStoppedTyping,
    startTyping,
    stopTyping
} from '../socket/socket';
import type { Chat, Message } from '../types/chatInterface';
import { useAuthStore } from '../../auth/store/authStore';

interface ChatState {
    chats: Chat[];
    selectedChat: Chat | null;
    messages: Message[];
    loading: boolean;
    error: string | null;
    onlineUsers: Set<string>;
    typingUsers: Map<string, Set<string>>;
    fetchChats: () => Promise<void>;
    accessChat: (userId: string, chatId?: string) => Promise<void>;
    fetchMessages: (chatId: string) => Promise<void>;
    sendMessage: (chatId: string, content: string, contentType?: 'text' | 'sticker' | 'gif') => Promise<void>;
    initializeSocket: (userId: string) => void;
    setTyping: (chatId: string, isTyping: boolean) => void;
    markMessageAsRead: (messageId: string, chatId: string) => Promise<void>;
    markMessageDelivered: (messageId: string, chatId: string) => Promise<void>;
}

export const useChatStore = create<ChatState>((set, get) => ({
    chats: [],
    selectedChat: null,
    messages: [],
    loading: false,
    error: null,
    onlineUsers: new Set(),
    typingUsers: new Map(),

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

    accessChat: async (userId: string, chatId?: string) => {
        set({ loading: true, error: null });
        try {
            const chat = await accessChat(userId, chatId);
            if (!chat || !chat._id) {
                throw new Error('Invalid chat data received');
            }
            set({ selectedChat: chat, loading: false, typingUsers: new Map() });
            joinChat(chat._id);
            await get().fetchMessages(chat._id);

            // Mark all unread messages as read when opening the chat
            const currentUser = useAuthStore.getState().user;
            if (currentUser?.id) {
                const unreadMessages = chat.messages.filter(
                    msg => msg.senderId !== currentUser.id && !msg.readBy.includes(currentUser.id)
                );

                // Mark each unread message as read
                for (const message of unreadMessages) {
                    try {
                        await markMessageAsRead(message._id, chat._id, currentUser.id);
                    } catch (error) {
                        console.error('Failed to mark message as read:', error);
                    }
                }
            }
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
            // console.log('Fetched messages:', messages);
            set({ messages, loading: false });
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Failed to fetch messages';
            set({ error: message, loading: false });
            throw error;
        }
    },

    sendMessage: async (chatId: string, content: string, contentType: 'text' | 'sticker' | 'gif' = 'text') => {
        try {
            const user = useAuthStore.getState().user;
            if (!user?.id) throw new Error('User not authenticated');
            
            const selectedChat = get().selectedChat;
            if (!selectedChat) throw new Error('No chat selected');
            
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
                deliveredBy: [user.id],
                readBy: [user.id],
                isRead: false,
                _id: ''
            };

            const sentMessage = await sendMessage(message);
            console.log("Message sent successfully:", sentMessage._id);

            // Update the message in the store
            set((state) => {
                const isDuplicate = state.messages.some(msg => msg._id === sentMessage._id);
                if (!isDuplicate) {
                    console.log("Adding sent message to store:", sentMessage._id);
                    return { messages: [...state.messages, sentMessage] };
                }
                console.log("Duplicate message ignored in store:", sentMessage._id);
                return state;
            });

            // Handle message delivery status
            if (selectedChat.isGroupChat) {
                // For group chats, mark as delivered to all online members
                const onlineMembers = selectedChat.users
                    .filter(u => u.id !== user.id && get().onlineUsers.has(u.id))
                    .map(u => u.id);
                
                if (onlineMembers.length > 0) {
                    try {
                        await markMessageDelivered(sentMessage._id, chatId, user.id);
                    } catch (error) {
                        console.error('Failed to mark message as delivered:', error);
                    }
                }
            } else {
                // For one-to-one chat, mark as delivered if recipient is online
                const recipientId = selectedChat.users.find(u => u.id !== user.id)?.id;
                if (recipientId && get().onlineUsers.has(recipientId)) {
                    try {
                        await markMessageDelivered(sentMessage._id, chatId, recipientId);
                    } catch (error) {
                        console.error('Failed to mark message as delivered:', error);
                    }
                }
            }

        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Failed to send message';
            console.error('Failed to send message:', error);
            set({ error: message });
            throw error;
        }
    },

    initializeSocket: (userId: string) => {
        initializeSocket(userId);
        
        onMessageReceived((message) => {
            const currentChat = get().selectedChat;
            if (currentChat && message.chatId === currentChat._id) {
                set((state) => {
                    // Check if message already exists in the store
                    const isDuplicate = state.messages.some((msg) => msg._id === message._id);
                    if (!isDuplicate) {
                        console.log("Adding received message to store:", message._id);
                        return { messages: [...state.messages, message] };
                    }
                    console.log("Duplicate message ignored in store:", message._id);
                    return state;
                });
            }
        });

        onMessageDelivered((data) => {
            const currentChat = get().selectedChat;
            if (currentChat && data.chatId === currentChat._id) {
                set((state) => {
                    const updatedMessages = state.messages.map((msg) =>
                        msg._id === data.messageId
                            ? {
                                ...msg,
                                deliveredBy: [...new Set([...msg.deliveredBy, ...(data.deliveredBy || [])])],
                                readBy: data.readBy || msg.readBy,
                                isRead: data.isRead
                            }
                            : msg
                    );
                    return { messages: updatedMessages };
                });
            }
        });

        onMessageRead((data) => {
            const currentChat = get().selectedChat;
            if (currentChat && data.chatId === currentChat._id) {
                set((state) => {
                    const updatedMessages = state.messages.map((msg) =>
                        msg._id === data.messageId
                            ? {
                                ...msg,
                                deliveredBy: data.deliveredBy || msg.deliveredBy,
                                readBy: [...new Set([...msg.readBy, ...(data.readBy || [])])],
                                isRead: data.isRead
                            }
                            : msg
                    );
                    return { messages: updatedMessages };
                });
            }
        });

        onMessageStatusUpdate((data) => {
            const currentChat = get().selectedChat;
            if (currentChat && data.chatId === currentChat._id) {
                set((state) => {
                    const updatedMessages = state.messages.map((msg) =>
                        msg._id === data.messageId
                            ? {
                                ...msg,
                                deliveredBy: data.deliveredBy || msg.deliveredBy,
                                readBy: data.readBy || msg.readBy,
                                isRead: data.isRead
                            }
                            : msg
                    );
                    return { messages: updatedMessages };
                });
            }
        });

        onUserOnline((onlineUserId: string) => {
            set((state) => {
                const newOnlineUsers = new Set([...state.onlineUsers, onlineUserId]);
                return { onlineUsers: newOnlineUsers };
            });
        });

        onUserTyping(({ chatId, userId }) => {
            set((state) => {
                const newTypingUsers = new Map(state.typingUsers);
                if (!newTypingUsers.has(chatId)) {
                    newTypingUsers.set(chatId, new Set());
                }
                const chatTypingUsers = newTypingUsers.get(chatId);
                if (chatTypingUsers) {
                    chatTypingUsers.add(userId);
                }
                return { typingUsers: newTypingUsers };
            });
        });

        onUserStoppedTyping(({ chatId, userId }) => {
            set((state) => {
                const newTypingUsers = new Map(state.typingUsers);
                const chatTypingUsers = newTypingUsers.get(chatId);
                if (chatTypingUsers) {
                    chatTypingUsers.delete(userId);
                    if (chatTypingUsers.size === 0) {
                        newTypingUsers.delete(chatId);
                    }
                }
                return { typingUsers: newTypingUsers };
            });
        });

        onUserOffline((offlineUserId: string) => {
            set((state) => {
                const newOnlineUsers = new Set(state.onlineUsers);
                newOnlineUsers.delete(offlineUserId);
                const newTypingUsers = new Map(state.typingUsers);
                newTypingUsers.forEach((users) => {
                    users.delete(offlineUserId);
                });
                return { 
                    onlineUsers: newOnlineUsers,
                    typingUsers: newTypingUsers
                };
            });
        });
    },

    setTyping: (chatId: string, isTyping: boolean) => {
        const chat = get().selectedChat;
        if (!chat) return;
        const currentUser = useAuthStore.getState().user;
        if (!currentUser?.id) {
            console.error('No current user found when setting typing status');
            return;
        }

        set((state) => {
            const newTypingUsers = new Map(state.typingUsers);
            if (!newTypingUsers.has(chatId)) {
                newTypingUsers.set(chatId, new Set());
            }
            if (isTyping) {
                newTypingUsers.get(chatId)?.add(currentUser.id);
            } else {
                newTypingUsers.get(chatId)?.delete(currentUser.id);
            }
            return { typingUsers: newTypingUsers };
        });

        if (isTyping) {
            startTyping(chatId, currentUser.id);
        } else {
            stopTyping(chatId, currentUser.id);
        }
    },

    markMessageAsRead: async (messageId: string, chatId: string) => {
        try {
            const user = useAuthStore.getState().user;
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
            const user = useAuthStore.getState().user;
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