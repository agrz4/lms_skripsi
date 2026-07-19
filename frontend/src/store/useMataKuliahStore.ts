import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../lib/api';

export interface MataKuliah {
  id: string;
  nama: string;
  kode: string;
  published: boolean;
  deskripsi?: string;
  kapasitas?: number;
  kategori?: string;
  level?: string;
  warna?: string;
  statusPendaftaran?: string;
  tipeKursus?: string;
  pengajarId?: string;
  pengajar?: {
    id: string;
    nama: string;
    email?: string;
  };
  jumlahPertemuan?: number;
  createdAt: string;
  _count?: {
    pendaftaran: number;
    pertemuan: number;
  };
  pertemuan?: any[]; // For storing detail sessions
  prerequisites?: any[];
  prerequisiteFor?: any[];
  ttd1Nama?: string;
  ttd1Jabatan?: string;
  ttd2Nama?: string;
  ttd2Jabatan?: string;
}

interface MataKuliahState {
  mataKuliahList: MataKuliah[];
  publishedMataKuliahList: MataKuliah[];
  isLoading: boolean;
  fetchMataKuliah: () => Promise<void>;
  fetchPublishedMataKuliah: () => Promise<void>;
  addMataKuliah: (mk: Omit<MataKuliah, 'id' | 'createdAt' | 'prerequisites' | 'prerequisiteFor'>) => Promise<void>;
  removeMataKuliah: (id: string) => Promise<void>;
  updateMataKuliah: (id: string, updatedData: Partial<MataKuliah>) => Promise<void>;
}

export const useMataKuliahStore = create<MataKuliahState>()(
  persist(
    (set) => ({
      mataKuliahList: [],
      publishedMataKuliahList: [],
      isLoading: false,
      fetchMataKuliah: async () => {
        set({ isLoading: true });
        try {
          const response = await api.get('/matakuliah');
          if (response.data) {
            set({ mataKuliahList: response.data });
          }
        } catch (error) {
          console.error('Failed to fetch mata kuliah', error);
        } finally {
          set({ isLoading: false });
        }
      },
      fetchPublishedMataKuliah: async () => {
        set({ isLoading: true });
        try {
          const response = await api.get('/matakuliah/published');
          set({ publishedMataKuliahList: response.data });
        } catch (error) {
          console.error('Failed to fetch published mata kuliah', error);
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
          throw error;
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
          throw error;
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
          throw error;
        }
      },
    }),
    {
      name: 'mata-kuliah-storage', // name of the item in the storage
    }
  )
);
