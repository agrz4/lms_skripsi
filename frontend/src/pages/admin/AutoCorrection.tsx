import React from 'react';

import { 
  HiOutlineSparkles, 
  HiOutlineEye, 
  HiOutlineCheckBadge, 
  HiOutlineClock,
  HiOutlineCpuChip,
} from 'react-icons/hi2';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
    { id: 1, materi: 'Introduction to figma', kursus: 'UI/UX Design', type: 'Ujian', score: 87, result: '26/30', status: 'Selesai' },
    { id: 2, materi: 'React Hooks Deep Dive', kursus: 'Web Dev', type: 'Tugas', score: 70, result: '7/10', status: 'Selesai' },
    { id: 3, materi: 'Advanced Typography', kursus: 'UI/UX Design', type: 'Ujian', score: 0, result: '0/30', status: 'Menunggu' },
    { id: 4, materi: 'Database Normalization', kursus: 'Backend Mastery', type: 'Tugas', score: 90, result: '9/10', status: 'Selesai' },
    { id: 5, materi: 'User Research Methods', kursus: 'UI/UX Design', type: 'Ujian', score: 94, result: '28/30', status: 'Selesai' },
  ];

  return (
    <>
      <div className="max-w-[1400px] mx-auto space-y-6">
        
        {/* Header Card */}
        <div className="bg-gradient-to-r from-slate-100 to-slate-50 p-6 rounded-[1.5rem] border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-slate-800 text-white rounded-xl shadow-lg">
            <HiOutlineCpuChip className="text-2xl" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Auto Correction AI</h1>
            <p className="text-xs text-slate-400 font-medium">Validasi Otomatis Jawaban Ujian dan tugas pilihan ganda menggunakan slm</p>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Main Table */}
          <div className="col-span-9">
            <Card className="border border-slate-200 shadow-sm rounded-[1.5rem] overflow-hidden bg-white">
              <Table>
                <TableHeader className="bg-white border-b border-slate-100">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="px-6 py-4 font-bold text-slate-900 text-sm">Nama Materi</TableHead>
                    <TableHead className="px-6 py-4 font-bold text-slate-900 text-sm">Jenis</TableHead>
                    <TableHead className="px-6 py-4 font-bold text-slate-900 text-sm">Skor AI</TableHead>
                    <TableHead className="px-6 py-4 font-bold text-slate-900 text-sm text-center">Benar/Total</TableHead>
                    <TableHead className="px-6 py-4 font-bold text-slate-900 text-sm text-center">Status</TableHead>
                    <TableHead className="px-6 py-4 font-bold text-slate-900 text-sm text-center">Detail</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {correctionData.map((item) => (
                    <TableRow key={item.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                      <TableCell className="px-6 py-5">
                        <div className="text-sm font-bold text-slate-900">{item.materi}</div>
                        <div className="text-[10px] font-bold text-slate-400 mt-0.5">{item.kursus}</div>
                      </TableCell>
                      <TableCell className="px-6 py-5">
                        <Badge variant="outline" className={`rounded-full px-3 py-0.5 text-[10px] font-bold border-none ${
                          item.type === 'Ujian' ? 'bg-orange-400/20 text-orange-600' : 'bg-blue-400/20 text-blue-600'
                        }`}>
                          {item.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-6 py-5 min-w-[140px]">
                        <div className="space-y-1">
                          <div className="flex justify-between items-center text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                            <span>Koreksi AI</span>
                            <span className="text-emerald-500">{item.score}%</span>
                          </div>
                          <Progress 
                            value={item.score} 
                            className={`h-1.5 ${item.score >= 80 ? '[&>div]:bg-emerald-400' : '[&>div]:bg-orange-400'}`} 
                          />
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-5 text-center">
                        <span className="text-lg font-bold text-slate-900">{item.result}</span>
                      </TableCell>
                      <TableCell className="px-6 py-5 text-center">
                        <Badge 
                          variant="outline" 
                          className={`rounded-full px-3 py-1 text-[9px] font-bold uppercase border border-slate-200 flex items-center gap-1.5 w-fit mx-auto ${
                            item.status === 'Selesai' ? 'bg-emerald-500 text-white border-none' : 'bg-white text-slate-900'
                          }`}
                        >
                          {item.status === 'Selesai' ? (
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-300"></span>
                          ) : (
                            <HiOutlineClock className="text-sm" />
                          )}
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-6 py-5 text-center">
                        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-900">
                          <HiOutlineEye className="text-xl" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </div>

          {/* Sidebar Area */}
          <div className="col-span-3 space-y-6">
            
            {/* Daily Stats Card */}
            <div className="bg-[#4682B4] rounded-[1.5rem] p-6 shadow-sm relative overflow-hidden text-white">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-1.5 h-5 bg-slate-900 rounded-full"></div>
                <h3 className="font-bold text-slate-900">Statistik Harian</h3>
              </div>

              <div className="space-y-4">
                <div className="bg-white p-4 rounded-xl text-slate-900">
                  <p className="text-[10px] font-bold text-slate-400 mb-1">Total Pengumpulan</p>
                  <p className="text-4xl font-black">45</p>
                </div>
                <div className="bg-white/40 p-4 rounded-xl backdrop-blur-sm">
                  <p className="text-[10px] font-bold text-emerald-100 mb-1">Selesai AI</p>
                  <p className="text-4xl font-black text-emerald-900">38</p>
                </div>
              </div>

              <div className="mt-8 text-center border-t border-white/20 pt-6">
                <p className="text-[10px] font-bold text-slate-900/60 uppercase tracking-widest mb-1">Rata-Rata Skor</p>
                <div className="text-5xl font-black text-slate-900 tracking-tighter">
                  74
                </div>
              </div>
            </div>

            {/* AI Engine Status Card */}
            <div className="bg-[#1e293b] rounded-[1.5rem] p-8 shadow-lg relative overflow-hidden text-white min-h-[300px] flex flex-col">
              {/* Brain Icon Background SVG overlay */}
              <div className="absolute top-4 right-4 opacity-10">
                <svg width="120" height="120" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20C16.4183 20 20 16.4183 20 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M15 12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9C13.6569 9 15 10.3431 15 12Z" stroke="currentColor" strokeWidth="2"/>
                  <circle cx="12" cy="12" r="1" fill="currentColor"/>
                </svg>
              </div>

              <div className="flex items-center gap-3 mb-8">
                <div className="p-2.5 bg-blue-500/20 text-blue-400 rounded-xl">
                  <HiOutlineCpuChip className="text-2xl" />
                </div>
                <h3 className="text-lg font-bold">AI Engine</h3>
              </div>

              <div className="space-y-6 flex-1">
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <span>Inference Load</span>
                    <span className="text-emerald-400">Stable</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full w-2/3 bg-emerald-500 rounded-full"></div>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Architecture</p>
                  <p className="text-xs font-bold text-slate-300">RAG+NVIDIA NIM+SLM</p>
                </div>
              </div>

              <Button className="w-full bg-[#7ca3b5]/40 hover:bg-[#7ca3b5]/60 text-white rounded-xl py-6 font-bold text-xs shadow-none">
                Optimize Wight
              </Button>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default AutoCorrection;
