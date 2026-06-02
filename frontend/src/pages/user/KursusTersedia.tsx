import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiOutlineClock, HiOutlineBookOpen, HiOutlineUsers, HiOutlineArrowRight, HiOutlineCheckCircle, HiOutlineSparkles } from 'react-icons/hi2';
import { useMataKuliahStore } from '../../store/useMataKuliahStore';
import { usePendaftaranStore } from '../../store/usePendaftaranStore';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const KursusTersedia: React.FC = () => {
  const navigate = useNavigate();
  const { publishedMataKuliahList, fetchPublishedMataKuliah } = useMataKuliahStore();
  const { pendaftaranList, fetchMyPendaftaran, enrollKursus } = usePendaftaranStore();

  useEffect(() => {
    fetchPublishedMataKuliah();
    fetchMyPendaftaran();
  }, [fetchPublishedMataKuliah, fetchMyPendaftaran]);

  const getFallbackData = (mk: any) => {
    const isRegistered = pendaftaranList.some((p) => p.mataKuliahId === mk.id);
    return {
      description: mk.deskripsi || 'Pelajari materi ini untuk meningkatkan keahlian Anda secara komprehensif dengan bantuan AI.',
      tag: mk.kategori || 'Informatika',
      level: mk.level || 'Beginner',
      modules: 14,
      instructor: mk.pengajar?.nama || 'Dr. Budi Santoso',
      status: isRegistered ? ('registered' as const) : ('enroll' as const),
    };
  };

  const handleEnroll = async (id: string) => {
    await enrollKursus(id);
    navigate(`/user/detail-kursus?id=${id}`);
  };

  return (
    <div className="p-10 bg-[#F3F4F6] min-h-screen pb-20">
      <div className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 leading-tight">Kursus Tersedia</h1>
          <p className="text-sm font-bold text-gray-400 uppercase tracking-[0.2em] mt-2">Daftar & Mulai Belajar Bersama AI</p>
        </div>
        <Badge className="bg-indigo-100 text-indigo-600 px-6 py-2 rounded-full font-black text-[10px] uppercase tracking-widest border-none">
           {publishedMataKuliahList.length} Kursus Terbuka
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
        {publishedMataKuliahList.map((mk) => {
          const fallback = getFallbackData(mk);
          const isRegistered = pendaftaranList.some((p) => p.mataKuliahId === mk.id);
          const participantCount = Math.max(mk._count?.pendaftaran || 0, isRegistered ? 1 : 0);
          return (
            <Card 
              key={mk.id} 
              className="rounded-[2.5rem] border-none shadow-sm bg-white overflow-hidden group hover:shadow-2xl hover:shadow-indigo-100 transition-all duration-500 flex flex-col cursor-pointer"
              onClick={() => navigate(`/user/detail-kursus?id=${mk.id}`)}
            >
              {/* Image / Header Placeholder */}
              <div className="h-56 bg-gradient-to-br from-indigo-600 via-blue-600 to-indigo-700 p-8 relative overflow-hidden flex flex-col justify-between">
                 <div className="flex justify-between items-center relative z-10">
                    <Badge className="bg-white/20 backdrop-blur-md text-white border-none font-black text-[9px] px-4 py-1 uppercase tracking-widest">
                       {fallback.tag}
                    </Badge>
                    <HiOutlineSparkles className="text-white/30 text-2xl" />
                 </div>
                 
                 <div className="relative z-10">
                    <h3 className="text-xl font-black text-white leading-tight mb-2 group-hover:text-indigo-200 transition-all">
                       {mk.nama}
                    </h3>
                    <p className="text-[10px] font-bold text-indigo-100/70 uppercase tracking-widest">
                       {mk.kode} · {fallback.level}
                    </p>
                 </div>

                 {/* Decorative elements */}
                 <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                 <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
              </div>

              <div className="p-8 flex-1 flex flex-col">
                 <p className="text-xs font-bold text-gray-500 leading-relaxed line-clamp-3 mb-8 italic">
                    "{fallback.description}"
                 </p>

                 <div className="grid grid-cols-2 gap-4 mb-10">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400">
                          <HiOutlineBookOpen className="text-lg" />
                       </div>
                       <div>
                          <p className="text-[9px] font-black text-gray-400 uppercase">Materi</p>
                          <p className="text-[11px] font-black text-gray-800">{(mk._count?.pertemuan || fallback.modules)} Sesi</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400">
                          <HiOutlineUsers className="text-lg" />
                       </div>
                       <div>
                          <p className="text-[9px] font-black text-gray-400 uppercase">Peserta</p>
                          <p className="text-[11px] font-black text-gray-800">{participantCount} Mahasiswa</p>
                       </div>
                    </div>
                 </div>

                 <div className="mt-auto pt-8 border-t border-gray-50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-full bg-indigo-50 border-2 border-white shadow-sm flex items-center justify-center font-black text-indigo-600 text-[10px]">
                          {fallback.instructor.split(' ').map(n => n[0]).join('').substring(1,3)}
                       </div>
                       <div>
                          <p className="text-[10px] font-black text-gray-900 leading-none">{fallback.instructor}</p>
                          <p className="text-[8px] font-bold text-gray-400 uppercase mt-1 tracking-widest">Pengajar</p>
                       </div>
                    </div>

                    {fallback.status === 'enroll' ? (
                       <Button 
                         onClick={(e) => {
                           e.stopPropagation();
                           handleEnroll(mk.id);
                         }}
                         className="bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl text-[10px] px-6 py-5 shadow-lg shadow-indigo-100 uppercase tracking-widest"
                       >
                          Enroll <HiOutlineArrowRight className="ml-2" />
                       </Button>
                    ) : (
                       <div className="flex items-center gap-2 text-emerald-600 font-black text-[10px] uppercase tracking-widest bg-emerald-50 px-4 py-2 rounded-xl">
                          <HiOutlineCheckCircle className="text-lg" /> Terdaftar
                       </div>
                    )}
                 </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default KursusTersedia;
