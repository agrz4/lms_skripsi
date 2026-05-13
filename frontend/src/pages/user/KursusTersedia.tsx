import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineClock, HiOutlineBookOpen, HiOutlineUsers, HiOutlineArrowRight, HiOutlineCheckCircle } from 'react-icons/hi2';
import { useMataKuliahStore } from '../../store/useMataKuliahStore';
import { usePendaftaranStore } from '../../store/usePendaftaranStore';

interface Course {
  id: string;
  title: string;
  description: string;
  tag: string;
  level: string;
  date: string;
  modules: number;
  quota: string;
  progress: number;
  instructor: string;
  instructorInitial: string;
  status: 'enroll' | 'registered' | 'closed';
  gradient: string;
}

const KursusTersedia: React.FC = () => {
  const { publishedMataKuliahList, isLoading, fetchPublishedMataKuliah } = useMataKuliahStore();
  const { pendaftaranList, fetchMyPendaftaran, enrollKursus } = usePendaftaranStore();

  useEffect(() => {
    fetchPublishedMataKuliah();
    fetchMyPendaftaran();
  }, [fetchPublishedMataKuliah, fetchMyPendaftaran]);

  // Fallback data for fields not in DB
  const getFallbackData = (mk: any) => {
    const isRegistered = pendaftaranList.some((p) => p.mataKuliahId === mk.id);
    
    return {
      description: 'Pelajari materi ini untuk meningkatkan keahlian Anda secara komprehensif.',
      tag: mk.kode.startsWith('IF') ? 'Informatika' : 'Umum',
      level: 'Beginner',
      date: 'Mulai Hari Ini',
      modules: 12,
      quota: 'Sisa: 10',
      progress: 0,
      instructor: 'Dosen Pengampu',
      instructorInitial: 'DP',
      status: isRegistered ? ('registered' as const) : ('enroll' as const),
      gradient: 'from-emerald-900 to-slate-900',
    };
  };

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <div className="mb-12">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Kursus Tersedia</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {publishedMataKuliahList.map((mk) => {
          const fallback = getFallbackData(mk);
          return (
            <Link key={mk.id} to={`/user/detail-kursus?id=${mk.id}`} className="block group">
              <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 group-hover:shadow-2xl transition-all duration-500 h-full">
                {/* Header / Top Part */}
                <div className={`p-8 bg-gradient-to-br ${fallback.gradient} relative overflow-hidden h-48 flex flex-col justify-between text-white`}>

                <div className="flex justify-between items-start relative z-10">
                  <span className="px-3 py-1 bg-emerald-500/20 backdrop-blur-md border border-emerald-500/30 rounded-full text-[10px] font-bold text-emerald-300 uppercase tracking-widest">
                    {fallback.tag}
                  </span>
                  <span className="text-[10px] font-bold opacity-60 uppercase tracking-widest">
                    {fallback.level}
                  </span>
                </div>

                <div className="relative z-10">
                  <h3 className="text-lg font-extrabold leading-tight mb-2 group-hover:text-emerald-400 transition-colors">
                    {mk.nama}
                  </h3>
                  <p className="text-[11px] opacity-70 line-clamp-2 leading-relaxed">
                    {fallback.description}
                  </p>
                </div>

              {/* Decorative circle */}
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
            </div>


            {/* Content Part */}
            <div className="p-6">
              <div className="grid grid-cols-3 gap-2 mb-6">
                <div className="flex items-center gap-2 text-gray-400">
                  <HiOutlineClock className="text-sm" />
                  <span className="text-[10px] font-bold whitespace-nowrap">{fallback.date}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400 justify-center">
                  <HiOutlineBookOpen className="text-sm" />
                  <span className="text-[10px] font-bold">{fallback.modules} modul</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400 justify-end">
                  <HiOutlineUsers className="text-sm" />
                  <span className="text-[10px] font-bold">{fallback.quota}</span>
                </div>
              </div>

              {/* Progress */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Progres belajar</span>
                  <span className="text-[10px] font-bold text-gray-900">{fallback.progress}%</span>
                </div>
                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${fallback.progress}%` }}
                  ></div>
                </div>
              </div>

              {/* Footer Part */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[10px] shadow-lg shadow-blue-100">
                    {fallback.instructorInitial}
                  </div>
                  <div>
                    <p className="text-[10px] font-extrabold text-gray-900 leading-none">{fallback.instructor}</p>
                    <p className="text-[9px] text-gray-400 mt-1 uppercase tracking-tighter">Pengajar</p>
                  </div>
                </div>

                {fallback.status === 'enroll' && (
                  <button 
                    onClick={async (e) => {
                      e.preventDefault();
                      await enrollKursus(mk.id);
                    }}
                    className="flex items-center gap-2 bg-emerald-500 text-white px-4 py-2 rounded-xl text-[10px] font-bold shadow-lg shadow-emerald-100 hover:bg-emerald-600 hover:-translate-y-0.5 transition-all"
                  >
                    Enroll <HiOutlineArrowRight />
                  </button>
                )}
                {fallback.status === 'registered' && (
                  <div className="flex items-center gap-2 bg-emerald-100 text-emerald-600 px-4 py-2 rounded-xl text-[10px] font-bold border border-emerald-200">
                    Terdaftar <HiOutlineCheckCircle className="text-lg" />
                  </div>
                )}
                {fallback.status === 'closed' && (
                  <div className="bg-gray-100 text-gray-400 px-4 py-2 rounded-xl text-[10px] font-bold border border-gray-200">
                    Belum Buka
                  </div>
                )}
              </div>
            </div>
          </div>
        </Link>
          );
        })}


      </div>

    </div>
  );
};

export default KursusTersedia;
