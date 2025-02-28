import axios from 'axios';
import { User } from '../store/userStore';

const API_BASE_URL = 'http://localhost:8081/api/users';
const LOGOUT_URL = 'http://localhost:8081/api/auth/logout';

export const fetchCurrentUser = async (): Promise<User> => {
    try {
        const response = await axios.get(`${API_BASE_URL}/current-user`, {
            withCredentials: true,
        });
        //   console.log('Current user:', response.data.user);
        return response.data.user; // No mapping needed
    } catch (error) {
        console.error('Error fetching current user:', error);
        throw error;
    }
};

export const searchUser = async (query: string): Promise<User[]> => {
    try {
        const response = await axios.get(`${API_BASE_URL}/search`, {
            params: { q: query },
            withCredentials: true,
        });
        return response.data.users; // No mapping needed
    } catch (error) {
        console.error('Error searching users:', error);
        throw error;
    }
};

export const fetchUsers = async (): Promise<User[]> => {
    try {
        const response = await axios.get(`${API_BASE_URL}/fetch-users`, {
            withCredentials: true,
        });
        return response.data.users; // No mapping needed
    } catch (error) {
        console.error('Error fetching users:', error);
        throw error;
    }
};

export const logout = async () => {
    try {
        await axios.post(LOGOUT_URL, {}, { withCredentials: true });
    } catch (error) {
        console.error('Error logging out:', error);
        throw error;
    }
};