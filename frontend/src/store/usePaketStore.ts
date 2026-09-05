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
  updatePaket: (
    id: string,
    paketData: Partial<{
      nama: string;
      deskripsi?: string;
      hargaPaket: string;
      hargaAsli: string;
      courses: string[];
    }>
  ) => Promise<Paket>;
  addCourseToPaket: (paketId: string, courseId: string) => Promise<Paket>;
  addCoursesToPaket: (paketId: string, courseIds: string[]) => Promise<Paket>;
  removeCourseFromPaket: (paketId: string, courseId: string) => Promise<Paket>;
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
      updatePaket: async (id, paketData) => {
        try {
          const response = await api.put(`/paket/${id}`, paketData);
          set((state) => ({
            paketList: state.paketList.map((p) => (p.id === id ? response.data : p)),
          }));
          return response.data;
        } catch (error) {
          console.error('Failed to update paket', error);
          throw error;
        }
      },
      addCourseToPaket: async (paketId, courseId) => {
        try {
          const response = await api.post(`/paket/${paketId}/courses`, { courseId });
          set((state) => ({
            paketList: state.paketList.map((p) => (p.id === paketId ? response.data : p)),
          }));
          return response.data;
        } catch (error) {
          console.error('Failed to add course to paket', error);
          throw error;
        }
      },
      addCoursesToPaket: async (paketId, courseIds) => {
        try {
          const response = await api.post(`/paket/${paketId}/courses`, { courseIds });
          set((state) => ({
            paketList: state.paketList.map((p) => (p.id === paketId ? response.data : p)),
          }));
          return response.data;
        } catch (error) {
          console.error('Failed to add courses to paket', error);
          throw error;
        }
      },
      removeCourseFromPaket: async (paketId, courseId) => {
        try {
          const response = await api.delete(`/paket/${paketId}/courses/${courseId}`);
          set((state) => ({
            paketList: state.paketList.map((p) => (p.id === paketId ? response.data : p)),
          }));
          return response.data;
        } catch (error) {
          console.error('Failed to remove course from paket', error);
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
