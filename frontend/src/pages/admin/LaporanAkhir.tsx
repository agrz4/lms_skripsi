import React from 'react';
import { 
  HiOutlineUserGroup, 
  HiOutlineAcademicCap, 
  HiOutlineXCircle,
  HiOutlineChartBar,
  HiOutlineTrophy,
  HiOutlineArrowDownTray
} from 'react-icons/hi2';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const LaporanAkhir: React.FC = () => {
  return (
    <div className="p-8 bg-[#F3F4F6] min-h-screen pb-20">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-black text-gray-900 leading-none">End Kursus</h1>
        <p className="text-sm text-gray-500 font-bold mt-2">Rekap nilai per materi - Status kelulusan - Generate Sertifikat</p>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-4 gap-6 mb-10">
        <StatCard count="32" label="Total Peserta" sub="+2 Hari Ini" color="bg-[#1a3a5a]" icon={<HiOutlineUserGroup />} />
        <StatCard count="24" label="Lulus" sub="+5 Hari Ini" color="bg-[#1a4a2a]" icon={<HiOutlineAcademicCap />} />
        <StatCard count="8" label="Tidak Lulus" sub="+0 Hari Ini" color="bg-[#5a1a1a]" icon={<HiOutlineXCircle />} />
        <StatCard count="75%" label="Total Kelulusan" sub="+20% Hari Ini" color="bg-[#5a4a1a]" icon={<HiOutlineChartBar />} />
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Main Table */}
        <div className="col-span-8">
           <Card className="rounded-[2rem] border-none shadow-sm bg-white overflow-hidden">
              <table className="w-full text-left">
                 <thead className="bg-gray-50/50">
                    <tr>
                       <th className="py-5 px-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">Nama</th>
                       <th className="py-5 px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">P1</th>
                       <th className="py-5 px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">P2</th>
                       <th className="py-5 px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">P3</th>
                       <th className="py-5 px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Ujian</th>
                       <th className="py-5 px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Total</th>
                       <th className="py-5 px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
                       <th className="py-5 px-8 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Sertifikat</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-50">
                    <StudentRow 
                      name="Ahmad Syafii" 
                      initial="AS" 
                      p1={70} p2={78} p3={78} 
                      ujian={70} total={75} 
                      status="Lulus" 
                    />
                    <StudentRow 
                      name="Dedi Kurniawan" 
                      initial="DK" 
                      p1={50} p2={50} p3={50} 
                      ujian={70} total={75} 
                      status="Tidak Lulus" 
                    />
                 </tbody>
              </table>
           </Card>
        </div>

        {/* Certificate Preview */}
        <div className="col-span-4 space-y-6">
           <div className="bg-gradient-to-b from-blue-500 to-indigo-600 p-8 rounded-[2rem] shadow-2xl shadow-indigo-200 flex flex-col items-center text-center text-white relative overflow-hidden">
              {/* Certificate Inner Card */}
              <div className="bg-white/10 backdrop-blur-md w-full rounded-[1.5rem] p-8 border border-white/20 relative z-10 shadow-inner">
                 <div className="flex justify-center mb-6">
                    <HiOutlineTrophy className="text-5xl text-yellow-400 drop-shadow-lg" />
                 </div>
                 <h2 className="text-xl font-bold text-yellow-400 mb-1">Sertifikat Kelulusan</h2>
                 <p className="text-[10px] font-bold text-white/70 mb-6 uppercase tracking-widest">HybridLMS - 2025</p>
                 
                 <div className="space-y-1 mb-6">
                    <p className="text-2xl font-black">Ahmad Syafii</p>
                    <p className="text-[10px] font-bold text-white/60">Web Dev Bootcamp - Nilai</p>
                    <p className="text-4xl font-black text-white">85</p>
                 </div>
                 
                 <p className="text-[9px] font-mono text-white/40">ID: CERT-WD-2025-001</p>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-900/20 rounded-full blur-3xl"></div>
           </div>

           <Button className="w-full bg-[#f39c12] hover:bg-[#e67e22] text-white font-black rounded-xl py-8 shadow-2xl shadow-orange-900/10 uppercase tracking-widest text-[10px]">
              <HiOutlineArrowDownTray className="mr-2 text-lg" /> Download Semua Sertifikat
           </Button>
        </div>
      </div>
    </div>
  );
};

