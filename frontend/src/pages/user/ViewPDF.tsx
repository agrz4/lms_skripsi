import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useJadwalStore } from '../../store/useJadwalStore';
import { useMateriStore } from '../../store/useMateriStore';
import { 
  HiOutlineArrowLeft, 
  HiOutlineMagnifyingGlassMinus, 
  HiOutlineMagnifyingGlassPlus,
  HiOutlineArrowDownTray,
  HiOutlineChevronUp,
  HiOutlineChevronDown
} from 'react-icons/hi2';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import api from '../../lib/api';

const ViewPDF: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const pertemuanId = searchParams.get('pertemuanId');
  const fileUrl = searchParams.get('url');
  const fileName = searchParams.get('name') || 'Materi PDF';

  const { jadwalList } = useJadwalStore();
  const session = jadwalList.find(s => s.id === pertemuanId);
  const { materiList, fetchMateriByPertemuan } = useMateriStore();

  const [zoom, setZoom] = useState(100);
  const [currentPage, setCurrentPage] = useState(2);
  const totalPages = 18;

  // State variables for Reflection
  const [refleksi, setRefleksi] = useState('');
  const [isSubmittingRefleksi, setIsSubmittingRefleksi] = useState(false);
  const [aiScoreRef, setAiScoreRef] = useState<number | null>(null);
  
  // Floating banner feedback state
  const [banner, setBanner] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Fetch materials & past submissions on load
  useEffect(() => {
    if (pertemuanId) {
      fetchMateriByPertemuan(pertemuanId);

      // Ambil data tugas/refleksi yang sudah dikumpulkan sebelumnya
      api.get(`/student/submissions?pertemuanId=${pertemuanId}`)
        .then(response => {
          const subs = response.data.data;
          const reflectionSub = subs.find((s: any) => s.type === 'REFLEKSI');

          if (reflectionSub) {
            setRefleksi(reflectionSub.content || '');
            if (reflectionSub.aiScore) {
              setAiScoreRef(reflectionSub.aiScore);
            }
          }
        })
        .catch(err => console.error('Gagal mengambil data submission sebelumnya', err));
    }
  }, [pertemuanId, fetchMateriByPertemuan]);

  // Handler for submitting Reflection
  const handleRefleksiSubmit = async () => {
    if (!refleksi.trim()) {
      showBanner('error', 'Tuliskan esai refleksi Anda terlebih dahulu!');
      return;
    }

    setIsSubmittingRefleksi(true);
    try {
      const response = await api.post('/student/refleksi/submit', {
        pertemuanId,
        content: refleksi
      });

      const score = response.data.data.aiScore;
      setAiScoreRef(score);
      showBanner('success', `Refleksi berhasil dikirim! AI menilai: ${score}/100.`);
      
      // Update progress pertemuan ke completed secara otomatis
      await api.post('/student/status/progres', {
        pertemuanId,
        isCompleted: true
      });
    } catch (err) {
      showBanner('error', 'Gagal mengirim jawaban refleksi');
    } finally {
      setIsSubmittingRefleksi(false);
    }
  };

  const showBanner = (type: 'success' | 'error', text: string) => {
    setBanner({ type, text });
    setTimeout(() => setBanner(null), 5000);
  };

  return (
    <div className="p-8 bg-[#F3F4F6] min-h-screen pb-20">
      {/* Visual Feedback Floating Banner */}
      {banner && (
        <div className={`fixed top-6 right-6 z-50 p-4 rounded-xl shadow-2xl flex items-center gap-3 animate-bounce border text-xs font-black ${
          banner.type === 'success' ? 'bg-emerald-500 border-emerald-600 text-white' : 'bg-red-500 border-red-600 text-white'
        }`}>
          <span>{banner.type === 'success' ? '⚡' : '⚠️'}</span>
          <span>{banner.text}</span>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div className="flex items-center gap-6">
          <Button 
            variant="outline" 
            onClick={() => navigate(-1)}
            className="bg-white border-none shadow-sm rounded-xl font-black text-[10px] uppercase py-6 px-6"
          >
            <HiOutlineArrowLeft className="mr-2" /> Kembali
          </Button>
          <div>
            <h1 className="text-2xl font-black text-gray-900 leading-tight">
               P{session?.urutan || '4'} — {session?.topik || 'CSS Flexbox'} · PDF Material
            </h1>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
               Halaman PDF bisa di-scroll · Bisa download
            </p>
          </div>
        </div>

        <Button className="bg-white text-gray-700 hover:bg-gray-50 border-none shadow-sm rounded-xl py-6 px-8 font-black text-xs">
          <HiOutlineArrowDownTray className="mr-2 text-lg" /> Download
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* PDF Viewer Content */}
        <div className="lg:col-span-8 space-y-8">
          <Card className="rounded-[2.5rem] border-none shadow-sm bg-white overflow-hidden flex flex-col min-h-[800px]">
             {/* Toolbar PDF */}
             <div className="bg-[#A0AEC0] p-4 flex justify-between items-center px-10">
                <span className="text-xs font-black text-white italic">{fileName.toLowerCase()}.pdf</span>
                <div className="flex items-center gap-4">
                   <div className="flex items-center bg-gray-500/20 rounded-lg overflow-hidden border border-white/10">
                      <button onClick={() => setZoom(z => Math.max(50, z-10))} className="p-2 text-white hover:bg-white/10 transition-all">
                         <HiOutlineMagnifyingGlassMinus className="text-lg" />
                      </button>
                      <span className="px-4 text-xs font-black text-white border-x border-white/10">{zoom}%</span>
                      <button onClick={() => setZoom(z => Math.min(200, z+10))} className="p-2 text-white hover:bg-white/10 transition-all">
                         <HiOutlineMagnifyingGlassPlus className="text-lg" />
                      </button>
                   </div>
                   <div className="bg-gray-500/20 px-6 py-2 rounded-lg border border-white/10 text-xs font-black text-white">
                      Hal {currentPage}/{totalPages}
                   </div>
                </div>
             </div>

             {/* Content Area */}
             <div className="flex-1 p-12 bg-gray-100 flex flex-col items-center overflow-y-auto custom-scrollbar relative">
                <div className="w-full max-w-4xl bg-white shadow-2xl rounded-sm p-16 space-y-12 min-h-[1200px] transition-all duration-300" style={{ transform: `scale(${zoom/100})`, transformOrigin: 'top center' }}>
                   <h2 className="text-3xl font-black text-center text-gray-800 mb-20">CSS Flexbox Layout</h2>
                   
                   <div className="space-y-6">
                      <h3 className="text-xl font-black text-gray-800">1. Pengertian Flexbox</h3>
                      <div className="space-y-3">
                         <div className="h-2 w-full bg-gray-100 rounded-full"></div>
                         <div className="h-2 w-full bg-gray-100 rounded-full"></div>
                         <div className="h-2 w-[80%] bg-gray-100 rounded-full"></div>
                      </div>
                   </div>

                   <div className="space-y-6">
                      <h3 className="text-xl font-black text-gray-800">2. Flex Container Properties</h3>
                      <div className="space-y-3">
                         <div className="h-2 w-full bg-gray-100 rounded-full"></div>
                         <div className="h-2 w-full bg-gray-100 rounded-full"></div>
                         <div className="h-2 w-[90%] bg-gray-100 rounded-full"></div>
                      </div>
                      <div className="p-8 bg-gray-50 rounded-2xl border border-gray-200 font-mono text-sm text-gray-600 space-y-2 mt-8">
                         <p>display: flex;</p>
                         <p>flex-direction: row;</p>
                         <p>justify-content: center;</p>
                      </div>
                   </div>

                   <div className="space-y-6">
                      <h3 className="text-xl font-black text-gray-800">3. Flex Item Properties</h3>
                      <div className="space-y-3">
                         <div className="h-2 w-full bg-gray-100 rounded-full"></div>
                         <div className="h-2 w-full bg-gray-100 rounded-full"></div>
                         <div className="h-2 w-full bg-gray-100 rounded-full"></div>
                         <div className="h-2 w-[70%] bg-gray-100 rounded-full"></div>
                      </div>
                   </div>
                </div>

                {/* Floating Navigation Controls as in Screenshot */}
                <div className="absolute right-10 top-1/2 -translate-y-1/2 flex flex-col gap-4">
                   <button className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-white hover:bg-indigo-500 shadow-lg transition-all">
                      <HiOutlineChevronUp className="text-xl" />
                   </button>
                   <button className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-white hover:bg-indigo-500 shadow-lg transition-all">
                      <HiOutlineChevronDown className="text-xl" />
                   </button>
                </div>
             </div>
          </Card>

          {/* Bottom Latihan Section */}
          <Card className="rounded-[2.5rem] border-none shadow-sm bg-white p-10">
             <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-black text-gray-900">Latihan PG</h2>
                <Badge className="bg-gray-100 text-gray-400 border-none font-black text-[9px] px-4 py-1 uppercase tracking-widest">
                   Belum Dikerjakan
                </Badge>
             </div>
             <Button className="w-full bg-[#10B981] hover:bg-[#059669] text-white font-black py-8 rounded-2xl shadow-xl shadow-emerald-100 uppercase tracking-widest text-xs">
                Mulai Latihan PG (10 Soal)
             </Button>
          </Card>
        </div>

        {/* Sidebar Sections */}
        <div className="lg:col-span-4 space-y-8">
          <Card className="rounded-[2.5rem] border-2 border-emerald-100 shadow-xl shadow-emerald-50 bg-[#E9F7F2] p-8">
             <div className="flex items-center gap-2 mb-4 justify-between">
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                   <h3 className="text-sm font-black text-emerald-900 uppercase">Refleksi P{session?.urutan || '4'}</h3>
                </div>
                {aiScoreRef !== null && (
                   <Badge className="bg-emerald-600 text-white border-none font-black text-[10px] px-3 py-1 uppercase tracking-widest shadow-lg shadow-emerald-100">
                      AI: {aiScoreRef}/100
                   </Badge>
                )}
             </div>
             <div className="text-[11px] font-bold text-emerald-800/70 leading-relaxed mb-6 text-left space-y-2">
                <span className="text-emerald-900 block font-black mb-1">Pertanyaan Refleksi:</span>
                {materiList.filter(m => m.refleksi && m.refleksi.trim()).length > 0 ? (
                   materiList
                      .filter(m => m.refleksi && m.refleksi.trim())
                      .map((m, idx, arr) => (
                         <p key={m.id || idx} className="bg-white/40 p-2.5 rounded-xl border border-emerald-100/50 font-sans normal-case">
                            {arr.length > 1 ? `${idx + 1}. ` : ''}{m.refleksi}
                         </p>
                      ))
                ) : (
                   <p className="bg-white/40 p-2.5 rounded-xl border border-emerald-100/50 font-sans normal-case">
                      Jelaskan apa yang kamu pelajari pada pertemuan ini dan bagaimana penerapannya dalam layout web?
                   </p>
                )}
             </div>
             <textarea 
               value={refleksi}
               onChange={(e) => setRefleksi(e.target.value)}
               placeholder="Tuliskan Refleksimu di sini..."
               className="w-full h-48 bg-white border-none rounded-[1.5rem] p-6 text-xs font-medium focus:outline-none"
             />
             <p className="text-[9px] font-bold text-emerald-800/40 italic mt-3 mb-6">
                AI akan memberi skor referensi · Nilai final dari Asisten
             </p>
             <Button 
               onClick={handleRefleksiSubmit}
               disabled={isSubmittingRefleksi}
               className="w-full bg-[#10B981] hover:bg-[#059669] text-white font-black py-6 rounded-xl shadow-lg shadow-emerald-100 uppercase tracking-widest text-[10px]"
             >
                {isSubmittingRefleksi ? 'Sedang Menilai (AI)...' : 'Submit Refleksi'}
             </Button>
          </Card>

          <Card className="rounded-[2.5rem] border-none shadow-sm bg-white overflow-hidden">
             <div className="p-8 pb-4">
                <h3 className="text-base font-black text-gray-900">Status P{session?.urutan || '4'}</h3>
             </div>
             <div className="divide-y divide-gray-50">
                <div className="p-6 flex justify-between items-center">
                   <span className="text-xs font-bold text-gray-500">PDF ({totalPages} halaman)</span>
                   <Badge className="text-amber-500 bg-amber-50 border-none font-black text-[8px] px-3 py-0.5 rounded-full uppercase">
                      Dibaca {currentPage}/{totalPages}
                   </Badge>
                </div>
                <div className="p-6 flex justify-between items-center">
                   <span className="text-xs font-bold text-gray-500">Latihan PG</span>
                   <Badge className="text-gray-300 bg-gray-50 border-none font-black text-[8px] px-3 py-0.5 rounded-full uppercase">
                      Belum
                   </Badge>
                </div>
                <div className="p-6 flex justify-between items-center">
                   <span className="text-xs font-bold text-gray-500">Refleksi</span>
                   <Badge className={`${
                      aiScoreRef !== null ? 'text-emerald-500 bg-emerald-50' : 'text-gray-300 bg-gray-50'
                    } border-none font-black text-[8px] px-3 py-0.5 rounded-full uppercase`}>
                      {aiScoreRef !== null ? 'Selesai' : 'Belum'}
                   </Badge>
                </div>
             </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ViewPDF;
