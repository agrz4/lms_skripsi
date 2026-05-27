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

const mockAniSusanti = {
  id: "mock-ani-susanti",
  type: "Screenshot Coding + Upload File",
  content: null,
  fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
  score: 82,
  aiScore: null,
  feedback: "",
  createdAt: "2026-05-20T10:30:00.000Z",
  user: {
    nama: "Ani Susanti",
    email: "E173038"
  },
  pertemuan: {
    urutan: 2,
    topik: "HTML Dasar",
    mataKuliah: {
      nama: "Web Dev Bootcamp"
    }
  },
  screenshots: ["screenshot_1.png", "screenshot_2.png"],
  zipFile: {
    name: "program_html.zip",
    size: "2.4 MB"
  },
  description: "Buat halaman HTML sederhana dengan struktur yang benar: heading, paragraf, list, link, dan gambar. Screenshot hasil browser dan upload file zip projectnya."
};

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
  
  // Checklist state
  const [checklist, setChecklist] = useState({
    struktur: true,
    heading: true,
    link: true,
    clean: false
  });

  useEffect(() => {
    if (submissionId) {
      fetchSubmissionDetail(submissionId);
    } else {
      findFirstRealSubmission();
    }
  }, [submissionId]);

  const findFirstRealSubmission = async () => {
    setLoading(true);
    try {
      const res = await api.get('/koreksi/list');
      if (res.data && res.data.success && res.data.data.length > 0) {
        const realFileSub = res.data.data.find((sub: any) => sub.type === 'FILE_UPLOAD' || sub.type === 'SCREENSHOT');
        if (realFileSub) {
          await fetchSubmissionDetail(realFileSub.id);
          return;
        }
      }
      fetchSubmissionDetail('mock-ani-susanti');
    } catch (error) {
      console.error('Error finding real submission:', error);
      fetchSubmissionDetail('mock-ani-susanti');
    }
  };

  const fetchSubmissionDetail = async (id: string) => {
    setLoading(true);
    try {
      if (id === 'mock-ani-susanti') {
        setSubmission(mockAniSusanti);
        setScore(mockAniSusanti.score);
        setFeedback(mockAniSusanti.feedback);
        setLoading(false);
        return;
      }

      if (id.startsWith('mock-')) {
        const mockItem = mockFallbackTasks.find(t => t.id === id);
        if (mockItem) {
          setSubmission(mockItem);
          setScore(mockItem.score || mockItem.aiScore || 0);
          setFeedback(mockItem.feedback || '');
          setLoading(false);
          return;
        }
      }
      const res = await api.get(`/koreksi/file-detail/${id}`);
      if (res.data && res.data.success) {
        const data = res.data.data;
        setSubmission(data);
        setScore(data.score || data.aiScore || 0);
        setFeedback(data.feedback || '');
      }
    } catch (error) {
      console.error('Error fetching submission detail:', error);
      if (id === 'mock-ani-susanti') {
        setSubmission(mockAniSusanti);
        setScore(mockAniSusanti.score);
        setFeedback(mockAniSusanti.feedback);
      } else {
        const mockItem = mockFallbackTasks.find(t => t.id === id);
        if (mockItem) {
          setSubmission(mockItem);
          setScore(mockItem.score || mockItem.aiScore || 0);
          setFeedback(mockItem.feedback || '');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleScoreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    setScore(isNaN(val) ? 0 : Math.min(100, Math.max(0, val)));
  };

  const handleSaveCorrection = async () => {
    const idToSave = submissionId || 'mock-ani-susanti';
    if (idToSave.startsWith('mock-')) {
      alert('Koreksi berhasil disimpan (Mode Demo)!');
      navigate('/asisten/koreksi');
      return;
    }
    try {
      const res = await api.post('/koreksi/submit-nilai', {
        submissionId: idToSave,
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
        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest animate-pulse">Memuat data submission...</p>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="p-8 bg-[#F3F4F6] min-h-screen flex flex-col items-center justify-center">
        <p className="text-sm font-bold text-red-500 uppercase tracking-widest mb-4">Submission tidak ditemukan</p>
        <Button onClick={() => navigate('/asisten/koreksi')} className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs px-6 py-3 rounded-xl shadow-sm">KEMBALI</Button>
      </div>
    );
  }

  const isMockAni = submission.id === 'mock-ani-susanti';
  const isDemoMode = submission.id.startsWith('mock-');

  // Parse all submissions for real data
  const screenshotSub = submission.allSubmissions?.find((s: any) => s.type === 'SCREENSHOT') || (submission.type === 'SCREENSHOT' ? submission : null);
  const fileSub = submission.allSubmissions?.find((s: any) => s.type === 'FILE_UPLOAD') || (submission.type === 'FILE_UPLOAD' ? submission : null);
  const refleksiSub = submission.allSubmissions?.find((s: any) => s.type === 'REFLEKSI');

  const getJenisLatihan = () => {
    if (isMockAni) return "Screenshot Coding + Upload File";
    const parts = [];
    if (screenshotSub) parts.push("Screenshot");
    if (fileSub) parts.push("File Program");
    if (refleksiSub) parts.push("Refleksi");
    return parts.join(" + ") || "Tugas Mandiri";
  };

  const aiScore = isMockAni ? null : (refleksiSub?.aiScore ?? submission.aiScore);

  const resolveUrl = (url: string | null | undefined) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) {
      if (url.startsWith('https://lms-storage.local')) {
        return 'https://picsum.photos/seed/picsum/800/600';
      }
      return url;
    }
    // Relative path, prepend backend base URL
    return `http://localhost:5000${url}`;
  };

  return (
    <div className="p-8 bg-[#F3F4F6] min-h-screen pb-20 text-left">
      {isDemoMode && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-black uppercase rounded-2xl tracking-wider flex items-center justify-between shadow-sm">
          <span>⚠️ Belum ada mahasiswa yang mensubmit tugas. Menampilkan data simulasi (Demo Mode) agar fitur dapat dicoba.</span>
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
             {submission.pertemuan?.mataKuliah?.nama} · P{submission.pertemuan?.urutan} {submission.pertemuan?.topik} · {isMockAni ? 'Upload Screenshot Coding' : getJenisLatihan()}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Section: Files & Instructions */}
        <div className="lg:col-span-8 space-y-8">
          <Card className="rounded-[2.5rem] border-none shadow-sm bg-white p-10">
            <h2 className="text-xl font-black text-gray-900 mb-8">File yang Di-upload Peserta</h2>
            
            <div className="space-y-6">
              {/* Screenshot Preview Grid */}
              {(isMockAni || screenshotSub) && (
                <div className="bg-gray-50 rounded-[2rem] p-8 border border-gray-100 space-y-6">
                  <div className="flex items-center gap-2">
                     <div className="w-4 h-4 bg-amber-400 rounded-sm"></div>
                     <h3 className="text-sm font-black text-gray-700">
                       {isMockAni ? "Screenshot Coding (2 file)" : "Screenshot Hasil Pengerjaan"}
                     </h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {isMockAni ? (
                      submission.screenshots.map((file: string, index: number) => (
                        <div key={index} className="relative rounded-2xl overflow-hidden border border-gray-250 aspect-video bg-[#D8D8F0] shadow-inner flex flex-col justify-center items-center">
                          <div className="flex flex-col items-center gap-2 text-indigo-950/70">
                            <span className="text-3xl">💻</span>
                            <span className="text-xs font-bold font-mono">{file}</span>
                          </div>
                          <a 
                            href="https://picsum.photos/seed/screenshot1/800/600"
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="absolute top-4 right-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[9px] px-3.5 py-1.5 rounded-xl shadow-md flex items-center"
                          >
                            Lihat
                          </a>
                        </div>
                      ))
                    ) : (
                      screenshotSub.fileUrl && (
                        <div className="col-span-2 relative rounded-2xl overflow-hidden border border-gray-250 aspect-video bg-gray-100 shadow-inner flex justify-center items-center">
                          <img 
                            src={resolveUrl(screenshotSub.fileUrl)} 
                            alt="Screenshot Pengerjaan" 
                            className="w-full h-full object-contain" 
                          />
                          <a 
                            href={resolveUrl(screenshotSub.fileUrl)} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="absolute top-4 right-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[8px] px-4 py-2 rounded-xl shadow-md flex items-center gap-2"
                          >
                            <HiOutlinePhoto className="text-sm" /> BUKA GAMBAR
                          </a>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

              {/* ZIP File Program Box */}
              {(isMockAni || fileSub) && (
                <div className="p-6 bg-indigo-50/50 border border-indigo-100 rounded-2xl flex items-center justify-between">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-indigo-500 shadow-sm text-lg">
                         🗜️
                      </div>
                      <div className="text-left">
                         <p className="text-xs font-black text-indigo-950 font-mono truncate max-w-xs md:max-w-md">
                           {isMockAni ? submission.zipFile.name : (fileSub.fileUrl?.substring(fileSub.fileUrl.lastIndexOf('/') + 1) || 'file_tugas.zip')}
                         </p>
                         <p className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest mt-1">
                           {isMockAni ? `${submission.zipFile.size} · Submitted 10:30` : `Submitted: ${new Date(fileSub.createdAt).toLocaleString('id-ID')}`}
                         </p>
                      </div>
                   </div>
                   <a 
                     href={isMockAni ? '#' : resolveUrl(fileSub.fileUrl)} 
                     download={!isMockAni}
                     target="_blank" 
                     rel="noopener noreferrer"
                     className="bg-[#5850EC] hover:bg-[#4f46e5] text-white font-black text-[9px] rounded-lg px-6 py-3 uppercase tracking-wider block text-center shadow-sm"
                     onClick={(e) => {
                       if (isMockAni) {
                         e.preventDefault();
                         alert('Download file program (Mode Demo)!');
                       }
                     }}
                   >
                      Download File
                   </a>
                </div>
              )}

              {/* Jawaban Refleksi Content */}
              {!isMockAni && refleksiSub && (
                <div className="p-6 bg-emerald-50/50 border border-emerald-100 rounded-2xl text-left">
                  <div className="flex items-center gap-2 mb-2">
                     <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></span>
                     <h4 className="text-xs font-black text-emerald-950 uppercase tracking-wider">Jawaban Refleksi Mahasiswa</h4>
                  </div>
                  <p className="text-xs font-semibold text-gray-700 leading-relaxed bg-white/60 p-4 rounded-xl border border-emerald-100/30">
                    "{refleksiSub.content}"
                  </p>
                </div>
              )}

              {/* Fallback if no files */}
              {!isMockAni && !screenshotSub && !fileSub && (
                <div className="p-8 text-center text-xs font-bold text-gray-400 uppercase tracking-widest bg-gray-50 rounded-[2rem] border border-gray-150">
                   Mahasiswa belum meng-upload file tugas.
                </div>
              )}
            </div>
          </Card>

          {/* Task Info / Deskripsi Latihan */}
          <Card className="rounded-[2.5rem] border-none shadow-sm bg-white p-10">
             <h2 className="text-xl font-black text-gray-900 mb-6">{isMockAni ? 'Deskripsi Latihan' : 'Deskripsi Pertemuan'}</h2>
             <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 text-xs font-semibold text-gray-650 leading-relaxed">
                {isMockAni ? submission.description : `Topik Pertemuan: ${submission.pertemuan?.topik || '—'}`}
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
                   <Input disabled value={isMockAni ? `${submission.user?.nama || ''} - ${submission.user?.email || ''}` : `${submission.user?.nama || ''} - ${submission.user?.email || ''}`} className="bg-gray-50 border-none rounded-xl font-bold text-xs py-6 cursor-not-allowed" />
                </div>

                <div>
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 block">Jenis Latihan</label>
                   <Input disabled value={getJenisLatihan()} className="bg-gray-50 border-none rounded-xl font-bold text-xs py-6 cursor-not-allowed" />
                </div>

                {/* Checklist Penilaian Box */}
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-150 space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 block">Checklist Penilaian</label>
                  {[
                    { key: 'struktur', label: 'Struktur HTML benar (head, body)' },
                    { key: 'heading', label: 'Ada heading, paragraf, list' },
                    { key: 'link', label: 'Link dan gambar berfungsi' },
                    { key: 'clean', label: 'Kode bersih & terstruktur' }
                  ].map(item => (
                    <label key={item.key} className="flex items-center gap-3 cursor-pointer text-xs font-bold text-gray-700">
                      <input 
                        type="checkbox"
                        checked={(checklist as any)[item.key]}
                        onChange={(e) => {
                          const updated = { ...checklist, [item.key]: e.target.checked };
                          setChecklist(updated);
                          const checkedCount = Object.values(updated).filter(Boolean).length;
                          setScore(checkedCount === 4 ? 100 : checkedCount * 25);
                        }}
                        className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 border-gray-300"
                      />
                      <span>{item.label}</span>
                    </label>
                  ))}
                </div>

                {aiScore !== null && (
                  <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100">
                     <p className="text-[10px] font-black text-indigo-900 uppercase mb-1">Skor Referensi AI: {aiScore}</p>
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
                     Batal
                   </Button>
                   <Button 
                     onClick={handleSaveCorrection}
                     className="flex-1 py-7 rounded-2xl font-black text-xs bg-[#0E341E] hover:bg-[#0a2616] text-white shadow-xl shadow-emerald-100"
                   >
                      Simpan Koreksi
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
