import axios from 'axios';
import { Chat } from '../types/chatInterface';

const API_URL = 'http://localhost:8081/api/chats';


// Create a group chat
export const createGroupChat = async (
    users: string[],
    name: string
): Promise<Chat> => {
    try {
        const response = await axios.post(
            `${API_URL}/group`,
            { users: JSON.stringify(users), name },
            { withCredentials: true }
        );
        return response.data;
    } catch (error) {
        console.error('Error creating group chat:', error);
        throw error;
    }
};
// Update group information
export const updateGroupInfo = async (
    chatId: string,
    data: {
        chatName?: string;
        groupIcon?: string;
        description?: string;
    }
): Promise<Chat> => {
    try {
        const response = await axios.put(`${API_URL}/group/${chatId}/info`, data, {
            withCredentials: true,
        });
        return response.data;
    } catch (error) {
        console.error('Error updating group info:', error);
        throw error;
    }
};

// Add members to group
export const addMembers = async (
    chatId: string,
    userIds: string[]
): Promise<Chat> => {
    try {
        const response = await axios.put(
            `${API_URL}/group/${chatId}/add-members`,
            { userIds },
            { withCredentials: true }
        );
        return response.data;
    } catch (error) {
        console.error('Error adding members:', error);
        throw error;
    }
};

// Remove members from group
export const removeMembers = async (
    chatId: string,
    userIds: string[]
): Promise<Chat> => {
    try {
        const response = await axios.put(
            `${API_URL}/group/${chatId}/remove-members`,
            { userIds },
            { withCredentials: true }
        );
        return response.data;
    } catch (error) {
        console.error('Error removing members:', error);
        throw error;
    }
};

// Leave group
export const leaveGroup = async (chatId: string): Promise<Chat> => {
    try {
        const response = await axios.post(
            `${API_URL}/group/${chatId}/leave`,
            {},
            { withCredentials: true }
        );
        return response.data;
    } catch (error) {
        console.error('Error leaving group:', error);
        throw error;
    }
};

// Transfer group ownership
export const transferOwnership = async (
    chatId: string,
    newAdminId: string
): Promise<Chat> => {
    try {
        const response = await axios.put(
            `${API_URL}/group/${chatId}/transfer-ownership`,
            { newAdminId },
            { withCredentials: true }
        );
        return response.data;
    } catch (error) {
        console.error('Error transferring ownership:', error);
        throw error;
    }
};

// Promote member to admin
export const promoteToAdmin = async (
    chatId: string,
    userId: string
): Promise<Chat> => {
    try {
        const response = await axios.put(
            `${API_URL}/group/${chatId}/promote-admin`,
            { userId },
            { withCredentials: true }
        );
        return response.data;
    } catch (error) {
        console.error('Error promoting to admin:', error);
        throw error;
    }
};

// Mute user in group
export const muteUser = async (
    chatId: string,
    userId: string
): Promise<Chat> => {
    try {
        const response = await axios.put(
            `${API_URL}/group/${chatId}/mute-user`,
            { userId },
            { withCredentials: true }
        );
        return response.data;
    } catch (error) {
        console.error('Error muting user:', error);
        throw error;
    }
};

// Unmute user in group
export const unmuteUser = async (
    chatId: string,
    userId: string
): Promise<Chat> => {
    try {
        const response = await axios.put(
            `${API_URL}/group/${chatId}/unmute-user`,
            { userId },
            { withCredentials: true }
        );
        return response.data;
    } catch (error) {
        console.error('Error unmuting user:', error);
        throw error;
    }
};

// Delete group
export const deleteGroup = async (chatId: string): Promise<void> => {
    try {
        await axios.delete(`${API_URL}/group/${chatId}`, {
            withCredentials: true,
        });
    } catch (error) {
        console.error('Error deleting group:', error);
        throw error;
    }
};

// Fetch all groups
export const fetchGroups = async (): Promise<Chat[]> => {
    try {
        const response = await axios.get(`${API_URL}/group`, {
            withCredentials: true,
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching groups:', error);
        throw error;
    }
}; 