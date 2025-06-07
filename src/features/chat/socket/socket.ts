// src/features/chat/socket/socket.ts
import io from "socket.io-client";
import type { Message } from "../types/chatInterface";
import { useChatStore } from "../store/chatStore";

// Use the same logic as apiConfig.ts for socket URL selection
const useLocal = false; // Set to true to use local URL, false to use hosted URL
const VITE_SOCKET_URL = import.meta.env.VITE_SOCKET_URL;
const VITE_LOCAL_SOCKET_URL = import.meta.env.VITE_LOCAL_SOCKET_URL;
const SOCKET_URL = useLocal ? VITE_LOCAL_SOCKET_URL : VITE_SOCKET_URL;

export const socket = io(SOCKET_URL, {
    withCredentials: true,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    autoConnect: true
});

// src/features/chat/socket/socket.ts
export const initializeSocket = (userId: string) => {
    try {
        socket.emit("setup", userId);
        socket.on("connect", () => {
            console.log("Socket connected to:", SOCKET_URL);
            // Join all existing chats for this user
            const currentChat = useChatStore.getState().selectedChat;
            if (currentChat) {
                joinChat(currentChat._id);
            }
        });
        socket.on("disconnect", () => console.log("Socket disconnected"));
        socket.on("connect_error", (error) => console.error("Socket connection error:", error));
    } catch (error) {
        console.error("Error initializing socket:", error);
    }
};

export const joinChat = (chatId: string) => {
    try {
        console.log("Joining chat with ID:", chatId);
        socket.emit("join chat", chatId);
    } catch (error) {
        console.error("Error joining chat:", error);
    }
};

export const sendMessageSocket = (message: Message) => {
    console.log("Sending message via socket:", message);

    try {
        socket.emit("new message", {
            ...message,
            timestamp: message.timestamp.toISOString(),
        });
        console.log("Message sent via socket:", message);
    } catch (error) {
        console.error("Error sending message via socket:", error);
    }
};

export const onMessageReceived = (callback: (message: Message) => void) => {
    console.log("Setting up message received listener");

    try {
        let lastProcessedMessageId: string | null = null;
        let lastProcessedTimestamp: number = 0;
        let processingMessage = false;

        socket.on("new message", (rawMessage: Message) => {
            const now = Date.now();
            
            // Prevent processing the same message ID within 1 second
            if (rawMessage._id === lastProcessedMessageId && (now - lastProcessedTimestamp) < 1000) {
                console.log("Duplicate message received, ignoring:", rawMessage._id);
                return;
            }

            // Prevent concurrent processing of the same message
            if (processingMessage) {
                console.log("Message processing in progress, ignoring:", rawMessage._id);
                return;
            }

            processingMessage = true;
            console.log("Raw message received via socket:", rawMessage);

            try {
                const message: Message = {
                    _id: rawMessage._id,
                    chatId: rawMessage.chatId,
                    senderId: rawMessage.senderId,
                    sender: {
                        _id: rawMessage.senderId,
                        name: rawMessage.sender.name || '',
                        email: rawMessage.sender.email || '',
                        profilePicture: rawMessage.sender.profilePicture
                    },
                    content: rawMessage.content,
                    contentType: rawMessage.contentType || 'text',
                    timestamp: new Date(rawMessage.timestamp),
                    deliveredBy: rawMessage.deliveredBy || [],
                    readBy: rawMessage.readBy || [],
                    isRead: rawMessage.isRead || false
                };

                lastProcessedMessageId = message._id;
                lastProcessedTimestamp = now;

                console.log("Message received via socket:", message);
                callback(message);
            } finally {
                processingMessage = false;
            }
        });
    } catch (error) {
        console.error("Error setting up message listener:", error);
    }
};

export const startTyping = (chatId: string, userId: string) => {
    try {
        socket.emit("typing", { chatId, userId });
        // console.log("Started typing in chat:", { chatId, userId });
    } catch (error) {
        console.error("Error emitting typing event:", error);
    }
};

export const stopTyping = (chatId: string, userId: string) => {
    try {
        socket.emit("stop typing", { chatId, userId });
        // console.log("Stopped typing in chat:", { chatId, userId });
    } catch (error) {
        console.error("Error emitting stop typing event:", error);
    }
};

export const onUserTyping = (callback: (data: { chatId: string; userId: string }) => void) => {
    try {
        socket.on("user typing", (data) => {
            // console.log("User typing event received:", data);
            callback(data);
        });
    } catch (error) {
        console.error("Error setting up user typing listener:", error);
    }
};