// Helper Components
const StatCard: React.FC<{ count: string, label: string, sub: string, color: string, icon: React.ReactNode }> = ({ count, label, sub, color, icon }) => (
  <Card className={`${color} border-none rounded-[2.5rem] shadow-xl overflow-hidden relative group`}>
    <CardContent className="p-8 text-white relative z-10">
      <div className="flex justify-between items-start mb-6">
         <Badge className="bg-white/20 text-white border-none font-bold text-[10px] px-4 py-1.5 rounded-full backdrop-blur-md">{sub}</Badge>
      </div>
      <div>
         <p className="text-6xl font-black mb-2">{count}</p>
         <p className="text-sm font-bold text-white/70 uppercase tracking-widest">{label}</p>
      </div>
      <div className="w-full h-1 bg-white/20 rounded-full mt-8 overflow-hidden">
         <div className="h-full bg-white w-1/2 rounded-full"></div>
      </div>
    </CardContent>
    <div className="absolute -right-4 bottom-0 p-8 opacity-[0.03] text-[10rem] text-white transform rotate-12 group-hover:rotate-0 transition-all duration-700">
       {icon}
    </div>
  </Card>
);

const StudentRow: React.FC<{ name: string, initial: string, p1: number, p2: number, p3: number, ujian: number, total: number, status: 'Lulus' | 'Tidak Lulus' }> = ({ name, initial, p1, p2, p3, ujian, total, status }) => (
  <tr className="hover:bg-gray-50 transition-colors">
     <td className="py-5 px-8">
        <div className="flex items-center gap-3">
           <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black text-white ${status === 'Lulus' ? 'bg-emerald-500' : 'bg-purple-500'}`}>
              {initial}
           </div>
           <span className="text-sm font-bold text-gray-900">{name}</span>
        </div>
     </td>
     <td className="py-5 px-4">
        <div className="space-y-1">
           <div className="flex justify-between text-[8px] font-bold text-gray-400">
              <span>Nilai</span>
              <span>{p1}</span>
           </div>
           <div className="w-16 h-1 bg-gray-100 rounded-full overflow-hidden">
              <div className={`h-full ${p1 > 60 ? 'bg-emerald-500' : 'bg-red-500'}`} style={{ width: `${p1}%` }}></div>
           </div>
        </div>
     </td>
     <td className="py-5 px-4">
        <div className="space-y-1">
           <div className="flex justify-between text-[8px] font-bold text-gray-400">
              <span>Nilai</span>
              <span>{p2}</span>
           </div>
           <div className="w-16 h-1 bg-gray-100 rounded-full overflow-hidden">
              <div className={`h-full ${p2 > 60 ? 'bg-emerald-500' : 'bg-red-500'}`} style={{ width: `${p2}%` }}></div>
           </div>
        </div>
     </td>
     <td className="py-5 px-4">
        <div className="space-y-1">
           <div className="flex justify-between text-[8px] font-bold text-gray-400">
              <span>Nilai</span>
              <span>{p3}</span>
           </div>
           <div className="w-16 h-1 bg-gray-100 rounded-full overflow-hidden">
              <div className={`h-full ${p3 > 60 ? 'bg-emerald-500' : 'bg-red-500'}`} style={{ width: `${p3}%` }}></div>
           </div>
        </div>
     </td>
     <td className="py-5 px-4 text-center text-sm font-black text-gray-900">{ujian}</td>
     <td className="py-5 px-4 text-center text-sm font-black text-gray-900">{total}</td>
     <td className="py-5 px-4 text-center">
        <Badge className={`rounded-full px-4 py-1 text-[9px] font-black border-none uppercase ${status === 'Lulus' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
           {status}
        </Badge>
     </td>
     <td className="py-5 px-8 text-right">
        {status === 'Lulus' && (
          <Button size="sm" className="bg-[#f39c12]/20 hover:bg-[#f39c12]/30 text-[#f39c12] font-black text-[9px] rounded-lg px-6 h-7 border-none shadow-none uppercase">
             ! Buat
          </Button>
        )}
     </td>
  </tr>
);

export default LaporanAkhir;
