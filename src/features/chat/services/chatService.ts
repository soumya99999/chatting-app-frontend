// src/features/chat/services/chatService.ts
import axios from 'axios';
import type { Chat, RawUser, RawMessage, RawChat } from '../types/chatInterface';

const API_BASE_URL = 'http://localhost:8081/api/chats';

export const fetchChats = async (): Promise<Chat[]> => {
    try {
        const response = await axios.get(`${API_BASE_URL}/fetch-chats`, { withCredentials: true });
        // console.log('fetchChats response.data:', response.data);
        const chats = response.data.chats || response.data; // Handle both possible response structures
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
                chatId: m.chat._id, // Extract _id from chat object
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
                    chatId: chat.latestMessage.chat._id, // Extract _id from chat object
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
                    isRead: chat.latestMessage.isRead || false
                }
                : undefined,
            createdAt: new Date(chat.createdAt),
            updatedAt: new Date(chat.updatedAt)
        }));
    } catch (error) {
        console.error('Error fetching chats:', error);
        throw error;
    }
};

export const accessChat = async (userId: string): Promise<Chat> => {
    try {
        // console.log('Attempting to access chat with userId:', userId);
        const response = await axios.post(
            `${API_BASE_URL}/access-chat`,
            { userId },
            { withCredentials: true }
        );
        // console.log('accessChat API Response:', response.data);
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
                chatId: m.chat._id, // Extract _id from chat object
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
                    chatId: chat.latestMessage.chat._id, // Extract _id from chat object
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
                    isRead: chat.latestMessage.isRead || false
                }
                : undefined,
            createdAt: new Date(chat.createdAt),
            updatedAt: new Date(chat.updatedAt)
        };
    } catch (error) {
        console.error('Error accessing chat:', error);
        throw error;
    }
};