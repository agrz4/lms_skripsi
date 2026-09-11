import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMataKuliahStore } from '../../store/useMataKuliahStore';
import { useJadwalStore } from '../../store/useJadwalStore';
import { usePendaftaranStore } from '../../store/usePendaftaranStore';
import { 
  HiOutlineCheckCircle, 
  HiOutlineLockClosed,
  HiOutlinePlayCircle,
  HiOutlineInformationCircle
} from 'react-icons/hi2';
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import api from '../../lib/api';

const DetailKursus: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const courseId = searchParams.get('id');
  
  const { mataKuliahList, fetchMataKuliah } = useMataKuliahStore();
  const { jadwalList, fetchJadwal } = useJadwalStore();
  const { pendaftaranList, fetchMyPendaftaran, isLoading: isPendaftaranLoading } = usePendaftaranStore();

  const [hasCheckedEnrollment, setHasCheckedEnrollment] = useState(false);
  const [summary, setSummary] = useState<{
    avgRefleksi: number;
    avgTugas: number;
    completedMeetings: number;
    totalMeetings: number;
    examScore: number | null;
  } | null>(null);

  useEffect(() => {
    fetchMataKuliah();
    fetchMyPendaftaran().then(() => setHasCheckedEnrollment(true));
    if (courseId) {
      fetchJadwal(courseId);
      api.get(`/student/course-summary/${courseId}`)
        .then(res => setSummary(res.data))
        .catch(err => console.error('Failed to fetch course summary', err));
    }
  }, [courseId, fetchMataKuliah, fetchJadwal, fetchMyPendaftaran]);

  useEffect(() => {
    if (hasCheckedEnrollment && !isPendaftaranLoading && courseId) {
      const isEnrolled = pendaftaranList.some(p => p.mataKuliahId === courseId);
      if (!isEnrolled) {
        navigate(`/user/enrolment-options?id=${courseId}`, { replace: true });
      }
    }
  }, [hasCheckedEnrollment, isPendaftaranLoading, pendaftaranList, courseId, navigate]);

  const course = mataKuliahList.find(mk => mk.id === courseId);
  const completedSessions = summary ? summary.completedMeetings : 0;
  const totalSessionsCount = summary ? summary.totalMeetings : (jadwalList.length > 0 ? jadwalList.length : (course?.jumlahPertemuan || 3));
  const progressPercent = totalSessionsCount > 0 ? Math.round((completedSessions / totalSessionsCount) * 100) : 0;
  const [showExamLockModal, setShowExamLockModal] = useState(false);

  const getSessionDescription = (pertemuan: any, isActive: boolean, isCompleted: boolean) => {
    if (!pertemuan.materi || pertemuan.materi.length === 0) {
      return isCompleted ? 'Review Sesi' : isActive ? 'Sesi Aktif · Menunggu Materi' : 'Belum Terbuka';
    }
    
    const videoCount = pertemuan.materi.filter((m: any) => m.videoUrl).length;
    const pdfCount = pertemuan.materi.filter((m: any) => m.fileUrl).length;
    const hasRefleksi = pertemuan.materi.some((m: any) => m.refleksi && m.refleksi.trim());
    
    const parts = [];
    if (videoCount > 0) parts.push(`${videoCount} Video`);
    if (pdfCount > 0) parts.push(`${pdfCount} PDF`);
    if (hasRefleksi) parts.push('Refleksi');
    
    return parts.length > 0 ? parts.join(' · ') : 'Review Materi';
  };

  return (
    <div className="p-8 bg-[#F3F4F6] min-h-screen pb-20">
      {/* Header Progress Section */}
      <div className="bg-[#2D3748] rounded-[2rem] p-10 mb-10 text-white shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">
          <div className="flex items-center gap-6">
             <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-3xl">
                🚀
             </div>
             <div>
                <h1 className="text-3xl font-black">{course?.nama || 'Web Development'}</h1>
                <p className="text-indigo-200 font-bold uppercase tracking-widest text-[10px] mt-1">Status: Sedang Berjalan</p>
             </div>
          </div>
          <div className="w-full md:w-[350px]">
             <div className="flex justify-between items-end mb-3">
                 <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Progress Belajar</span>
                 <span className="text-xs font-black">{completedSessions}/{totalSessionsCount} Sesi</span>
             </div>
             <div className="h-2.5 w-full bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 transition-all duration-1000 shadow-[0_0_15px_rgba(59,130,246,0.5)]" 
                  style={{ width: `${progressPercent}%` }}
                ></div>
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: 14 Meetings */}
        <div className="lg:col-span-8 space-y-4">
          {jadwalList.map((s, index) => {
            const isCompleted = index < completedSessions;
            const isActive = index === completedSessions;
            const isLocked = index > completedSessions;

            return (
              <div 
                key={s.id} 
                className={`group rounded-[1.8rem] p-6 transition-all duration-300 border-2 ${
                  isActive ? 'bg-[#E0E7FF] border-[#C7D2FE] shadow-xl shadow-indigo-100 scale-[1.02]' : 
                  isCompleted ? 'bg-white border-emerald-100 hover:border-emerald-200' : 
                  'bg-white border-transparent shadow-sm grayscale opacity-70'
                }`}
              >
                <div className="flex items-center justify-between gap-6">
                  <div className="flex items-center gap-6">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-black ${
                      isActive ? 'bg-indigo-500 text-white' : 
                      isCompleted ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-400'
                    }`}>
                      {s.urutan}
                    </div>
                    <div>
                      <h3 className={`text-lg font-black ${isActive ? 'text-indigo-900' : isCompleted ? 'text-gray-800' : 'text-gray-400'}`}>
                        Pertemuan {s.urutan} — {s.topik || 'Belum Ada Topik'}
                        {isActive && <span className="ml-2 text-indigo-500">← Aktif</span>}
                        {isLocked && <HiOutlineLockClosed className="inline ml-2 text-sm" />}
                      </h3>
                      <p className={`text-[10px] font-bold uppercase tracking-wider mt-1 ${isActive ? 'text-indigo-500' : isCompleted ? 'text-emerald-600/60' : 'text-gray-400'}`}>
                        {isCompleted || isActive ? getSessionDescription(s, isActive, isCompleted) : 'Belum Terbuka'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                     {(isCompleted || isActive) && (
                       <Button 
                         onClick={() => navigate(`/user/materi-sesi?pertemuanId=${s.id}`)}
                         size="sm" 
                         className={`${
                           isActive ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-emerald-600 hover:bg-emerald-700'
                         } text-white font-black rounded-xl text-[10px] px-6 transition-all`}
                       >
                         {isActive ? 'MASUK KELAS' : 'REVIEW MATERI'}
                       </Button>
                     )}
                     {isLocked && (
                       <Badge className="bg-gray-100 text-gray-400 rounded-lg px-4 py-1 text-[10px] font-black border-none uppercase">
                         Terkunci
                       </Badge>
                     )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Widgets */}
        <div className="lg:col-span-4 space-y-8">
          {/* Progress Card */}
          <Card className="rounded-[2.5rem] border-none shadow-sm bg-white p-8">
            <h2 className="text-xl font-black text-gray-900 mb-8">Progress Kursus</h2>
            <div className="space-y-6">
               <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-gray-400">
                     <span>Pertemuan Selesai</span>
                     <span className="text-indigo-600">{completedSessions}/{totalSessionsCount}</span>
                  </div>
                  <Progress value={progressPercent} className="h-2 bg-gray-100" />
               </div>
               <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-gray-400">
                     <span>Refleksi Submit</span>
                     <span className="text-emerald-600">{completedSessions}/{totalSessionsCount}</span>
                  </div>
                  <Progress value={progressPercent} className="h-2 bg-gray-100" />
               </div>
               <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-gray-400">
                     <span>Latihan Selesai</span>
                     <span className="text-amber-600">{completedSessions}/{totalSessionsCount}</span>
                  </div>
                  <Progress value={progressPercent} className="h-2 bg-gray-100" />
               </div>
            </div>
          </Card>

          {/* Nilai Card */}
          <Card className="rounded-[2.5rem] border-none shadow-sm bg-white overflow-hidden">
            <div className="p-8 pb-4">
               <h2 className="text-xl font-black text-gray-900 mb-6">Status Nilai</h2>
            </div>
            <div className="divide-y divide-gray-50">
               <div className="p-6 flex justify-between items-center">
                  <span className="text-xs font-bold text-gray-500">Rata Latihan Test Formatif</span>
                  <span className="text-lg font-black text-gray-900">{summary && summary.avgTugas !== null ? summary.avgTugas : '—'}</span>
               </div>
               <div className="p-6 flex justify-between items-center">
                  <span className="text-xs font-bold text-gray-500">Rata Refleksi</span>
                  <span className="text-lg font-black text-gray-900">{summary && summary.avgRefleksi !== null ? summary.avgRefleksi : '—'}</span>
               </div>
               <div className="p-6 flex justify-between items-center">
                  <span className="text-xs font-bold text-gray-500">Ujian AI</span>
                  <span className="text-lg font-black text-gray-900">{summary && summary.examScore !== null ? summary.examScore : '—'}</span>
               </div>
            </div>
          </Card>

          {/* AI Exam Card */}
          <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-8 rounded-[2.5rem] border-2 border-indigo-100 shadow-xl shadow-indigo-100/50">
             <h3 className="text-lg font-black text-indigo-900 mb-2">Ujian AI</h3>
             <p className="text-xs text-indigo-700/60 font-bold mb-8">Tersedia setelah semua {totalSessionsCount} pertemuan selesai</p>
             
             {completedSessions >= totalSessionsCount && totalSessionsCount > 0 ? (
               <Button 
                 onClick={() => navigate(`/user/ujian?courseId=${courseId}`)}
                 className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-8 rounded-2xl flex flex-col gap-1 shadow-lg shadow-indigo-200 transition-all cursor-pointer"
               >
                 <div className="flex items-center gap-2">
                    <span>Mulai Ujian Sekarang</span>
                 </div>
               </Button>
             ) : (
               <Button 
                 onClick={() => setShowExamLockModal(true)}
                 className="w-full bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-black py-7 rounded-2xl flex flex-col gap-1 shadow-sm transition-all cursor-pointer group"
               >
                  <div className="flex items-center gap-2 text-sm font-black">
                     <HiOutlineLockClosed className="text-amber-600 group-hover:scale-110 transition-transform" /> 
                     <span>Ujian Terkunci ({completedSessions}/{totalSessionsCount} Pertemuan)</span>
                  </div>
                  <span className="text-[10px] text-amber-700/80 font-bold uppercase tracking-wider">
                     Klik untuk info & syarat pengerjaan
                  </span>
               </Button>
             )}
          </div>
        </div>
      </div>

      {/* Validation Modal for Locked Exam */}
      {showExamLockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[2.5rem] p-8 md:p-10 max-w-md w-full shadow-2xl border border-gray-100 text-center space-y-6 animate-in zoom-in-95 duration-200">
            <div className="w-20 h-20 bg-rose-50 border-4 border-rose-100 rounded-3xl flex items-center justify-center mx-auto text-rose-500 shadow-lg shadow-rose-100">
              <HiOutlineLockClosed className="text-4xl" />
            </div>

            <div className="space-y-3">
              <span className="px-3 py-1 bg-rose-100 text-rose-800 text-[10px] font-black uppercase tracking-widest rounded-full">
                Ujian Belum Terbuka
              </span>
              <h3 className="text-2xl font-black text-gray-900">
                Belum Dapat Mengerjakan Ujian
              </h3>
              <p className="text-xs text-gray-600 font-semibold leading-relaxed">
                Anda belum dapat mengikuti Ujian Akhir untuk mata kuliah <span className="font-bold text-gray-900">{course?.nama || 'ini'}</span> karena belum menyelesaikan seluruh sesi pertemuan.
              </p>
            </div>

            {/* Progress status card inside modal */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 text-left space-y-2">
              <div className="flex justify-between items-center text-xs font-black text-gray-700">
                <span>Progres Pertemuan Anda</span>
                <span className="text-indigo-600">{completedSessions} dari {totalSessionsCount} Selesai</span>
              </div>
              <div className="h-2.5 w-full bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-600 rounded-full transition-all"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
              <p className="text-[11px] text-gray-500 font-medium pt-1">
                Harap selesaikan modul video, materi bacaan, latihan test formatif, dan refleksi pada setiap sesi pertemuan terlebih dahulu.
              </p>
            </div>

            <div className="flex flex-col gap-2.5 pt-2">
              <Button 
                onClick={() => setShowExamLockModal(false)}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-indigo-200 border-none"
              >
                Lanjutkan Belajar Pertemuan
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Simple internal Card component for clean design
const Card = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={`bg-white rounded-[2rem] border border-gray-100 shadow-sm ${className}`}>
    {children}
  </div>
);

export default DetailKursus;
