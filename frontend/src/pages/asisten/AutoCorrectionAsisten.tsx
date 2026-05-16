import React from 'react';
import { 
  HiOutlineCpuChip, 
  HiOutlineInformationCircle,
  HiOutlineFaceSmile,
  HiOutlineCheckCircle,
  HiOutlineClock
} from 'react-icons/hi2';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const AutoCorrectionAsisten: React.FC = () => {
  const stats = [
    { title: 'PG Di Koreksi AI', value: '38', sub: 'Dari Total 48 Peserta', trend: '+5 Hari Ini', color: 'bg-[#1E3A5F]' },
    { title: 'Essai Selesai', value: '22', sub: 'sudah di koreksi manual', trend: '+3 Hari Ini', color: 'bg-[#1B5E20]' },
    { title: 'Upload Menunggu', value: '10', sub: 'Menunggu Koreksi Manual', trend: '-3 Dari Kemarin', color: 'bg-[#556B2F]' },
  ];

  const tableData = [
    { name: 'Budi Santoso', course: 'Web Dev · P1', type: 'PG Auto', score: 87, ratio: '26/30', status: 'AI Selesai', statusColor: 'bg-emerald-100 text-emerald-600' },
    { name: 'Ani Susanti', course: 'Web Dev · P3', type: 'Refleksi', score: 50, ratio: '5/10', status: 'Tunggu Asisten', statusColor: 'bg-purple-100 text-purple-600' },
  ];

  return (
    <div className="p-8 bg-[#F3F4F6] min-h-screen pb-20">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 leading-tight">Auto Correction AI</h1>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
           Web Dev Bootcamp · P2 HTML Dasar · Upload Screenshot Coding
        </p>
      </div>

      {/* Info Banner */}
      <div className="bg-[#1A202C] p-5 rounded-2xl flex items-center gap-4 mb-10 shadow-lg">
         <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-400">
            <HiOutlineCpuChip className="text-xl" />
         </div>
         <p className="text-[11px] font-bold text-blue-100/80 leading-relaxed">
            🤖 AI otomatis koreksi Latihan PG. Untuk Refleksi Essai — AI beri skor referensi, asisten input nilai final. Untuk Upload Screenshot/File — asisten review manual.
         </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        {stats.map((stat, idx) => (
          <Card key={idx} className={`${stat.color} rounded-[2.5rem] border-none p-10 text-white relative overflow-hidden shadow-2xl`}>
             <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                   <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-2xl">
                      {idx === 0 ? '🤖' : idx === 1 ? '🟩' : '🟨'}
                   </div>
                   <Badge className="bg-white/20 text-white border-none font-black text-[10px] px-4 py-1 rounded-full uppercase">
                      {stat.trend}
                   </Badge>
                </div>
                <h3 className="text-6xl font-black mb-2">{stat.value}</h3>
                <p className="text-lg font-black opacity-90">{stat.title}</p>
                <p className="text-[11px] font-bold opacity-50 uppercase tracking-widest mt-1">{stat.sub}</p>
                <div className="mt-8 h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                   <div className="h-full bg-white w-[60%] opacity-40"></div>
                </div>
             </div>
          </Card>
        ))}
      </div>

      {/* Detail Table */}
      <Card className="rounded-[2.5rem] border-none shadow-sm bg-white overflow-hidden">
         <div className="grid grid-cols-12 px-10 py-8 bg-white text-xs font-black text-gray-900">
            <div className="col-span-3">Nama Peserta</div>
            <div className="col-span-3">Kursus</div>
            <div className="col-span-2">Jenis</div>
            <div className="col-span-2">Skor AI</div>
            <div className="col-span-1 text-center">Benar/Total</div>
            <div className="col-span-1 text-right">Status</div>
         </div>

         <div className="divide-y divide-gray-50">
            {tableData.map((row, idx) => (
              <div key={idx} className="grid grid-cols-12 px-10 py-8 items-center hover:bg-gray-50/50 transition-all group">
                 <div className="col-span-3 flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center text-white font-black text-xs">
                       {row.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <span className="text-sm font-black text-gray-800">{row.name}</span>
                 </div>
                 <div className="col-span-3 text-sm font-bold text-gray-500">
                    {row.course}
                 </div>
                 <div className="col-span-2">
                    <Badge className="bg-blue-50 text-blue-500 border-none font-black text-[9px] px-4 py-1 rounded-lg uppercase">
                       {row.type}
                    </Badge>
                 </div>
                 <div className="col-span-2 pr-10">
                    <div className="flex justify-between items-center mb-2">
                       <span className={`text-xs font-black ${row.score > 70 ? 'text-emerald-500' : 'text-rose-500'}`}>
                          {row.score}
                       </span>
                    </div>
                    <Progress value={row.score} className={`h-1.5 bg-gray-100 ${row.score > 70 ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                 </div>
                 <div className="col-span-1 text-center text-sm font-black text-gray-900">
                    {row.ratio}
                 </div>
                 <div className="col-span-1 text-right">
                    <Badge className={`${row.statusColor} border-none font-black text-[8px] px-3 py-1 rounded-full uppercase`}>
                       {row.status}
                    </Badge>
                 </div>
              </div>
            ))}
         </div>
      </Card>
    </div>
  );
};

export default AutoCorrectionAsisten;
