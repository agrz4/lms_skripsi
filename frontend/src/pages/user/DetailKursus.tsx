import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useMateriStore } from '../../store/useMateriStore';
import { useJadwalStore } from '../../store/useJadwalStore';
import { 
  HiOutlineVideoCamera, 
  HiOutlinePlayCircle, 
  HiOutlineChevronDown, 
  HiOutlineChevronUp,
  HiOutlineCloudArrowUp,
  HiOutlineLockClosed
} from 'react-icons/hi2';

const DetailKursus: React.FC = () => {
  const [searchParams] = useSearchParams();
  const courseId = searchParams.get('id');
  
  const [expandedMateri, setExpandedMateri] = useState<string | null>(null);

  const { materiList, fetchMateri } = useMateriStore();
  const { jadwalList, fetchJadwal } = useJadwalStore();

  useEffect(() => {
    if (courseId) {
      fetchMateri(courseId);
      fetchJadwal(courseId);
    }
  }, [courseId, fetchMateri, fetchJadwal]);

  // Set first materi as expanded by default when list loaded
  useEffect(() => {
    if (materiList.length > 0 && !expandedMateri) {
      setExpandedMateri(materiList[0].id);
    }
  }, [materiList, expandedMateri]);

  return (
    <div className="p-8 bg-slate-50 min-h-screen pb-20">
      {/* Header Banner */}
      <div className="bg-slate-800 rounded-3xl p-8 mb-8 text-white relative overflow-hidden shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-3xl font-extrabold mb-3">Web Development</h1>
            <div className="flex items-center gap-4">
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-[10px] font-bold uppercase tracking-wider border border-emerald-500/30">
                Berlangsung
              </span>
              <span className="text-[10px] font-bold opacity-60 uppercase tracking-widest">
                5 Mar 2026
              </span>
            </div>
          </div>
          
          <div className="w-full md:w-96">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-bold opacity-60 uppercase tracking-widest">Progress Kursus</span>
              <span className="text-[10px] font-bold">60%</span>
            </div>
            <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full w-[60%] shadow-[0_0_15px_rgba(16,185,129,0.5)]"></div>
            </div>
          </div>
        </div>
        
        {/* Decorative circle */}
        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column - Materials */}
        <div className="lg:col-span-8 space-y-4">
          {materiList.map((m, index) => (
            <div key={m.id} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <button 
                onClick={() => setExpandedMateri(expandedMateri === m.id ? null : m.id)}
                className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-6">
                  <span className="text-lg font-extrabold text-gray-900">Materi {index + 1} —</span>
                  <span className="text-lg font-bold text-gray-700">{m.nama}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-blue-100 text-blue-600">
                    PDF
                  </span>
                  <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-gray-100 text-gray-400">
                    Belum
                  </span>
                  {expandedMateri === m.id ? <HiOutlineChevronUp className="text-gray-400" /> : <HiOutlineChevronDown className="text-gray-400" />}
                </div>
              </button>

              {expandedMateri === m.id && (
                <div className="p-8 border-t border-gray-50 space-y-8 animate-in fade-in slide-in-from-top-2 duration-300">
                  {/* Material Links */}
                  <div>
                    <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4">Material</h4>
                    <div className="space-y-3">
                      {m.fileUrl && (
                        <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-100 rounded-2xl group hover:border-emerald-200 transition-all">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center text-xl">
                              <HiOutlineCloudArrowUp />
                            </div>
                            <span className="font-bold text-gray-900 text-sm">File Materi (PDF/Docs)</span>
                          </div>
                          <a href={m.fileUrl} target="_blank" rel="noopener noreferrer" className="px-6 py-2 bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-100 hover:bg-emerald-600">Download</a>
                        </div>
                      )}
                      <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-100 rounded-2xl group hover:border-blue-200 transition-all">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center text-xl">
                            <HiOutlineVideoCamera />
                          </div>
                          <span className="font-bold text-gray-900 text-sm">Link Zoom Meeting (Live Session)</span>
                        </div>
                        <button className="px-6 py-2 bg-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-100 hover:bg-blue-600">Buka</button>
                      </div>
                    </div>
                  </div>

                  {/* Refleksi */}
                  <div>
                    <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4">Refleksi Materi</h4>
                    <textarea 
                      className="w-full p-6 bg-gray-50 border border-gray-200 rounded-[2rem] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all min-h-[120px]"
                      placeholder="Tuliskan refleksi Anda mengenai materi ini..."
                    ></textarea>
                  </div>

                  {/* Tugas */}
                  <div>
                    <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4">Tugas</h4>
                    <div className="w-full p-10 border-2 border-dashed border-gray-200 rounded-[2rem] bg-gray-50/50 flex flex-col items-center justify-center gap-3 hover:border-blue-400 hover:bg-blue-50/30 transition-all cursor-pointer">
                      <HiOutlineCloudArrowUp className="text-4xl text-gray-300" />
                      <span className="text-xs text-gray-400 font-bold">Upload file jawaban</span>
                    </div>
                  </div>

                  <div className="flex justify-center pt-4">
                    <button className="px-12 py-4 bg-blue-600 text-white rounded-2xl font-bold text-lg shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all">
                      Kumpulkan
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Locked Section */}
          <div className="bg-blue-900/10 border-2 border-dashed border-blue-200 rounded-3xl p-10 text-center">
             <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-6">
                <HiOutlineLockClosed />
             </div>
             <h3 className="text-xl font-extrabold text-blue-900 mb-2">Ujian Akhir — 30 Soal PG (AI Generate)</h3>
             <p className="text-sm text-blue-700/60 mb-8 font-medium">Tersedia setelah semua materi selesai</p>
             <Link to="/user/ujian" className="inline-block px-10 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all">
                Buka Ujian (Simulasi)
             </Link>
          </div>

        </div>

        {/* Right Column - Stats */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-8">Jadwal Perkuliahan</h2>
            <div className="space-y-4">
              {jadwalList.length > 0 ? jadwalList.map((j, i) => (
                <div key={i} className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-gray-700">{j.hari.join(', ')}</span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-[9px] font-extrabold uppercase tracking-widest">
                      Aktif
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-500">
                    {new Date(j.tglMulai).toLocaleDateString('id-ID')} s/d {new Date(j.tglSelesai).toLocaleDateString('id-ID')}
                  </p>
                </div>
              )) : (
                <div className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100 text-center">
                  <p className="text-xs font-bold text-gray-400">Belum ada jadwal yang diatur</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-8">Nilai Saya</h2>
            <div className="space-y-4">
               <div className="flex justify-between items-center py-3 border-b border-gray-50">
                  <span className="text-sm font-bold text-gray-500">Refleksi M1</span>
                  <span className="text-lg font-extrabold text-gray-900">85</span>
               </div>
               <div className="flex justify-between items-center py-3 border-b border-gray-50">
                  <span className="text-sm font-bold text-gray-500">Tugas M1</span>
                  <span className="text-lg font-extrabold text-gray-900">80</span>
               </div>
               <div className="flex justify-between items-center py-3">
                  <span className="text-sm font-bold text-gray-500">Ujian Akhir</span>
                  <span className="text-lg font-extrabold text-gray-300">—</span>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailKursus;
