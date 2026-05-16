import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useJadwalStore } from '../../store/useJadwalStore';
import { 
  HiOutlineArrowLeft, 
  HiOutlineVideoCamera,
  HiOutlinePlayCircle,
  HiOutlineArrowTopRightOnSquare,
  HiOutlineCheckCircle
} from 'react-icons/hi2';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const KelasOnline: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const pertemuanId = searchParams.get('pertemuanId');

  const { jadwalList } = useJadwalStore();
  const session = jadwalList.find(s => s.id === pertemuanId);

  return (
    <div className="p-8 bg-[#F3F4F6] min-h-screen pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
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
               P{session?.urutan || '1'} — {session?.topik || 'Pengenalan Web'} · Live Class
            </h1>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
               Sesi Pertemuan Online via Zoom
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Main Content */}
        <div className="lg:col-span-8 space-y-8">
          {/* Zoom Link Section */}
          <Card className="rounded-[2.5rem] border-none shadow-sm bg-white p-10">
             <h2 className="text-xl font-black text-gray-900 mb-8">Link Kelas Online</h2>
             <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 p-8 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                   <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-200">
                      <HiOutlineVideoCamera className="text-3xl text-white" />
                   </div>
                   <div>
                      <h3 className="text-lg font-black text-blue-900">Masuk Kelas Zoom</h3>
                      <p className="text-xs font-bold text-blue-700/60 mt-1">zoom.us/j/123456789 · Rabu 09:00</p>
                   </div>
                </div>
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-10 py-7 rounded-xl shadow-lg shadow-emerald-100">
                   Buka Link <HiOutlineArrowTopRightOnSquare className="ml-2" />
                </Button>
             </div>
             <p className="text-[10px] font-bold text-gray-400 mt-6 px-4">
                Kelas berlangsung live · Gunakan link di atas untuk bergabung · Pastikan sudah install Zoom
             </p>
          </Card>

          {/* Recording Section */}
          <Card className="rounded-[2.5rem] border-none shadow-sm bg-white p-10">
             <h2 className="text-xl font-black text-gray-900 mb-8">Rekaman Kelas (Setelah Live)</h2>
             <div className="aspect-video w-full bg-[#E0E7FF] rounded-[2rem] flex flex-col items-center justify-center gap-4 relative group overflow-hidden border-2 border-indigo-100 cursor-pointer">
                <HiOutlinePlayCircle className="text-7xl text-indigo-400 group-hover:text-indigo-600 transition-all" />
                <div className="text-center">
                   <p className="text-xs font-black text-indigo-900">rekaman_p1_intro.mp4</p>
                   <p className="text-[10px] font-bold text-indigo-700/50">1:45:30 · Upload 6 Mar</p>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-2 bg-indigo-200/50">
                   <div className="h-full bg-indigo-600 w-0"></div>
                </div>
             </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-8">
          <Card className="rounded-[2.5rem] border-2 border-emerald-100 shadow-xl shadow-emerald-50 bg-[#E9F7F2] p-8">
             <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <h3 className="text-sm font-black text-emerald-900 uppercase">Refleksi P{session?.urutan || '1'}</h3>
             </div>
             <p className="text-[11px] font-bold text-emerald-800/60 leading-relaxed mb-6">
                "Apa yang kamu pelajari dari sesi live pertama ini?"
             </p>
             <textarea 
               placeholder="Tuliskan Refleksimu di sini..."
               className="w-full h-48 bg-white border-none rounded-[1.5rem] p-6 text-xs font-medium focus:outline-none"
             />
             <Button className="w-full bg-[#10B981] hover:bg-[#059669] text-white font-black py-6 rounded-xl shadow-lg shadow-emerald-100 uppercase tracking-widest text-[10px] mt-6">
                Submit Refleksi
             </Button>
          </Card>

          <Card className="rounded-[2.5rem] border-none shadow-sm bg-white overflow-hidden">
             <div className="p-8 pb-4">
                <h3 className="text-base font-black text-gray-900">Status P{session?.urutan || '1'}</h3>
             </div>
             <div className="divide-y divide-gray-50">
                <div className="p-6 flex justify-between items-center">
                   <span className="text-xs font-bold text-gray-500">Hadir Live</span>
                   <Badge className="bg-emerald-100 text-emerald-600 border-none font-black text-[8px] px-3 py-0.5 rounded-full uppercase">
                      ✓ Hadir
                   </Badge>
                </div>
                <div className="p-6 flex justify-between items-center">
                   <span className="text-xs font-bold text-gray-500">Rekaman</span>
                   <Badge className="bg-gray-50 text-gray-300 border-none font-black text-[8px] px-3 py-0.5 rounded-full uppercase">
                      Belum tonton
                   </Badge>
                </div>
                <div className="p-6 flex justify-between items-center">
                   <span className="text-xs font-bold text-gray-500">Latihan PG</span>
                   <Badge className="bg-emerald-100 text-emerald-600 border-none font-black text-[8px] px-3 py-0.5 rounded-full uppercase">
                      ✓ Selesai
                   </Badge>
                </div>
                <div className="p-6 flex justify-between items-center">
                   <span className="text-xs font-bold text-gray-500">Refleksi</span>
                   <Badge className="bg-gray-50 text-gray-300 border-none font-black text-[8px] px-3 py-0.5 rounded-full uppercase">
                      Belum
                   </Badge>
                </div>
             </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default KelasOnline;
