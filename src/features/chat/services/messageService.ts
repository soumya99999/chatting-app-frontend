// src/features/chat/services/messageService.ts
import axios from "axios";
import type { Message, RawMessage } from "../types/chatInterface";
import { socket } from "../socket/socket";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8081";

// fetchMessages
export const fetchMessages = async (chatId: string): Promise<Message[]> => {
    try {
        const response = await axios.get(`${API_BASE_URL}/api/messages/${chatId}/history`, {
            withCredentials: true,
        });
        const messagesArray = Array.isArray(response.data) 
            ? response.data 
            : (response.data.messages || []);

        return messagesArray.map((msg: RawMessage) => {
            const senderId = msg.sender._id;
            return {
                _id: msg._id,
                chatId: msg.chat._id, // Extract _id from chat object
                senderId: senderId,
                sender: {
                    _id: senderId,
                    name: msg.sender.name,
                    email: msg.sender.email,
                    profilePicture: msg.sender.profilePicture
                },
                content: msg.content,
                contentType: msg.contentType || 'text',
                timestamp: new Date(msg.createdAt),
                deliveredBy: msg.deliveredBy || [], // Include deliveredBy
                readBy: msg.readBy || [],
                isRead: msg.isRead || false
            };
        });
    } catch (error) {
        console.error("Error fetching messages:", error);
        throw new Error("Failed to fetch messages. Please try again.");
    }
};

export const sendMessage = async (messageData: Message): Promise<Message> => {
    console.log("Sending message data:", messageData);
    try {
        const response = await axios.post(`${API_BASE_URL}/api/messages/messages`, {
            chatId: messageData.chatId,
            content: messageData.content,
            contentType: messageData.contentType,
            senderId: messageData.senderId,
            timestamp: messageData.timestamp.toISOString(),
            deliveredBy: messageData.deliveredBy, // Include deliveredBy
            readBy: messageData.readBy,
            isRead: messageData.isRead
        }, {
            withCredentials: true,
        });
        const senderId = response.data.sender?._id || response.data.sender?.id;
        return {
            _id: response.data._id,
            chatId: response.data.chat._id || response.data.chatId, // Handle both cases
            senderId: senderId,
            sender: {
                _id: senderId,
                name: response.data.sender?.name,
                email: response.data.sender?.email,
                profilePicture: response.data.sender?.profilePicture
            },
            content: response.data.content,
            contentType: response.data.contentType,
            timestamp: new Date(response.data.createdAt || response.data.timestamp),
            deliveredBy: response.data.deliveredBy || [senderId], // Include deliveredBy
            readBy: response.data.readBy || [senderId],
            isRead: response.data.isRead || false
        };
    } catch (error) {
        console.error("Error sending message:", error);
        throw new Error("Failed to send message. Please try again.");
    }
};

export const markMessageAsRead = async (messageId: string, chatId: string, userId: string): Promise<void> => {
    console.log("Marking message as read:", { messageId, chatId, userId });

    try {
        const response = await axios.put(`${API_BASE_URL}/api/messages/${messageId}/read`, { chatId, userId }, {
            withCredentials: true,
        });
        console.log("Message marked as read successfully:", { messageId, chatId, userId });

        // Emit socket event for message read status
        socket.emit('mark message read', {
            messageId,
            chatId,
            userId,
            deliveredBy: response.data.updatedMessage.deliveredBy,
            readBy: response.data.updatedMessage.readBy,
            isRead: response.data.updatedMessage.isRead
        });
    } catch (error) {
        console.error("Error marking message as read:", error);
        throw new Error("Failed to mark message as read. Please try again.");
    }
};

export const markMessageDelivered = async (messageId: string, chatId: string, userId: string): Promise<void> => {
    console.log("message id = ",messageId,"chat Id = ",chatId);
    try {
        const response = await axios.put(`${API_BASE_URL}/api/messages/${messageId}/delivered`, {
            chatId,
            userId
        }, {
            withCredentials: true,
        });
        console.log("Message Delivered Successfully", response.data);
        
        // Emit socket event for message delivered status
        socket.emit('mark message delivered', {
            messageId,
            chatId,
            userId,
            deliveredBy: response.data.updatedMessage.deliveredBy,
            readBy: response.data.updatedMessage.readBy,
            isRead: response.data.updatedMessage.isRead
        });
    } catch (error) {
        console.error("Error marking message as delivered:", error);
        throw new Error("Failed to mark message as delivered");
    }
};