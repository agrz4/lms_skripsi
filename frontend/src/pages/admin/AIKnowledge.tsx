import React from 'react';

import { 
  HiOutlineCheckCircle, 
  HiOutlineClock, 
  HiOutlineExclamationCircle,
  HiOutlineArrowRight,
  HiOutlineArrowPath,
  HiOutlineDocumentText,
  HiOutlineVideoCamera,
  HiOutlineChatBubbleBottomCenterText
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

const AIKnowledge: React.FC = () => {
  const knowledgeData = [
    { id: 1, materi: 'Introduction to Figma', kursus: 'UI/UX Design', type: 'Video', transcript: 'done', rag: 'done', soal: 10, status: 'Synced' },
    { id: 2, materi: 'React Hooks Deep Dive', kursus: 'Web Dev', type: 'PDF', transcript: 'done', rag: 'done', soal: 15, status: 'Synced' },
    { id: 3, materi: 'Advanced Typography', kursus: 'UI/UX Design', type: 'Video', transcript: 'processing', rag: 'waiting', soal: 0, status: 'Processing' },
    { id: 4, materi: 'Database Normalization', kursus: 'Backend Mastery', type: 'Video', transcript: 'error', rag: 'failed', soal: 0, status: 'Error' },
    { id: 5, materi: 'User Research Methods', kursus: 'UI/UX Design', type: 'PDF', transcript: 'done', rag: 'done', soal: 12, status: 'Synced' },
  ];

  return (
    <>
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Title Section */}
        <div className="flex justify-between items-center bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-gray-900 flex items-center gap-3">
              AI Knowledge Base
              <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-widest px-3 border-purple-200 text-purple-600 bg-purple-50">RAG + SLM</Badge>
            </h1>
            <p className="text-sm text-muted-foreground mt-1 font-medium">Monitoring sistem retrieval augmented generation untuk materi kursus.</p>
          </div>
          <Button variant="outline" size="icon" className="rounded-full h-12 w-12 text-purple-600 border-purple-100 bg-purple-50 hover:bg-purple-100 transition-all">
            <HiOutlineArrowPath className="text-2xl animate-spin-slow" />
          </Button>
        </div>

        {/* Flow Diagram Section using Cards */}
        <Card className="rounded-[2.5rem] border-none shadow-xl shadow-purple-900/5 overflow-hidden">
          <div className="h-1.5 w-full bg-gradient-to-r from-emerald-400 via-blue-500 to-purple-600"></div>
          <CardHeader className="pb-2">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Pipeline Alur Kecerdasan Artifisial</p>
          </CardHeader>
          <CardContent className="p-10">
            <div className="flex items-center justify-between gap-4 relative">
              <div className="absolute top-1/2 left-0 w-full h-px bg-gray-100 -translate-y-1/2 -z-10"></div>
              
              <FlowStep icon={<HiOutlineDocumentText />} label="Materi PDF" active />
              <HiOutlineArrowRight className="text-gray-300" />
              <FlowStep icon={<HiOutlineVideoCamera />} label="Video Short" active />
              <HiOutlineArrowRight className="text-gray-300" />
              <FlowStep icon={<HiOutlineVideoCamera />} label="Video Zoom" active />
              <HiOutlineArrowRight className="text-gray-300" />
              <FlowStep icon={<HiOutlineChatBubbleBottomCenterText />} label="Transcript" active highlight />
              <HiOutlineArrowRight className="text-gray-300" />
              <div className="px-8 py-4 bg-purple-600 text-white rounded-[1.5rem] shadow-2xl shadow-purple-300 font-black text-xs flex items-center gap-2 transform hover:scale-105 transition-all cursor-default">
                <HiOutlineArrowPath className="animate-spin text-lg" /> RAG SYSTEM
              </div>
              <HiOutlineArrowRight className="text-gray-300" />
              <FlowStep icon={<HiOutlineCpuChip />} label="SLM ENGINE" active />
              <HiOutlineArrowRight className="text-gray-300" />
              <div className="px-8 py-4 border-2 border-emerald-500 text-emerald-600 rounded-[1.5rem] font-black text-xs bg-emerald-50 shadow-lg shadow-emerald-100">
                OUTPUT UJIAN
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-12 gap-8">
          {/* Main Table */}
          <div className="col-span-9">
            <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
              <Table>
                <TableHeader className="bg-gray-50/50">
                  <TableRow>
                    <TableHead className="px-8 py-5 font-bold uppercase text-[10px] tracking-widest">Nama Materi</TableHead>
                    <TableHead className="px-6 py-5 font-bold uppercase text-[10px] tracking-widest">Jenis</TableHead>
                    <TableHead className="px-6 py-5 font-bold uppercase text-[10px] tracking-widest">Transcript</TableHead>
                    <TableHead className="px-6 py-5 font-bold uppercase text-[10px] tracking-widest">RAG Index</TableHead>
                    <TableHead className="px-6 py-5 text-center font-bold uppercase text-[10px] tracking-widest">Soal</TableHead>
                    <TableHead className="px-8 py-5 text-center font-bold uppercase text-[10px] tracking-widest">Status AI</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {knowledgeData.map((item) => (
                    <TableRow key={item.id} className="hover:bg-gray-50/30 transition-colors">
                      <TableCell className="px-8 py-6">
                        <div>
                          <div className="text-sm font-bold text-gray-900">{item.materi}</div>
                          <div className="text-[10px] font-bold text-gray-400 mt-0.5 uppercase tracking-tighter">{item.kursus}</div>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-6">
                        <Badge variant="outline" className={`font-bold text-[9px] px-2 py-0 ${item.type === 'PDF' ? 'border-red-200 text-red-600 bg-red-50' : 'border-blue-200 text-blue-600 bg-blue-50'}`}>
                          {item.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-6 py-6">{getStatusIcon(item.transcript)}</TableCell>
                      <TableCell className="px-6 py-6">{getStatusIcon(item.rag)}</TableCell>
                      <TableCell className="px-6 py-6 text-center">
                        <span className="text-sm font-black text-gray-900">{item.soal > 0 ? item.soal : '—'}</span>
                      </TableCell>
                      <TableCell className="px-8 py-6 text-center">
                        <Badge variant={item.status === 'Synced' ? 'default' : item.status === 'Processing' ? 'secondary' : 'destructive'} className="rounded-full px-3 py-0.5 text-[9px] font-black uppercase">
                          {item.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </div>

          {/* Sidebar Stats & Actions using Cards */}
          <div className="col-span-3 space-y-6">
            <Card className="rounded-[2rem] border-none shadow-sm">
              <CardHeader>
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <span className="w-1.5 h-4 bg-purple-500 rounded-full"></span>
                  Status AI
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <StatRow label="TerIndex" value="9" color="text-emerald-500" />
                <StatRow label="Proses" value="2" color="text-blue-500" />
                <StatRow label="Error" value="1" color="text-red-500" />
              </CardContent>
            </Card>

            <Card className="rounded-[2rem] border-none shadow-sm">
              <CardHeader>
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <HiOutlineArrowPath className="text-gray-400" />
                  Aksi Global
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full rounded-2xl py-6 font-bold text-xs uppercase tracking-widest shadow-xl shadow-gray-200 transition-all hover:scale-[1.02] active:scale-95">
                  Reindex Semua
                </Button>
                <Button variant="outline" className="w-full rounded-2xl py-6 font-bold text-xs uppercase tracking-widest border-gray-100 hover:bg-gray-50">
                  Retry Error
                </Button>
                <Button variant="ghost" className="w-full rounded-2xl py-6 font-bold text-xs uppercase tracking-widest text-gray-400 hover:text-gray-600">
                  Lihat Log AI
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

// Helper Components
const FlowStep: React.FC<{ icon: React.ReactNode, label: string, active?: boolean, highlight?: boolean }> = ({ icon, label, active, highlight }) => (
  <div className={`flex flex-col items-center gap-3 ${active ? 'opacity-100' : 'opacity-30'}`}>
    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-all border ${
      highlight ? 'bg-purple-600 text-white border-purple-400 shadow-2xl shadow-purple-200 scale-110' : 'bg-white text-gray-400 border-gray-100 shadow-sm'
    }`}>
      {icon}
    </div>
    <span className="text-[9px] font-black text-gray-400 uppercase tracking-tighter text-center max-w-[60px] leading-tight">{label}</span>
  </div>
);

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'done': return <HiOutlineCheckCircle className="text-emerald-500 text-xl" />;
    case 'processing': return <HiOutlineClock className="text-blue-500 text-xl animate-pulse" />;
    case 'error': return <HiOutlineExclamationCircle className="text-red-500 text-xl" />;
    case 'waiting': return <HiOutlineClock className="text-gray-200 text-xl" />;
    case 'failed': return <HiOutlineExclamationCircle className="text-gray-200 text-xl" />;
    default: return <HiOutlineClock className="text-gray-200 text-xl" />;
  }
};

const StatRow: React.FC<{ label: string, value: string, color: string }> = ({ label, value, color }) => (
  <div className="flex justify-between items-center py-3 border-b border-gray-50 last:border-0">
    <span className="text-xs font-bold text-gray-400 uppercase tracking-tight">{label}</span>
    <span className={`text-xl font-black ${color}`}>{value}</span>
  </div>
);

const HiOutlineCpuChip: React.FC<any> = (props) => (
  <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="1em" width="1em" {...props}>
    <rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect>
    <rect x="9" y="9" width="6" height="6"></rect>
    <line x1="9" y1="1" x2="9" y2="4"></line>
    <line x1="15" y1="1" x2="15" y2="4"></line>
    <line x1="9" y1="20" x2="9" y2="23"></line>
    <line x1="15" y1="20" x2="15" y2="23"></line>
    <line x1="20" y1="9" x2="23" y2="9"></line>
    <line x1="20" y1="15" x2="23" y2="15"></line>
    <line x1="1" y1="9" x2="4" y2="9"></line>
    <line x1="1" y1="15" x2="4" y2="15"></line>
  </svg>
);

export default AIKnowledge;
