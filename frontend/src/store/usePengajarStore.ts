import { create } from 'zustand';
import api from '../lib/api';

export interface Pengajar {
  id: string;
  nama: string;
  email: string;
  role: string;
  instansi?: string;
  pelatihan?: string;
  jadwal?: string;
  createdAt: string;
}

interface PengajarState {
  pengajarList: Pengajar[];
  isLoading: boolean;
  fetchPengajar: () => Promise<void>;
  addPengajar: (pengajar: any) => Promise<void>;
  removePengajar: (id: string) => Promise<void>;
  updatePengajar: (id: string, updatedData: any) => Promise<void>;
}

export const usePengajarStore = create<PengajarState>((set, get) => ({
  pengajarList: [],
  isLoading: false,
  fetchPengajar: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get('/users');
      set({ pengajarList: response.data });
    } catch (error) {
      console.error('Failed to fetch users', error);
    } finally {
      set({ isLoading: false });
    }
  },
  addPengajar: async (pengajar) => {
    try {
      const response = await api.post('/users', pengajar);
      set((state) => ({ pengajarList: [...state.pengajarList, response.data] }));
    } catch (error) {
      console.error('Failed to add user', error);
      throw error;
    }
  },
  removePengajar: async (id) => {
    try {
      await api.delete(`/users/${id}`);
      set((state) => ({
        pengajarList: state.pengajarList.filter((p) => p.id !== id)
      }));
    } catch (error) {
      console.error('Failed to delete user', error);
    }
  },
  updatePengajar: async (id, updatedData) => {
    try {
      const response = await api.put(`/users/${id}`, updatedData);
      set((state) => ({
        pengajarList: state.pengajarList.map((p) => p.id === id ? response.data : p)
      }));
    } catch (error) {
      console.error('Failed to update user', error);
    }
  },
}));
