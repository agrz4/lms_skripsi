import React from 'react';
import { HiOutlineCpuChip, HiOutlineCheckBadge, HiOutlineClock, HiOutlineInformationCircle } from 'react-icons/hi2';

const AutoCorrectionAsisten: React.FC = () => {
  const stats = [
    { 
      label: 'PG Di Koreksi AI', 
      value: '38', 
      total: 'Dari Total 48 Peserta', 
      badge: '+5 Hari Ini', 
      color: 'bg-slate-800 text-white', 
      progress: 'w-2/3',
      icon: <HiOutlineCpuChip />
    },
    { 
      label: 'Essai Selesai', 
      value: '22', 
      total: 'sudah di koreksi manual', 
      badge: '+3 Hari Ini', 
      color: 'bg-emerald-700 text-white', 
      progress: 'w-1/2',
      icon: <HiOutlineCheckBadge />
    },
    { 
      label: 'Essai Antrian', 
      value: '10', 
      total: 'Menunggu Koreksi Manual', 
      badge: '-3 Dari Kemarin', 
      color: 'bg-yellow-700 text-white', 
      progress: 'w-1/3',
      icon: <HiOutlineClock />
    },
  ];

  const submissions = [
    { nama: 'Budi Santoso', initial: 'BS', kursus: 'Kecerdasan AI', jenis: 'Ujian', skor: 87, detail: '26/30' },
    { nama: 'Ani Susanti', initial: 'AS', kursus: 'UI/UX', jenis: 'Selesai', skor: 50, detail: '5/10' },
  ];

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold text-gray-900">Auto Correction AI</h1>
        <p className="text-gray-400 text-sm font-medium">Hasil koreksi AI untuk PG — referensi sebelum koreksi essai</p>
      </div>

      <div className="bg-slate-700 text-white p-4 rounded-xl flex items-center gap-3 mb-8 shadow-lg shadow-slate-200">
        <HiOutlineInformationCircle className="text-xl text-emerald-400" />
        <p className="text-sm font-bold">AI otomatis koreksi Ujian & Tugas PG. Kamu hanya perlu koreksi Refleksi Essai secara manual.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {stats.map((stat, i) => (
          <div key={i} className={`${stat.color} p-6 rounded-2xl shadow-xl relative overflow-hidden group`}>
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-lg flex items-center justify-center text-xl">
                {stat.icon}
              </div>
              <span className="text-[10px] font-bold bg-white/20 backdrop-blur-md px-2 py-1 rounded-full">{stat.badge}</span>
            </div>
            <div className="relative z-10">
              <h2 className="text-5xl font-extrabold mb-1">{stat.value}</h2>
              <p className="text-sm font-bold opacity-90">{stat.label}</p>
              <p className="text-[10px] opacity-60 uppercase tracking-widest mt-1">{stat.total}</p>
            </div>
            <div className="mt-6 h-1 bg-white/10 rounded-full overflow-hidden relative z-10">
              <div className={`h-full bg-white/40 ${stat.progress} rounded-full`}></div>
            </div>
            
            {/* Decoration */}
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-all duration-500"></div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-50 text-gray-400 text-xs font-bold uppercase tracking-widest">
              <th className="px-8 py-5">Nama Peserta</th>
              <th className="px-8 py-5">Kursus</th>
              <th className="px-8 py-5">Jenis</th>
              <th className="px-8 py-5">Skor AI</th>
              <th className="px-8 py-5">Benar/Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {submissions.map((sub, i) => (
              <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-8 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-700 text-white flex items-center justify-center font-bold text-xs shadow-md border-2 border-white">
                      {sub.initial}
                    </div>
                    <span className="font-bold text-gray-900 text-lg">{sub.nama}</span>
                  </div>
                </td>
                <td className="px-8 py-5 text-gray-600 font-medium text-lg">{sub.kursus}</td>
                <td className="px-8 py-5">
                  <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${sub.jenis === 'Ujian' ? 'bg-blue-100 text-blue-600' : 'bg-blue-100 text-blue-600'}`}>
                    {sub.jenis}
                  </span>
                </td>
                <td className="px-8 py-5">
                  <div className="flex items-center gap-4 w-48">
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${sub.skor > 70 ? 'bg-emerald-500' : 'bg-red-500'}`} 
                        style={{ width: `${sub.skor}%` }}
                      ></div>
                    </div>
                    <span className={`font-bold text-sm ${sub.skor > 70 ? 'text-emerald-600' : 'text-red-600'}`}>{sub.skor}</span>
                  </div>
                </td>
                <td className="px-8 py-5 font-bold text-gray-900 text-lg">{sub.detail}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AutoCorrectionAsisten;
