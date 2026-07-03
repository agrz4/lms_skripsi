import { create } from 'zustand';
import api from '../lib/api';

export interface Pendaftaran {
  id: string;
  userId: string;
  mataKuliahId: string;
  createdAt: string;
  mataKuliah?: any;
  referralCode?: string;
  harga?: string;
  invoiceNo?: string;
  status?: string;
  method?: string;
  user?: any;
}

interface PendaftaranState {
  pendaftaranList: Pendaftaran[];
  referralList: Pendaftaran[];
  isLoading: boolean;
  fetchMyPendaftaran: () => Promise<void>;
  fetchMyReferrals: () => Promise<void>;
  enrollKursus: (mataKuliahId: string, transactionDetails?: {
    referralCode?: string;
    harga?: string;
    invoiceNo?: string;
    status?: string;
    method?: string;
  }) => Promise<void>;
}

export const usePendaftaranStore = create<PendaftaranState>((set) => ({
  pendaftaranList: [],
  referralList: [],
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
  fetchMyReferrals: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get('/pendaftaran/referrals');
      set({ referralList: response.data });
    } catch (error) {
      console.error('Failed to fetch referrals', error);
    } finally {
      set({ isLoading: false });
    }
  },
  enrollKursus: async (mataKuliahId, transactionDetails) => {
    set({ isLoading: true });
    try {
      const response = await api.post('/pendaftaran', { 
        mataKuliahId,
        ...transactionDetails
      });
      set((state) => ({ pendaftaranList: [...state.pendaftaranList, response.data] }));
    } catch (error) {
      console.error('Failed to enroll kursus', error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
}));
