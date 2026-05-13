import { create } from 'zustand';
import api from '../lib/api';

export interface Pendaftaran {
  id: string;
  userId: string;
  mataKuliahId: string;
  createdAt: string;
  mataKuliah?: any;
}

interface PendaftaranState {
  pendaftaranList: Pendaftaran[];
  isLoading: boolean;
  fetchMyPendaftaran: () => Promise<void>;
  enrollKursus: (mataKuliahId: string) => Promise<void>;
}

export const usePendaftaranStore = create<PendaftaranState>((set) => ({
  pendaftaranList: [],
  isLoading: false,
  fetchMyPendaftaran: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get('/pendaftaran/my');
      set({ pendaftaranList: response.data });
    } catch (error) {
      console.error('Failed to fetch pendaftaran', error);
    } finally {
      set({ isLoading: false });
    }
  },
  enrollKursus: async (mataKuliahId) => {
    set({ isLoading: true });
    try {
      const response = await api.post('/pendaftaran', { mataKuliahId });
      set((state) => ({ pendaftaranList: [...state.pendaftaranList, response.data] }));
    } catch (error) {
      console.error('Failed to enroll kursus', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
}));
