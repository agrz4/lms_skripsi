import { create } from 'zustand';
import api from '../lib/api';

export interface Materi {
  id: string;
  nama: string;
  mataKuliahId: string;
  fileUrl?: string;
}

interface MateriState {
  isLoading: boolean;
  addMateri: (materi: Omit<Materi, 'id'>) => Promise<void>;
}

export const useMateriStore = create<MateriState>((set) => ({
  isLoading: false,
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
