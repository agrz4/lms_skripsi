import React, { useEffect } from 'react';
import { useStatsStore } from '../store/useStatsStore';
import { HiOutlineUsers, HiOutlineAcademicCap, HiOutlineBookOpen, HiOutlineClipboardDocumentCheck } from 'react-icons/hi2';

const DashboardSummary: React.FC = () => {
  const { stats, isLoading, fetchStats } = useStatsStore();

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (isLoading && !stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-white rounded-3xl animate-pulse shadow-sm"></div>
        ))}
      </div>
    );
  }

  const items = [
    { label: 'Total Mahasiswa', value: stats?.users?.mahasiswa || 0, icon: HiOutlineUsers, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Total Pengajar', value: stats?.users?.dosen || 0, icon: HiOutlineAcademicCap, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { label: 'Total Kursus', value: stats?.mataKuliah || 0, icon: HiOutlineBookOpen, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Evaluasi AI', value: stats?.evaluasi || 0, icon: HiOutlineClipboardDocumentCheck, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      {items.map((item, idx) => (
        <div key={idx} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-5">
          <div className={`w-14 h-14 ${item.bg} ${item.color} rounded-2xl flex items-center justify-center text-3xl`}>
            <item.icon />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{item.label}</p>
            <h3 className="text-2xl font-black text-gray-900">{item.value}</h3>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DashboardSummary;
