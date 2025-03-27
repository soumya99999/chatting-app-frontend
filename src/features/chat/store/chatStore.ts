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
            // console.log("Selected Chat after accessChat:", chat);
            set({ selectedChat: chat, loading: false, typingUsers: new Set() });
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
            
            // Get the recipient's ID from the selected chat
            const selectedChat = get().selectedChat;
            if (!selectedChat) throw new Error('No chat selected');
            
            const recipientId = selectedChat.users.find(u => u.id !== user.id)?.id;
            if (!recipientId) throw new Error('No recipient found');

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
            sendMessageSocket(sentMessage);

            // Update the message in the store
            set((state) => {
                const updatedMessages = [...state.messages, sentMessage];
                return { messages: updatedMessages };
            });

            // If recipient is online, mark message as delivered immediately
            if (get().onlineUsers.has(recipientId)) {
                try {
                    await markMessageDelivered(sentMessage._id, chatId, recipientId);
                } catch (error) {
                    console.error('Failed to mark message as delivered:', error);
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
                    const isDuplicate = state.messages.some((msg) => msg._id === message._id);
                    if (!isDuplicate) {
                        return { messages: [...state.messages, message] };
                    }
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
                                deliveredBy: data.deliveredBy || msg.deliveredBy,
                                readBy: data.readBy || msg.readBy,
                                isRead: data.isRead || msg.isRead
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
                                readBy: data.readBy || msg.readBy,
                                isRead: data.isRead || msg.isRead
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
                // When a user comes online, mark all their unread messages as delivered
                const updatedMessages = state.messages.map((msg) => {
                    if (msg.senderId === onlineUserId && !msg.deliveredBy.includes(onlineUserId)) {
                        return {
                            ...msg,
                            deliveredBy: [...msg.deliveredBy, onlineUserId]
                        };
                    }
                    return msg;
                });
                return { 
                    onlineUsers: newOnlineUsers,
                    messages: updatedMessages
                };
            });
        });

        onUserTyping(({ chatId, userId }) => {
            const currentChat = get().selectedChat;
            if (currentChat && currentChat._id === chatId) {
                set((state) => {
                    const newTypingUsers = new Set(state.typingUsers);
                    newTypingUsers.add(userId);
                    return { typingUsers: newTypingUsers };
                });
            }
        });

        onUserStoppedTyping(({ chatId, userId }) => {
            const currentChat = get().selectedChat;
            if (currentChat && currentChat._id === chatId) {
                set((state) => {
                    const newTypingUsers = new Set(state.typingUsers);
                    newTypingUsers.delete(userId);
                    return { typingUsers: newTypingUsers };
                });
            }
        });

        onUserOffline((offlineUserId: string) => {
            set((state) => {
                const newOnlineUsers = new Set(state.onlineUsers);
                newOnlineUsers.delete(offlineUserId);
                const newTypingUsers = new Set(state.typingUsers);
                newTypingUsers.delete(offlineUserId);
                return { 
                    onlineUsers: newOnlineUsers,
                    typingUsers: newTypingUsers
                };
            });
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
                                isRead: data.isRead || msg.isRead
                            }
                            : msg
                    );
                    return { messages: updatedMessages };
                });
            }
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
            const newTypingUsers = new Set(state.typingUsers);
            if (isTyping) {
                newTypingUsers.add(currentUser.id);
            } else {
                newTypingUsers.delete(currentUser.id);
            }
            return { typingUsers: newTypingUsers };
        });

        // console.log(`Setting typing for chat ${chatId}:`, isTyping);
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