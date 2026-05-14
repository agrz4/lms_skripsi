import React from 'react';
import { 
  HiOutlineClock, 
  HiOutlineCheckCircle, 
  HiOutlineXCircle,
  HiOutlineQueueList,
  HiOutlineSparkles,
  HiOutlineArrowRight,
  HiOutlineEye
} from 'react-icons/hi2';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const AIReviewQueue: React.FC = () => {
  return (
    <div className="p-8 bg-[#F3F4F6] min-h-screen pb-20">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-black text-gray-900 leading-none">AI Review Queue</h1>
        <p className="text-sm text-gray-500 font-bold mt-2">Soal AI yang di-generate dari materi - Approve sebelum aktif ke peserta</p>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-4 gap-6 mb-10">
        <StatCard count="3" label="Menunggu" sub="+2 Hari Ini" color="bg-indigo-900" icon={<HiOutlineClock />} />
        <StatCard count="8" label="Approved" sub="+5 Hari Ini" color="bg-purple-900" icon={<HiOutlineCheckCircle />} />
        <StatCard count="0" label="Di Tolak" sub="+0 Hari Ini" color="bg-red-900" icon={<HiOutlineXCircle />} />
        <StatCard count="270" label="Total Soal" sub="+50 Hari Ini" color="bg-emerald-900" icon={<HiOutlineQueueList />} />
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Main Queue List */}
        <div className="col-span-9 space-y-6">
          {/* Card 1 - Pending */}
          <Card className="rounded-[2rem] border-none shadow-sm bg-[#E9D9B9] overflow-hidden group hover:shadow-lg transition-all border-l-[12px] border-amber-500">
            <CardContent className="p-8 flex justify-between items-start">
               <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-black text-amber-900">Web Dev Bootcamp — P3: CSS Layout</h3>
                    <p className="text-[11px] font-bold text-amber-700/60 uppercase mt-1">Generate: 2 jam lalu · 30 soal PG · Dr. Siti</p>
                  </div>
                  <div className="flex items-center gap-2">
                     <Badge className="bg-indigo-600 text-white font-bold text-[9px] px-3 py-1 border-none">RAG + SLM</Badge>
                     <span className="text-[10px] font-bold text-amber-700">Akurasi 87%</span>
                  </div>
                  <div className="flex gap-2">
                     <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] rounded-lg px-4 h-8 shadow-md">Tinjau</Button>
                     <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded-lg px-4 h-8 shadow-md">Approve</Button>
                     <Button className="bg-red-600 hover:bg-red-700 text-white font-bold text-[10px] rounded-lg px-4 h-8 shadow-md">Tolak</Button>
                  </div>
               </div>
               <Badge className="bg-amber-200/50 text-amber-800 font-bold text-[10px] px-4 py-2 rounded-xl flex items-center gap-2 border-none">
                  <HiOutlineClock /> Pending
               </Badge>
            </CardContent>
          </Card>

          {/* Card 2 - Review */}
          <Card className="rounded-[2rem] border-none shadow-sm bg-[#D9D9E9] overflow-hidden group hover:shadow-lg transition-all border-l-[12px] border-indigo-500">
            <CardContent className="p-8 flex justify-between items-start">
               <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-black text-indigo-900">Web Dev Bootcamp — P4: Refleksi Auto Score</h3>
                    <p className="text-[11px] font-bold text-indigo-700/60 uppercase mt-1">Generate: 5 jam lalu · Skor AI untuk refleksi peserta</p>
                  </div>
                  <p className="text-xs font-medium text-indigo-800/70 max-w-lg">
                    AI akan otomatis scoring refleksi peserta menggunakan model ini sebagai referensi untuk Asisten.
                  </p>
                  <div className="flex gap-2">
                     <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] rounded-lg px-4 h-8 shadow-md">Tinjau</Button>
                     <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded-lg px-4 h-8 shadow-md">Approve</Button>
                  </div>
               </div>
               <Badge className="bg-indigo-200/50 text-indigo-800 font-bold text-[10px] px-4 py-2 rounded-xl flex items-center gap-2 border-none">
                  <HiOutlineEye /> Review
               </Badge>
            </CardContent>
          </Card>

          {/* Card 3 - Aktif */}
          <Card className="rounded-[2rem] border-none shadow-sm bg-[#D9E9D9] overflow-hidden group hover:shadow-lg transition-all border-l-[12px] border-emerald-500">
            <CardContent className="p-8 flex justify-between items-center">
               <div className="space-y-1">
                  <h3 className="text-xl font-black text-emerald-900">Web Dev — P1: Intro Web Dev</h3>
                  <p className="text-[11px] font-bold text-emerald-700/60 uppercase">Approved kemarin - Aktif ke peserta ✓</p>
               </div>
               <Badge className="bg-emerald-200/50 text-emerald-800 font-bold text-[10px] px-4 py-2 rounded-xl flex items-center gap-2 border-none">
                  <HiOutlineCheckCircle /> Aktif
               </Badge>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Right */}
        <div className="col-span-3 space-y-8">
           {/* Panduan */}
           <Card className="rounded-[2rem] border-none shadow-sm bg-white p-8">
              <h2 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2">
                 <HiOutlineDocumentArrowUp className="text-gray-400" /> Panduan
              </h2>
              <div className="space-y-4">
                 <GuidelineItem text="Soal relevan materi" />
                 <GuidelineItem text="Jawaban benar akurat" />
                 <GuidelineItem text="Bahasa jelas" />
                 <GuidelineItem text="Tingkat kesulitan sesuai" />
              </div>
           </Card>

           {/* Alur AI */}
           <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-8 rounded-[2rem] border border-white shadow-xl shadow-indigo-100">
              <div className="flex items-center gap-2 mb-6">
                 <div className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse"></div>
                 <h2 className="text-sm font-black text-indigo-900">Alur AI ke Kursus</h2>
              </div>
              
              <div className="space-y-4 mb-6">
                 <div className="flex items-center justify-between gap-2">
                    <span className="bg-gray-400 text-white font-bold text-[8px] px-3 py-1 rounded-md uppercase">Materi Upload</span>
                    <HiOutlineArrowRight className="text-indigo-300 text-xs" />
                    <span className="bg-indigo-600 text-white font-bold text-[8px] px-3 py-1 rounded-md uppercase">RAG Kursus</span>
                    <HiOutlineArrowRight className="text-indigo-300 text-xs" />
                 </div>
                 <div className="flex items-center gap-2 ml-4">
                    <span className="bg-indigo-400 text-white font-bold text-[8px] px-3 py-1 rounded-md uppercase">SLM</span>
                    <HiOutlineArrowRight className="text-indigo-300 text-xs" />
                    <span className="bg-emerald-500 text-white font-bold text-[8px] px-3 py-1 rounded-md uppercase">Auto Correct ✓</span>
                 </div>
              </div>

              <p className="text-[9px] text-indigo-400 font-bold leading-relaxed">
                 AI terkait per kursus. Jika kursus ada refleksi → AI auto score tersedia untuk Asisten sebagai referensi.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
};

