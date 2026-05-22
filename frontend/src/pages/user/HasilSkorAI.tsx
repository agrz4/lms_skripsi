import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  HiOutlineAcademicCap, 
  HiOutlineDocumentCheck, 
  HiOutlinePencilSquare, 
  HiOutlineSparkles,
  HiOutlineArrowDownTray,
  HiOutlineBookOpen,
  HiOutlineCheckCircle,
  HiOutlineXCircle
} from 'react-icons/hi2';
import api from '../../lib/api';
import { usePendaftaranStore } from '../../store/usePendaftaranStore';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ExamResult {
  examScore: number;
  avgRefleksi: number;
  avgTugas: number;
  feedback: {
    general: string;
    details: {
      [key: string]: {
        isCorrect: boolean;
        correctOption: string;
        explanation: string;
      };
    };
  } | null;
  sertifikat: {
    id: string;
    noSertifikat: string;
    fileUrl: string;
    createdAt: string;
  } | null;
}

const HasilSkorAI: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const courseIdFromParam = searchParams.get('courseId') || '';
  const [selectedCourseId, setSelectedCourseId] = useState<string>(courseIdFromParam);
  
  const { pendaftaranList, fetchMyPendaftaran } = usePendaftaranStore();
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ExamResult | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchMyPendaftaran();
  }, [fetchMyPendaftaran]);

  useEffect(() => {
    // If state is passed from UjianPage.tsx
    if (location.state?.result && location.state?.courseId) {
      const stateResult = location.state.result;
      const stateCourseId = location.state.courseId;
      setSelectedCourseId(stateCourseId);
      setSearchParams({ courseId: stateCourseId });
      
      let parsedFeedback = null;
      if (stateResult.feedback) {
        try {
          parsedFeedback = typeof stateResult.feedback === 'string' 
            ? JSON.parse(stateResult.feedback) 
            : stateResult.feedback;
        } catch (e) {
          parsedFeedback = { general: stateResult.feedback, details: {} };
        }
      }

      setResult({
        examScore: stateResult.score,
        avgRefleksi: stateResult.avgRefleksi || 0,
        avgTugas: stateResult.avgTugas || 0,
        feedback: parsedFeedback,
        sertifikat: stateResult.sertifikat
      });
      setLoading(false);
    } else if (selectedCourseId) {
      fetchResultData(selectedCourseId);
    }
  }, [location.state, selectedCourseId]);

  const fetchResultData = async (courseId: string) => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await api.get(`/ujian/result?courseId=${courseId}`);
      setResult(res.data);
    } catch (err: any) {
      console.error('Failed to fetch exam result:', err);
      setResult(null);
      if (err.response?.status === 404) {
        setErrorMsg('Anda belum menyelesaikan ujian akhir untuk mata kuliah ini.');
      } else {
        setErrorMsg('Gagal mengambil hasil ujian.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCourseChange = (courseId: string) => {
    setSelectedCourseId(courseId);
    setSearchParams({ courseId });
  };

  const handleDownloadCertificate = async (noSertifikat: string) => {
    try {
      const response = await api.get(`/admin/sertifikat/download/${noSertifikat}`, {
        responseType: 'blob'
      });
      const blob = new Blob([response.data], { type: 'image/svg+xml' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${noSertifikat}.svg`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (err) {
      console.error('Failed to download certificate:', err);
      alert('Gagal mendownload sertifikat.');
    }
  };

  return (
    <div className="p-8 bg-slate-50 min-h-screen pb-20">
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Hasil & Skor AI</h1>
            <p className="text-gray-500 font-medium">Evaluasi Ujian Akhir, Nilai Kumulatif & Sertifikat Digital</p>
          </div>
          
          {/* Course Selector Dropdown */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-black text-gray-400 uppercase tracking-wider">Pilih Kelas:</span>
            <select
              value={selectedCourseId}
              onChange={(e) => handleCourseChange(e.target.value)}
              className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-bold text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Pilih Mata Kuliah --</option>
              {pendaftaranList.map((p) => (
                <option key={p.mataKuliahId} value={p.mataKuliahId}>
                  {p.mataKuliah?.nama || 'Mata Kuliah'} ({p.mataKuliah?.kode})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Loading state */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest animate-pulse">Memuat Hasil Ujian Anda...</p>
          </div>
        ) : errorMsg ? (
          /* Error / Exam Not Taken State */
          <div className="max-w-xl mx-auto py-16 text-center">
            <Card className="rounded-[2.5rem] border-none shadow-sm bg-white p-12 space-y-6">
              <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto text-amber-500">
                <HiOutlineAcademicCap className="text-4xl" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-gray-900">Ujian Belum Ditempuh</h3>
                <p className="text-sm text-gray-500 font-medium leading-relaxed">
                  {errorMsg}
                </p>
              </div>
              {selectedCourseId && (
                <Button 
                  onClick={() => navigate(`/user/ujian?courseId=${selectedCourseId}`)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl text-xs px-8 py-5 uppercase tracking-wider shadow-lg"
                >
                  Ambil Ujian Sekarang
                </Button>
              )}
            </Card>
          </div>
        ) : result ? (
          /* Result Display State */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Main Results Column */}
            <div className="lg:col-span-8 space-y-8">
              {/* Hero Score Card */}
              <div className="bg-gradient-to-br from-slate-700 to-slate-900 rounded-[3rem] p-12 text-white text-center shadow-2xl relative overflow-hidden">
                <div className="relative z-10">
                  <span className="text-[120px] font-black leading-none text-emerald-400 drop-shadow-[0_0_30px_rgba(52,211,153,0.3)]">
                    {result.examScore}
                  </span>
                  <p className="text-lg font-bold opacity-60 mt-4">Skor Ujian Akhir Pilihan Ganda</p>
                  
                  <div className="max-w-md mx-auto my-8">
                    <div className="h-3 w-full bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-emerald-50 rounded-full shadow-[0_0_20px_rgba(16,185,129,0.5)] transition-all duration-1000"
                        style={{ width: `${result.examScore}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className={`inline-flex items-center gap-3 px-8 py-3 rounded-2xl font-extrabold text-xl shadow-xl ${
                    result.examScore >= 70 ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
                  }`}>
                    Status: {result.examScore >= 70 ? 'Lulus' : 'Tidak Lulus'}{' '}
                    <HiOutlineDocumentCheck className="text-2xl" />
                  </div>
                </div>

                {/* Decorative background elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -ml-20 -mb-20"></div>
              </div>

              {/* Score Breakdown Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 text-center group hover:-translate-y-1 transition-all">
                  <span className="text-4xl font-black text-indigo-600 block mb-2">{result.examScore}</span>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Ujian Akhir (AI)</span>
                </div>
                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 text-center group hover:-translate-y-1 transition-all">
                  <span className="text-4xl font-black text-emerald-600 block mb-2">{result.avgRefleksi}</span>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Rata-rata Refleksi</span>
                </div>
                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 text-center group hover:-translate-y-1 transition-all">
                  <span className="text-4xl font-black text-purple-600 block mb-2">{result.avgTugas}</span>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Rata-rata Tugas</span>
                </div>
              </div>

              {/* AI Insights */}
              <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100 relative overflow-hidden">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center text-2xl">
                    <HiOutlineSparkles />
                  </div>
                  <h2 className="text-2xl font-extrabold text-gray-900">Ulasan & Feedback AI</h2>
                </div>

                <p className="text-gray-600 leading-relaxed font-semibold mb-10 text-sm">
                  {result.feedback?.general || 'Evaluasi AI selesai.'}
                </p>

                {result.sertifikat && (
                  <div className="flex flex-wrap gap-4">
                    <button 
                      onClick={() => handleDownloadCertificate(result.sertifikat!.noSertifikat)}
                      className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all"
                    >
                      <HiOutlineArrowDownTray className="text-lg" /> Unduh Sertifikat
                    </button>
                  </div>
                )}

                {/* Subtle purple glow */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl"></div>
              </div>

              {/* Detailed Question Review */}
              {result.feedback?.details && Object.keys(result.feedback.details).length > 0 && (
                <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100 space-y-6">
                  <h2 className="text-2xl font-extrabold text-gray-900 mb-6 flex items-center gap-2">
                    Review Lembar Jawaban <HiOutlineDocumentCheck className="text-blue-500" />
                  </h2>
                  <div className="space-y-4">
                    {Object.entries(result.feedback.details).map(([soalId, details]: any, idx) => (
                      <div 
                        key={soalId} 
                        className={`p-6 rounded-2xl border ${
                          details.isCorrect ? 'bg-emerald-50/30 border-emerald-100' : 'bg-rose-50/30 border-rose-100'
                        } space-y-2`}
                      >
                        <div className="flex justify-between items-start gap-4">
                          <span className="text-xs font-black text-gray-400 uppercase">Soal #{idx + 1}</span>
                          <Badge className={`rounded-full px-3 py-0.5 text-[9px] font-black uppercase border-none ${
                            details.isCorrect ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                          }`}>
                            {details.isCorrect ? 'Benar' : 'Salah'}
                          </Badge>
                        </div>
                        <p className="text-sm font-bold text-gray-900 mt-2">
                          Kunci Jawaban yang Benar: <span className="text-indigo-600">{details.correctOption}</span>
                        </p>
                        <div className="text-xs text-gray-600 font-medium leading-relaxed bg-white/60 p-4 rounded-xl border border-gray-50 mt-3">
                          <span className="font-extrabold text-gray-900 block mb-1">Penjelasan AI:</span>
                          {details.explanation}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Sidebar */}
            <div className="lg:col-span-4 space-y-8">
              {/* Certificate Preview Card */}
              {result.sertifikat && (
                <div className="bg-gradient-to-b from-blue-500 to-indigo-600 p-8 rounded-[2rem] shadow-2xl shadow-indigo-200 flex flex-col items-center text-center text-white relative overflow-hidden">
                  <div className="bg-white/10 backdrop-blur-md w-full rounded-[1.5rem] p-8 border border-white/20 relative z-10 shadow-inner">
                    <div className="flex justify-center mb-6">
                      <HiOutlineSparkles className="text-5xl text-yellow-400 drop-shadow-lg animate-pulse" />
                    </div>
                    <h2 className="text-xl font-bold text-yellow-400 mb-1">Sertifikat Kelulusan</h2>
                    <p className="text-[10px] font-bold text-white/70 mb-6 uppercase tracking-widest">HybridLMS - AI Academy</p>
                    
                    <div className="space-y-1 mb-6">
                      <p className="text-[10px] font-bold text-white/60">No Sertifikat:</p>
                      <p className="text-xs font-mono font-bold text-emerald-300">{result.sertifikat.noSertifikat}</p>
                      <p className="text-[10px] font-bold text-white/60 mt-4">Skor Ujian:</p>
                      <p className="text-4xl font-black text-white">{result.examScore}</p>
                    </div>
                  </div>
                  
                  {/* Decorative elements */}
                  <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
                  <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-900/20 rounded-full blur-3xl"></div>
                </div>
              )}

              {/* Grade Progress Details */}
              <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-8">Rincian Nilai</h2>
                <div className="space-y-6">
                  {[
                    { label: 'Ujian PG (AI)', score: result.examScore, icon: <HiOutlineAcademicCap />, color: 'bg-indigo-500' },
                    { label: 'Rata-rata Refleksi', score: result.avgRefleksi, icon: <HiOutlinePencilSquare />, color: 'bg-emerald-500' },
                    { label: 'Rata-rata Tugas', score: result.avgTugas, icon: <HiOutlineDocumentCheck />, color: 'bg-purple-500' },
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
                    <span className="text-sm font-extrabold text-gray-900">Total Nilai Kumulatif</span>
                    <span className="text-2xl font-black text-gray-900">
                      {Math.round((result.avgRefleksi * 0.3) + (result.avgTugas * 0.35) + (result.examScore * 0.35))}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* No Course Selected State */
          <div className="text-center py-20 bg-white rounded-[2.5rem] border border-dashed border-gray-200">
            <HiOutlineBookOpen className="text-5xl text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">Pilih Mata Kuliah</h3>
            <p className="text-gray-500 text-sm max-w-sm mx-auto">
              Silakan pilih mata kuliah di sudut kanan atas untuk melihat hasil ujian dan sertifikat kelulusan Anda.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HasilSkorAI;
