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
  isLoading: boolean;
  addJadwal: (jadwal: Omit<Jadwal, 'id'>) => Promise<void>;
}

export const useJadwalStore = create<JadwalState>((set) => ({
  isLoading: false,
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
