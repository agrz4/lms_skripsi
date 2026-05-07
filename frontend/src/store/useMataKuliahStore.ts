import { create } from 'zustand';
import api from '../lib/api';

export interface MataKuliah {
  id: string;
  nama: string;
  kode: string;
  createdAt: string;
}

interface MataKuliahState {
  mataKuliahList: MataKuliah[];
  isLoading: boolean;
  fetchMataKuliah: () => Promise<void>;
  addMataKuliah: (mk: Omit<MataKuliah, 'id' | 'createdAt'>) => Promise<void>;
  removeMataKuliah: (id: string) => Promise<void>;
  updateMataKuliah: (id: string, updatedData: Partial<MataKuliah>) => Promise<void>;
}

export const useMataKuliahStore = create<MataKuliahState>((set) => ({
  mataKuliahList: [],
  isLoading: false,
  fetchMataKuliah: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get('/matakuliah');
      set({ mataKuliahList: response.data });
    } catch (error) {
      console.error('Failed to fetch mata kuliah', error);
    } finally {
      set({ isLoading: false });
    }
  },
  addMataKuliah: async (mk) => {
    try {
      const response = await api.post('/matakuliah', mk);
      set((state) => ({ mataKuliahList: [...state.mataKuliahList, response.data] }));
    } catch (error) {
      console.error('Failed to add mata kuliah', error);
    }
  },
  removeMataKuliah: async (id) => {
    try {
      await api.delete(`/matakuliah/${id}`);
      set((state) => ({
        mataKuliahList: state.mataKuliahList.filter((mk) => mk.id !== id)
      }));
    } catch (error) {
      console.error('Failed to delete mata kuliah', error);
    }
  },
  updateMataKuliah: async (id, updatedData) => {
    try {
      const response = await api.put(`/matakuliah/${id}`, updatedData);
      set((state) => ({
        mataKuliahList: state.mataKuliahList.map((mk) => mk.id === id ? response.data : mk)
      }));
    } catch (error) {
      console.error('Failed to update mata kuliah', error);
    }
  },
}));
