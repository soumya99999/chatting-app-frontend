// src/features/user/store/userStore.ts
import { create } from 'zustand';
import {  searchUser, fetchUsers } from '../services/userService';
import { authService } from '../../auth/services/authService';

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
  loadingCurrentUser: boolean;
  loadingUsers: boolean;
  loadingSearch: boolean;
  error: string | null;
  fetchCurrentUser: () => Promise<void>;
  searchUsers: (query: string) => Promise<void>;
  fetchAllUsers: () => Promise<void>;
  clearError: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  currentUser: null,
  users: [],
  searchResults: [],
  loadingCurrentUser: false,
  loadingUsers: false,
  loadingSearch: false,
  error: null,

  fetchCurrentUser: async () => {
    set({ loadingCurrentUser: true, error: null });
    try {
      const user = await authService.fetchCurrentUser();
      set({ currentUser: user, loadingCurrentUser: false });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to fetch current user';
      set({ error: message, loadingCurrentUser: false });
    }
  },

  searchUsers: async (query) => {
    set({ loadingSearch: true, error: null });
    try {
      const results = await searchUser(query);
      set({ searchResults: results, loadingSearch: false });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to search users';
      set({ error: message, loadingSearch: false });
    }
  },

  fetchAllUsers: async () => {
    set({ loadingUsers: true, error: null });
    try {
      const users = await fetchUsers();
      set({ users, loadingUsers: false });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to fetch users';
      set({ error: message, loadingUsers: false });
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));