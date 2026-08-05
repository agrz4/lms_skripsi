import { create } from 'zustand';
import api from '../lib/api';

interface User {
  id: string;
  nama: string;
  email: string;
  role: string;
  instansi?: string;
  pelatihan?: string;
  noWhatsapp?: string;
}

interface UpdateProfileData {
  nama?: string;
  email?: string;
  instansi?: string;
  noWhatsapp?: string;
  passwordLama?: string;
  passwordBaru?: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  fetchMe: () => Promise<void>;
  updateProfile: (data: UpdateProfileData) => Promise<{ success: boolean; message: string }>;
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
  updateProfile: async (data: UpdateProfileData) => {
    set({ loading: true });
    try {
      const response = await api.put('/auth/profile', data);
      const updatedUser = response.data.user;
      set((state) => ({
        user: state.user ? { ...state.user, ...updatedUser } : null,
        loading: false
      }));
      return { success: true, message: response.data.message || 'Profile berhasil diperbarui' };
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      set({ loading: false });
      return { 
        success: false, 
        message: error.response?.data?.message || 'Gagal memperbarui profile. Silakan coba lagi.' 
      };
    }
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    set({ user: null });
    window.location.href = '/login';
  }
}));
