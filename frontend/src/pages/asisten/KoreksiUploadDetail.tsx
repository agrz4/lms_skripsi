import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  HiOutlineArrowLeft, 
  HiOutlinePhoto,
  HiOutlineDocumentArrowDown,
  HiOutlineClipboardDocumentList
} from 'react-icons/hi2';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import api from '../../lib/api';

const mockFallbackTasks = [
  {
    id: "mock-refleksi-1",
    type: "REFLEKSI",
    content: "CSS Grid Layout adalah sistem tata letak dua dimensi untuk CSS. Ini memungkinkan pengaturan kolom dan baris dengan lebih mudah dibandingkan dengan Flexbox yang cenderung satu dimensi. Saya menggunakannya untuk menata grid layout halaman admin ini agar terlihat rapi dan responsif.",
    fileUrl: null,
    score: null,
    aiScore: 85,
    feedback: "Jawaban sangat baik, menjelaskan konsep dua dimensi CSS Grid dengan tepat. Serta penggunaannya sudah relevan.",
    createdAt: "2026-05-20T12:00:00.000Z",
    user: {
      nama: "Budi Santoso",
      email: "budi.santoso@mahasiswa.ac.id"
    },
    pertemuan: {
      urutan: 3,
      mataKuliah: {
        nama: "Desain Web & Frontend"
      }
    }
  },
  {
    id: "mock-upload-2",
    type: "FILE_UPLOAD",
    content: null,
    fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    score: null,
    aiScore: null,
    feedback: null,
    createdAt: "2026-05-20T12:30:00.000Z",
    user: {
      nama: "Ani Setyawati",
      email: "ani.setyawati@mahasiswa.ac.id"
    },
    pertemuan: {
      urutan: 2,
      mataKuliah: {
        nama: "Desain Web & Frontend"
      }
    }
  },
  {
    id: "mock-screenshot-3",
    type: "SCREENSHOT",
    content: null,
    fileUrl: "https://picsum.photos/800/600",
    score: null,
    aiScore: 92,
    feedback: "Hasil screenshot memperlihatkan implementasi CSS Grid dan responsivitas layout yang sangat baik.",
    createdAt: "2026-05-20T11:00:00.000Z",
    user: {
      nama: "Candra Wijaya",
      email: "candra.wijaya@mahasiswa.ac.id"
    },
    pertemuan: {
      urutan: 4,
      mataKuliah: {
        nama: "Desain Web & Frontend"
      }
    }
  }
];

