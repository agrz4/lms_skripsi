import { create } from 'zustand';
import api from '../lib/api';

export interface Materi {
  id: string;
  nama: string;
  mataKuliahId: string;
  fileUrl?: string;
}

interface MateriState {
  materiList: Materi[];
  isLoading: boolean;
  fetchMateri: (mataKuliahId?: string) => Promise<void>;
  addMateri: (materi: Omit<Materi, 'id'>) => Promise<void>;
}

export const useMateriStore = create<MateriState>((set) => ({
  materiList: [],
  isLoading: false,
  fetchMateri: async (mataKuliahId) => {
    set({ isLoading: true });
    try {
      const url = mataKuliahId ? `/materi?mataKuliahId=${mataKuliahId}` : '/materi';
      const response = await api.get(url);
      set({ materiList: response.data });
    } catch (error) {
      console.error('Failed to fetch materi', error);
    } finally {
      set({ isLoading: false });
    }
  },
  addMateri: async (materi) => {
    set({ isLoading: true });
    try {
      await api.post('/materi', materi);
    } catch (error) {
      console.error('Failed to add materi', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
}));
