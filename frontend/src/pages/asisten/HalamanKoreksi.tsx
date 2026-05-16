import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  HiOutlineMagnifyingGlass, 
  HiOutlineAdjustmentsHorizontal,
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

const HalamanKoreksi: React.FC = () => {
  const navigate = useNavigate();
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [finalScore, setFinalScore] = useState<number>(78);

  const mockTasks = [
    { id: 1, name: 'Budi Santoso', idNumber: 'E173037', course: 'Web Dev', session: 'P3', type: 'Refleksi Esai', aiScore: 75, manualScore: null, status: 'Belum', color: 'bg-amber-100 text-amber-600' },
    { id: 2, name: 'Ani Setyawati', idNumber: 'E173038', course: 'Web Dev', session: 'P2', type: 'Screenshot', aiScore: null, manualScore: null, status: 'Belum', color: 'bg-blue-100 text-blue-600' },
    { id: 3, name: 'Candra Wijaya', idNumber: 'E173039', course: 'Web Dev', session: 'P1', type: 'File Program', aiScore: null, manualScore: 88, status: 'Selesai', color: 'bg-emerald-100 text-emerald-600' },
  ];

  return (
    <div className="p-8 bg-[#F3F4F6] min-h-screen pb-20">
      {/* Header */}
      <div className="flex justify-between items-start mb-10">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Halaman Koreksi</h1>
          <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">
             Hanya kursus yang di-assign Admin · Refleksi + Upload Screenshot + Upload File
          </p>
        </div>
        <Badge className="bg-red-100 text-red-600 border-none font-black text-[10px] px-6 py-2 rounded-full shadow-sm">
           12 Belum Di Koreksi
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
                    placeholder="Cari Nama Peserta..."
                  />
               </div>
               <div className="flex gap-3">
                  <Button variant="outline" className="rounded-xl border-none bg-indigo-50 text-indigo-600 font-black text-[10px] px-6 py-6">
                     Jenis <HiOutlineAdjustmentsHorizontal className="ml-2" />
                  </Button>
                  <Button variant="outline" className="rounded-xl border-none bg-indigo-50 text-indigo-600 font-black text-[10px] px-6 py-6">
                     Status <HiOutlineAdjustmentsHorizontal className="ml-2" />
                  </Button>
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
               {mockTasks.map((task) => (
                 <div key={task.id} className="grid grid-cols-12 px-8 py-6 items-center hover:bg-gray-50 transition-all group">
                    <div className="col-span-4 flex items-center gap-4">
                       <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-black text-xs ${
                         task.id === 1 ? 'bg-blue-500' : task.id === 2 ? 'bg-emerald-500' : 'bg-amber-500'
                       }`}>
                          {task.name.split(' ').map(n => n[0]).join('')}
                       </div>
                       <div>
                          <div className="text-sm font-black text-gray-900">{task.name}</div>
                          <div className="text-[10px] font-bold text-gray-400">{task.idNumber}</div>
                       </div>
                    </div>
                    <div className="col-span-3 text-xs font-bold text-gray-600">
                       {task.course} · {task.session}
                    </div>
                    <div className="col-span-2">
                       <Badge className={`${task.color} border-none font-black text-[8px] px-3 py-1 rounded-lg uppercase tracking-widest`}>
                          {task.type === 'Refleksi Esai' && <HiOutlineChatBubbleBottomCenterText className="mr-1" />}
                          {task.type === 'Screenshot' && <HiOutlinePhoto className="mr-1" />}
                          {task.type === 'File Program' && <HiOutlineDocumentDuplicate className="mr-1" />}
                          {task.type}
                       </Badge>
                    </div>
                    <div className="col-span-1 text-center text-sm font-black text-gray-900">
                       {task.aiScore || '—'}
                    </div>
                    <div className="col-span-1 text-center">
                       <Badge className={`border-none font-black text-[8px] px-3 py-1 rounded-full uppercase ${
                         task.status === 'Belum' ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-500'
                       }`}>
                          {task.status}
                       </Badge>
                    </div>
                    <div className="col-span-1 text-right">
                       <Button 
                         onClick={() => {
                           if (task.type === 'Refleksi Esai') {
                             setSelectedTask(task);
                           } else {
                             navigate(`/asisten/upload?id=${task.id}`);
                           }
                         }}
                         variant="ghost" 
                         size="sm" 
                         className="text-[10px] font-black text-indigo-600 hover:bg-indigo-50 rounded-xl"
                       >
                          {task.status === 'Belum' ? 'KOREKSI' : 'LIHAT'}
                       </Button>
                    </div>
                 </div>
               ))}
            </div>
          </Card>
        </div>

        {/* Right Section: Correction Form */}
        <div className="lg:col-span-4">
          <Card className="rounded-[2.5rem] border-none shadow-2xl bg-white overflow-hidden sticky top-32">
             <div className="bg-indigo-600 p-8">
                <h2 className="text-xl font-black text-white">Form Koreksi</h2>
             </div>
             
             <div className="p-8 space-y-8">
                <div>
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 block">Nama Peserta</label>
                   <Input disabled value="Budi Santoso - E173037" className="bg-gray-50 border-none rounded-xl font-bold text-xs py-6" />
                </div>

                <div>
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 block">Nama Kursus</label>
                   <Input disabled value="Web Dev Bootcamp - P3 CSS Layout" className="bg-gray-50 border-none rounded-xl font-bold text-xs py-6" />
                </div>

                <div>
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 block">Jawaban Refleksi Peserta</label>
                   <div className="p-6 bg-gray-50 rounded-2xl text-[11px] font-medium text-gray-600 leading-relaxed border border-gray-100">
                      CSS adalah bahasa styling yang digunakan untuk mengatur tampilan halaman web. CSS memungkinkan pemisahan antara konten dan presentasi...
                   </div>
                </div>

                <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100">
                   <div className="flex items-center gap-2 mb-2">
                      <HiOutlineCheckBadge className="text-indigo-600" />
                      <span className="text-[10px] font-black text-indigo-900 uppercase">Skor AI (Referensi): 75</span>
                   </div>
                   <p className="text-[10px] font-bold text-indigo-700/60 leading-relaxed">
                      Jawaban mencakup konsep utama. Perlu lebih detail tentang box model dan Flexbox.
                   </p>
                </div>

                <div className="space-y-4">
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block text-center">Input Nilai Akhir (0-100)</label>
                   <div className="relative group">
                      <div className="h-40 border-4 border-emerald-500 rounded-[2.5rem] flex flex-col items-center justify-center bg-white shadow-xl shadow-emerald-50">
                         <input 
                           type="number"
                           value={finalScore}
                           onChange={(e) => setFinalScore(parseInt(e.target.value))}
                           className="text-6xl font-black text-gray-900 w-full text-center focus:outline-none bg-transparent"
                         />
                         <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-2">AI: 75 · Nilai final ditentukan asisten</p>
                      </div>
                      <div className="absolute -bottom-2 left-10 right-10 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                         <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${finalScore}%` }}></div>
                      </div>
                   </div>
                </div>

                <div>
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 block">Catatan (Opsional)</label>
                   <textarea className="w-full bg-gray-50 border-none rounded-2xl p-6 text-xs font-medium focus:ring-4 focus:ring-indigo-100 transition-all h-32" placeholder="Berikan feedback untuk mahasiswa..."></textarea>
                </div>

                <div className="flex gap-4 pt-4">
                   <Button variant="outline" className="flex-1 py-7 rounded-2xl font-black text-xs border-none bg-gray-100 text-gray-400">BATAL</Button>
                   <Button className="flex-1 py-7 rounded-2xl font-black text-xs bg-[#10B981] hover:bg-[#059669] text-white shadow-xl shadow-emerald-100">SIMPAN</Button>
                </div>
             </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default HalamanKoreksi;