// Helper Components
const StatCard: React.FC<{ count: string, label: string, sub: string, color: string, icon: React.ReactNode }> = ({ count, label, sub, color, icon }) => (
  <Card className={`${color} border-none rounded-[2rem] shadow-xl overflow-hidden relative group`}>
    <CardContent className="p-8 text-white relative z-10">
      <div className="flex justify-between items-start mb-6">
         <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center text-xl backdrop-blur-md">
            {icon}
         </div>
         <Badge className="bg-white/20 text-white border-none font-bold text-[9px] px-3 py-1 rounded-full">{sub}</Badge>
      </div>
      <div>
         <p className="text-5xl font-black mb-2">{count}</p>
         <p className="text-sm font-bold text-white/60 uppercase tracking-widest">{label}</p>
      </div>
      <div className="w-full h-1 bg-white/20 rounded-full mt-6">
         <div className="w-1/3 h-full bg-white rounded-full"></div>
      </div>
    </CardContent>
    <div className="absolute top-0 right-0 p-10 opacity-[0.05] text-8xl text-white transform rotate-12 group-hover:rotate-0 transition-all duration-500">
       {icon}
    </div>
  </Card>
);

const GuidelineItem: React.FC<{ text: string }> = ({ text }) => (
  <div className="flex items-center gap-3">
     <div className="w-4 h-4 bg-emerald-500 text-white rounded flex items-center justify-center text-[10px]">✓</div>
     <span className="text-xs font-bold text-gray-600">{text}</span>
  </div>
);

const HiOutlineDocumentArrowUp: React.FC<any> = (props) => (
  <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="1em" width="1em" {...props}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <line x1="12" y1="18" x2="12" y2="12"></line>
    <polyline points="9 15 12 12 15 15"></polyline>
  </svg>
);

export default AIReviewQueue;
