import { create } from 'zustand';

export interface Pengajar {
  id: number;
  nama: string;
  instansi: string;
  email: string;
  pelatihan: string;
  jadwal: string;
  status: 'Aktif' | 'Non-Aktif';
}

interface PengajarState {
  pengajarList: Pengajar[];
  addPengajar: (pengajar: Omit<Pengajar, 'id'>) => void;
  removePengajar: (id: number) => void;
  updatePengajar: (id: number, updatedData: Partial<Pengajar>) => void;
}

export const usePengajarStore = create<PengajarState>((set) => ({
  pengajarList: [
    { id: 1, nama: 'Dr. Ahmad Subarjo', instansi: 'Universitas Indonesia', email: 'ahmad@ui.ac.id', pelatihan: 'Data Science', jadwal: 'Senin, 09:00', status: 'Aktif' },
    { id: 2, nama: 'Siti Aminah, M.Kom', instansi: 'Institut Teknologi Bandung', email: 'siti@itb.ac.id', pelatihan: 'Web Development', jadwal: 'Selasa, 13:00', status: 'Aktif' },
    { id: 3, nama: 'Budi Hartono', instansi: 'UGM', email: 'budi@ugm.ac.id', pelatihan: 'Cyber Security', jadwal: 'Rabu, 10:00', status: 'Non-Aktif' },
    { id: 4, nama: 'Ani Wijaya', instansi: 'Binus University', email: 'ani@binus.edu', pelatihan: 'UI/UX Design', jadwal: 'Kamis, 15:00', status: 'Non-Aktif' },
  ],
  addPengajar: (pengajar) => set((state) => ({
    pengajarList: [
      ...state.pengajarList,
      { ...pengajar, id: Math.max(...state.pengajarList.map(p => p.id), 0) + 1 }
    ]
  })),
  removePengajar: (id) => set((state) => ({
    pengajarList: state.pengajarList.filter((p) => p.id !== id)
  })),
  updatePengajar: (id, updatedData) => set((state) => ({
    pengajarList: state.pengajarList.map((p) => p.id === id ? { ...p, ...updatedData } : p)
  })),
}));
