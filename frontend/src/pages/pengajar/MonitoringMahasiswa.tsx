import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  HiOutlineChartBar, 
  HiOutlineUserGroup, 
  HiOutlineBookOpen,
  HiOutlineChevronDown,
  HiOutlineChevronUp,
  HiOutlineCheckCircle,
  HiOutlineExclamationCircle
} from 'react-icons/hi2';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

const MonitoringMahasiswa: React.FC = () => {
  const navigate = useNavigate();
  const [expandedMaterial, setExpandedMaterial] = useState<string | null>('P3');

  const stats = [
    { title: 'Materi Assigned', value: '3', sub: 'Dari 5 Total Materi Tersedia', trend: '↑ Aktif', color: 'bg-[#1E3A5F]' },
    { title: 'Total Mahasiswa', value: '28', sub: 'Di Materi Assigned', trend: '↑ +3 Minggu Ini', color: 'bg-[#4B3B7A]' },
    { title: 'Rata-Rata Nilai Tugas', value: '82', sub: 'Rata-rata tugas & latihan', trend: '↑ +3 Point', color: 'bg-[#1B5E20]' },
  ];

  const materialData = [
    { id: 'P1', name: 'Intro AI & ML', type: 'Intro Web Dev', students: 28, score: 82, reflection: 78, upload: '26/28' },
    { id: 'P3', name: 'Deep Learning', type: 'CSS Flexbox & Grid', students: 25, score: 65, reflection: 80, upload: '15/28' },
  ];

  const studentData = [
    { name: 'Budi S.', pg: 85, reflection: 78, upload: '2 file', status: 'Selesai', statusColor: 'bg-emerald-100 text-emerald-600' },
    { name: 'Ani S.', pg: 55, reflection: '—', upload: 'Belum upload', status: 'Kurang', statusColor: 'bg-rose-100 text-rose-600' },
  ];

  return (
    <div className="p-8 bg-[#F3F4F6] min-h-screen pb-20">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-black text-gray-900 leading-tight">Monitoring Mahasiswa</h1>
        <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">
           Hanya materi yang di-assign Admin padamu · Web Dev Bootcamp: P1, P3, P4
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        {stats.map((stat, idx) => (
          <Card key={idx} className={`${stat.color} rounded-[2.5rem] border-none p-10 text-white relative overflow-hidden shadow-2xl`}>
             <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                   <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-2xl">
                      {idx === 0 ? <HiOutlineBookOpen /> : idx === 1 ? <HiOutlineUserGroup /> : <HiOutlineChartBar />}
                   </div>
                   <Badge className="bg-white/20 text-white border-none font-black text-[10px] px-4 py-1 rounded-full uppercase">
                      {stat.trend}
                   </Badge>
                </div>
                <h3 className="text-6xl font-black mb-2">{stat.value}</h3>
                <p className="text-lg font-black opacity-90">{stat.title}</p>
                <p className="text-[11px] font-bold opacity-50 uppercase tracking-widest mt-1">{stat.sub}</p>
                <div className="mt-8 h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                   <div className="h-full bg-white w-[70%] opacity-40"></div>
                </div>
             </div>
          </Card>
        ))}
      </div>

      {/* Materials Table */}
      <Card className="rounded-[2.5rem] border-none shadow-sm bg-white overflow-hidden mb-12">
         <div className="grid grid-cols-12 px-10 py-6 bg-white text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">
            <div className="col-span-3">Nama Materi</div>
            <div className="col-span-2">Jenis Materi</div>
            <div className="col-span-1 text-center">Jumlah Mahasiswa</div>
            <div className="col-span-2 text-center px-4">Rata Nilai Tugas</div>
            <div className="col-span-2 text-center px-4">Rata Refleksi</div>
            <div className="col-span-1 text-center">Upload Selesai</div>
            <div className="col-span-1 text-right">Detail</div>
         </div>

         <div className="divide-y divide-gray-50">
            {materialData.map((m) => (
              <div key={m.id} className="grid grid-cols-12 px-10 py-8 items-center hover:bg-gray-50/50 transition-all">
                 <div className="col-span-3 text-sm font-black text-gray-800">{m.name}</div>
                 <div className="col-span-2 text-xs font-bold text-gray-400">{m.type}</div>
                 <div className="col-span-1 text-center text-sm font-black text-gray-800">{m.students}</div>
                 <div className="col-span-2 px-6">
                    <div className="flex justify-between mb-1"><span className="text-[10px] font-black text-emerald-500">{m.score}</span></div>
                    <Progress value={m.score} className="h-1.5 bg-gray-100" />
                 </div>
                 <div className="col-span-2 px-6">
                    <div className="flex justify-between mb-1"><span className="text-[10px] font-black text-indigo-500">{m.reflection}</span></div>
                    <Progress value={m.reflection} className="h-1.5 bg-gray-100" />
                 </div>
                 <div className="col-span-1 text-center text-sm font-black text-gray-800">{m.upload}</div>
                 <div className="col-span-1 text-right flex flex-col gap-2">
                    <Button 
                      variant="ghost" 
                      onClick={() => setExpandedMaterial(expandedMaterial === m.id ? null : m.id)}
                      className="bg-amber-50 hover:bg-amber-100 text-amber-600 font-black text-[9px] px-4 py-1 rounded-lg h-7"
                    >
                       Expand {expandedMaterial === m.id ? <HiOutlineChevronUp className="ml-1" /> : <HiOutlineChevronDown className="ml-1" />}
                    </Button>
                    <Button 
                      variant="ghost" 
                      onClick={() => navigate(`/pengajar/add-materi?pertemuanId=${m.id}`)}
                      className="bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-black text-[9px] px-4 py-1 rounded-lg h-7"
                    >
                       Edit Materi
                    </Button>
                 </div>
              </div>
            ))}
         </div>
      </Card>

      {/* Expanded Student List */}
      {expandedMaterial && (
        <Card className="rounded-[2.5rem] border-none shadow-xl bg-white overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500">
           <div className="bg-[#3182CE] px-10 py-5">
              <h3 className="text-white font-black text-sm uppercase tracking-widest">Mahasiswa — {expandedMaterial} CSS Layout</h3>
           </div>
           <div className="grid grid-cols-12 px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50/50">
              <div className="col-span-3">NAMA</div>
              <div className="col-span-2 text-center">LATIHAN PG</div>
              <div className="col-span-2 text-center">REFLEKSI</div>
              <div className="col-span-3 text-center">UPLOAD STATUS</div>
              <div className="col-span-2 text-right">STATUS</div>
           </div>
           <div className="divide-y divide-gray-50">
              {studentData.map((s, i) => (
                <div key={i} className="grid grid-cols-12 px-10 py-6 items-center">
                   <div className="col-span-3 flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-black text-xs ${i === 0 ? 'bg-slate-700' : 'bg-emerald-500'}`}>
                         {s.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="text-sm font-black text-gray-700">{s.name}</span>
                   </div>
                   <div className="col-span-2 text-center text-lg font-black text-gray-800">{s.pg}</div>
                   <div className="col-span-2 text-center text-lg font-black text-gray-800">{s.reflection}</div>
                   <div className="col-span-3 text-center">
                      <Badge className="bg-emerald-50 text-emerald-500 border-none font-black text-[9px] px-4 py-1 rounded-full">
                         {s.upload}
                      </Badge>
                   </div>
                   <div className="col-span-2 text-right">
                      <Badge className={`${s.statusColor} border-none font-black text-[8px] px-3 py-1 rounded-lg uppercase`}>
                         {s.status}
                      </Badge>
                   </div>
                </div>
              ))}
           </div>
        </Card>
      )}
    </div>
  );
};

export default MonitoringMahasiswa;