const KoreksiUploadDetail: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const rawId = searchParams.get('id');
  const submissionId = rawId ? rawId.replace(/['"]/g, '').trim() : null;

  const [submission, setSubmission] = useState<any>(null);
  const [score, setScore] = useState<number>(0);
  const [feedback, setFeedback] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (submissionId) {
      fetchSubmissionDetail();
    } else {
      setLoading(false);
    }
  }, [submissionId]);

  const fetchSubmissionDetail = async () => {
    console.log("fetchSubmissionDetail: ID is", submissionId);
    setLoading(true);
    try {
      if (submissionId && submissionId.startsWith('mock-')) {
        const mockItem = mockFallbackTasks.find(t => t.id === submissionId);
        console.log("fetchSubmissionDetail: Found mockItem:", mockItem);
        if (mockItem) {
          setSubmission(mockItem);
          setScore(mockItem.score || mockItem.aiScore || 0);
          setFeedback(mockItem.feedback || '');
          setLoading(false);
          return;
        }
      }
      const res = await api.get(`/koreksi/file-detail/${submissionId}`);
      console.log("fetchSubmissionDetail: Backend response:", res.data);
      if (res.data && res.data.success) {
        const data = res.data.data;
        setSubmission(data);
        setScore(data.score || data.aiScore || 0);
        setFeedback(data.feedback || '');
      }
    } catch (error) {
      console.error('Error fetching submission detail:', error);
      const mockItem = mockFallbackTasks.find(t => t.id === submissionId);
      console.log("fetchSubmissionDetail: Catch block mock fallback found:", mockItem);
      if (mockItem) {
        setSubmission(mockItem);
        setScore(mockItem.score || mockItem.aiScore || 0);
        setFeedback(mockItem.feedback || '');
      }
    } finally {
      console.log("fetchSubmissionDetail: finally block called");
      setLoading(false);
    }
  };

  const handleScoreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    setScore(isNaN(val) ? 0 : Math.min(100, Math.max(0, val)));
  };

  const handleSaveCorrection = async () => {
    if (!submissionId) return;
    if (submissionId.startsWith('mock-')) {
      alert('Koreksi berhasil disimpan (Mode Demo)!');
      navigate('/asisten/koreksi');
      return;
    }
    try {
      const res = await api.post('/koreksi/submit-nilai', {
        submissionId,
        score,
        feedback
      });
      if (res.data && res.data.success) {
        alert('Koreksi berhasil disimpan!');
        navigate('/asisten/koreksi');
      }
    } catch (error: any) {
      console.error(error);
      alert('Gagal menyimpan koreksi: ' + (error.response?.data?.message || error.message));
    }
  };

  if (loading) {
    return (
      <div className="p-8 bg-[#F3F4F6] min-h-screen flex items-center justify-center">
        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Memuat data submission...</p>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="p-8 bg-[#F3F4F6] min-h-screen flex flex-col items-center justify-center">
        <p className="text-sm font-bold text-red-500 uppercase tracking-widest mb-4">Submission tidak ditemukan</p>
        <p className="text-[10px] text-gray-500 font-mono mb-6 uppercase tracking-wider">
          Debug Info — Clean ID: {String(submissionId)} | Raw ID: {String(rawId)} | Loading State: {String(loading)}
        </p>
        <Button onClick={() => navigate('/asisten/koreksi')} className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs px-6 py-3 rounded-xl shadow-sm">KEMBALI</Button>
      </div>
    );
  }

  const isImage = submission.fileUrl && submission.fileUrl.match(/\.(jpeg|jpg|gif|png|webp|svg)$/i);

  return (
    <div className="p-8 bg-[#F3F4F6] min-h-screen pb-20">
      {submissionId && submissionId.startsWith('mock-') && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-black uppercase rounded-2xl tracking-wider flex items-center justify-between shadow-sm">
          <span>⚠️ Anda sedang meninjau data simulasi (Demo Mode) karena tugas ini belum disubmit secara nyata di database.</span>
        </div>
      )}
      {/* Header Navigation */}
      <div className="flex items-center gap-6 mb-10">
        <Button 
          variant="outline" 
          onClick={() => navigate(-1)}
          className="bg-white border-none shadow-sm rounded-xl font-bold text-[10px] uppercase py-6 px-6"
        >
          <HiOutlineArrowLeft className="mr-2" /> Kembali
        </Button>
        <div>
          <h1 className="text-3xl font-black text-gray-900 leading-tight">
             Koreksi Upload — <span className="text-indigo-600">{submission.user?.nama}</span>
          </h1>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
             {submission.pertemuan?.mataKuliah?.nama} · Pertemuan {submission.pertemuan?.urutan} · {submission.type}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Section: Files & Instructions */}
        <div className="lg:col-span-8 space-y-8">
          <Card className="rounded-[2.5rem] border-none shadow-sm bg-white p-10">
            <h2 className="text-xl font-black text-gray-900 mb-8">File yang Di-upload Peserta</h2>
            
            <div className="bg-gray-50 rounded-[2rem] p-8 space-y-8 border border-gray-100">
              {submission.fileUrl ? (
                isImage ? (
                  <div className="space-y-4">
                     <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-amber-400 rounded-sm"></div>
                        <h3 className="text-sm font-black text-gray-700">Preview Screenshot</h3>
                     </div>
                     <div className="relative rounded-2xl overflow-hidden border border-gray-250 aspect-video bg-gray-100 shadow-inner">
                        <img 
                          src={submission.fileUrl} 
                          alt="Screenshot Pengerjaan" 
                          className="w-full h-full object-contain" 
                        />
                        <a 
                          href={submission.fileUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="absolute top-4 right-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[8px] px-4 py-2 rounded-xl shadow-md flex items-center gap-2"
                        >
                          <HiOutlinePhoto className="text-sm" /> BUKA GAMBAR
                        </a>
                     </div>
                  </div>
                ) : (
                  <div className="p-6 bg-indigo-50/50 border border-indigo-100 rounded-2xl flex items-center justify-between">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-indigo-500 shadow-sm">
                           <HiOutlineDocumentArrowDown className="text-2xl" />
                        </div>
                        <div>
                           <p className="text-xs font-black text-indigo-900 truncate max-w-xs">
                             {submission.fileUrl.substring(submission.fileUrl.lastIndexOf('/') + 1)}
                           </p>
                           <p className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest mt-1">
                             Submitted: {new Date(submission.createdAt).toLocaleString('id-ID')}
                           </p>
                        </div>
                     </div>
                     <a 
                       href={submission.fileUrl} 
                       download
                       target="_blank"
                       rel="noopener noreferrer"
                       className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[9px] px-6 py-3 rounded-xl shadow-sm block text-center"
                     >
                       DOWNLOAD FILE
                     </a>
                  </div>
                )
              ) : (
                <div className="p-8 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">
                   Mahasiswa belum meng-upload file tugas.
                </div>
              )}
            </div>
          </Card>

          {/* Task Info */}
          <Card className="rounded-[2.5rem] border-none shadow-sm bg-white p-10">
             <h2 className="text-xl font-black text-gray-900 mb-6">Deskripsi Pertemuan</h2>
             <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 text-xs font-medium text-gray-500 leading-relaxed">
                Topik Pertemuan: {submission.pertemuan?.topik || '—'}
             </div>
          </Card>
        </div>

        {/* Right Section: Form Koreksi Upload */}
        <div className="lg:col-span-4">
          <Card className="rounded-[2.5rem] border-none shadow-2xl bg-white overflow-hidden sticky top-10">
             <div className="p-8 pb-4">
                <h2 className="text-xl font-black text-gray-900 mb-2">Form Koreksi Upload</h2>
             </div>
             
             <div className="p-8 space-y-8">
                <div>
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 block">Peserta</label>
                   <Input disabled value={`${submission.user?.nama || ''} - ${submission.user?.email || ''}`} className="bg-gray-50 border-none rounded-xl font-bold text-xs py-6 cursor-not-allowed" />
                </div>

                <div>
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 block">Jenis Latihan</label>
                   <Input disabled value={submission.type || ''} className="bg-gray-50 border-none rounded-xl font-bold text-xs py-6 cursor-not-allowed" />
                </div>

                {submission.aiScore !== null && (
                  <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100">
                     <p className="text-[10px] font-black text-indigo-900 uppercase mb-1">Skor Referensi AI: {submission.aiScore}</p>
                     <p className="text-[9px] font-bold text-indigo-700/60 leading-relaxed">
                        Nilai final tetap ditentukan oleh asisten secara manual.
                     </p>
                  </div>
                )}

                {/* Score Section */}
                <div className="space-y-4">
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block text-center">Input Nilai (0-100)</label>
                   <div className="relative group">
                      <div className="h-40 border-4 border-[#10B981] rounded-[2.5rem] flex items-center justify-center bg-white shadow-xl shadow-emerald-50">
                         <input 
                           type="number"
                           min="0"
                           max="100"
                           value={score}
                           onChange={handleScoreChange}
                           className="text-6xl font-black text-gray-900 w-full text-center focus:outline-none bg-transparent"
                         />
                      </div>
                      <div className="absolute -bottom-2 left-10 right-10 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                         <div className="h-full bg-[#10B981] transition-all duration-500" style={{ width: `${score}%` }}></div>
                      </div>
                   </div>
                </div>

                <div>
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 block">Catatan Feedback</label>
                   <textarea 
                     value={feedback}
                     onChange={(e) => setFeedback(e.target.value)}
                     className="w-full bg-gray-50 border-none rounded-2xl p-6 text-xs font-medium focus:ring-4 focus:ring-indigo-100 transition-all h-32" 
                     placeholder="Berikan feedback untuk praktik mahasiswa..."
                   />
                </div>

                <div className="flex gap-4 pt-4">
                   <Button 
                     variant="outline" 
                     onClick={() => navigate('/asisten/koreksi')}
                     className="flex-1 py-7 rounded-2xl font-black text-xs border-none bg-gray-100 text-gray-400"
                   >
                     BATAL
                   </Button>
                   <Button 
                     onClick={handleSaveCorrection}
                     className="flex-1 py-7 rounded-2xl font-black text-xs bg-[#0E341E] hover:bg-[#0a2616] text-white shadow-xl shadow-emerald-100"
                   >
                      <HiOutlineClipboardDocumentList className="mr-2 text-lg" /> SIMPAN KOREKSI
                   </Button>
                </div>
             </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default KoreksiUploadDetail;
