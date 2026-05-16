import { create } from 'zustand';
import api from '../lib/api';

export interface Materi {
  id: string;
  nama: string;
  pertemuanId: string;
  mataKuliahId: string;
  fileUrl?: string;
  videoUrl?: string;
  refleksi?: string;
  tipe?: 'VIDEO' | 'PDF' | 'LINK';
}

interface MateriState {
  materiList: Materi[];
  isLoading: boolean;
  fetchMateriByPertemuan: (pertemuanId: string) => Promise<void>;
  addMateri: (materi: Omit<Materi, 'id'>) => Promise<void>;
  updateMateri: (id: string, materi: Partial<Materi>) => Promise<void>;
  deleteMateri: (id: string) => Promise<void>;
}

export const useMateriStore = create<MateriState>((set) => ({
  materiList: [],
  isLoading: false,
  fetchMateriByPertemuan: async (pertemuanId) => {
    set({ isLoading: true });
    try {
      const response = await api.get(`/materi?pertemuanId=${pertemuanId}`);
      set({ materiList: response.data });
    } catch (error) {
      console.error('Failed to fetch materi', error);
    } finally {
      set({ isLoading: false });
    }
  },
  addMateri: async (materi) => {
    try {
      const response = await api.post('/materi', materi);
      set((state) => ({ materiList: [...state.materiList, response.data] }));
    } catch (error) {
      console.error('Failed to add materi', error);
    }
  },
  updateMateri: async (id, materi) => {
    try {
      const response = await api.put(`/materi/${id}`, materi);
      set((state) => ({
        materiList: state.materiList.map((m) => (m.id === id ? response.data : m)),
      }));
    } catch (error) {
      console.error('Failed to update materi', error);
    }
  },
  deleteMateri: async (id) => {
    try {
      await api.delete(`/materi/${id}`);
      set((state) => ({
        materiList: state.materiList.filter((m) => m.id !== id),
      }));
    } catch (error) {
      console.error('Failed to delete materi', error);
    }
  },
}));
