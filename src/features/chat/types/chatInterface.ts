// src/features/chat/types/chatInterface.ts
import { User } from '../../user/store/userStore';

export interface RawUser {
    _id: string;
    name: string;
    email: string;
    profilePicture?: string;
}

export interface RawMessage {
    _id: string;
    chat: {
        _id: string;
        users: RawUser[];
    }; // Backend-populated chat object
    sender: RawUser; // Backend-populated sender object
    content: string;
    contentType: 'text' | 'sticker' | 'gif';
    readBy: string[];
    isRead: boolean;
    deliveredBy:string[];
    createdAt: string;
    updatedAt: string;  
    chatId: string;
    senderId: string;
}

export interface Message {
    _id: string ;
    chatId: string; 
    senderId: string; 
    sender: {
        _id: string;
        name: string;
        email: string;
        profilePicture?: string;
    };
    content: string;
    contentType: 'text' | 'sticker' | 'gif';
    deliveredBy: string[];
    timestamp: Date;
    readBy: string[];
    isRead: boolean;
}

export interface RawChat {
    _id: string;
    chatName?: string;
    isGroupChat: boolean;
    users: RawUser[];
    messages: RawMessage[];
    latestMessage?: RawMessage;
    createdAt: string;
    updatedAt: string;
}

export interface Chat {
    _id: string;
    chatName?: string;
    isGroupChat: boolean;
    users: User[];
    messages: Message[];
    lastMessage?: Message;
    createdAt: Date;
    updatedAt: Date;
}

export interface ChatState {
    chats: Chat[];
    selectedChat: Chat | null;
    messages: Message[];
    loading: boolean;
    error: string | null;
    onlineUsers: Set<string>;
    typingUsers: Set<string>;
}