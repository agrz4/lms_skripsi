import React from 'react';

import { 
  HiOutlineDocumentChartBar, 
  HiOutlineChevronLeft, 
  HiOutlineChevronRight,
  HiOutlineArrowUpTray,
  HiOutlineArchiveBoxXMark,
  HiOutlineMagnifyingGlass,
  HiOutlineEllipsisHorizontal
} from 'react-icons/hi2';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";

const LaporanAkhir: React.FC = () => {
  const studentGrades = [
    { id: 1, name: 'Ahmad Syafii', m1: 70, m2: 70, m3: 70, exam: 70, total: 70, status: 'Lulus' },
    { id: 2, name: 'Budi Santoso', m1: 95, m2: 95, m3: 95, exam: 95, total: 95, status: 'Lulus' },
    { id: 3, name: 'Citra Kirana', m1: 50, m2: 50, m3: 50, exam: 50, total: 50, status: 'Tidak Lulus' },
    { id: 4, name: 'Dedi Kurniawan', m1: 60, m2: 60, m3: 60, exam: 60, total: 60, status: 'Tidak Lulus' },
    { id: 5, name: 'Eka Putri', m1: 85, m2: 80, m3: 88, exam: 90, total: 86, status: 'Lulus' },
  ];

  return (
    <>
      <div className="max-w-7xl mx-auto space-y-8 pb-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-black tracking-tight text-gray-900 flex items-center gap-3">
              End Kursus
              <span className="text-gray-200 font-light mx-1">/</span>
              <span className="text-gray-400 font-bold text-xl uppercase tracking-widest">Rekap Nilai & Kelulusan</span>
            </h1>
            <p className="text-sm text-muted-foreground font-medium">Finalisasi data peserta dan rekapitulasi nilai akhir kursus.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="rounded-2xl py-6 px-6 border-gray-200 font-bold text-gray-600 hover:bg-gray-50">
              <HiOutlineArrowUpTray className="mr-2 text-lg" /> Export Excel
            </Button>
            <Button className="rounded-2xl py-6 px-6 bg-red-600 hover:bg-red-700 text-white font-black shadow-xl shadow-red-100 uppercase tracking-widest text-xs border-none">
              <HiOutlineArchiveBoxXMark className="mr-2 text-lg" /> Akhiri Kursus
            </Button>
          </div>
        </div>

        {/* Summary Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <SummaryCard label="Total Peserta" value="32" color="gray" icon={<HiOutlineDocumentChartBar />} />
          <SummaryCard label="Lulus" value="24" color="emerald" icon={<HiOutlineDocumentChartBar />} />
          <SummaryCard label="Tidak Lulus" value="8" color="red" icon={<HiOutlineDocumentChartBar />} />
        </div>

        {/* Filters Section */}
        <Card className="rounded-[2.5rem] border-none shadow-sm p-6">
          <CardContent className="p-0 space-y-6">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="flex-1 w-full space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Pilih Kursus</label>
                <Select defaultValue="data-analyst">
                  <SelectTrigger className="rounded-2xl border-gray-100 py-6 font-bold bg-gray-50/50">
                    <SelectValue placeholder="Pilih Kursus" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl">
                    <SelectItem value="data-analyst">Data Analyst Bootcamp</SelectItem>
                    <SelectItem value="uiux">UI/UX Design Masterclass</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 w-full space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Cari Peserta</label>
                <div className="relative">
                  <HiOutlineMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                  <Input className="rounded-2xl border-gray-100 py-6 pl-12 bg-gray-50/50 font-medium" placeholder="Cari nama peserta..." />
                </div>
              </div>
              <div className="w-full md:w-48 space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Status</label>
                <Select>
                  <SelectTrigger className="rounded-2xl border-gray-100 py-6 bg-gray-50/50">
                    <SelectValue placeholder="Semua Status" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl">
                    <SelectItem value="lulus">Lulus</SelectItem>
                    <SelectItem value="tidak">Tidak Lulus</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="w-full md:w-48 space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Materi</label>
                <Select>
                  <SelectTrigger className="rounded-2xl border-gray-100 py-6 bg-gray-50/50">
                    <SelectValue placeholder="Semua Materi" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl">
                    <SelectItem value="m1">Materi 1</SelectItem>
                    <SelectItem value="m2">Materi 2</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Table */}
        <Card className="rounded-[2.5rem] border-none shadow-sm overflow-hidden">
          <Table>
            <TableHeader className="bg-gray-50/50">
              <TableRow className="hover:bg-transparent">
                <TableHead className="px-6 py-5 font-bold uppercase text-[10px] tracking-widest">No</TableHead>
                <TableHead className="px-6 py-5 font-bold uppercase text-[10px] tracking-widest">Nama Peserta</TableHead>
                <TableHead className="px-6 py-5 font-bold uppercase text-[10px] tracking-widest">Materi 1</TableHead>
                <TableHead className="px-6 py-5 font-bold uppercase text-[10px] tracking-widest">Materi 2</TableHead>
                <TableHead className="px-6 py-5 font-bold uppercase text-[10px] tracking-widest">Materi 3</TableHead>
                <TableHead className="px-6 py-5 font-bold uppercase text-[10px] tracking-widest text-center">Ujian</TableHead>
                <TableHead className="px-6 py-5 font-bold uppercase text-[10px] tracking-widest text-center">Total</TableHead>
                <TableHead className="px-6 py-5 font-bold uppercase text-[10px] tracking-widest text-center">Status</TableHead>
                <TableHead className="px-8 py-5 text-center font-bold uppercase text-[10px] tracking-widest">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {studentGrades.map((student, idx) => (
                <TableRow key={student.id} className="hover:bg-gray-50/30 transition-colors border-b border-gray-50 last:border-0">
                  <TableCell className="px-6 py-6 text-[10px] font-black text-gray-300">{idx + 1}</TableCell>
                  <TableCell className="px-6 py-6 font-bold text-gray-900">{student.name}</TableCell>
                  <TableCell className="px-6 py-6 min-w-[120px]">
                    <GradeCell value={student.m1} />
                  </TableCell>
                  <TableCell className="px-6 py-6 min-w-[120px]">
                    <GradeCell value={student.m2} />
                  </TableCell>
                  <TableCell className="px-6 py-6 min-w-[120px]">
                    <GradeCell value={student.m3} />
                  </TableCell>
                  <TableCell className="px-6 py-6 text-center font-black text-gray-700">{student.exam}</TableCell>
                  <TableCell className="px-6 py-6 text-center">
                    <span className={`text-sm font-black ${student.total >= 70 ? 'text-emerald-600' : 'text-red-500'}`}>
                      {student.total}
                    </span>
                  </TableCell>
                  <TableCell className="px-6 py-6 text-center">
                    <Badge variant={student.status === 'Lulus' ? 'default' : 'destructive'} className="rounded-full px-3 py-1 text-[9px] font-black uppercase border-none">
                      {student.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-8 py-6 text-center">
                    <Button variant="ghost" size="icon" className="rounded-xl h-10 w-10 text-gray-300 hover:text-emerald-600 hover:bg-emerald-50 transition-all">
                      <HiOutlineEllipsisHorizontal className="text-2xl" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="p-8 bg-gray-50/30 border-t border-gray-50 flex items-center justify-between">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Menampilkan 5 dari 32 Peserta</p>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" className="rounded-xl h-10 w-10 border-gray-200">
                <HiOutlineChevronLeft />
              </Button>
              <Button className="rounded-xl h-10 w-10 font-bold shadow-lg shadow-emerald-100">1</Button>
              <Button variant="ghost" className="rounded-xl h-10 w-10 font-bold text-gray-400 hover:text-gray-600">2</Button>
              <Button variant="outline" size="icon" className="rounded-xl h-10 w-10 border-gray-200">
                <HiOutlineChevronRight />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
};

// Helper Components
const SummaryCard: React.FC<{ label: string, value: string, color: string, icon: React.ReactNode }> = ({ label, value, color, icon }) => (
  <Card className="rounded-[2.5rem] border-none shadow-sm relative overflow-hidden group hover:shadow-xl hover:shadow-gray-900/5 transition-all">
    <div className={`absolute top-0 left-0 w-1.5 h-full ${
      color === 'emerald' ? 'bg-emerald-500' : color === 'red' ? 'bg-red-500' : 'bg-gray-300'
    }`}></div>
    <CardContent className="p-8 flex items-center justify-between">
      <div>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">{label}</p>
        <p className={`text-5xl font-black tracking-tighter ${
          color === 'emerald' ? 'text-emerald-600' : color === 'red' ? 'text-red-500' : 'text-gray-900'
        }`}>{value}</p>
      </div>
      <div className={`text-6xl opacity-5 group-hover:opacity-10 transition-opacity rotate-12 ${
        color === 'emerald' ? 'text-emerald-600' : color === 'red' ? 'text-red-500' : 'text-gray-900'
      }`}>
        {icon}
      </div>
    </CardContent>
  </Card>
);

const GradeCell: React.FC<{ value: number }> = ({ value }) => (
  <div className="space-y-1.5">
    <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest">
      <span className="text-gray-300">Nilai</span>
      <span className={value >= 70 ? 'text-emerald-500' : 'text-red-400'}>{value}</span>
    </div>
    <Progress value={value} className={`h-1.5 rounded-full ${
      value >= 70 ? '[&>div]:bg-emerald-500 bg-emerald-50' : '[&>div]:bg-red-400 bg-red-50'
    }`} />
  </div>
);

export default LaporanAkhir;
