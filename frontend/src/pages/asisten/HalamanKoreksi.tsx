import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  HiOutlineMagnifyingGlass, 
  HiOutlineCheckBadge,
  HiOutlineEye,
  HiOutlineChatBubbleBottomCenterText,
  HiOutlinePhoto,
  HiOutlineDocumentDuplicate
} from 'react-icons/hi2';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

const HalamanKoreksi: React.FC = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [finalScore, setFinalScore] = useState<number>(75);
  const [feedbackText, setFeedbackText] = useState<string>('');
  const [isDemo, setIsDemo] = useState<boolean>(false);
  
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await api.get('/koreksi/list');
      if (res.data && res.data.success && res.data.data.length > 0) {
        setTasks(res.data.data);
        setIsDemo(false);
      } else {
        setTasks(mockFallbackTasks);
        setIsDemo(true);
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
      setTasks(mockFallbackTasks);
      setIsDemo(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTask = (task: any) => {
    setSelectedTask(task);
    setFinalScore(task.score || task.aiScore || 75);
    setFeedbackText(task.feedback || '');
  };

  const handleSaveScore = async () => {
    if (!selectedTask) return;
    if (selectedTask.id.startsWith('mock-')) {
      alert('Koreksi berhasil disimpan (Mode Demo)!');
      setTasks(prev => prev.map(t => t.id === selectedTask.id ? { ...t, score: finalScore, feedback: feedbackText } : t));
      setSelectedTask(null);
      return;
    }
    try {
      const res = await api.post('/koreksi/submit-nilai', {
        submissionId: selectedTask.id,
        score: finalScore,
        feedback: feedbackText
      });
      if (res.data && res.data.success) {
        alert('Nilai berhasil disimpan!');
        setSelectedTask(null);
        fetchTasks();
      }
    } catch (error: any) {
      console.error(error);
      alert('Gagal menyimpan nilai: ' + (error.response?.data?.message || error.message));
    }
  };

  // Filter logic
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = (task.user?.nama || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (task.user?.email || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = typeFilter === 'ALL' || task.type === typeFilter;
    
    const matchesStatus = statusFilter === 'ALL' || 
      (statusFilter === 'BELUM' && task.score === null) || 
      (statusFilter === 'SELESAI' && task.score !== null);

    return matchesSearch && matchesType && matchesStatus;
  });

  const countBelumKoreksi = tasks.filter(task => task.score === null).length;

  return (
    <div className="p-8 bg-[#F3F4F6] min-h-screen pb-20">
      {isDemo && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-black uppercase rounded-2xl tracking-wider flex items-center justify-between shadow-sm">
          <span>⚠️ Belum ada mahasiswa yang mensubmit tugas. Menampilkan data simulasi (Demo Mode) agar fitur dapat dicoba.</span>
          <button onClick={() => setIsDemo(false)} className="underline hover:text-amber-950 font-black ml-4">TUTUP</button>
        </div>
      )}
      {/* Header */}
      <div className="flex justify-between items-start mb-10">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Halaman Koreksi</h1>
          <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">
             Hanya pertemuan yang di-assign Admin/Dosen · Refleksi + Upload Screenshot + Upload File
          </p>
        </div>
        <Badge className="bg-red-100 text-red-600 border-none font-black text-[10px] px-6 py-2 rounded-full shadow-sm">
           {countBelumKoreksi} Belum Di Koreksi
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Section: Table */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="rounded-[2.5rem] border-none shadow-sm bg-white overflow-hidden">
            {/* Table Filters */}
            <div className="p-8 border-b border-gray-50 flex flex-wrap items-center justify-between gap-4">
               <div className="relative w-full max-w-xs">
                  <HiOutlineMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <Input 
                    className="pl-12 bg-gray-50 border-none rounded-xl text-xs font-bold placeholder:text-gray-300 py-6"
                    placeholder="Cari Nama/Email Peserta..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
               </div>
               <div className="flex gap-3">
                  <select 
                    value={typeFilter} 
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="rounded-xl border-none bg-indigo-50 text-indigo-600 font-black text-[10px] px-4 py-3 outline-none cursor-pointer"
                  >
                    <option value="ALL">SEMUA JENIS</option>
                    <option value="REFLEKSI">REFLEKSI ESAI</option>
                    <option value="FILE_UPLOAD">FILE PROGRAM</option>
                    <option value="SCREENSHOT">SCREENSHOT</option>
                  </select>
                  <select 
                    value={statusFilter} 
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="rounded-xl border-none bg-indigo-50 text-indigo-600 font-black text-[10px] px-4 py-3 outline-none cursor-pointer"
                  >
                    <option value="ALL">SEMUA STATUS</option>
                    <option value="BELUM">BELUM KOREKSI</option>
                    <option value="SELESAI">SELESAI KOREKSI</option>
                  </select>
               </div>
            </div>

            {/* Table Header */}
            <div className="grid grid-cols-12 px-8 py-4 bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
               <div className="col-span-4">Nama Peserta</div>
               <div className="col-span-3">Kursus · Pertemuan</div>
               <div className="col-span-2">Jenis</div>
               <div className="col-span-1 text-center">AI</div>
               <div className="col-span-1 text-center">Status</div>
               <div className="col-span-1 text-right">Aksi</div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gray-50">
               {loading ? (
                 <div className="p-8 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Memuat data tugas...
                 </div>
               ) : filteredTasks.length === 0 ? (
                 <div className="p-8 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Tidak ada tugas yang cocok.
                 </div>
               ) : filteredTasks.map((task) => (
                 <div key={task.id} className="grid grid-cols-12 px-8 py-6 items-center hover:bg-gray-50 transition-all group">
                    <div className="col-span-4 flex items-center gap-4">
                       <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-black text-xs bg-indigo-600">
                          {(task.user?.nama || 'M').split(' ').map((n: string) => n[0]).join('')}
                       </div>
                       <div>
                          <div className="text-sm font-black text-gray-900">{task.user?.nama}</div>
                          <div className="text-[10px] font-bold text-gray-400">{task.user?.email}</div>
                       </div>
                    </div>
                    <div className="col-span-3 text-xs font-bold text-gray-600 truncate pr-2">
                       {task.pertemuan?.mataKuliah?.nama} · P{task.pertemuan?.urutan}
                    </div>
                    <div className="col-span-2">
                       <Badge className={`border-none font-black text-[8px] px-3 py-1 rounded-lg uppercase tracking-widest ${
                         task.type === 'REFLEKSI' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'
                       }`}>
                          {task.type === 'REFLEKSI' && <HiOutlineChatBubbleBottomCenterText className="mr-1" />}
                          {task.type !== 'REFLEKSI' && <HiOutlineDocumentDuplicate className="mr-1" />}
                          {task.type}
                       </Badge>
                    </div>
                    <div className="col-span-1 text-center text-sm font-black text-gray-900">
                       {task.aiScore !== null ? task.aiScore : '—'}
                    </div>
                    <div className="col-span-1 text-center">
                       <Badge className={`border-none font-black text-[8px] px-3 py-1 rounded-full uppercase ${
                         task.score === null ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-500'
                       }`}>
                          {task.score === null ? 'Belum' : 'Selesai'}
                       </Badge>
                    </div>
                    <div className="col-span-1 text-right">
                       <Button 
                         onClick={() => {
                           if (task.type === 'REFLEKSI') {
                             handleSelectTask(task);
                           } else {
                             navigate(`/asisten/upload?id=${task.id}`);
                           }
                         }}
                         variant="ghost" 
                         size="sm" 
                         className="text-[10px] font-black text-indigo-600 hover:bg-indigo-50 rounded-xl"
                       >
                          {task.score === null ? 'KOREKSI' : 'LIHAT'}
                       </Button>
                    </div>
                 </div>
               ))}
            </div>
          </Card>
        </div>

        {/* Right Section: Correction Form */}
        <div className="lg:col-span-4">
          {!selectedTask ? (
            <Card className="rounded-[2.5rem] border-none shadow-sm bg-white p-10 flex flex-col items-center justify-center min-h-[450px] text-center">
               <div className="w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 mb-4">
                  <HiOutlineEye className="text-3xl" />
               </div>
               <h3 className="text-lg font-black text-gray-900 mb-2">Belum Ada Tugas Terpilih</h3>
               <p className="text-xs font-bold text-gray-400 max-w-xs leading-relaxed uppercase tracking-wider">
                  PILIH SALAH SATU TUGAS MAHASISWA BERJENIS REFLEKSI DI TABEL KIRI UNTUK MEMULAI PROSES PENILAIAN.
               </p>
            </Card>
          ) : (
            <Card className="rounded-[2.5rem] border-none shadow-2xl bg-white overflow-hidden sticky top-32">
               <div className="bg-indigo-600 p-8">
                  <h2 className="text-xl font-black text-white">Form Koreksi</h2>
               </div>
               
               <div className="p-8 space-y-8">
                  <div>
                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 block">Nama Peserta</label>
                     <Input disabled value={selectedTask.user?.nama || ''} className="bg-gray-50 border-none rounded-xl font-bold text-xs py-6 cursor-not-allowed" />
                  </div>

                  <div>
                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 block">Pertemuan</label>
                     <Input disabled value={`${selectedTask.pertemuan?.mataKuliah?.nama} - Pertemuan ${selectedTask.pertemuan?.urutan}`} className="bg-gray-50 border-none rounded-xl font-bold text-xs py-6 cursor-not-allowed" />
                  </div>

                  <div>
                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 block">Jawaban Refleksi Peserta</label>
                     <div className="p-6 bg-gray-50 rounded-2xl text-[11px] font-medium text-gray-600 leading-relaxed border border-gray-100 max-h-48 overflow-y-auto">
                        {selectedTask.content || '—'}
                     </div>
                  </div>

                  {selectedTask.aiScore !== null && (
                    <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100">
                       <div className="flex items-center gap-2 mb-2">
                          <HiOutlineCheckBadge className="text-indigo-600" />
                          <span className="text-[10px] font-black text-indigo-900 uppercase">Skor AI (Referensi): {selectedTask.aiScore}</span>
                       </div>
                       {selectedTask.feedback && (
                         <p className="text-[10px] font-bold text-indigo-700/60 leading-relaxed">
                            {selectedTask.feedback}
                         </p>
                       )}
                    </div>
                  )}

                  <div className="space-y-4">
                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block text-center">Input Nilai Akhir (0-100)</label>
                     <div className="relative group">
                        <div className="h-40 border-4 border-emerald-500 rounded-[2.5rem] flex flex-col items-center justify-center bg-white shadow-xl shadow-emerald-50">
                           <input 
                             type="number"
                             min="0"
                             max="100"
                             value={finalScore}
                             onChange={(e) => setFinalScore(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                             className="text-6xl font-black text-gray-900 w-full text-center focus:outline-none bg-transparent"
                           />
                           <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-2">
                             AI: {selectedTask.aiScore !== null ? selectedTask.aiScore : '—'} · Nilai final ditentukan asisten
                           </p>
                        </div>
                        <div className="absolute -bottom-2 left-10 right-10 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                           <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${finalScore}%` }}></div>
                        </div>
                     </div>
                  </div>

                  <div>
                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 block">Catatan Feedback</label>
                     <textarea 
                       value={feedbackText}
                       onChange={(e) => setFeedbackText(e.target.value)}
                       className="w-full bg-gray-50 border-none rounded-2xl p-6 text-xs font-medium focus:ring-4 focus:ring-indigo-100 transition-all h-32" 
                       placeholder="Berikan feedback untuk mahasiswa..."
                     />
                  </div>

                  <div className="flex gap-4 pt-4">
                     <Button 
                       onClick={() => setSelectedTask(null)}
                       variant="outline" 
                       className="flex-1 py-7 rounded-2xl font-black text-xs border-none bg-gray-100 text-gray-400"
                     >
                       BATAL
                     </Button>
                     <Button 
                       onClick={handleSaveScore}
                       className="flex-1 py-7 rounded-2xl font-black text-xs bg-[#10B981] hover:bg-[#059669] text-white shadow-xl shadow-emerald-100"
                     >
                       SIMPAN
                     </Button>
                  </div>
               </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default HalamanKoreksi;
