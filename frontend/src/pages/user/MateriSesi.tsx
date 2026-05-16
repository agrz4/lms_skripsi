import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMateriStore } from '../../store/useMateriStore';
import { useJadwalStore } from '../../store/useJadwalStore';
import { 
  HiOutlineArrowLeft, 
  HiOutlineChevronLeft, 
  HiOutlineChevronRight,
  HiOutlinePlayCircle,
  HiOutlineDocumentArrowDown,
  HiOutlineCheckCircle,
  HiOutlineCloudArrowUp,
  HiOutlineSparkles
} from 'react-icons/hi2';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const MateriSesi: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const pertemuanId = searchParams.get('pertemuanId');

  const { materiList, fetchMateriByPertemuan } = useMateriStore();
  const { jadwalList } = useJadwalStore();
  
  const [refleksi, setRefleksi] = useState('');

  // Find session info
  const session = jadwalList.find(s => s.id === pertemuanId);
  const videos = materiList.filter(m => m.videoUrl);
  const pdfs = materiList.filter(m => m.fileUrl);

  useEffect(() => {
    if (pertemuanId) {
      fetchMateriByPertemuan(pertemuanId);
    }
  }, [pertemuanId, fetchMateriByPertemuan]);

  return (
    <div className="p-8 bg-[#F3F4F6] min-h-screen pb-20">
      {/* Header Navigation */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={() => navigate(-1)}
            className="bg-white border-none shadow-sm rounded-xl font-bold text-[10px] uppercase py-6 px-6"
          >
            <HiOutlineArrowLeft className="mr-2" /> List Pertemuan
          </Button>
          <div>
            <h1 className="text-2xl font-black text-gray-900 leading-tight">
               P{session?.urutan || '—'} — {session?.topik || 'CSS Layout & Flexbox'}
            </h1>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
               Web Dev Bootcamp · Micro Learning · 19 Mar 2025
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" className="bg-white border-none shadow-sm rounded-xl py-6 px-6 font-black text-xs">
            <HiOutlineChevronLeft className="mr-2" /> P2
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white border-none shadow-lg shadow-blue-100 rounded-xl py-6 px-6 font-black text-xs">
            P4 <HiOutlineChevronRight className="ml-2" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Content: Videos & Files */}
        <div className="lg:col-span-8 space-y-8">
          <Card className="rounded-[2.5rem] border-none shadow-sm bg-white p-10">
            <h2 className="text-xl font-black text-gray-900 mb-8">Video Materi ({videos.length} Video)</h2>
            
            <div className="space-y-12">
              {videos.map((v, i) => (
                <div key={v.id} className="space-y-6">
                  <h3 className="text-sm font-black text-gray-700">Video {i + 1} — {v.nama}</h3>
                  <div className="aspect-video w-full bg-gray-100 rounded-[2rem] flex items-center justify-center border border-gray-50 overflow-hidden relative group">
                    <HiOutlinePlayCircle className="text-8xl text-gray-300 group-hover:text-blue-500 transition-all cursor-pointer" />
                    <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gray-200">
                      <div className="h-full bg-indigo-500 w-[40%]"></div>
                    </div>
                  </div>
                </div>
              ))}

              {/* TikTok Example style as in screenshot */}
              <div className="space-y-6">
                 <h3 className="text-sm font-black text-gray-700">Video 2 — CSS Flexbox (TikTok)</h3>
                 <div className="aspect-video w-full bg-gray-50 rounded-[2rem] flex items-center justify-center border-2 border-dashed border-gray-200 group cursor-pointer hover:bg-gray-100/50 transition-all">
                    <div className="flex flex-col items-center gap-3 text-center">
                       <HiOutlinePlayCircle className="text-6xl text-gray-300" />
                       <div>
                          <p className="text-xs font-black text-gray-500">tiktok.com/flexbox-guide</p>
                          <p className="text-[10px] font-bold text-gray-400">Klik untuk buka di TikTok</p>
                       </div>
                    </div>
                 </div>
              </div>

              {/* Sub Materi / PDF Section */}
              <div className="pt-10 border-t border-gray-50 space-y-6">
                <h3 className="text-sm font-black text-gray-700">Sub Materi</h3>
                <div className="space-y-3">
                   {pdfs.length > 0 ? pdfs.map((p, i) => (
                     <div 
                       key={p.id} 
                       onClick={() => navigate(`/user/view-pdf?pertemuanId=${pertemuanId}&url=${encodeURIComponent(p.fileUrl)}&name=${encodeURIComponent(p.nama)}`)}
                       className="flex items-center justify-between p-5 bg-gray-50 border border-gray-100 rounded-2xl group hover:border-blue-400 hover:bg-blue-50/30 transition-all cursor-pointer shadow-sm"
                     >
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                              <HiOutlineDocumentArrowDown className="text-xl text-blue-500" />
                           </div>
                           <span className="text-xs font-black text-gray-700">Sub Materi {i+1}: {p.nama}</span>
                        </div>
                        <Button className="bg-[#0E341E] hover:bg-[#0a2616] text-white font-black text-[10px] rounded-lg px-6 uppercase tracking-wider">
                           Buka PDF
                        </Button>
                     </div>
                   )) : (
                     <div className="text-center py-4 text-xs font-bold text-gray-300 italic">Belum ada file PDF</div>
                   )}
                </div>
              </div>
            </div>
          </Card>

          {/* Latihan PG Section */}
          <Card className="rounded-[2.5rem] border-none shadow-sm bg-white p-10">
             <div className="flex justify-between items-center mb-8">
                <div>
                   <h2 className="text-xl font-black text-gray-900">Latihan PG (10 Soal)</h2>
                   <p className="text-xs font-bold text-gray-400 mt-1">Jawab 10 soal pilihan ganda · AI langsung koreksi dan beri nilai</p>
                </div>
                <Badge className="bg-emerald-100 text-emerald-600 border-none font-black text-[9px] px-4 py-1 uppercase tracking-widest">
                   AI Auto Koreksi
                </Badge>
             </div>
             <Button className="w-full bg-[#10B981] hover:bg-[#059669] text-white font-black py-8 rounded-2xl shadow-xl shadow-emerald-100 uppercase tracking-widest text-xs">
                Mulai Latihan PG →
             </Button>
          </Card>

          {/* Latihan Upload Section */}
          <Card className="rounded-[2.5rem] border-none shadow-sm bg-white p-10">
             <div className="flex justify-between items-center mb-8">
                <div>
                   <h2 className="text-xl font-black text-gray-900">Latihan Praktik</h2>
                   <p className="text-xs font-bold text-gray-400 mt-1">Buat layout CSS sederhana dan upload screenshot hasilnya + file zip project</p>
                </div>
                <Badge className="bg-blue-100 text-blue-600 border-none font-black text-[9px] px-4 py-1 uppercase tracking-widest">
                   Screenshot/File
                </Badge>
             </div>
             <div className="space-y-4">
                <div className="w-full p-8 border-2 border-dashed border-gray-100 rounded-2xl bg-gray-50/50 flex flex-col items-center justify-center gap-3 group hover:border-blue-300 transition-all cursor-pointer">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-8 bg-amber-100 rounded-lg flex items-center justify-center text-amber-500">
                         📂
                      </div>
                      <span className="text-xs font-black text-gray-500">Upload Screenshot (.png/.jpg)</span>
                   </div>
                </div>
                <div className="w-full p-8 border-2 border-dashed border-gray-100 rounded-2xl bg-gray-50/50 flex flex-col items-center justify-center gap-3 group hover:border-blue-300 transition-all cursor-pointer">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-500">
                         🗜️
                      </div>
                      <span className="text-xs font-black text-gray-500">Upload File Program (.zip)</span>
                   </div>
                </div>
             </div>
          </Card>
        </div>

        {/* Sidebar: Refleksi & Status */}
        <div className="lg:col-span-4 space-y-8">
          {/* Refleksi Card */}
          <Card className="rounded-[2.5rem] border-2 border-emerald-100 shadow-xl shadow-emerald-50 bg-[#E9F7F2] p-8">
             <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <h3 className="text-sm font-black text-emerald-900 uppercase">Refleksi Pertemuan {session?.urutan}</h3>
             </div>
             <p className="text-[11px] font-bold text-emerald-800/60 leading-relaxed mb-6">
                Pertanyaan: "Jelaskan apa yang kamu pelajari tentang CSS Flexbox dan bagaimana penerapannya dalam layout web?"
             </p>
             <textarea 
               value={refleksi}
               onChange={(e) => setRefleksi(e.target.value)}
               placeholder="Tuliskan Refleksimu di sini..."
               className="w-full h-48 bg-white border-none rounded-[1.5rem] p-6 text-xs font-medium focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
             />
             <p className="text-[9px] font-bold text-emerald-800/40 italic mt-3 mb-6">
                AI akan memberi skor referensi · Nilai final dari Asisten
             </p>
             <Button className="w-full bg-[#10B981] hover:bg-[#059669] text-white font-black py-6 rounded-xl shadow-lg shadow-emerald-100 uppercase tracking-widest text-[10px]">
                Submit Refleksi
             </Button>
          </Card>

          {/* Status Tracker Card */}
          <Card className="rounded-[2.5rem] border-none shadow-sm bg-white overflow-hidden">
             <div className="p-8 pb-4">
                <h3 className="text-base font-black text-gray-900">Status P{session?.urutan}</h3>
             </div>
             <div className="divide-y divide-gray-50">
                {[
                  { name: 'Video 1', status: '85% ditonton', color: 'text-amber-500 bg-amber-50' },
                  { name: 'Video 2 (TikTok)', status: 'Belum', color: 'text-gray-300 bg-gray-50' },
                  { name: 'Latihan PG', status: 'Belum', color: 'text-gray-300 bg-gray-50' },
                  { name: 'Upload', status: 'Belum', color: 'text-gray-300 bg-gray-50' },
                  { name: 'Refleksi', status: 'Belum', color: 'text-gray-300 bg-gray-50' },
                ].map((item, idx) => (
                  <div key={idx} className="p-6 flex justify-between items-center">
                     <span className="text-xs font-bold text-gray-500">{item.name}</span>
                     <Badge className={`${item.color} border-none font-black text-[8px] px-3 py-0.5 rounded-full uppercase`}>
                        {item.status}
                     </Badge>
                  </div>
                ))}
             </div>
          </Card>

          {/* AI Hint Section */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-8 rounded-[2.5rem] border border-white shadow-xl shadow-indigo-100/50">
             <div className="flex items-center gap-2 mb-4">
                <HiOutlineSparkles className="text-indigo-600" />
                <h3 className="text-xs font-black text-indigo-900 uppercase">AI Learning Buddy</h3>
             </div>
             <p className="text-[10px] text-indigo-800/60 font-bold leading-relaxed">
                Tonton video minimal 80% untuk membuka akses latihan PG dan mendapatkan skor AI terbaik!
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MateriSesi;
