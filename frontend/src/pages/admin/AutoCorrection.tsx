import React from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import { 
  HiOutlineSparkles, 
  HiOutlineEye, 
  HiOutlineCheckBadge, 
  HiOutlineClock,
  HiOutlineChartPie,
  HiOutlineBeaker
} from 'react-icons/hi2';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const AutoCorrection: React.FC = () => {
  const correctionData = [
    { id: 1, materi: 'Introduction to Figma', kursus: 'UI/UX Design', type: 'Ujian', score: 87, result: '26/30', status: 'Selesai' },
    { id: 2, materi: 'React Hooks Deep Dive', kursus: 'Web Dev', type: 'Tugas', score: 70, result: '7/10', status: 'Selesai' },
    { id: 3, materi: 'Advanced Typography', kursus: 'UI/UX Design', type: 'Ujian', score: 0, result: '0/30', status: 'Menunggu' },
    { id: 4, materi: 'Database Normalization', kursus: 'Backend Mastery', type: 'Tugas', score: 90, result: '9/10', status: 'Selesai' },
    { id: 5, materi: 'User Research Methods', kursus: 'UI/UX Design', type: 'Ujian', score: 94, result: '28/30', status: 'Selesai' },
  ];

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Title Section */}
        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5 text-8xl text-purple-600 rotate-12">
            <HiOutlineSparkles />
          </div>
          <div className="flex items-center gap-6 relative z-10">
            <div className="p-4 bg-purple-600 text-white rounded-2xl shadow-xl shadow-purple-200">
              <HiOutlineSparkles className="text-3xl animate-pulse" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight text-gray-900">Auto Correction AI</h1>
              <p className="text-sm text-muted-foreground font-medium">Validasi otomatis jawaban ujian dan tugas pilihan ganda menggunakan SLM.</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-8">
          {/* Main Table */}
          <div className="col-span-9">
            <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
              <Table>
                <TableHeader className="bg-gray-50/50">
                  <TableRow>
                    <TableHead className="px-8 py-5 font-bold uppercase text-[10px] tracking-widest">Nama Materi</TableHead>
                    <TableHead className="px-6 py-5 font-bold uppercase text-[10px] tracking-widest">Jenis</TableHead>
                    <TableHead className="px-6 py-5 font-bold uppercase text-[10px] tracking-widest">Skor AI</TableHead>
                    <TableHead className="px-6 py-5 text-center font-bold uppercase text-[10px] tracking-widest">Benar/Total</TableHead>
                    <TableHead className="px-6 py-5 text-center font-bold uppercase text-[10px] tracking-widest">Status</TableHead>
                    <TableHead className="px-8 py-5 text-center font-bold uppercase text-[10px] tracking-widest">Detail</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {correctionData.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/30 transition-colors group border-b last:border-0 border-gray-100">
                      <td className="px-8 py-6">
                        <div>
                          <div className="text-sm font-bold text-gray-900">{item.materi}</div>
                          <div className="text-[10px] font-bold text-gray-400 mt-0.5 uppercase tracking-tighter">{item.kursus}</div>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <Badge variant="outline" className={`font-bold text-[9px] px-2.5 py-0.5 rounded-md uppercase border-none ${
                          item.type === 'Ujian' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'
                        }`}>
                          {item.type}
                        </Badge>
                      </td>
                      <td className="px-6 py-6 min-w-[160px]">
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            <span>Koreksi AI</span>
                            <span className={item.score >= 80 ? 'text-emerald-500' : 'text-amber-500'}>{item.score}%</span>
                          </div>
                          <Progress 
                            value={item.score} 
                            className={`h-1.5 ${item.score >= 80 ? '[&>div]:bg-emerald-500' : '[&>div]:bg-amber-500'}`} 
                          />
                        </div>
                      </td>
                      <td className="px-6 py-6 text-center">
                        <span className="text-sm font-black text-gray-900 tracking-tighter">{item.result}</span>
                      </td>
                      <td className="px-6 py-6 text-center">
                        <Badge variant={item.status === 'Selesai' ? 'default' : 'secondary'} className="rounded-full px-3 py-1 text-[9px] font-black uppercase flex items-center gap-1.5 w-fit mx-auto">
                          {item.status === 'Selesai' ? <HiOutlineCheckBadge className="text-lg" /> : <HiOutlineClock className="text-lg" />}
                          {item.status}
                        </Badge>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <Button variant="ghost" size="icon" className="rounded-full text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 h-10 w-10">
                          <HiOutlineEye className="text-2xl" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </div>

          {/* Sidebar Stats & Engine Info */}
          <div className="col-span-3 space-y-6">
            <Card className="rounded-[2.5rem] border-none shadow-sm overflow-hidden">
              <CardHeader className="pb-4">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <span className="w-1.5 h-4 bg-emerald-500 rounded-full"></span>
                  Statistik Harian
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 gap-4">
                  <StatItem label="Total Pengumpulan" value="45" />
                  <StatItem label="Selesai AI" value="38" highlight color="emerald" />
                  <StatItem label="Menunggu" value="7" highlight color="amber" />
                </div>
                <div className="pt-6 border-t border-gray-50 text-center">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Rata-Rata Skor</p>
                  <div className="text-5xl font-black text-gray-900 tracking-tighter">
                    74<span className="text-xl font-normal text-gray-300 ml-1">%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[2.5rem] bg-gray-900 border-none shadow-2xl shadow-gray-200 text-white relative overflow-hidden p-8">
              <div className="absolute top-0 right-0 p-8 opacity-10 text-8xl rotate-12">
                <HiOutlineBeaker />
              </div>
              <div className="relative z-10 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/30">
                    <HiOutlineBeaker className="text-2xl" />
                  </div>
                  <h3 className="text-lg font-black tracking-tight">AI Engine</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">
                      <span>Inference Load</span>
                      <span className="text-emerald-400">Stable</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full w-2/3 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                    </div>
                  </div>
                  
                  <div className="space-y-1 mt-6">
                    <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Architecture</p>
                    <p className="text-xs font-bold text-gray-100 leading-relaxed uppercase">
                      RAG + NVIDIA NIM + SLM
                    </p>
                  </div>
                </div>
                
                <Button className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/10 rounded-2xl py-6 font-bold text-[10px] uppercase tracking-widest transition-all">
                  Optimize Weights
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

// Helper Components
const StatItem: React.FC<{ label: string, value: string, highlight?: boolean, color?: 'emerald' | 'amber' }> = ({ label, value, highlight, color }) => (
  <div className={`p-4 rounded-2xl border ${
    highlight 
      ? color === 'emerald' ? 'bg-emerald-50 border-emerald-100' : 'bg-amber-50 border-amber-100'
      : 'bg-white border-gray-50 shadow-sm'
  }`}>
    <p className={`text-[9px] font-bold uppercase tracking-widest mb-1 ${
      highlight ? color === 'emerald' ? 'text-emerald-600' : 'text-amber-600' : 'text-gray-400'
    }`}>{label}</p>
    <p className={`text-2xl font-black ${
      highlight ? color === 'emerald' ? 'text-emerald-700' : 'text-amber-700' : 'text-gray-900'
    }`}>{value}</p>
  </div>
);

export default AutoCorrection;
