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
import { useMataKuliahStore } from '../../store/useMataKuliahStore';
import { usePaketStore } from '../../store/usePaketStore';
import { useAuthStore } from '../../store/useAuthStore';
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
  const { mataKuliahList, fetchMataKuliah } = useMataKuliahStore();
  const { paketList, fetchPaket } = usePaketStore();
  const { user } = useAuthStore();
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ExamResult | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchMyPendaftaran();
    fetchMataKuliah();
    fetchPaket();
  }, [fetchMyPendaftaran, fetchMataKuliah, fetchPaket]);

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

  // Find course details
  const selectedPendaftaran = pendaftaranList.find((p) => p.mataKuliahId === selectedCourseId);
  const courseName = selectedPendaftaran?.mataKuliah?.nama || 'Mata Kuliah';
  
  const fullCourseInfo = mataKuliahList.find((m) => m.id === selectedCourseId);
  const nextCourse = fullCourseInfo?.prerequisiteFor?.[0];
  const recommendedPaket = paketList.find((p) => 
    p.courses?.some((c: any) => c.id === selectedCourseId)
  );

  const getNextCourseRecommendation = () => {
    if (nextCourse) {
      return {
        nama: nextCourse.nama,
        syarat: `Syarat: Lulus ${courseName}`
      };
    }
    if (recommendedPaket) {
      return {
        nama: recommendedPaket.nama,
        syarat: "Syarat: Lulus Semua Pertemuan"
      };
    }
    // Dynamic fallbacks based on name matching
    const lowerName = courseName.toLowerCase();
    if (lowerName.includes('html') || lowerName.includes('css')) {
      return {
        nama: "JavaScript Dasar",
        syarat: `Syarat: Lulus ${courseName}`
      };
    } else if (lowerName.includes('javascript') || lowerName.includes('js')) {
      return {
        nama: "React JS Fundamental",
        syarat: `Syarat: Lulus ${courseName}`
      };
    } else if (lowerName.includes('react')) {
      return {
        nama: "Node.js & API dev",
        syarat: `Syarat: Lulus ${courseName}`
      };
    }
    return {
      nama: "Web Dev Full Path",
      syarat: "Syarat: Lulus Semua Pertemuan"
    };
  };

  const recommendation = getNextCourseRecommendation();
  const studentName = user?.nama || localStorage.getItem('userName') || 'Budi Santoso';
  const certYear = result?.sertifikat?.createdAt 
    ? new Date(result.sertifikat.createdAt).getFullYear() 
    : new Date().getFullYear();

  return (
    <div className="p-8 bg-[#dcdcdc] min-h-screen pb-20">
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-800 mb-1">Hasil & Sertifikat</h1>
            <p className="text-slate-500 font-bold text-sm">
              {selectedCourseId ? `${courseName} · Hasil ujian + Sertifikat kelulusan` : 'Hasil ujian & Sertifikat kelulusan'}
            </p>
          </div>
          
          {/* Course Selector Dropdown */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-black text-slate-500 uppercase tracking-wider">Pilih Kelas:</span>
            <select
              value={selectedCourseId}
              onChange={(e) => handleCourseChange(e.target.value)}
              className="bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-xs font-black text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest animate-pulse">Memuat Hasil Ujian Anda...</p>
          </div>
        ) : errorMsg ? (
          /* Error / Exam Not Taken State */
          <div className="max-w-xl mx-auto py-16 text-center">
            <Card className="rounded-[2rem] border-none shadow-sm bg-white p-12 space-y-6">
              <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto text-amber-500">
                <HiOutlineAcademicCap className="text-4xl" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-slate-800">Ujian Belum Ditempuh</h3>
                <p className="text-sm text-slate-500 font-bold leading-relaxed">
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
              <div className="bg-gradient-to-b from-[#2e74c9] to-[#8eb3df] rounded-[2rem] p-10 text-center shadow-md relative overflow-hidden">
                <div className="relative z-10 flex flex-col items-center">
                  <span className="text-[8.5rem] font-black leading-none text-[#0e9f6e] select-none">
                    {result.examScore}
                  </span>
                  <p className="text-sm md:text-base font-black text-[#133c70] mt-1 mb-6">
                    Total Skor dari 100 — {courseName}
                  </p>
                  
                  <div className="w-full max-w-xl bg-black/10 h-3 rounded-full overflow-hidden mb-6">
                    <div 
                      className="h-full bg-[#0e9f6e] rounded-full transition-all duration-1000"
                      style={{ width: `${result.examScore}%` }}
                    ></div>
                  </div>

                  <div className="inline-flex items-center gap-1.5 px-6 py-2 bg-[#a3e6b9] text-[#0a522c] rounded-full font-bold text-sm">
                    <span>Status: {result.examScore >= 70 ? 'Lulus' : 'Tidak Lulus'}</span>
                    {result.examScore >= 70 ? '✓' : '✗'}
                  </div>
                </div>
              </div>

              {/* Score Breakdown Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
                  <span className="text-5xl font-black text-[#6f42c1] block mb-2">{result.examScore}</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ujian PG (AI)</span>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
                  <span className="text-5xl font-black text-[#28a745] block mb-2">{result.avgRefleksi}</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Refleksi (Asisten)</span>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
                  <span className="text-5xl font-black text-[#6f42c1] block mb-2">{result.avgTugas}</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tugas PG (AI)</span>
                </div>
              </div>

              {/* AI Insights */}
              <div className="bg-[#e9e6f2] border border-[#c7bde3] p-8 rounded-2xl shadow-sm relative overflow-hidden">
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-3 h-3 bg-[#6f42c1] rounded-full inline-block"></span>
                  <h2 className="text-lg font-black text-[#502e99]">Insight dari AI</h2>
                </div>

                <p className="text-[#5c5670] leading-relaxed font-semibold text-sm">
                  {result.feedback?.general || 'Evaluasi AI selesai.'}
                </p>
              </div>


            </div>

            {/* Right Sidebar */}
            <div className="lg:col-span-4 space-y-8">
              {/* Certificate Preview Card */}
              <div className="bg-white p-6 rounded-[2rem] border border-gray-200 shadow-sm flex flex-col items-center">
                {/* Blue Gradient Certificate Frame Wrap */}
                <div className="bg-gradient-to-b from-[#1b62b7] to-[#7da4d4] p-4 rounded-2xl w-full shadow-inner">
                  {/* Inner Certificate layout */}
                  {result.sertifikat ? (
                    <div className="bg-white rounded-xl p-6 w-full flex flex-col items-center text-center shadow-md border border-slate-100">
                      <span className="text-5xl mb-4 select-none">🏆</span>
                      <h3 className="text-[#f0a500] font-black text-sm uppercase tracking-wider mb-1">
                        Sertifikat Kelulusan
                      </h3>
                      <p className="text-[9px] font-black text-slate-400 tracking-widest uppercase mb-4">
                        HybridLMS · {certYear}
                      </p>
                      
                      <h4 className="text-slate-800 font-black text-xl mb-1 truncate w-full px-2">
                        {studentName}
                      </h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                        {courseName} · Nilai
                      </p>
                      
                      <span className="text-[#7ca5d8] font-black text-5xl my-3">
                        {result.sertifikat.nilai}
                      </span>
                      
                      <p className="text-[#c0825a] font-mono font-black text-[10px] tracking-wider">
                        {result.sertifikat.noSertifikat}
                      </p>
                    </div>
                  ) : (
                    /* Locked state for certificate if score < 70 */
                    <div className="bg-white rounded-xl p-6 w-full flex flex-col items-center text-center shadow-md border border-slate-100 opacity-80">
                      <span className="text-5xl mb-4 select-none">🔒</span>
                      <h3 className="text-slate-400 font-black text-sm uppercase tracking-wider mb-1">
                        Sertifikat Terkunci
                      </h3>
                      <p className="text-[9px] font-black text-slate-400 tracking-widest uppercase mb-4">
                        HybridLMS · {certYear}
                      </p>
                      
                      <h4 className="text-slate-800 font-black text-xl mb-1 truncate w-full px-2">
                        {studentName}
                      </h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                        {courseName}
                      </p>
                      
                      <span className="text-slate-300 font-black text-5xl my-3">
                        {result.examScore}
                      </span>
                      
                      <p className="text-slate-400 font-medium text-[10px] px-2 leading-relaxed">
                        Skor Anda belum memenuhi syarat kelulusan minimum 70.
                      </p>
                    </div>
                  )}
                </div>
                
                {/* Download Button */}
                {result.sertifikat ? (
                  <button 
                    onClick={() => handleDownloadCertificate(result.sertifikat!.noSertifikat)}
                    className="w-full bg-[#ffa500] hover:bg-[#e69500] text-slate-800 font-black py-3 px-6 rounded-xl flex items-center justify-center gap-2 mt-5 transition-all shadow-md text-xs uppercase tracking-wider"
                  >
                    📥 Download Sertifikat PDF
                  </button>
                ) : (
                  <button 
                    disabled
                    className="w-full bg-slate-200 text-slate-400 font-black py-3 px-6 rounded-xl flex items-center justify-center gap-2 mt-5 cursor-not-allowed text-xs uppercase tracking-wider"
                  >
                    Belum Memenuhi Syarat Kelulusan
                  </button>
                )}
              </div>

              {/* Lanjutan Kursus Card */}
              <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-sm">
                <h3 className="text-slate-800 font-black text-base mb-2">Lanjutan Kursus</h3>
                <p className="text-slate-500 font-bold text-xs mb-4">
                  {result.examScore >= 70 
                    ? 'Kamu lulus! Lanjut ke kursus berikutnya:' 
                    : 'Silakan selesaikan kursus ini dengan nilai minimal 70 untuk melanjutkan:'}
                </p>
                
                <div className="border border-gray-200 rounded-xl p-4 bg-slate-50/50">
                  <h4 className="text-slate-800 font-black text-sm">{recommendation.nama}</h4>
                  <p className="text-slate-400 font-bold text-[10px] mt-1 uppercase tracking-wider">{recommendation.syarat}</p>
                </div>
                
                <button 
                  onClick={() => navigate('/user/dashboard')}
                  className="w-full bg-[#c0825a] hover:bg-[#b0724a] text-white font-extrabold py-3.5 px-6 rounded-xl text-center text-xs mt-4 transition-all uppercase tracking-wider shadow-sm"
                >
                  Daftar Kursus Selanjutnya →
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* No Course Selected State */
          <div className="text-center py-20 bg-white rounded-[2.5rem] border border-dashed border-gray-200 max-w-2xl mx-auto mt-10">
            <HiOutlineBookOpen className="text-5xl text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-800 mb-2">Pilih Mata Kuliah</h3>
            <p className="text-slate-500 text-sm max-w-sm mx-auto font-medium">
              Silakan pilih mata kuliah di sudut kanan atas untuk melihat hasil ujian dan sertifikat kelulusan Anda.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HasilSkorAI;
