import React from 'react';
import { 
  HiOutlineAcademicCap, 
  HiOutlineDocumentCheck, 
  HiOutlinePencilSquare, 
  HiOutlineSparkles,
  HiOutlineArrowDownTray,
  HiOutlineArrowPath
} from 'react-icons/hi2';

const HasilSkorAI: React.FC = () => {
  return (
    <div className="p-8 bg-slate-50 min-h-screen pb-20">
      <div className="max-w-[1400px] mx-auto">
        <div className="mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Hasil & Skor AI</h1>
          <p className="text-gray-500 font-medium">Kecerdasan AI Dasar — View Results</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Results Column */}
          <div className="lg:col-span-8 space-y-8">
            {/* Hero Score Card */}
            <div className="bg-gradient-to-br from-slate-700 to-slate-900 rounded-[3rem] p-12 text-white text-center shadow-2xl relative overflow-hidden">
               <div className="relative z-10">
                  <span className="text-[120px] font-black leading-none text-emerald-400 drop-shadow-[0_0_30px_rgba(52,211,153,0.3)]">83</span>
                  <p className="text-lg font-bold opacity-60 mt-4">Total Skor dari 100 — Kecerdasan AI Dasar</p>
                  
                  <div className="max-w-md mx-auto my-8">
                    <div className="h-3 w-full bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full w-[83%] shadow-[0_0_20px_rgba(16,185,129,0.5)]"></div>
                    </div>
                  </div>

                  <div className="inline-flex items-center gap-3 bg-emerald-500 text-white px-8 py-3 rounded-2xl font-extrabold text-xl shadow-xl shadow-emerald-900/20">
                    Status: Lulus <HiOutlineDocumentCheck className="text-2xl" />
                  </div>
               </div>

               {/* Decorative background elements */}
               <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
               <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -ml-20 -mb-20"></div>
            </div>

            {/* Score Breakdown Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 text-center group hover:-translate-y-1 transition-all">
                <span className="text-4xl font-black text-indigo-600 block mb-2">87</span>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Ujian PG (AI)</span>
              </div>
              <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 text-center group hover:-translate-y-1 transition-all">
                <span className="text-4xl font-black text-emerald-600 block mb-2">78</span>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Refleksi (Asisten)</span>
              </div>
              <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 text-center group hover:-translate-y-1 transition-all">
                <span className="text-4xl font-black text-purple-600 block mb-2">70</span>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Tugas PG (AI)</span>
              </div>
            </div>

            {/* AI Insights */}
            <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100 relative overflow-hidden">
               <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center text-2xl">
                    <HiOutlineSparkles />
                  </div>
                  <h2 className="text-2xl font-extrabold text-gray-900">Insight dari AI</h2>
               </div>

               <p className="text-gray-600 leading-relaxed font-medium mb-10 text-sm">
                  Kamu menguasai topik <span className="text-gray-900 font-bold">Full-Stack Development dengan React & Node.js</span> dengan sangat baik (90% benar). Perlu diperkuat pada topik <span className="text-gray-900 font-bold">Pengembangan Backend dan Server</span> (40% benar). Disarankan mengulang Materi 3 sebelum mengambil kursus lanjutan agar fondasi backend kamu lebih kuat.
               </p>

               <div className="flex flex-wrap gap-4">
                  <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all">
                    <HiOutlineArrowDownTray className="text-lg" /> Unduh PDF
                  </button>
                  <button className="flex items-center gap-2 px-6 py-3 bg-slate-800 text-white rounded-xl text-xs font-bold shadow-lg shadow-slate-200 hover:bg-slate-900 transition-all">
                    <HiOutlineArrowPath className="text-lg" /> Ulangi Materi 3
                  </button>
               </div>

               {/* Subtle purple glow */}
               <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl"></div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-8">Status Semua Kursus</h2>
              <div className="space-y-4">
                {[
                  { name: 'Data Science', status: 'Berlangsung', color: 'bg-blue-100 text-blue-600', dot: 'bg-blue-500' },
                  { name: 'Web Development', status: 'Lulus', color: 'bg-emerald-100 text-emerald-600', dot: 'bg-emerald-500' },
                  { name: 'System Analyst', status: 'Mengulang', color: 'bg-orange-100 text-orange-600', dot: 'bg-orange-500' },
                ].map((item, i) => (
                  <div key={i} className="flex justify-between items-center p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${item.dot}`}></div>
                      <span className="text-xs font-bold text-gray-700">{item.name}</span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-widest ${item.color}`}>
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-8">Rincian Nilai</h2>
              <div className="space-y-6">
                 {[
                   { label: 'Ujian PG(AI)', score: 87, icon: <HiOutlineAcademicCap />, color: 'bg-indigo-500' },
                   { label: 'Refleksi (Asisten)', score: 78, icon: <HiOutlinePencilSquare />, color: 'bg-emerald-500' },
                   { label: 'Tugas PG (AI)', score: 70, icon: <HiOutlineDocumentCheck />, color: 'bg-purple-500' },
                 ].map((item, i) => (
                   <div key={i} className="space-y-2">
                      <div className="flex justify-between items-center text-xs font-bold">
                        <div className="flex items-center gap-2 text-gray-500">
                          {item.icon}
                          <span>{item.label}</span>
                        </div>
                        <span className={`text-sm ${item.color.replace('bg-', 'text-')}`}>{item.score}</span>
                      </div>
                      <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.score}%` }}></div>
                      </div>
                   </div>
                 ))}
                 
                 <div className="pt-6 border-t border-gray-100 flex justify-between items-center">
                    <span className="text-sm font-extrabold text-gray-900">Total Skor</span>
                    <span className="text-2xl font-black text-gray-900">83</span>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HasilSkorAI;
