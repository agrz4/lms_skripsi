import React from 'react';
import { HiOutlineBookOpen, HiOutlineUsers, HiOutlineChartBar, HiOutlineChevronDown } from 'react-icons/hi2';

const MonitoringMahasiswa: React.FC = () => {
  const stats = [
    { label: 'Materi Aktif', value: '3', sub: 'Dari 5 Total Materi Tersedia', badge: '↑ Aktif', color: 'bg-slate-800' },
    { label: 'Total Mahasiswa', value: '28', sub: 'Terdaftar Di Kelas Ini', badge: '↑ +3 Minggu ini', color: 'bg-purple-800' },
    { label: 'Rata-Rata Nilai Tugas', value: '82', sub: 'Dari Nilai Maksimal 100', badge: '↑ +3 Point', color: 'bg-emerald-800' },
  ];

  const materiList = [
    { nama: 'Intro AI & ML', jenis: 'Zoom / meet', mhs: 28, nilaiTugas: 82, nilaiRefleksi: 78 },
    { nama: 'Deep Learning', jenis: 'Micro Learning', mhs: 25, nilaiTugas: 65, nilaiRefleksi: 80 },
  ];

  const students = [
    { nama: 'Budi S.', initial: 'BS', tugas: 85, refleksi: 78, status: 'Selesai' },
    { nama: 'Ani S.', initial: 'AS', tugas: 55, refleksi: null, status: 'Belum Refleksi' },
    { nama: 'Candra W.', initial: 'CW', tugas: null, refleksi: null, status: 'Belum' },
  ];

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">Monitoring Mahasiswa</h1>
        <p className="text-gray-400 text-sm font-medium">Nama Materi (Given Dari Admin), jenis materi, Nama, +Nilai Tugas & Refleksi</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {stats.map((stat, i) => (
          <div key={i} className={`${stat.color} p-6 rounded-2xl shadow-xl text-white relative overflow-hidden group`}>
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-lg flex items-center justify-center text-xl">
                {i === 0 ? <HiOutlineBookOpen /> : i === 1 ? <HiOutlineUsers /> : <HiOutlineChartBar />}
              </div>
              <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 px-2 py-1 rounded-full">{stat.badge}</span>
            </div>
            <h2 className="text-5xl font-extrabold mb-1">{stat.value}</h2>
            <p className="text-sm font-bold opacity-90">{stat.label}</p>
            <p className="text-[10px] opacity-60 uppercase tracking-widest mt-1">{stat.sub}</p>
            <div className="mt-4 h-1 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-white/40 w-3/4 rounded-full"></div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-10">
        <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
          <h2 className="font-bold text-gray-800">Daftar Materi</h2>
          <div className="flex gap-2">
             <select className="text-xs border-gray-200 rounded-lg bg-white p-2 outline-none focus:ring-2 focus:ring-emerald-500 transition-all">
                <option>Semua Jenis</option>
             </select>
          </div>
        </div>
        <table className="w-full text-left">
          <thead>
            <tr className="text-gray-400 text-[11px] font-bold uppercase tracking-widest border-b border-gray-50">
              <th className="px-8 py-4">Nama Peserta</th>
              <th className="px-8 py-4">Jenis Materi</th>
              <th className="px-8 py-4">Jumlah Mahasiswa</th>
              <th className="px-8 py-4">Rata Nilai Tugas</th>
              <th className="px-8 py-4">Rata Refleksi</th>
              <th className="px-8 py-4 text-center">Detail</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {materiList.map((m, i) => (
              <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-8 py-5 font-bold text-gray-900">{m.nama}</td>
                <td className="px-8 py-5">
                  <span className="px-3 py-1 bg-blue-100 text-blue-600 text-[10px] font-bold rounded-full">{m.jenis}</span>
                </td>
                <td className="px-8 py-5 font-bold text-gray-900">{m.mhs}</td>
                <td className="px-8 py-5">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full w-24">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${m.nilaiTugas}%` }}></div>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-600">{m.nilaiTugas}</span>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full w-24">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${m.nilaiRefleksi}%` }}></div>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-600">{m.nilaiRefleksi}</span>
                  </div>
                </td>
                <td className="px-8 py-5 text-center">
                  <button className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 mx-auto hover:bg-yellow-200 transition-colors">
                    Expand <HiOutlineChevronDown />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* List Mahasiswa Section */}
      <div className="bg-emerald-700/10 rounded-2xl p-4 mb-6 flex justify-between items-center border border-emerald-100">
        <h3 className="font-extrabold text-slate-800 text-xl italic">List Mahasiswa — Intro AI & ML</h3>
        <span className="font-bold text-slate-500">28 mahasiswa</span>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="text-gray-400 text-[11px] font-bold uppercase tracking-widest border-b border-gray-50">
              <th className="px-8 py-5">Nama Mahasiswa</th>
              <th className="px-8 py-5">Nilai Tugas</th>
              <th className="px-8 py-5">Nilai Refleksi</th>
              <th className="px-8 py-5">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {students.map((s, i) => (
              <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-8 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-700 text-white flex items-center justify-center font-bold text-xs shadow-md border-2 border-white">
                      {s.initial}
                    </div>
                    <span className="font-bold text-gray-900">{s.nama}</span>
                  </div>
                </td>
                <td className="px-8 py-5 font-bold text-gray-600">{s.tugas || '—'}</td>
                <td className="px-8 py-5 font-bold text-gray-600">{s.refleksi || '—'}</td>
                <td className="px-8 py-5">
                  <span className={`px-4 py-1 rounded-full text-[10px] font-bold uppercase ${
                    s.status === 'Selesai' ? 'bg-emerald-100 text-emerald-600' : 
                    s.status === 'Belum Refleksi' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {s.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MonitoringMahasiswa;
