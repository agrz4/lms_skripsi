import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  HiOutlineArrowLeft, 
  HiOutlinePlus,
  HiOutlineVideoCamera,
  HiOutlineDocumentText,
  HiOutlineLink,
  HiOutlineCheckCircle,
  HiOutlineSparkles,
  HiOutlineLockClosed
} from 'react-icons/hi2';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const AddMateriAdmin: React.FC = () => {
  const navigate = useNavigate();
  const [jenisUtama, setJenisUtama] = useState('Micro Learning');

  return (
    <div className="p-8 bg-[#F3F4F6] min-h-screen pb-20">
      {/* Header */}
      <div className="flex items-center gap-6 mb-10">
        <Button 
          variant="outline" 
          onClick={() => navigate('/admin/materi')}
          className="bg-white border-none shadow-sm rounded-xl font-bold text-xs py-6 px-6"
        >
          <HiOutlineArrowLeft className="mr-2" /> Kembali ke Materi
        </Button>
        <div>
          <h1 className="text-3xl font-black text-gray-900 leading-none">Add Materi — Pertemuan 4</h1>
          <p className="text-sm text-gray-500 font-bold mt-2 uppercase tracking-tight">Web Dev Bootcamp - 26 Mar 2025 - Rabu 09:00 - Dr. Siti</p>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Left Column */}
        <div className="col-span-7 space-y-8">
          <Card className="rounded-[2rem] border-none shadow-sm bg-white p-10">
            <h2 className="text-lg font-black text-gray-900 mb-8">Konten Pembelajaran</h2>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-gray-900 ml-1">Topik Pertemuan</label>
                <Input placeholder="Judul topik pertemuan 4..." className="rounded-xl border-gray-100 bg-gray-50/50 py-7 focus:bg-white transition-all font-bold text-sm" />
              </div>

              <div className="space-y-3">
                <label className="text-[11px] font-bold text-gray-900 ml-1">Jenis Utama</label>
                <div className="flex gap-6">
                   {['Zoom/Meet', 'Micro Learning', 'General PDF'].map((type) => (
                     <label key={type} className="flex items-center gap-2 cursor-pointer group">
                        <div 
                          onClick={() => setJenisUtama(type)}
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                            jenisUtama === type ? 'border-indigo-600 bg-indigo-600 shadow-lg shadow-indigo-100' : 'border-gray-200 group-hover:border-gray-300'
                          }`}
                        >
                          {jenisUtama === type && <div className="w-2 h-2 bg-white rounded-full"></div>}
                        </div>
                        <span className={`text-xs font-bold ${jenisUtama === type ? 'text-gray-900' : 'text-gray-400'}`}>{type}</span>
                     </label>
                   ))}
                </div>
              </div>

              {/* Zoom Section */}
              <div className="pt-6 border-t border-dashed border-gray-100 space-y-6">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest italic">Jika Zoom/Meet:</p>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-gray-900 ml-1">Link Zoom</label>
                  <Input placeholder="https://zoom.us/j/..." className="rounded-xl border-gray-100 bg-gray-50/50 py-7 focus:bg-white" />
                </div>
                <div className="space-y-4">
                  <label className="text-[11px] font-bold text-gray-900 ml-1">Upload Rekaman</label>
                  <div className="space-y-3">
                    <button className="w-full py-6 border-2 border-dashed border-gray-100 rounded-xl flex items-center justify-center gap-3 hover:bg-gray-50 transition-all group">
                       <div className="w-8 h-6 bg-amber-100 rounded flex items-center justify-center">
                          <div className="w-4 h-3 bg-amber-400 rounded-sm"></div>
                       </div>
                       <span className="text-[11px] font-bold text-gray-400 group-hover:text-gray-600">Upload Video 1 (.mp4)</span>
                    </button>
                    <button className="w-full py-6 border-2 border-dashed border-gray-100 rounded-xl flex items-center justify-center gap-3 hover:bg-gray-50 transition-all group">
                       <div className="w-8 h-6 bg-amber-100 rounded flex items-center justify-center">
                          <div className="w-4 h-3 bg-amber-400 rounded-sm"></div>
                       </div>
                       <span className="text-[11px] font-bold text-gray-400 group-hover:text-gray-600">Upload Video 2 (.mp4)</span>
                    </button>
                    <button className="text-[10px] font-bold text-gray-400 flex items-center gap-1 ml-1 hover:text-indigo-600 transition-colors">
                      <HiOutlinePlus /> Tambah video
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="rounded-[2rem] border-none shadow-sm bg-white p-10">
             <h2 className="text-sm font-black text-gray-900 mb-6">Micro Learning (aktif):</h2>
             <div className="space-y-4">
                <p className="text-[11px] font-bold text-gray-900 ml-1">Video/Link</p>
                <div className="space-y-3">
                   <div className="p-5 border-2 border-dashed border-gray-100 rounded-xl flex items-center justify-between text-[11px] font-bold text-gray-300">
                      <div className="flex items-center gap-3">
                        <HiOutlineLink className="text-lg" /> https://www.tiktok.com/
                      </div>
                   </div>
                   <div className="p-5 border-2 border-dashed border-gray-100 rounded-xl flex items-center justify-between text-[11px] font-bold text-gray-300">
                      <div className="flex items-center gap-3">
                        <HiOutlineVideoCamera className="text-lg" /> Upload Lokal Video 1
                      </div>
                   </div>
                   <button className="text-[10px] font-bold text-gray-400 flex items-center gap-1 ml-1 hover:text-indigo-600">
                     <HiOutlinePlus /> Tambah video/link
                   </button>
                </div>
             </div>
          </Card>

          <Card className="rounded-[2rem] border-none shadow-sm bg-white p-10">
             <div className="space-y-6">
                <div>
                   <h2 className="text-sm font-black text-gray-900 mb-1">PDF:</h2>
                   <p className="text-[11px] font-bold text-gray-400">Upload PDF (bisa lebih dari 1)</p>
                </div>
                <div className="space-y-4">
                   <div className="p-6 border-2 border-dashed border-gray-100 rounded-xl flex items-center justify-center gap-3 text-[11px] font-bold text-gray-300">
                      <HiOutlineDocumentText className="text-xl" /> Upload PDF 1
                   </div>
                   <button className="text-[10px] font-bold text-gray-400 flex items-center gap-1 ml-1 hover:text-indigo-600">
                     <HiOutlinePlus /> Tambah PDF
                   </button>
                </div>
             </div>
          </Card>
        </div>

        {/* Right Column */}
        <div className="col-span-5 space-y-8">
           <Card className="rounded-[2rem] border-none shadow-sm bg-white p-10">
              <h2 className="text-lg font-black text-gray-900 mb-8">Latihan & Refleksi</h2>
              <div className="space-y-10">
                 {/* PG */}
                 <div className="space-y-4">
                    <div className="flex items-center gap-2">
                       <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                       <p className="text-[11px] font-bold text-emerald-600">Latihan PG (Opsional)</p>
                    </div>
                    <div className="relative">
                       <Input placeholder="Soal PG 1 --- ..." className="rounded-xl border-gray-100 bg-gray-50/50 py-7 pr-10 focus:bg-white text-xs font-medium" />
                       <HiOutlineCheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500 text-lg" />
                       <p className="text-[9px] text-gray-400 text-right mt-1 font-bold">... hingga 10 soal</p>
                    </div>
                    <Button className="w-full bg-[#0E341E] hover:bg-[#0a2616] text-white font-bold rounded-xl text-[11px] py-6">
                      <HiOutlinePlus className="mr-2" /> Soal PG
                    </Button>
                 </div>

                 {/* Upload */}
                 <div className="space-y-4">
                    <div className="flex items-center gap-2">
                       <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                       <p className="text-[11px] font-bold text-indigo-600 uppercase tracking-tighter">Latihan Upload (Screenshot/File)</p>
                    </div>
                    <div className="w-full h-24 bg-gray-50/50 border-2 border-gray-100 rounded-xl"></div>
                    <p className="text-[9px] text-gray-400 font-bold ml-1">Peserta akan upload screenshot coding / file program sebagai bukti latihan</p>
                 </div>

                 {/* Refleksi */}
                 <div className="space-y-4">
                    <div className="flex items-center gap-2">
                       <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                       <p className="text-[11px] font-bold text-red-600 uppercase tracking-tighter">Refleksi Materi</p>
                    </div>
                    <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                       <p className="text-[9px] text-red-600 font-bold leading-relaxed">
                          Refleksi di-input oleh peserta secara manual. AI akan memberi saran skor sebagai referensi untuk Asisten.
                       </p>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[11px] font-bold text-gray-900 ml-1">Pertanyaan Refleksi</label>
                       <div className="w-full h-32 bg-gray-50/50 border-2 border-gray-100 rounded-xl"></div>
                    </div>
                 </div>
              </div>
           </Card>

           {/* AI Status */}
           <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-8 rounded-[2rem] border border-white shadow-xl shadow-indigo-100">
              <div className="flex items-center gap-2 mb-6">
                 <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                 <p className="text-[11px] font-black text-indigo-600">AI Proses Setelah Simpan</p>
              </div>
              <div className="flex flex-wrap gap-4 mb-4">
                 <Badge className="bg-gray-400 text-white font-bold text-[9px] px-6 py-2 rounded-lg border-none shadow-sm">Materi</Badge>
                 <Badge className="bg-indigo-600 text-white font-bold text-[9px] px-6 py-2 rounded-lg border-none shadow-sm">RAG</Badge>
                 <Badge className="bg-indigo-400 text-white font-bold text-[9px] px-6 py-2 rounded-lg border-none shadow-sm">SLM</Badge>
                 <Badge className="bg-emerald-500 text-white font-bold text-[9px] px-6 py-2 rounded-lg border-none shadow-sm">Auto Correct Refleksi</Badge>
              </div>
              <p className="text-[9px] text-indigo-400 font-bold italic">Skor AI untuk refleksi = referensi Asisten. Nilai final ditentukan Asisten.</p>
           </div>

           <div className="flex gap-4 pt-4">
              <Button variant="outline" className="flex-1 bg-white border-none shadow-sm rounded-xl py-8 font-bold text-[10px] text-gray-900">
                Kembali
              </Button>
              <Button className="flex-[3] bg-[#0E341E] hover:bg-[#0a2616] text-white font-black rounded-xl py-8 shadow-2xl shadow-emerald-900/10 uppercase tracking-[0.2em] text-[10px]">
                <HiOutlineLockClosed className="mr-2 text-lg" /> Simpan & Add Pertemuan Berikutnya »
              </Button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AddMateriAdmin;
