import React, { useState } from 'react';
import { 
  HiOutlinePlayCircle, 
  HiOutlineDocumentPlus, 
  HiOutlinePlus,
  HiOutlineCloudArrowUp,
  HiOutlineLink,
  HiOutlineVideoCamera,
  HiOutlineChatBubbleBottomCenterText,
  HiOutlineArrowUpTray
} from 'react-icons/hi2';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

const AddMateri: React.FC = () => {
  const [videoSource, setVideoSource] = useState('upload');

  return (
    <div className="p-8 bg-[#F3F4F6] min-h-screen pb-20">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 leading-tight">Edit/Add Materi — <span className="text-blue-600">P3 CSS Layout</span></h1>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
           Bisa tambah banyak video · Sub materi dalam satu pertemuan
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Videos & Sub Materials */}
        <div className="lg:col-span-7 space-y-8">
          {/* Section: Video Content */}
          <Card className="rounded-[2.5rem] border-none shadow-sm bg-white p-10">
            <h2 className="text-xl font-black text-gray-900 mb-8">Konten Video (Bisa Lebih dari 1)</h2>
            
            <div className="space-y-10">
              {/* Video 1 Item */}
              <div className="p-8 bg-gray-50 rounded-[2rem] border border-gray-100 space-y-6">
                 <div className="flex justify-between items-center">
                    <h3 className="text-sm font-black text-gray-700">Video 1 — Intro CSS</h3>
                 </div>
                 
                 <RadioGroup defaultValue="upload" className="flex gap-6 mb-6">
                    <div className="flex items-center space-x-2">
                       <RadioGroupItem value="tiktok" id="v1-tiktok" />
                       <Label htmlFor="v1-tiktok" className="text-[10px] font-black text-gray-400 uppercase">TikTok/Link</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                       <RadioGroupItem value="upload" id="v1-upload" />
                       <Label htmlFor="v1-upload" className="text-[10px] font-black text-orange-500 uppercase">Upload Lokal</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                       <RadioGroupItem value="zoom" id="v1-zoom" />
                       <Label htmlFor="v1-zoom" className="text-[10px] font-black text-gray-400 uppercase">Zoom</Label>
                    </div>
                 </RadioGroup>

                 <div className="h-20 bg-blue-100/50 rounded-2xl border-2 border-dashed border-blue-200 flex items-center justify-center gap-3">
                    <HiOutlinePlayCircle className="text-2xl text-blue-400" />
                    <span className="text-xs font-black text-blue-500">▶ intro_css.mp4 · 12:34</span>
                 </div>
              </div>

              {/* Video 2 Item */}
              <div className="p-8 bg-gray-50 rounded-[2rem] border border-gray-100 space-y-6">
                 <div className="flex justify-between items-center">
                    <h3 className="text-sm font-black text-gray-700">Video 2 — CSS Flexbox (TikTok)</h3>
                 </div>
                 
                 <RadioGroup defaultValue="tiktok" className="flex gap-6">
                    <div className="flex items-center space-x-2">
                       <RadioGroupItem value="tiktok" id="v2-tiktok" />
                       <Label htmlFor="v2-tiktok" className="text-[10px] font-black text-orange-500 uppercase">TikTok/Link</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                       <RadioGroupItem value="upload" id="v2-upload" />
                       <Label htmlFor="v2-upload" className="text-[10px] font-black text-gray-400 uppercase">Upload Lokal</Label>
                    </div>
                 </RadioGroup>

                 <Input 
                   className="bg-indigo-50 border-indigo-100 rounded-xl py-6 text-xs font-bold text-indigo-400 placeholder:text-indigo-200"
                   placeholder="https://tiktok.com/@cssmaster/flexbox-guide"
                 />
              </div>

              <Button variant="outline" className="w-full py-10 rounded-[1.5rem] border-2 border-dashed border-gray-200 text-gray-400 font-black text-xs hover:bg-gray-50 hover:border-blue-300 hover:text-blue-500 transition-all">
                 + Tambah Video/Link Lagi
              </Button>
            </div>
          </Card>

          {/* Section: Sub Materials */}
          <Card className="rounded-[2.5rem] border-none shadow-sm bg-white p-10">
            <h2 className="text-xl font-black text-gray-900 mb-2">Sub Materi dalam Pertemuan Ini</h2>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-8">Setiap kursus bisa punya banyak sub materi dalam satu pertemuan</p>
            
            <div className="space-y-4">
              <div className="p-5 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-4">
                 <HiOutlineDocumentPlus className="text-xl text-emerald-500" />
                 <span className="text-xs font-black text-emerald-900">Sub Materi 1: Box Model</span>
              </div>
              <div className="p-5 bg-white border border-gray-100 rounded-2xl flex items-center gap-4">
                 <HiOutlineDocumentPlus className="text-xl text-gray-300" />
                 <span className="text-xs font-black text-gray-700">Sub Materi 2: Flexbox</span>
              </div>
              <Button variant="outline" className="w-full py-6 rounded-2xl border-2 border-dashed border-gray-100 text-gray-300 font-black text-[10px] uppercase tracking-widest hover:border-blue-200 hover:text-blue-400">
                 + Tambah Sub Materi
              </Button>
            </div>
          </Card>
        </div>

        {/* Right Column: PG, Upload & Reflection */}
        <div className="lg:col-span-5 space-y-8">
          <Card className="rounded-[2.5rem] border-none shadow-sm bg-white p-10 space-y-10">
            {/* Latihan PG */}
            <div className="space-y-4">
               <h3 className="text-sm font-black text-emerald-500 uppercase tracking-widest">Latihan PG (Opsional)</h3>
               <textarea 
                 className="w-full bg-gray-50 border-none rounded-2xl p-6 text-xs font-medium text-gray-500 h-28 focus:ring-4 focus:ring-emerald-50"
                 placeholder="Soal 1 — Apa itu CSS?&#10;Soal 2 — Box model terdiri dari?&#10;...Hingga 10 soal"
               />
               <div className="flex gap-3">
                  <Button className="flex-1 bg-[#10B981] hover:bg-[#059669] text-white font-black text-[10px] py-6 rounded-xl uppercase">
                     + Soal PG
                  </Button>
                  <Button variant="outline" className="bg-gray-100 border-none text-gray-500 font-black text-[10px] px-8 rounded-xl">
                     Import
                  </Button>
               </div>
            </div>

            {/* Latihan Upload */}
            <div className="space-y-4">
               <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Latihan Upload</h3>
               <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Deskripsi Tugas Upload</label>
               <textarea 
                 className="w-full bg-gray-50 border-none rounded-2xl p-6 text-xs font-medium text-gray-500 h-32 focus:ring-4 focus:ring-indigo-50"
                 placeholder="Peserta upload screenshot/file sebagai bukti"
               />
            </div>

            {/* Refleksi */}
            <div className="space-y-4">
               <h3 className="text-sm font-black text-rose-500 uppercase tracking-widest">Refleksi Materi (Input Peserta)</h3>
               <div className="bg-rose-50 p-4 rounded-xl text-[10px] font-bold text-rose-400 leading-tight">
                  Peserta input refleksi manual · AI beri skor referensi untuk Asisten
               </div>
               <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-4 block">Pertanyaan Refleksi</label>
               <textarea 
                 className="w-full bg-gray-50 border-none rounded-2xl p-6 text-xs font-medium text-gray-500 h-20 focus:ring-4 focus:ring-rose-50"
                 placeholder="Masukkan pertanyaan refleksi..."
               />
            </div>

            {/* Save Button */}
            <Button className="w-full bg-[#10B981] hover:bg-[#059669] text-white font-black py-8 rounded-[1.8rem] shadow-xl shadow-emerald-100 uppercase tracking-[0.2em] text-xs">
               <HiOutlineArrowUpTray className="mr-2 text-xl" /> Simpan Materi
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AddMateri;
