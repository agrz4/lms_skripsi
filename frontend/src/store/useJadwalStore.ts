import { create } from 'zustand';
import api from '../lib/api';

export interface Pertemuan {
  id: string;
  mataKuliahId: string;
  urutan: number;
  topik: string;
  tgl?: string;
  jam?: string;
  dosenId?: string;
  asistenId?: string;
  dosen?: { id: string; nama: string };
  asisten?: { id: string; nama: string };
  materi?: any[];
}

interface JadwalState {
  jadwalList: Pertemuan[];
  isLoading: boolean;
  fetchJadwal: (mataKuliahId?: string) => Promise<void>;
  updatePertemuan: (id: string, data: any) => Promise<void>;
}

export const useJadwalStore = create<JadwalState>((set) => ({
  jadwalList: [],
  isLoading: false,
  fetchJadwal: async (mataKuliahId) => {
    set({ isLoading: true });
    try {
      const url = mataKuliahId ? `/pertemuan?mataKuliahId=${mataKuliahId}` : '/pertemuan';
      const response = await api.get(url);
      set({ jadwalList: response.data });
    } catch (error) {
      console.error('Failed to fetch pertemuan', error);
    } finally {
      set({ isLoading: false });
    }
  },
  updatePertemuan: async (id, data) => {
    set({ isLoading: true });
    try {
      const response = await api.patch(`/pertemuan/${id}`, data);
      set((state) => ({
        jadwalList: state.jadwalList.map((p) => p.id === id ? response.data : p)
      }));
    } catch (error) {
      console.error('Failed to update pertemuan', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
}));
