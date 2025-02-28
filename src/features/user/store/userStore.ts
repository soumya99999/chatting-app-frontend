import { create } from 'zustand';
import { fetchCurrentUser, searchUser, fetchUsers, logout } from '../services/userService';

export interface User {
  id: string;
  name: string;
  email: string;
  profilePicture?: string;
}

export interface UserState {
  currentUser: User | null;
  users: User[];
  searchResults: User[];
  loading: boolean;
  error: string | null;
  fetchCurrentUser: () => Promise<void>;
  searchUsers: (query: string) => Promise<void>;
  fetchAllUsers: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useUserStore = create<UserState>((set) => ({
  currentUser: null,
  users: [],
  searchResults: [],
  loading: false,
  error: null,

  fetchCurrentUser: async () => {
    set({ loading: true, error: null });
    try {
      const user = await fetchCurrentUser();
      set({ currentUser: user, loading: false });
    } catch (error) {
      set({ error: (error as Error).message || 'Failed to fetch current user', loading: false });
    }
  },

  searchUsers: async (query) => {
    set({ loading: true, error: null });
    try {
      const results = await searchUser(query);
      set({ searchResults: results, loading: false });
    } catch (error) {
      set({ error: (error as Error).message || 'Failed to search users', loading: false });
    }
  },

  fetchAllUsers: async () => {
    set({ loading: true, error: null });
    try {
      const users = await fetchUsers();
      set({ users, loading: false });
    } catch (error) {
      set({ error: (error as Error).message || 'Failed to fetch users', loading: false });
    }
  },

  logout: async () => {
    set({ loading: true, error: null });
    try {
      await logout();
      set({ currentUser: null, users: [], searchResults: [], loading: false }); // Reset state
    } catch (error) {
      set({ error: (error as Error).message || 'Failed to logout', loading: false });
    }
  },
}));
