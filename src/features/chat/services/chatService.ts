// src/features/chat/services/chatService.ts
import axios, { AxiosError } from 'axios';
import type { Chat, RawUser, RawMessage, RawChat } from '../types/chatInterface';

const API_BASE_URL = 'http://localhost:8081/api/chats';

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const fetchChats = async (): Promise<Chat[]> => {
    try {
        console.log('Fetching chats...');
        const response = await axiosInstance.get('/fetch-chats');
        console.log('Chats response:', response.data);
        
        const chats = response.data.chats || response.data;
        return chats.map((chat: RawChat) => ({
            _id: chat._id,
            chatName: chat.chatName,
            isGroupChat: chat.isGroupChat || false,
            users: Array.isArray(chat.users) ? chat.users.map((u: RawUser) => ({
                id: u._id,
                name: u.name,
                email: u.email,
                profilePicture: u.profilePicture
            })) : [],
            messages: Array.isArray(chat.messages) ? chat.messages.map((m: RawMessage) => ({
                _id: m._id,
                chatId: m.chat._id,
                senderId: m.sender._id,
                sender: {
                    _id: m.sender._id,
                    name: m.sender.name,
                    email: m.sender.email,
                    profilePicture: m.sender.profilePicture
                },
                content: m.content,
                contentType: m.contentType || 'text',
                timestamp: new Date(m.createdAt),
                readBy: m.readBy || [],
                isRead: m.isRead || false
            })) : [],
            lastMessage: chat.latestMessage
                ? {
                    _id: chat.latestMessage._id,
                    chatId: chat.latestMessage.chat._id,
                    senderId: chat.latestMessage.sender._id,
                    sender: {
                        _id: chat.latestMessage.sender._id,
                        name: chat.latestMessage.sender.name,
                        email: chat.latestMessage.sender.email,
                        profilePicture: chat.latestMessage.sender.profilePicture
                    },
                    content: chat.latestMessage.content,
                    contentType: chat.latestMessage.contentType || 'text',
                    timestamp: new Date(chat.latestMessage.createdAt),
                    readBy: chat.latestMessage.readBy || [],
                    deliveredBy: chat.latestMessage.deliveredBy || [],
                    isRead: chat.latestMessage.isRead || false
                }
                : undefined,
            createdAt: new Date(chat.createdAt),
            updatedAt: new Date(chat.updatedAt)
        }));
    } catch (error: unknown) {
        if (error instanceof AxiosError) {
            console.error('Fetch chats error details:', {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message,
                code: error.code
            });
            if (error.response?.status === 401) {
                throw new Error('Authentication failed. Please login again.');
            }
            throw new Error(error.response?.data?.message || 'Failed to fetch chats');
        }
        throw new Error('Failed to fetch chats');
    }
};

export const accessChat = async (userId: string, chatId?: string): Promise<Chat> => {
    try {
        console.log('Accessing chat with userId:', userId, 'chatId:', chatId);
        const response = await axiosInstance.post('/access-chat', { userId, chatId });
        console.log('Access chat response:', response.data);
        
        const chat: RawChat = response.data;
        if (!chat || !chat._id) {
            throw new Error('Invalid or missing chat data in response');
        }
        return {
            _id: chat._id,
            chatName: chat.chatName,
            isGroupChat: chat.isGroupChat || false,
            users: Array.isArray(chat.users) ? chat.users.map((u: RawUser) => ({
                id: u._id,
                name: u.name,
                email: u.email,
                profilePicture: u.profilePicture
            })) : [],
            messages: Array.isArray(chat.messages) ? chat.messages.map((m: RawMessage) => ({
                _id: m._id,
                chatId: m.chat._id,
                senderId: m.sender._id,
                sender: {
                    _id: m.sender._id,
                    name: m.sender.name,
                    email: m.sender.email,
                    profilePicture: m.sender.profilePicture
                },
                content: m.content,
                contentType: m.contentType || 'text',
                timestamp: new Date(m.createdAt),
                readBy: m.readBy || [],
                deliveredBy: m.deliveredBy || [],
                isRead: m.isRead || false
            })) : [],
            lastMessage: chat.latestMessage
                ? {
                    _id: chat.latestMessage._id,
                    chatId: chat.latestMessage.chat._id,
                    senderId: chat.latestMessage.sender._id,
                    sender: {
                        _id: chat.latestMessage.sender._id,
                        name: chat.latestMessage.sender.name,
                        email: chat.latestMessage.sender.email,
                        profilePicture: chat.latestMessage.sender.profilePicture
                    },
                    content: chat.latestMessage.content,
                    contentType: chat.latestMessage.contentType || 'text',
                    timestamp: new Date(chat.latestMessage.createdAt),
                    readBy: chat.latestMessage.readBy || [],
                    deliveredBy: chat.latestMessage.deliveredBy || [],
                    isRead: chat.latestMessage.isRead || false
                }
                : undefined,
            createdAt: new Date(chat.createdAt),
            updatedAt: new Date(chat.updatedAt)
        };
    } catch (error: unknown) {
        if (error instanceof AxiosError) {
            console.error('Access chat error details:', {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message,
                code: error.code
            });
            if (error.response?.status === 401) {
                throw new Error('Authentication failed. Please login again.');
            }
            throw new Error(error.response?.data?.message || 'Failed to access chat');
        }
        throw new Error('Failed to access chat');
    }
};