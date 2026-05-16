import { create } from 'zustand';
import api from '../lib/api';

interface User {
  id: string;
  nama: string;
  email: string;
  role: string;
  instansi?: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  fetchMe: () => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: false,
  fetchMe: async () => {
    set({ loading: true });
    try {
      const response = await api.get('/auth/me');
      set({ user: response.data, loading: false });
    } catch (error) {
      console.error('Failed to fetch user:', error);
      set({ user: null, loading: false });
      // If unauthorized, could handle redirect to login here
    }
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    set({ user: null });
    window.location.href = '/login';
  }
}));
