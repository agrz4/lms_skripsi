import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  HiOutlineBookOpen, 
  HiOutlineCheckCircle, 
  HiOutlineSparkles, 
  HiOutlineArrowRight, 
  HiOutlinePlay 
} from 'react-icons/hi2';
import { usePendaftaranStore } from '../../store/usePendaftaranStore';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import api from '../../lib/api';

const KursusSaya: React.FC = () => {
  const navigate = useNavigate();
  const { pendaftaranList, fetchMyPendaftaran, isLoading: pendaftaranLoading } = usePendaftaranStore();
  const [progressData, setProgressData] = useState<any[]>([]);
  const [loadingProgress, setLoadingProgress] = useState(true);

  useEffect(() => {
    fetchMyPendaftaran();
    fetchProgress();
  }, []);

  const fetchProgress = async () => {
    try {
      const response = await api.get('/student/status/progres');
      setProgressData(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch student progress', error);
    } finally {
      setLoadingProgress(false);
    }
  };

  const getCourseProgress = (courseId: string) => {
    // Filter progress items that belong to meetings of this course and are completed
    const completedSessions = progressData.filter(
      (prog) => prog.pertemuan?.mataKuliahId === courseId && prog.isCompleted
    ).length;

    // A course has 14 sessions (standard)
    const totalSessions = 14;
    const percentage = Math.min(Math.round((completedSessions / totalSessions) * 100), 100);

    return {
      completed: completedSessions,
      total: totalSessions,
      percentage
    };
  };

  const loading = pendaftaranLoading || loadingProgress;

  if (loading) {
    return (
      <div className="p-10 bg-[#F3F4F6] min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest animate-pulse">Memuat Kursus Anda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-10 bg-[#F3F4F6] min-h-screen pb-20">
      {/* Header */}
      <div className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 leading-tight">Kursus Saya</h1>
          <p className="text-sm font-bold text-gray-400 uppercase tracking-[0.2em] mt-2">Kelola dan Lanjutkan Pembelajaran Anda</p>
        </div>
        <Badge className="bg-indigo-600 text-white px-6 py-2 rounded-full font-black text-[10px] uppercase tracking-widest border-none">
          {pendaftaranList.length} Kursus Diikuti
        </Badge>
      </div>

      {pendaftaranList.length === 0 ? (
        <Card className="rounded-[2.5rem] border-none shadow-sm bg-white p-12 text-center max-w-2xl mx-auto space-y-6">
          <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto text-indigo-600">
            <HiOutlineBookOpen className="text-4xl" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-black text-gray-900">Belum Ada Kursus</h3>
            <p className="text-sm text-gray-500 font-medium max-w-md mx-auto">
              Anda belum terdaftar di kelas manapun. Silakan jelajahi daftar kursus yang tersedia untuk mulai belajar.
            </p>
          </div>
          <Button 
            onClick={() => navigate('/user/dashboard')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl text-xs px-8 py-6 uppercase tracking-wider shadow-lg shadow-indigo-100"
          >
            Cari Kursus
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
          {pendaftaranList.map((pendaftar) => {
            const mk = pendaftar.mataKuliah;
            if (!mk) return null;
            const progress = getCourseProgress(mk.id);

            return (
              <Card 
                key={pendaftar.id} 
                className="rounded-[2.5rem] border-none shadow-sm bg-white overflow-hidden group hover:shadow-2xl hover:shadow-indigo-100 transition-all duration-500 flex flex-col cursor-pointer"
                onClick={() => navigate(`/user/detail-kursus?id=${mk.id}`)}
              >
                {/* Header Banner */}
                <div className="h-48 bg-gradient-to-br from-indigo-700 via-blue-800 to-indigo-950 p-8 relative overflow-hidden flex flex-col justify-between">
                  <div className="flex justify-between items-center relative z-10">
                    <Badge className="bg-white/20 backdrop-blur-md text-white border-none font-black text-[9px] px-4 py-1.5 uppercase tracking-widest">
                      {mk.kategori || 'Informatika'}
                    </Badge>
                    <HiOutlineSparkles className="text-white/30 text-2xl" />
                  </div>
                  
                  <div className="relative z-10">
                    <h3 className="text-xl font-black text-white leading-tight mb-2 group-hover:text-indigo-200 transition-all">
                      {mk.nama}
                    </h3>
                    <p className="text-[10px] font-bold text-indigo-100/70 uppercase tracking-widest">
                      {mk.kode}
                    </p>
                  </div>

                  {/* Decorative Elements */}
                  <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                  <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-15"></div>
                </div>

                {/* Body Content */}
                <div className="p-8 flex-1 flex flex-col justify-between">
                  {/* Progress Section */}
                  <div className="space-y-4 mb-8">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-gray-400 uppercase tracking-wider text-[9px]">Progres Pembelajaran</span>
                      <span className="text-indigo-600">{progress.completed} / {progress.total} Sesi</span>
                    </div>

                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-indigo-600 rounded-full transition-all duration-1000"
                        style={{ width: `${progress.percentage}%` }}
                      ></div>
                    </div>

                    <div className="flex justify-between items-center pt-2">
                      <span className="text-[10px] text-gray-500 font-bold uppercase">{progress.percentage}% Selesai</span>
                      {progress.percentage === 100 && (
                        <span className="flex items-center gap-1 text-[9px] font-black text-emerald-600 uppercase tracking-wider bg-emerald-50 px-2 py-1 rounded-md">
                          <HiOutlineCheckCircle /> Siap Ujian
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Footer Actions */}
                  <div className="pt-6 border-t border-gray-50 flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center font-black text-indigo-600 text-[9px]">
                        {mk.kode.substring(0, 2)}
                      </div>
                      <div>
                        <p className="text-[9px] font-bold text-gray-400 uppercase">Tipe Kursus</p>
                        <p className="text-[10px] font-black text-gray-800 leading-none mt-0.5">{mk.tipeKursus || 'HYBRID'}</p>
                      </div>
                    </div>

                    <Button 
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/user/detail-kursus?id=${mk.id}`);
                      }}
                      className="bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-black rounded-xl text-[9px] px-4 py-4 uppercase tracking-widest shadow-none"
                    >
                      {progress.completed > 0 ? (
                        <>Lanjut <HiOutlinePlay className="ml-1 text-xs" /></>
                      ) : (
                        <>Mulai <HiOutlineArrowRight className="ml-1" /></>
                      )}
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default KursusSaya;
