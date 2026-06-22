import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../lib/api';

export interface Paket {
  id: string;
  nama: string;
  deskripsi?: string;
  hargaPaket: string;
  hargaAsli: string;
  createdAt: string;
  courses?: any[];
}

interface PaketState {
  paketList: Paket[];
  isLoading: boolean;
  fetchPaket: () => Promise<void>;
  addPaket: (paketData: {
    nama: string;
    deskripsi?: string;
    hargaPaket: string;
    hargaAsli: string;
    courses: string[];
  }) => Promise<void>;
  removePaket: (id: string) => Promise<void>;
}

export const usePaketStore = create<PaketState>()(
  persist(
    (set) => ({
      paketList: [],
      isLoading: false,
      fetchPaket: async () => {
        set({ isLoading: true });
        try {
          const response = await api.get('/paket');
          if (response.data) {
            set({ paketList: response.data });
          }
        } catch (error) {
          console.error('Failed to fetch paket list', error);
        } finally {
          set({ isLoading: false });
        }
      },
      addPaket: async (paketData) => {
        try {
          const response = await api.post('/paket', paketData);
          set((state) => ({ paketList: [response.data, ...state.paketList] }));
        } catch (error) {
          console.error('Failed to add paket', error);
          throw error;
        }
      },
      removePaket: async (id) => {
        try {
          await api.delete(`/paket/${id}`);
          set((state) => ({
            paketList: state.paketList.filter((p) => p.id !== id)
          }));
        } catch (error) {
          console.error('Failed to delete paket', error);
          throw error;
        }
      },
    }),
    {
      name: 'paket-storage', // name of the item in the storage
    }
  )
);
