import React, { useState } from 'react';
import { HiOutlineMagnifyingGlass, HiOutlineFunnel, HiOutlineSparkles, HiOutlineCheckCircle } from 'react-icons/hi2';

interface Submission {
  id: string;
  namaPeserta: string;
  initial: string;
  kursus: string;
  materi: string;
  dosen: string;
  jenis: 'Refleksi' | 'Tugas';
  nilai: number | null;
  status: 'Selesai' | 'Belum';
}

const HalamanKoreksi: React.FC = () => {
  const [submissions] = useState<Submission[]>([
    { id: '1', namaPeserta: 'Budi S.', initial: 'BS', kursus: 'Kecerdasan AI', materi: 'Intro AI', dosen: 'Dr. Reza', jenis: 'Refleksi', nilai: null, status: 'Belum' },
    { id: '2', namaPeserta: 'Ani S.', initial: 'AS', kursus: 'UI/UX', materi: 'Materi 2', dosen: 'Dr. Andi', jenis: 'Tugas', nilai: null, status: 'Belum' },
    { id: '3', namaPeserta: 'Candra W.', initial: 'CW', kursus: 'Kecerdasan AI', materi: 'Deep Learning', dosen: 'Dr. Reza', jenis: 'Refleksi', nilai: 85, status: 'Selesai' },
  ]);

  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(submissions[0]);

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-1">Halaman Koreksi</h1>
          <p className="text-gray-500 text-sm">Nama_kursus • Nama_materi • Nama_dosen</p>
        </div>
        <div className="bg-red-100 text-red-600 px-4 py-2 rounded-xl font-bold text-sm shadow-sm border border-red-200">
          12 Belum dikoreksi
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Side - Table */}
        <div className="flex-1 space-y-6">
          {/* Filters */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex gap-4">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <HiOutlineMagnifyingGlass />
              </span>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                placeholder="Cari Nama Peserta"
              />
            </div>
            <div className="relative w-48">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <HiOutlineFunnel />
              </span>
              <select className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none transition-all">
                <option>Semua Jenis</option>
                <option>Refleksi</option>
                <option>Tugas</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  <th className="px-6 py-4">Nama Peserta</th>
                  <th className="px-6 py-4">Nama Kursus</th>
                  <th className="px-6 py-4">Materi</th>
                  <th className="px-6 py-4 text-center">Jenis</th>
                  <th className="px-6 py-4 text-center">Nilai</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm">
                {submissions.map((sub) => (
                  <tr key={sub.id} className={`hover:bg-gray-50 transition-colors ${selectedSubmission?.id === sub.id ? 'bg-emerald-50/30' : ''}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-700 text-white flex items-center justify-center text-[10px] font-bold">
                          {sub.initial}
                        </div>
                        <span className="font-bold text-gray-900">{sub.namaPeserta}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{sub.kursus}</td>
                    <td className="px-6 py-4 text-gray-500">{sub.materi}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${sub.jenis === 'Refleksi' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}>
                        {sub.jenis}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-gray-900">{sub.nilai || '—'}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${sub.status === 'Selesai' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                        {sub.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => setSelectedSubmission(sub)}
                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${sub.status === 'Selesai' ? 'border border-gray-200 text-gray-400 hover:bg-gray-50' : 'bg-emerald-500 text-white shadow-lg shadow-emerald-100 hover:bg-emerald-600'}`}
                      >
                        {sub.status === 'Selesai' ? 'Lihat' : 'Koreksi'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full lg:w-96 space-y-6">
          <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100 sticky top-24">
            <h2 className="font-extrabold text-gray-900 text-lg mb-6 border-b border-gray-100 pb-4">Form Koreksi</h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Nama Peserta</label>
                <input type="text" readOnly value={selectedSubmission?.namaPeserta || ''} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-600 focus:outline-none" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Kursus</label>
                  <input type="text" readOnly value={selectedSubmission?.kursus || ''} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-600 focus:outline-none" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Materi</label>
                  <input type="text" readOnly value={selectedSubmission?.materi || ''} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-600 focus:outline-none" />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Jawaban Peserta</label>
                <div className="w-full p-4 bg-slate-50 border border-gray-200 rounded-xl text-sm text-gray-700 min-h-[100px] leading-relaxed">
                  "Saya memahami bahwa AI adalah simulasi kecerdasan manusia yang diproses oleh mesin, khususnya sistem komputer..."
                </div>
              </div>

              {/* AI Suggestion */}
              <div className="p-4 bg-purple-50 border border-purple-100 rounded-2xl flex gap-3">
                <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center text-white text-xl flex-shrink-0">
                  <HiOutlineSparkles />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-bold text-purple-900">Saran Skor AI: 75</span>
                  </div>
                  <p className="text-[10px] text-purple-700/80 leading-tight italic">Jawaban mencakup poin utama, namun kurang detail pada implementasi sistem pakar.</p>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Input Hasil Koreksi</label>
                <div className="relative">
                  <input type="number" placeholder="78" className="w-full p-4 bg-emerald-50 border-2 border-emerald-500 rounded-2xl text-3xl font-extrabold text-emerald-700 text-center focus:outline-none transition-all" />
                  <div className="absolute top-1/2 right-4 -translate-y-1/2 text-emerald-500 text-2xl">
                    <HiOutlineCheckCircle />
                  </div>
                </div>
                <p className="text-[10px] text-gray-400 mt-2 text-center">Saran AI: 75 • Nilai akhir ditentukan oleh asisten</p>
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Catatan Koreksi (Optional)</label>
                <textarea className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all min-h-[80px]" placeholder="Berikan feedback untuk peserta..."></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <button className="py-3 px-4 border border-gray-200 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-50 transition-all">Batal</button>
                <button className="py-3 px-4 bg-emerald-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-100 hover:bg-emerald-600 transition-all">Simpan</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HalamanKoreksi;
