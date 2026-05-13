import { create } from 'zustand';
import api from '../lib/api';

export interface Jadwal {
  id: string;
  mataKuliahId: string;
  hari: string[];
  tglMulai: string;
  tglSelesai: string;
  dosenId: string;
  asistenId: string;
}

interface JadwalState {
  jadwalList: Jadwal[];
  isLoading: boolean;
  fetchJadwal: (mataKuliahId?: string) => Promise<void>;
  addJadwal: (jadwal: Omit<Jadwal, 'id'>) => Promise<void>;
}

export const useJadwalStore = create<JadwalState>((set) => ({
  jadwalList: [],
  isLoading: false,
  fetchJadwal: async (mataKuliahId) => {
    set({ isLoading: true });
    try {
      const url = mataKuliahId ? `/jadwal?mataKuliahId=${mataKuliahId}` : '/jadwal';
      const response = await api.get(url);
      set({ jadwalList: response.data });
    } catch (error) {
      console.error('Failed to fetch jadwal', error);
    } finally {
      set({ isLoading: false });
    }
  },
  addJadwal: async (jadwal) => {
    set({ isLoading: true });
    try {
      await api.post('/jadwal', jadwal);
    } catch (error) {
      console.error('Failed to add jadwal', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
}));
