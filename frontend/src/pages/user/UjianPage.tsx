import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  HiOutlineSparkles, 
  HiOutlineCheckCircle, 
  HiOutlineInformationCircle,
  HiOutlineClock,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineLockClosed
} from 'react-icons/hi2';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import api from '../../lib/api';
import { usePendaftaranStore } from '../../store/usePendaftaranStore';

interface SoalItem {
  id: string;
  pertanyaan: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
}

const getCourseImageUrl = (kode: string) => {
  const k = (kode || '').toLowerCase();
  if (k.includes('wd-01') || k.includes('html') || k.includes('css')) {
    return 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=500&auto=format&fit=crop&q=60';
  }
  if (k.includes('wd-02') || k.includes('javascript') || k.includes('js')) {
    return 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=500&auto=format&fit=crop&q=60';
  }
  if (k.includes('wd-03') || k.includes('react')) {
    return 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=500&auto=format&fit=crop&q=60';
  }
  return 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=500&auto=format&fit=crop&q=60';
};

const UjianPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const courseId = searchParams.get('courseId') || '';

  const { pendaftaranList, fetchMyPendaftaran } = usePendaftaranStore();

  const [loading, setLoading] = useState(true);
  const [locked, setLocked] = useState(false);
  const [lockMessage, setLockMessage] = useState('');
  const [progressList, setProgressList] = useState<any[]>([]);
  const [validationModal, setValidationModal] = useState<{
    open: boolean;
    courseName: string;
    courseId: string;
    completed: number;
    total: number;
  } | null>(null);
  
  const [ujianId, setUjianId] = useState('');
  const [soalList, setSoalList] = useState<SoalItem[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<{ [soalId: string]: string }>({});
  const [refleksi, setRefleksi] = useState('');
  
  // Timer state
  const [timeLeft, setTimeLeft] = useState(5400); // 90 minutes in seconds
  const [submitting, setSubmitting] = useState(false);
  const [examStarted, setExamStarted] = useState(false);

  const currentPendaftaran = pendaftaranList.find(p => p.mataKuliahId === courseId);
  const courseName = currentPendaftaran?.mataKuliah?.nama || 'Mata Kuliah';

  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      try {
        await fetchMyPendaftaran();
        const progRes = await api.get('/student/status/progres');
        setProgressList(progRes.data.data || []);
      } catch (err) {
        console.error('Failed to fetch initial progress:', err);
      }

      if (courseId) {
        await fetchUjianData();
      } else {
        setLoading(false);
      }
    };
    initData();
  }, [courseId]);

  // Timer Countdown Effect
  useEffect(() => {
    if (loading || locked || !examStarted || timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmitExam(true); // Auto submit when time runs out
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [loading, locked, examStarted, timeLeft]);

  const fetchUjianData = async () => {
    setLoading(true);
    try {
      // Panggil API tanpa bypass agar validasi penyelesaian sesi pertemuan berjalan
      const response = await api.get(`/ujian/soal?mataKuliahId=${courseId}`);
      setUjianId(response.data.ujianId);
      const rawSoal = response.data.soal || [];
      const parsedSoal = rawSoal.map((s: any) => {
        try {
          if (s.pertanyaan && (s.pertanyaan.trim().startsWith('{') || s.pertanyaan.trim().startsWith('['))) {
            const parsed = JSON.parse(s.pertanyaan);
            return {
              ...s,
              pertanyaan: parsed.pertanyaan || s.pertanyaan,
              options: parsed.options || s.options || {
                A: 'Opsi A untuk soal ini',
                B: 'Opsi B untuk soal ini',
                C: 'Opsi C untuk soal ini',
                D: 'Opsi D untuk soal ini'
              }
            };
          }
        } catch (e) {
          console.error('Failed to parse exam question JSON:', e);
        }
        return s;
      });
      setSoalList(parsedSoal);
      if (response.data.durasi) {
        setTimeLeft(response.data.durasi * 60);
      }
    } catch (error: any) {
      console.error('Failed to fetch exam:', error);
      if (error.response?.status === 403) {
        setLocked(true);
        setLockMessage(error.response?.data?.message || 'Ujian terkunci. Anda belum menyelesaikan seluruh sesi pertemuan.');
      } else {
        alert('Gagal mengambil data ujian: ' + (error.response?.data?.message || error.message));
        navigate('/user/kursus-saya');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAnswer = (soalId: string, optionKey: string) => {
    setAnswers((prev) => ({
      ...prev,
      [soalId]: optionKey
    }));
  };

  const handleSubmitExam = async (isAuto = false) => {
    if (isAuto) {
      alert('Waktu ujian habis! Jawaban Anda akan otomatis dikumpulkan.');
    } else {
      const confirmSubmit = window.confirm('Apakah Anda yakin ingin mengumpulkan lembar jawaban ujian sekarang?');
      if (!confirmSubmit) return;
    }

    setSubmitting(true);
    try {
      // Map state answers to the array expected by API
      const answersPayload = soalList.map((q) => ({
        id: q.id,
        pertanyaan: q.pertanyaan,
        options: q.options,
        selectedAnswer: answers[q.id] || '' // empty if skipped
      }));

      const response = await api.post('/ujian/submit', {
        ujianId,
        answers: answersPayload,
        refleksi
      });

      // Arahkan ke halaman hasil skor dengan melewatkan data dari response
      navigate('/user/hasil-skor', { state: { result: response.data, courseId } });
    } catch (error: any) {
      console.error('Failed to submit exam:', error);
      alert('Gagal mengirimkan ujian: ' + (error.response?.data?.message || error.message));
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const renderValidationModal = () => {
    if (!validationModal || !validationModal.open) return null;

    const percent = validationModal.total > 0 
      ? Math.min(Math.round((validationModal.completed / validationModal.total) * 100), 100) 
      : 0;

    return (
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
              Anda belum dapat mengerjakan ujian untuk mata kuliah <span className="font-bold text-gray-900">{validationModal.courseName}</span> karena belum menyelesaikan seluruh sesi pertemuan.
            </p>
          </div>

          {/* Progress status card */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 text-left space-y-2">
            <div className="flex justify-between items-center text-xs font-black text-gray-700">
              <span>Progres Pertemuan Anda</span>
              <span className="text-indigo-600 font-bold">{validationModal.completed} dari {validationModal.total} Selesai</span>
            </div>
            <div className="h-2.5 w-full bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                style={{ width: `${percent}%` }}
              ></div>
            </div>
            <p className="text-[11px] text-gray-500 font-medium pt-1">
              Harap selesaikan seluruh sesi pertemuan beserta materi bacaan, video, kuis test formatif, dan refleksi terlebih dahulu.
            </p>
          </div>

          <div className="flex flex-col gap-2.5 pt-2">
            <Button 
              onClick={() => {
                const targetId = validationModal.courseId;
                setValidationModal(null);
                navigate(`/user/detail-kursus?id=${targetId}`);
              }}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-indigo-200 border-none cursor-pointer"
            >
              Lanjutkan Belajar Pertemuan
            </Button>
            <Button 
              onClick={() => setValidationModal(null)}
              variant="outline"
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl text-xs uppercase tracking-wider border-none cursor-pointer"
            >
              Tutup
            </Button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-10 bg-slate-50 min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest animate-pulse">Menyiapkan Lembar Soal Ujian...</p>
        </div>
      </div>
    );
  }

  // Handle missing courseId
  if (!courseId) {
    if (pendaftaranList.length === 0) {
      return (
        <div className="p-10 bg-slate-50 min-h-screen flex items-center justify-center">
          <Card className="rounded-[2.5rem] border-none shadow-sm bg-white p-12 text-center max-w-lg space-y-6">
            <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto text-amber-500">
              <HiOutlineInformationCircle className="text-4xl" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-gray-900">Belum Mengikuti Kursus</h3>
              <p className="text-sm text-gray-500 font-medium leading-relaxed">
                Anda belum terdaftar di kelas/mata kuliah manapun. Silakan daftar kelas terlebih dahulu untuk dapat mengakses ujian AI.
              </p>
            </div>
            <Button 
              onClick={() => navigate('/user/dashboard')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl text-xs px-8 py-5 uppercase tracking-wider shadow-lg"
            >
              Cari Kursus
            </Button>
          </Card>
        </div>
      );
    }

    return (
      <div className="p-8 bg-[#dcdcdc] min-h-screen pb-20">
        <div className="max-w-[1400px] mx-auto space-y-8">
          <div className="text-left">
            <h1 className="text-3xl font-black text-slate-800">Ujian - Pilih Kelas</h1>
            <p className="text-sm font-bold text-slate-500 mt-1">Silahkan Pilih Kelas Yang Ingin Anda Ikuti Ujian Akhir</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {pendaftaranList.map((p) => {
              const mk = p.mataKuliah;
              if (!mk) return null;
              
              const completedMeetings = progressList.filter(
                (pr) => pr.pertemuan?.mataKuliahId === p.mataKuliahId && pr.isCompleted
              ).length;
              const totalMeetings = mk.jumlahPertemuan || mk._count?.pertemuan || 3;
              const isUnlocked = completedMeetings >= totalMeetings && totalMeetings > 0;
              const percent = totalMeetings > 0 ? Math.min(Math.round((completedMeetings / totalMeetings) * 100), 100) : 0;
              const imageUrl = getCourseImageUrl(mk.kode);

              const handleItemClick = () => {
                if (!isUnlocked) {
                  setValidationModal({
                    open: true,
                    courseName: mk.nama,
                    courseId: p.mataKuliahId,
                    completed: completedMeetings,
                    total: totalMeetings
                  });
                  return;
                }
                navigate(`/user/ujian?courseId=${p.mataKuliahId}`);
              };

              return (
                <Card 
                  key={p.id}
                  className="rounded-[1.5rem] border border-gray-200 shadow-sm bg-white overflow-hidden flex flex-col justify-between hover:shadow-md transition-all duration-300 group cursor-pointer"
                  onClick={handleItemClick}
                >
                  <div className="relative w-full h-48 overflow-hidden select-none">
                    <img 
                      src={imageUrl} 
                      alt={mk.nama} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
                    />
                    {/* Badge Overlay */}
                    <div className="absolute top-4 left-4 flex gap-2">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100/90 backdrop-blur-sm text-blue-800 font-extrabold text-[9px] rounded-full uppercase tracking-wider">
                        • {mk.kategori || 'Programming'}
                      </span>
                      <span className="inline-flex items-center px-3 py-1 bg-black/60 backdrop-blur-sm text-white font-extrabold text-[9px] rounded-md tracking-wider">
                        {mk.kode}
                      </span>
                    </div>

                    {/* Status Badge */}
                    <div className="absolute top-4 right-4">
                      {isUnlocked ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-500/90 backdrop-blur-sm text-white font-extrabold text-[10px] rounded-full uppercase tracking-wider shadow-sm">
                          <HiOutlineCheckCircle className="text-xs" /> Siap Ujian
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-500/90 backdrop-blur-sm text-white font-extrabold text-[10px] rounded-full uppercase tracking-wider shadow-sm">
                          <HiOutlineLockClosed className="text-xs" /> Terkunci
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div className="text-left">
                      <h3 className="text-lg font-black text-slate-800 tracking-tight leading-tight group-hover:text-blue-600 transition-all">
                        {mk.nama}
                      </h3>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">
                        {mk.kode}
                      </p>
                      <p className="text-xs text-slate-500 font-semibold leading-relaxed mt-3 mb-4">
                        {mk.deskripsi || 'Mata kuliah pembelajaran sistem LMS Hybrid.'}
                      </p>

                      {/* Progress Indicator */}
                      <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-1.5 mb-2">
                        <div className="flex justify-between items-center text-[11px] font-bold">
                          <span className="text-slate-500">Progres Pertemuan</span>
                          <span className={isUnlocked ? "text-emerald-600 font-extrabold" : "text-amber-600 font-extrabold"}>
                            {completedMeetings}/{totalMeetings} Selesai ({percent}%)
                          </span>
                        </div>
                        <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all ${isUnlocked ? 'bg-emerald-500' : 'bg-amber-500'}`}
                            style={{ width: `${percent}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t border-gray-100 flex justify-start">
                      {isUnlocked ? (
                        <Button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleItemClick();
                          }}
                          className="bg-[#1b62b7] hover:bg-[#154c8f] text-white font-extrabold text-xs px-6 py-2.5 rounded-lg flex items-center justify-center border-none shadow-sm transition-all cursor-pointer"
                        >
                          Ambil Ujian
                        </Button>
                      ) : (
                        <Button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleItemClick();
                          }}
                          className="bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-extrabold text-xs px-5 py-2.5 rounded-lg flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                        >
                          <HiOutlineLockClosed className="text-amber-600" /> Ujian Terkunci
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {renderValidationModal()}
      </div>
    );
  }

  if (locked) {
    return (
      <div className="p-10 bg-slate-50 min-h-screen flex items-center justify-center">
        <Card className="rounded-[2.5rem] border-none shadow-sm bg-white p-12 text-center max-w-lg space-y-6">
          <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto text-rose-500 shadow-inner">
            <HiOutlineLockClosed className="text-4xl animate-bounce" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-black text-gray-900">Ujian Belum Terbuka</h3>
            <p className="text-sm text-gray-500 font-medium leading-relaxed">
              {lockMessage || 'Anda harus menyelesaikan seluruh sesi pertemuan untuk membuka ujian akhir.'}
            </p>
          </div>
          <div className="flex flex-col gap-3 pt-2">
            {courseId && (
              <Button 
                onClick={() => navigate(`/user/detail-kursus?id=${courseId}`)}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl text-xs py-4 uppercase tracking-wider shadow-lg shadow-indigo-100"
              >
                Lanjutkan Belajar Pertemuan
              </Button>
            )}
            <Button 
              onClick={() => navigate('/user/kursus-saya')}
              variant="outline"
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-black rounded-xl text-xs py-3.5 uppercase tracking-wider border-none"
            >
              Kembali ke Kursus Saya
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (soalList.length === 0) {
    return (
      <div className="p-10 bg-slate-50 min-h-screen flex items-center justify-center">
        <Card className="rounded-[2.5rem] border-none shadow-sm bg-white p-12 text-center max-w-lg space-y-6">
          <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto text-amber-500">
            <HiOutlineInformationCircle className="text-4xl" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-black text-gray-900">Soal Ujian Belum Tersedia</h3>
            <p className="text-sm text-gray-500 font-medium leading-relaxed">
              Maaf, belum ada soal latihan pilihan ganda yang di-input untuk kelas ini. Hubungi Dosen atau Asisten Anda.
            </p>
          </div>
          <Button 
            onClick={() => navigate('/user/kursus-saya')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl text-xs px-8 py-5 uppercase tracking-wider shadow-lg"
          >
            Kembali ke Kursus Saya
          </Button>
        </Card>
      </div>
    );
  }

  if (!examStarted) {
    const formattedDate = currentPendaftaran?.createdAt 
      ? new Date(currentPendaftaran.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
      : '19 Mar 2025';

    const currentCompletedMeetings = progressList.filter(
      (pr) => pr.pertemuan?.mataKuliahId === courseId && pr.isCompleted
    ).length;
    const currentTotalMeetings = currentPendaftaran?.mataKuliah?.jumlahPertemuan || currentPendaftaran?.mataKuliah?._count?.pertemuan || 3;
    const isReadyToStart = currentCompletedMeetings >= currentTotalMeetings && currentTotalMeetings > 0;
    const progressPercent = currentTotalMeetings > 0 ? Math.min(Math.round((currentCompletedMeetings / currentTotalMeetings) * 100), 100) : 0;

    return (
      <div className="p-8 bg-[#dcdcdc] min-h-screen pb-20">
        <div className="max-w-[1400px] mx-auto space-y-6">
          {/* Breadcrumb Back link */}
          <button 
            onClick={() => navigate('/user/ujian')}
            className="flex items-center gap-2 text-xs font-black text-slate-600 hover:text-slate-900 transition-all uppercase tracking-wider text-left border-none bg-transparent p-0 cursor-pointer"
          >
            <HiOutlineChevronLeft className="text-base stroke-[3]" /> List Ujian Akhir — {courseName}
          </button>

          {/* Banner Card */}
          <div className="bg-gradient-to-r from-blue-500 via-blue-450 to-[#8eb3df] text-white rounded-2xl p-6 flex justify-between items-center shadow-sm">
             <span className="text-sm font-black tracking-wide">
                Web Dev Bootcamp · Micro Learning · {formattedDate}
             </span>
             <Badge className="bg-amber-100 text-amber-800 border-none px-4 py-1.5 rounded-full font-black text-[10px] uppercase tracking-wider select-none">
                Sedang Berjalan
             </Badge>
          </div>

          {/* Start Exam Card */}
          <Card className="rounded-[1.5rem] border border-gray-200 shadow-sm bg-white p-10 text-left space-y-6">
             <div>
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-black text-slate-800">
                     Ujian Akhir — {courseName}
                  </h2>
                  {isReadyToStart ? (
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-extrabold text-[10px] rounded-full uppercase tracking-wider">
                      ✓ Siap Ujian
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-amber-100 text-amber-800 font-extrabold text-[10px] rounded-full uppercase tracking-wider flex items-center gap-1">
                      <HiOutlineLockClosed className="text-xs" /> Terkunci
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 font-bold uppercase mt-1 tracking-wider">
                   {soalList.length} soal
                </p>
             </div>

             {/* Info alert box */}
             {isReadyToStart ? (
               <div className="bg-[#ebf8ff] border border-[#bee3f8] p-5 rounded-xl flex items-center gap-3 text-slate-700 text-xs font-semibold">
                  <span className="w-2.5 h-2.5 bg-blue-500 rounded-full shrink-0"></span>
                  <span>
                     Kamu Telah Menyelesaikan Semua Materi. Silahkan Mulai Ujian Akhir Sebagai Syarat Mendapatkan Sertifikat.
                  </span>
               </div>
             ) : (
               <div className="bg-amber-50 border border-amber-200 p-5 rounded-xl flex flex-col gap-2 text-amber-900 text-xs font-semibold">
                  <div className="flex items-center gap-2">
                    <HiOutlineLockClosed className="text-lg text-amber-600 shrink-0" />
                    <span>
                       Perhatian: Anda baru menyelesaikan {currentCompletedMeetings} dari {currentTotalMeetings} pertemuan ({progressPercent}%). Selesaikan seluruh sesi pertemuan terlebih dahulu sebelum dapat mengerjakan ujian ini.
                    </span>
                  </div>
                  <div className="w-full bg-amber-200/60 h-2 rounded-full overflow-hidden mt-1">
                    <div className="bg-amber-500 h-full rounded-full transition-all" style={{ width: `${progressPercent}%` }}></div>
                  </div>
               </div>
             )}

             {/* Action Button */}
             <Button 
                onClick={() => {
                  if (!isReadyToStart) {
                    setValidationModal({
                      open: true,
                      courseName,
                      courseId,
                      completed: currentCompletedMeetings,
                      total: currentTotalMeetings
                    });
                    return;
                  }
                  setExamStarted(true);
                }}
                className={isReadyToStart
                  ? "w-full bg-[#10b981] hover:bg-[#059669] text-white font-black py-7 rounded-xl shadow-lg shadow-emerald-100 uppercase tracking-widest text-xs flex items-center justify-center gap-2 border-none cursor-pointer"
                  : "w-full bg-amber-500 hover:bg-amber-600 text-white font-black py-7 rounded-xl shadow-lg shadow-amber-200 uppercase tracking-widest text-xs flex items-center justify-center gap-2 border-none cursor-pointer"
                }
             >
                {isReadyToStart ? (
                  <>Mulai Ujian Akhir →</>
                ) : (
                  <><HiOutlineLockClosed className="text-base" /> Ujian Terkunci (Selesaikan Pertemuan Dulu)</>
                )}
             </Button>
          </Card>
        </div>

        {renderValidationModal()}
      </div>
    );
  }

  const currentQuestion = soalList[currentIdx];
  const isAnswered = (id: string) => !!answers[id];

  return (
    <div className="p-8 bg-slate-50 min-h-screen pb-20">
      <div className="max-w-[1400px] mx-auto space-y-8">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">Ujian Akhir - {courseName}</h1>
            <p className="text-xs text-gray-400 font-bold uppercase mt-1 tracking-wider">LMS Hybrid HybridAI System</p>
          </div>

          <Card className="rounded-2xl border-none shadow-sm bg-white px-6 py-4 flex items-center gap-4">
            <HiOutlineClock className="text-2xl text-purple-600 animate-pulse" />
            <div>
              <p className="text-[9px] font-black text-gray-400 uppercase leading-none">Sisa Waktu</p>
              <p className="text-lg font-black text-gray-900 mt-1 font-mono">{formatTime(timeLeft)}</p>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Navigation */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">Navigasi Soal</h3>
              <div className="grid grid-cols-5 gap-2.5 mb-8">
                {soalList.map((q, idx) => {
                  const answered = isAnswered(q.id);
                  const active = idx === currentIdx;

                  return (
                    <button 
                      key={q.id}
                      onClick={() => setCurrentIdx(idx)}
                      className={`w-full aspect-square rounded-xl flex items-center justify-center font-black text-xs transition-all ${
                        active ? 'bg-purple-600 text-white shadow-lg shadow-purple-100 scale-105' :
                        answered ? 'bg-emerald-500 text-white shadow-md shadow-emerald-100' :
                        'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
              
              <div className="flex flex-wrap gap-4 pt-5 border-t border-gray-50">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-purple-600 rounded-sm"></div>
                  <span className="text-[9px] font-black text-gray-400 uppercase">Aktif</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-emerald-500 rounded-sm"></div>
                  <span className="text-[9px] font-black text-gray-400 uppercase">Terjawab</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gray-100 rounded-sm"></div>
                  <span className="text-[9px] font-black text-gray-400 uppercase">Belum</span>
                </div>
              </div>
            </div>

            <Card className="rounded-[2rem] border-none shadow-sm bg-gradient-to-br from-indigo-950 to-slate-900 p-8 text-white text-center relative overflow-hidden">
              <p className="text-[9px] font-black opacity-60 uppercase tracking-widest mb-2">Total Pertanyaan</p>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-5xl font-black text-emerald-400">{soalList.length}</span>
                <span className="text-xs opacity-40 font-bold">Soal PG</span>
              </div>
              <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl"></div>
            </Card>
            {/* Card and Navigation spacer */}
          </div>

          {/* Center Questions Area */}
          <div className="lg:col-span-9 space-y-8">
            {/* Active Question Card */}
            <Card className="rounded-[2.5rem] border-none shadow-sm bg-white p-8 relative overflow-hidden">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-xl font-black text-gray-900 leading-none">Pertanyaan {currentIdx + 1} dari {soalList.length}</h2>
                  <p className="text-[10px] font-bold text-gray-400 uppercase mt-2">Pilihlah salah satu jawaban yang paling tepat</p>
                </div>
                <Badge className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider border-none ${
                  isAnswered(currentQuestion.id) ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                }`}>
                  {isAnswered(currentQuestion.id) ? 'Terjawab' : 'Belum Dijawab'}
                </Badge>
              </div>

              <div className="space-y-6">
                <p className="text-gray-700 font-semibold text-base leading-relaxed">
                  {currentQuestion.pertanyaan}
                </p>

                <div className="grid grid-cols-1 gap-3">
                  {(Object.keys(currentQuestion.options) as Array<keyof typeof currentQuestion.options>).map((key) => {
                    const optText = currentQuestion.options[key];
                    const isSelected = answers[currentQuestion.id] === key;

                    return (
                      <button 
                        key={key}
                        onClick={() => handleSelectAnswer(currentQuestion.id, key)}
                        className={`p-4.5 rounded-xl border-2 flex items-center gap-4 transition-all text-left ${
                          isSelected ? 'bg-purple-50 border-purple-500 text-purple-950 font-bold' : 'bg-white border-gray-100 hover:border-purple-200 text-gray-700'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs transition-colors ${
                          isSelected ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-400'
                        }`}>
                          {key}
                        </div>
                        <span className="text-sm font-bold">{optText}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-50">
                <Button 
                  disabled={currentIdx === 0}
                  onClick={() => setCurrentIdx((prev) => prev - 1)}
                  className="bg-gray-50 hover:bg-gray-100 text-gray-600 font-bold rounded-xl h-10 px-4 flex items-center gap-2 border-none shadow-none"
                >
                  <HiOutlineChevronLeft /> Sebelumnya
                </Button>

                <Button 
                  disabled={currentIdx === soalList.length - 1}
                  onClick={() => setCurrentIdx((prev) => prev + 1)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl h-10 px-4 flex items-center gap-2 border-none shadow-none"
                >
                  Berikutnya <HiOutlineChevronRight />
                </Button>
              </div>
            </Card>

            {/* Final Reflection Box & Submit Section */}
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-10 rounded-[2.5rem] border border-indigo-200 shadow-sm space-y-6">
              <div>
                <h2 className="text-2xl font-black text-indigo-950 flex items-center gap-2 leading-none">
                  Refleksi Akhir Pembelajaran <HiOutlineSparkles className="text-indigo-500 text-xl" />
                </h2>
                <p className="text-[11px] font-bold text-indigo-700/60 uppercase mt-2 tracking-wide">Generate feedback akhir berbasis AI</p>
              </div>

              <textarea 
                value={refleksi}
                onChange={(e) => setRefleksi(e.target.value)}
                className="w-full p-6 bg-white border border-indigo-200 rounded-[2rem] text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all min-h-[160px] shadow-inner text-gray-800 font-medium"
                placeholder="Tuliskan refleksi singkat mengenai pemahaman Anda selama mengikuti bootcamp/kuliah ini. Apa kesulitan utama Anda dan bagaimana Anda mengatasinya?..."
              ></textarea>
              
              <div className="flex gap-3 text-indigo-900/60 p-4.5 bg-white/50 rounded-2xl border border-indigo-200/30">
                <HiOutlineInformationCircle className="text-2xl flex-shrink-0 text-indigo-600" />
                <p className="text-[10px] font-bold leading-relaxed uppercase tracking-wider">
                  Nilai kelulusan minimal adalah 70. AI akan menilai PG dan memberikan saran sertifikat setelah dikirim.
                </p>
              </div>

              <Button 
                onClick={() => handleSubmitExam(false)}
                disabled={submitting}
                className="w-full py-7 bg-indigo-600 hover:bg-indigo-700 text-white rounded-3xl font-black text-base shadow-xl shadow-indigo-200 transition-all flex items-center justify-center gap-3 uppercase tracking-wider"
              >
                {submitting ? (
                  <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>Kumpulkan Lembar Ujian <HiOutlineCheckCircle className="text-xl" /></>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UjianPage;
