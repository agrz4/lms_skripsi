import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  HiOutlineChartBar, 
  HiOutlineUserGroup, 
  HiOutlineBookOpen,
  HiOutlineChevronDown,
  HiOutlineChevronUp,
  HiOutlineMagnifyingGlass,
  HiOutlineXMark
} from 'react-icons/hi2';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import api from '../../lib/api';

const MonitoringMahasiswa: React.FC = () => {
  const navigate = useNavigate();
  const [expandedMaterial, setExpandedMaterial] = useState<string | null>(null);
  const [statsData, setStatsData] = useState<{ avgScore: number; totalStudents: number; completionRate: number } | null>(null);
  const [materialData, setMaterialData] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch aggregate stats
      const statsRes = await api.get('/monitoring/stats');
      const stats = statsRes.data.success ? statsRes.data.data : null;
      setStatsData(stats);

      // 2. Fetch assigned materials
      const materiRes = await api.get('/monitoring/materi-assigned');
      const materiList = materiRes.data.success ? materiRes.data.data : [];

      // Group into unique pertemuans
      const pertemuansMap = new Map();
      materiList.forEach((m: any) => {
        if (!m.pertemuan) return;
        if (!pertemuansMap.has(m.pertemuanId)) {
          pertemuansMap.set(m.pertemuanId, {
            id: m.pertemuanId,
            urutan: m.pertemuan.urutan,
            topik: m.pertemuan.topik || 'Tanpa Topik',
            mataKuliahNama: m.mataKuliah?.nama || '—',
          });
        }
      });
      const pertemuansList = Array.from(pertemuansMap.values()).sort((a, b) => a.urutan - b.urutan);

      // 3. Fetch detail-mhs for each pertemuan to compute session-level averages & progress
      const pertemuansWithStats = await Promise.all(
        pertemuansList.map(async (p: any) => {
          try {
            const detailRes = await api.get(`/monitoring/detail-mhs?pertemuanId=${p.id}`);
            if (detailRes.data.success) {
              const students = detailRes.data.data.students || [];
              
              let totalRefScore = 0;
              let refCount = 0;
              let totalTaskScore = 0;
              let taskCount = 0;
              let completedUploadsCount = 0;

              students.forEach((s: any) => {
                s.submissions.forEach((sub: any) => {
                  const val = sub.score !== null ? sub.score : sub.aiScore;
                  if (sub.type === 'REFLEKSI') {
                    if (val !== null && val !== undefined) {
                      totalRefScore += val;
                      refCount++;
                    }
                  } else if (sub.type === 'FILE_UPLOAD' || sub.type === 'SCREENSHOT') {
                    if (val !== null && val !== undefined) {
                      totalTaskScore += val;
                      taskCount++;
                    }
                  }
                });

                const hasUpload = s.submissions.some((sub: any) => sub.type === 'FILE_UPLOAD' || sub.type === 'SCREENSHOT');
                if (hasUpload) {
                  completedUploadsCount++;
                }
              });

              const avgScore = taskCount > 0 ? Math.round(totalTaskScore / taskCount) : 0;
              const avgReflection = refCount > 0 ? Math.round(totalRefScore / refCount) : 0;

              return {
                ...p,
                studentsCount: students.length,
                score: avgScore || 75,
                reflection: avgReflection || 75,
                upload: `${completedUploadsCount}/${students.length}`,
                studentsList: students,
              };
            }
          } catch (err) {
            console.error(`Failed to fetch details for pertemuanId ${p.id}`, err);
          }
          return {
            ...p,
            studentsCount: 0,
            score: 75,
            reflection: 75,
            upload: '0/0',
            studentsList: [],
          };
        })
      );

      setMaterialData(pertemuansWithStats);
      if (pertemuansWithStats.length > 0) {
        setExpandedMaterial(pertemuansWithStats[0].id);
      }
    } catch (error) {
      console.error('Error in Monitoring fetchData:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectedPertemuan = materialData.find((m) => m.id === expandedMaterial);
  const selectedPertemuanStudents = selectedPertemuan?.studentsList || [];

  if (loading) {
    return (
      <div className="p-8 bg-[#F3F4F6] min-h-screen flex items-center justify-center">
        <p className="text-xs font-black text-gray-400 uppercase tracking-widest animate-pulse">Loading data monitoring...</p>
      </div>
    );
  }

  const stats = [
    { 
      title: 'Materi Assigned', 
      value: String(materialData.length), 
      sub: 'Dari total pertemuan yang di-assign', 
      trend: '↑ Aktif', 
      color: 'bg-[#1E3A5F]' 
    },
    { 
      title: 'Total Mahasiswa', 
      value: String(statsData?.totalStudents ?? 0), 
      sub: 'Di materi assigned dosen', 
      trend: '↑ Terdaftar', 
      color: 'bg-[#4B3B7A]' 
    },
    { 
      title: 'Rata-Rata Nilai', 
      value: String(statsData?.avgScore ?? 75), 
      sub: 'Rata-rata seluruh tugas', 
      trend: `↑ ${statsData?.completionRate ?? 0}% Selesai`, 
      color: 'bg-[#1B5E20]' 
    },
  ];

  const filteredMaterialData = useMemo(() => {
    if (!searchQuery.trim()) return materialData;
    const q = searchQuery.toLowerCase();
    return materialData.filter(m => 
      (m.mataKuliahNama && m.mataKuliahNama.toLowerCase().includes(q)) ||
      (m.topik && m.topik.toLowerCase().includes(q)) ||
      `Pertemuan ${m.urutan}`.toLowerCase().includes(q)
    );
  }, [materialData, searchQuery]);

  return (
    <div className="p-8 bg-[#F3F4F6] min-h-screen pb-20">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-black text-gray-900 leading-tight">Monitoring Mahasiswa</h1>
        <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">
           Hanya menampilkan pertemuan & materi yang di-assign padamu
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
         {/* Table Header with Search */}
         <div className="px-10 py-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
               <h2 className="text-base font-black text-gray-900">Daftar Kursus & Sesi Pertemuan</h2>
               <p className="text-xs text-gray-400 font-medium mt-0.5">
                  Menampilkan {filteredMaterialData.length} dari {materialData.length} sesi pertemuan
               </p>
            </div>
            <div className="relative w-full sm:w-80">
               <HiOutlineMagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
               <Input
                  placeholder="Cari nama kursus atau topik..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-8 h-9 rounded-xl border-gray-200 bg-gray-50/80 text-xs font-medium text-gray-800 placeholder:text-gray-400 focus:bg-white focus-visible:ring-[#1E3A5F] transition-all"
               />
               {searchQuery && (
                  <button
                     type="button"
                     onClick={() => setSearchQuery('')}
                     className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 rounded-full hover:bg-gray-200/50"
                  >
                     <HiOutlineXMark className="text-sm" />
                  </button>
               )}
            </div>
         </div>

         <div className="grid grid-cols-12 px-10 py-4 bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
            <div className="col-span-3">Nama Pertemuan</div>
            <div className="col-span-2">Mata Kuliah</div>
            <div className="col-span-1 text-center">Jumlah Mhs</div>
            <div className="col-span-2 text-center px-4">Rata Nilai Tugas</div>
            <div className="col-span-2 text-center px-4">Rata Refleksi</div>
            <div className="col-span-1 text-center">Upload Tugas</div>
            <div className="col-span-1 text-right">Detail</div>
         </div>

         <div className="divide-y divide-gray-50">
            {filteredMaterialData.length === 0 ? (
               <div className="py-12 text-center">
                  <p className="text-xs font-bold text-gray-400">
                     Tidak ditemukan pertemuan yang cocok dengan pencarian "{searchQuery}"
                  </p>
                  <button
                     type="button"
                     onClick={() => setSearchQuery('')}
                     className="mt-2 text-xs font-black text-indigo-600 hover:underline"
                  >
                     Reset Pencarian
                  </button>
               </div>
            ) : (
               filteredMaterialData.map((m) => (
                 <div key={m.id} className="grid grid-cols-12 px-10 py-8 items-center hover:bg-gray-50/50 transition-all">
                    <div className="col-span-3 text-sm font-black text-gray-800">Pertemuan {m.urutan} - {m.topik}</div>
                    <div className="col-span-2 text-xs font-bold text-gray-400">{m.mataKuliahNama}</div>
                    <div className="col-span-1 text-center text-sm font-black text-gray-800">{m.studentsCount}</div>
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
               ))
            )}
         </div>
      </Card>

      {/* Expanded Student List */}
      {expandedMaterial && selectedPertemuan && (
        <Card className="rounded-[2.5rem] border-none shadow-xl bg-white overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500">
           <div className="bg-[#3182CE] px-10 py-5">
              <h3 className="text-white font-black text-sm uppercase tracking-widest">
                 Daftar Mahasiswa — Pertemuan {selectedPertemuan.urutan} ({selectedPertemuan.mataKuliahNama})
              </h3>
           </div>
           <div className="grid grid-cols-12 px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50/50">
              <div className="col-span-3">NAMA</div>
              <div className="col-span-2 text-center">VIDEO PROGRESS</div>
              <div className="col-span-2 text-center">REFLEKSI</div>
              <div className="col-span-3 text-center">TUGAS UPLOAD</div>
              <div className="col-span-2 text-right">STATUS KELAS</div>
           </div>
           <div className="divide-y divide-gray-50">
              {selectedPertemuanStudents.length === 0 ? (
                <div className="p-8 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">
                   Belum ada mahasiswa terdaftar atau progres tercatat.
                </div>
              ) : selectedPertemuanStudents.map((s: any, i: number) => {
                const isCompleted = s.isCompleted;
                const watchedTime = s.watchedTime;
                
                const reflectionSub = s.submissions.find((sub: any) => sub.type === 'REFLEKSI');
                const reflectionScore = reflectionSub ? (reflectionSub.score !== null ? reflectionSub.score : `AI: ${reflectionSub.aiScore ?? '—'}`) : '—';
                
                const hasUpload = s.submissions.some((sub: any) => sub.type === 'FILE_UPLOAD' || sub.type === 'SCREENSHOT');

                return (
                  <div key={s.id || i} className="grid grid-cols-12 px-10 py-6 items-center">
                     <div className="col-span-3 flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-black text-xs ${i % 2 === 0 ? 'bg-slate-700' : 'bg-emerald-500'}`}>
                           {s.nama.split(' ').map((n: string) => n[0]).join('')}
                        </div>
                        <div>
                           <span className="text-sm font-black text-gray-700 block">{s.nama}</span>
                           <span className="text-[9px] text-gray-400 block truncate max-w-xs">{s.email}</span>
                        </div>
                     </div>
                     <div className="col-span-2 text-center text-sm font-black text-gray-800">{watchedTime}% ditonton</div>
                     <div className="col-span-2 text-center text-sm font-black text-gray-800">{reflectionScore}</div>
                     <div className="col-span-3 text-center">
                        <Badge className={`border-none font-black text-[9px] px-4 py-1 rounded-full ${hasUpload ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'}`}>
                           {hasUpload ? 'Selesai' : 'Belum Upload'}
                        </Badge>
                     </div>
                     <div className="col-span-2 text-right">
                        <Badge className={`${isCompleted ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'} border-none font-black text-[8px] px-3 py-1 rounded-lg uppercase`}>
                           {isCompleted ? 'Selesai' : 'Aktif'}
                        </Badge>
                     </div>
                  </div>
                );
              })}
           </div>
        </Card>
      )}
    </div>
  );
};

export default MonitoringMahasiswa;