export const onUserStoppedTyping = (callback: (data: { chatId: string; userId: string }) => void) => {
    try {
        socket.on("user stopped typing", (data) => {
            // console.log("User stopped typing event received:", data);
            callback(data);
        });
    } catch (error) {
        console.error("Error setting up user stopped typing listener:", error);
    }
};

export const onUserOnline = (callback: (userId: string) => void) => {
    try {
        socket.on("user online", (userId) => {
            // console.log("User online event received:", userId);
            callback(userId);
        });
    } catch (error) {
        console.error("Error setting up user online listener:", error);
    }
};

export const onUserOffline = (callback: (userId: string) => void) => {
    try {
        socket.on("user offline", (userId) => {
            // console.log("User offline event received:", userId);
            callback(userId);
        });
    } catch (error) {
        console.error("Error setting up user offline listener:", error);
    }
};

export const markMessageRead = (messageId: string, chatId: string, userId: string) => {
    try {
        socket.emit("mark message read", { messageId, chatId, userId });
        // console.log("Marked message as read via socket:", { messageId, chatId, userId });
    } catch (error) {
        console.error("Error marking message as read via socket:", error);
    }
};

export const markMessageDelivered = (messageId: string, chatId: string, userId: string) => {
    try {
        socket.emit("mark message delivered", { messageId, chatId, userId });
        // console.log("Marked message as delivered via socket:", { messageId, chatId, userId });
    } catch (error) {
        console.error("Error marking message as delivered via socket:", error);
    }
};

export const onMessageStatusUpdate = (callback: (data: { messageId: string; chatId: string; userId: string; deliveredBy: string[]; readBy: string[]; isRead: boolean }) => void) => {
    try {
        let lastProcessedMessageId: string | null = null;
        let lastProcessedTimestamp: number = 0;

        socket.on("message status update", (data) => {
            const now = Date.now();
            // Prevent processing the same message ID within 1 second
            if (data.messageId === lastProcessedMessageId && (now - lastProcessedTimestamp) < 1000) {
                return;
            }

            console.log("Message status update received:", data);
            const { messageId, chatId, userId, deliveredBy = [], readBy = [], isRead = false } = data;
            
            lastProcessedMessageId = messageId;
            lastProcessedTimestamp = now;
            
            callback({ messageId, chatId, userId, deliveredBy, readBy, isRead });
        });
    } catch (error) {
        console.error("Error setting up message status update listener:", error);
    }
};

export const onMessageDelivered = (callback: (data: { messageId: string; chatId: string; userId: string; deliveredBy: string[]; readBy: string[]; isRead: boolean }) => void) => {
    try {
        let lastProcessedMessageId: string | null = null;
        let lastProcessedTimestamp: number = 0;

        socket.on("message delivered", (data) => {
            const now = Date.now();
            // Prevent processing the same message ID within 1 second
            if (data.messageId === lastProcessedMessageId && (now - lastProcessedTimestamp) < 1000) {
                return;
            }

            console.log("Message delivered event received:", data);
            const { messageId, chatId, userId, deliveredBy = [], readBy = [], isRead = false } = data;
            
            lastProcessedMessageId = messageId;
            lastProcessedTimestamp = now;
            
            callback({ messageId, chatId, userId, deliveredBy, readBy, isRead });
        });
    } catch (error) {
        console.error("Error setting up message delivered listener:", error);
    }
};

export const onMessageRead = (callback: (data: { messageId: string; chatId: string; userId: string; deliveredBy: string[]; readBy: string[]; isRead: boolean }) => void) => {
    try {
        socket.on("message read", (data) => {
            console.log("Message read event received:", data);
            const { messageId, chatId, userId, deliveredBy = [], readBy = [], isRead = false } = data;
            callback({ messageId, chatId, userId, deliveredBy, readBy, isRead });
        });
    } catch (error) {
        console.error("Error setting up message read listener:", error);
    }
};

export const cleanupSocket = () => {
    try {
        console.log("Cleaning up socket listeners...");
        socket.off("message received");
        socket.off("user online");
        socket.off("user offline");
        socket.off("user typing");
        socket.off("user stopped typing");
        socket.off("message read");
        socket.off("message status update");
        socket.off("message delivered");
        socket.disconnect();
    } catch (error) {
        console.error("Error cleaning up socket:", error);
    }
};