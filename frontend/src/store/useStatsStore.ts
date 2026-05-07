import { create } from 'zustand';
import api from '../lib/api';

interface Stats {
  users: {
    total: number;
    mahasiswa: number;
    dosen: number;
    admin: number;
  };
  mataKuliah: number;
  soal: number;
  evaluasi: number;
}

interface StatsState {
  stats: Stats | null;
  isLoading: boolean;
  fetchStats: () => Promise<void>;
}

export const useStatsStore = create<StatsState>((set) => ({
  stats: null,
  isLoading: false,
  fetchStats: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get('/dashboard/stats');
      set({ stats: response.data });
    } catch (error) {
      console.error('Failed to fetch stats', error);
    } finally {
      set({ isLoading: false });
    }
  },
}));
