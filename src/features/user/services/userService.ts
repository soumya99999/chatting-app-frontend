// src/features/user/services/userService.ts
import axios, { AxiosError } from 'axios';
import { User } from '../store/userStore';

const API_BASE_URL = 'http://localhost:8081/api/users';

export const searchUser = async (query: string): Promise<User[]> => {
    try {
        const response = await axios.get(`${API_BASE_URL}/search`, {
            params: { q: query },
            withCredentials: true,
        });
        return response.data.users;
    } catch (error: unknown) {
        if (error instanceof AxiosError) {
            const message = error.response?.data?.message || 'Failed to search users';
            console.error('Error searching users:', message);
            throw new Error(message);
        }
        throw new Error('Failed to search users');
    }
};

export const fetchUsers = async (): Promise<User[]> => {
    try {
        const response = await axios.get(`${API_BASE_URL}/fetch-users`, {
            withCredentials: true,
        });
        return response.data.users;
    } catch (error: unknown) {
        if (error instanceof AxiosError) {
            const message = error.response?.data?.message || 'Failed to fetch users';
            console.error('Error fetching users:', message);
            throw new Error(message);
        }
        throw new Error('Failed to fetch users');
    }
};