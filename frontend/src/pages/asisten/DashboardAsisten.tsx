import React from 'react';
import { HiOutlineClipboardDocumentCheck, HiOutlineChatBubbleBottomCenterText, HiOutlineClock, HiOutlineChevronRight } from 'react-icons/hi2';

const DashboardAsisten: React.FC = () => {
  const stats = [
    { label: 'Tugas Belum Dikoreksi', value: '12', icon: <HiOutlineClipboardDocumentCheck />, color: 'bg-red-100 text-red-600' },
    { label: 'Refleksi Menunggu', value: '8', icon: <HiOutlineChatBubbleBottomCenterText />, color: 'bg-orange-100 text-orange-600' },
    { label: 'Rata-rata Waktu Koreksi', value: '1.5h', icon: <HiOutlineClock />, color: 'bg-emerald-100 text-emerald-600' },
  ];

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Asisten</h1>
        <p className="text-gray-500">Selamat datang kembali! Berikut ringkasan tugas Anda hari ini.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5">
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl ${stat.color}`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-bold text-gray-900">Tugas Terbaru Perlu Koreksi</h2>
            <button className="text-emerald-600 text-sm font-bold hover:underline">Lihat Semua</button>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold">
                    BS
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">Budi Santoso</p>
                    <p className="text-[11px] text-gray-500">Kecerdasan AI • Intro AI</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-blue-100 text-blue-600 text-[10px] font-bold rounded-full uppercase">Refleksi</span>
                  <HiOutlineChevronRight className="text-gray-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="font-bold text-gray-900 mb-6">Informasi Terbaru</h2>
          <div className="space-y-4">
            <div className="p-4 border-l-4 border-emerald-500 bg-emerald-50/50 rounded-r-xl">
              <p className="text-sm font-bold text-emerald-900">Update Panduan Koreksi</p>
              <p className="text-xs text-emerald-700/80 mt-1">Harap perhatikan kriteria penilaian baru untuk materi Deep Learning.</p>
            </div>
            <div className="p-4 border-l-4 border-purple-500 bg-purple-50/50 rounded-r-xl">
              <p className="text-sm font-bold text-purple-900">Integrasi AI Auto-Correction</p>
              <p className="text-xs text-purple-700/80 mt-1">Gunakan saran dari AI untuk mempercepat proses koreksi tugas rutin.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardAsisten;
