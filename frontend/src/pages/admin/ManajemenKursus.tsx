import React, { useState } from 'react';

import { 
  HiOutlinePencilSquare, 
  HiOutlineTrash, 
  HiOutlinePlus, 
  HiOutlineCloudArrowUp, 
  HiOutlineDocumentText, 
  HiOutlineRocketLaunch,
  HiOutlineCheckCircle
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

const ManajemenKursus: React.FC = () => {
  const [currentStep, setCurrentStep] = useState("step1");

  const steps = ["step1", "step2", "step3", "step4"];

  const handleStepChange = (newStep: string) => {
    setCurrentStep(newStep);
  };

  const stepIndex = steps.indexOf(currentStep);

  return (
    <>
      <div className="max-w-6xl mx-auto pb-20 overflow-hidden px-4">
        
        {/* Step Header */}
        <div className="bg-white p-3 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between mb-12">
          <div className="flex items-center gap-3 p-1">
            {[
              { id: "step1", label: "Kursus" },
              { id: "step2", label: "Jadwal" },
              { id: "step3", label: "Materi" },
              { id: "step4", label: "Publish" }
            ].map((step, idx) => {
              const isActive = currentStep === step.id;
              return (
                <button
                  key={step.id}
                  onClick={() => handleStepChange(step.id)}
                  className={`flex items-center px-6 py-3 rounded-2xl text-sm font-bold transition-all duration-300 ${
                    isActive 
                      ? "bg-emerald-500 text-white shadow-lg shadow-emerald-100 scale-105" 
                      : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <span className={`mr-2 transition-opacity ${isActive ? "opacity-100" : "opacity-40"}`}>
                    {idx + 1}
                  </span>
                  {step.label}
                </button>
              );
            })}
          </div>
          <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] px-8 border-l border-gray-100 hidden md:block">
            Manajemen Kurikulum
          </div>
        </div>

        {/* Carousel Container */}
        <div className="relative overflow-visible">
          <div 
            className="flex transition-all duration-700 ease-in-out gap-20"
            style={{ 
              transform: `translateX(calc(-${stepIndex * 100}% - ${stepIndex * 80}px))`,
              width: '100%'
            }}
          >
            {/* Step 1: Kursus */}
            <div className="w-full shrink-0 animate-in fade-in duration-700">
              <div className="grid grid-cols-12 gap-8">
                <div className="col-span-5">
                  <Card className="rounded-[2.5rem] border-none shadow-sm overflow-hidden bg-white">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-xl font-bold flex items-center gap-3">
                        <span className="w-1.5 h-6 bg-emerald-500 rounded-full"></span>
                        Data Kursus Baru
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <form className="space-y-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Nama Kursus</label>
                          <Input className="rounded-2xl border-gray-100 bg-gray-50/50 py-7 focus:bg-white transition-all" placeholder="Contoh: Web Development Dasar" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Deskripsi</label>
                          <textarea className="w-full px-5 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none h-36 transition-all" placeholder="Jelaskan mengenai kursus ini..."></textarea>
                        </div>
                        <div className="flex gap-4 pt-2">
                          <Button variant="outline" className="flex-1 rounded-2xl py-7 font-bold text-gray-500 border-gray-100">Batal</Button>
                          <Button className="flex-1 rounded-2xl py-7 font-bold shadow-xl shadow-emerald-100 bg-emerald-500 hover:bg-emerald-600" onClick={(e) => { e.preventDefault(); handleStepChange("step2"); }}>Buat Kursus</Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                </div>
                <div className="col-span-7">
                  <Card className="rounded-[2.5rem] border-none shadow-sm overflow-hidden h-full bg-white">
                    <CardHeader className="bg-gray-50/50 border-b border-gray-100 py-6">
                      <CardTitle className="text-xl font-bold">Daftar Kursus</CardTitle>
                    </CardHeader>
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-transparent border-gray-100">
                          <TableHead className="px-8 py-5 font-bold uppercase text-[10px] tracking-widest text-gray-400">Nama Kursus</TableHead>
                          <TableHead className="px-8 py-5 font-bold uppercase text-[10px] tracking-widest text-center text-gray-400">Peserta</TableHead>
                          <TableHead className="px-8 py-5 font-bold uppercase text-[10px] tracking-widest text-center text-gray-400">Status</TableHead>
                          <TableHead className="px-8 py-5 font-bold uppercase text-[10px] tracking-widest text-center text-gray-400">Aksi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow className="hover:bg-gray-50/30 border-gray-50 transition-colors">
                          <TableCell className="px-8 py-7 font-bold text-gray-800">UI/UX Design for Beginners</TableCell>
                          <TableCell className="px-8 py-7 text-center text-gray-600 font-medium">32 Orang</TableCell>
                          <TableCell className="px-8 py-7 text-center">
                            <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 rounded-full px-4 py-1 font-bold text-[9px] uppercase tracking-wider">Aktif</Badge>
                          </TableCell>
                          <TableCell className="px-8 py-7">
                            <div className="flex justify-center gap-2">
                              <Button variant="ghost" size="icon" className="h-10 w-10 text-gray-300 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"><HiOutlinePencilSquare className="text-xl" /></Button>
                              <Button variant="ghost" size="icon" className="h-10 w-10 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"><HiOutlineTrash className="text-xl" /></Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </Card>
                </div>
              </div>
            </div>

            {/* Step 2: Jadwal */}
            <div className="w-full shrink-0 animate-in fade-in duration-700">
              <div className="grid grid-cols-12 gap-8">
                <div className="col-span-7">
                  <Card className="rounded-[2.5rem] border-none shadow-sm p-6 bg-white">
                    <CardHeader>
                      <CardTitle className="text-xl font-bold flex items-center gap-3">
                        <span className="w-1.5 h-6 bg-blue-500 rounded-full"></span>
                        Jadwal Pelaksanaan
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-8">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Pilih Kursus</label>
                        <Select>
                          <SelectTrigger className="rounded-2xl border-gray-100 bg-gray-50/50 py-7">
                            <SelectValue placeholder="UI/UX Design for Beginners" />
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl border-gray-100">
                            <SelectItem value="uiux">UI/UX Design for Beginners</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-4">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Waktu Pelaksanaan</label>
                        <div className="flex flex-wrap gap-3">
                          {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'].map(day => (
                            <label key={day} className="flex items-center gap-3 px-6 py-4 border border-gray-100 rounded-2xl hover:bg-gray-50 cursor-pointer transition-all hover:border-blue-200 group bg-gray-50/30">
                              <input type="checkbox" className="w-5 h-5 accent-blue-500 rounded-md" />
                              <span className="text-sm font-bold text-gray-600 group-hover:text-blue-700">{day}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-6 pt-2">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Tgl Mulai</label>
                          <Input type="date" className="rounded-2xl border-gray-100 bg-gray-50/50 py-7" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Tgl Selesai</label>
                          <Input type="date" className="rounded-2xl border-gray-100 bg-gray-50/50 py-7" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                <div className="col-span-5">
                  <Card className="rounded-[2.5rem] border-none shadow-sm h-full p-6 bg-white">
                    <CardHeader>
                      <CardTitle className="text-xl font-bold flex items-center gap-3">
                        <span className="w-1.5 h-6 bg-blue-500 rounded-full"></span>
                        Assign Role
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-8">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Nama Materi</label>
                        <Input className="rounded-2xl border-gray-100 bg-gray-50/50 py-7" placeholder="Judul Materi..." />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Pilih Pengajar</label>
                        <Select>
                          <SelectTrigger className="rounded-2xl border-gray-100 bg-gray-50/50 py-7">
                            <SelectValue placeholder="Pilih Pengajar" />
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl">
                            <SelectItem value="ahmad">Dr. Ahmad Subarjo</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Pilih Asisten</label>
                        <Select>
                          <SelectTrigger className="rounded-2xl border-gray-100 bg-gray-50/50 py-7">
                            <SelectValue placeholder="Pilih Asisten" />
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl">
                            <SelectItem value="budi">Budi Santoso</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex gap-4 pt-6">
                        <Button variant="outline" className="flex-1 rounded-2xl py-7 font-bold text-gray-500 border-gray-100" onClick={() => handleStepChange("step1")}>Batal</Button>
                        <Button className="flex-1 rounded-2xl py-7 font-bold bg-gray-900 hover:bg-black shadow-xl shadow-gray-200 tracking-widest uppercase text-xs" onClick={() => handleStepChange("step3")}>Simpan Jadwal</Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>

            {/* Step 3: Materi */}
            <div className="w-full shrink-0 animate-in fade-in duration-700">
              <div className="grid grid-cols-12 gap-8">
                <div className="col-span-7">
                  <Card className="rounded-[3rem] border-none shadow-sm p-6 bg-white">
                    <CardHeader>
                      <CardTitle className="text-xl font-bold flex items-center gap-3">
                        <span className="w-1.5 h-6 bg-purple-500 rounded-full"></span>
                        Upload & Konfigurasi Materi
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-8">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Nama Materi</label>
                        <Input className="rounded-2xl border-gray-100 bg-gray-50/50 py-7" placeholder="Judul Materi..." />
                      </div>
                      <div className="p-12 border-2 border-dashed border-gray-100 rounded-[2.5rem] text-center hover:border-emerald-300 transition-all group cursor-pointer bg-gray-50/30">
                        <HiOutlineCloudArrowUp className="text-6xl mx-auto mb-4 text-gray-300 group-hover:text-emerald-500 transition-all duration-500" />
                        <p className="text-sm font-black text-gray-700">Tarik file ke sini atau klik untuk unggah</p>
                        <p className="text-[10px] text-gray-400 mt-2 font-bold uppercase tracking-widest">MP4, PDF, ZIP up to 50MB</p>
                      </div>
                      <div className="bg-gray-50/50 p-10 rounded-[2.5rem] border border-gray-100">
                        <div className="flex justify-between items-center mb-8">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em]">Kuis Terintegrasi AI</label>
                          <Badge className="bg-gray-900 text-white font-bold text-[10px] px-4 py-1 rounded-full">10 SOAL</Badge>
                        </div>
                        <div className="space-y-4">
                          <div className="flex items-center gap-5 p-5 bg-white border border-gray-100 rounded-2xl shadow-sm">
                            <span className="w-10 h-10 bg-emerald-500 text-white rounded-xl flex items-center justify-center text-xs font-black shadow-lg shadow-emerald-100">1</span>
                            <Input className="flex-1 bg-transparent border-none focus:ring-0 shadow-none px-0 font-bold text-gray-700" placeholder="Tulis pertanyaan..." />
                            <HiOutlineCheckCircle className="text-emerald-500 text-2xl" />
                          </div>
                          <Button variant="ghost" className="w-full py-10 border-2 border-dashed border-gray-200 rounded-2xl text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] hover:bg-white hover:border-emerald-200 transition-all">
                            <HiOutlinePlus className="mr-2 text-xl" /> Tambah Soal Manual
                          </Button>
                        </div>
                      </div>
                      <div className="flex gap-4 pt-4">
                          <Button variant="outline" className="flex-1 rounded-2xl py-8 font-bold text-gray-500 border-gray-100" onClick={() => handleStepChange("step2")}>Kembali</Button>
                          <Button className="flex-[2] rounded-2xl py-8 font-bold bg-emerald-500 hover:bg-emerald-600 text-white shadow-xl shadow-emerald-100" onClick={() => handleStepChange("step4")}>Lanjutkan ke Publish</Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                <div className="col-span-5">
                  <Card className="rounded-[3rem] border-none shadow-sm h-full p-6 bg-white">
                    <CardHeader>
                      <CardTitle className="text-xl font-bold flex items-center gap-3 text-red-600">
                        <span className="w-1.5 h-6 bg-red-500 rounded-full"></span>
                        Bank Soal Ujian Akhir
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-3">
                        {[1, 2, 3].map(num => (
                          <div key={num} className="p-6 border border-gray-50 rounded-2xl bg-gray-50/50 flex items-center gap-5 group hover:bg-red-50 hover:border-red-100 transition-all cursor-pointer">
                            <HiOutlineDocumentText className="text-3xl text-gray-300 group-hover:text-red-400 transition-colors" />
                            <span className="text-sm font-bold text-gray-600 group-hover:text-red-700 tracking-tight">Butir Soal Ke-{num}</span>
                          </div>
                        ))}
                      </div>
                      <Button variant="outline" className="w-full py-12 border-2 border-dashed border-gray-100 rounded-[2.5rem] text-[11px] font-black text-gray-400 uppercase tracking-[0.25em] hover:bg-red-50 hover:border-red-200 hover:text-red-500 transition-all">
                        <HiOutlinePlus className="mr-2 text-2xl" /> Tambah Soal Ujian
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>

            {/* Step 4: Publish */}
            <div className="w-full shrink-0 animate-in fade-in duration-700">
              <Card className="bg-white p-20 rounded-[4rem] border-none shadow-2xl shadow-emerald-900/5 text-center max-w-4xl mx-auto relative overflow-hidden">
                <div className="absolute top-0 right-0 p-12 opacity-[0.03] text-[20rem] text-emerald-600 rotate-12">
                  <HiOutlineRocketLaunch />
                </div>
                <CardContent className="relative z-10">
                  <div className="w-28 h-28 bg-emerald-100 text-emerald-600 rounded-[2.5rem] flex items-center justify-center text-6xl mx-auto mb-10 shadow-2xl shadow-emerald-100 animate-bounce">
                    <HiOutlineRocketLaunch />
                  </div>
                  <h2 className="text-5xl font-black text-gray-900 mb-8 tracking-tight">Siap Untuk Di-Publish?</h2>
                  <p className="text-gray-500 mb-20 max-w-lg mx-auto font-medium text-lg leading-relaxed">
                    Semua kurikulum, jadwal, dan materi telah divalidasi oleh sistem. Pastikan untuk memeriksa kembali bobot nilai sebelum mempublikasikannya ke peserta.
                  </p>
                  <div className="flex gap-6 max-w-lg mx-auto">
                    <Button variant="outline" onClick={() => handleStepChange("step1")} className="flex-1 rounded-[2rem] py-9 text-sm font-black text-gray-400 hover:text-gray-600 hover:bg-gray-50 border-gray-100 uppercase tracking-widest">
                      Batalkan
                    </Button>
                    <Button className="flex-[2] rounded-[2rem] py-9 bg-emerald-500 hover:bg-emerald-600 text-white font-black shadow-2xl shadow-emerald-200 text-sm uppercase tracking-[0.25em] transform hover:scale-105 active:scale-95 transition-all">
                      Publish Sekarang
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};


export default ManajemenKursus;
