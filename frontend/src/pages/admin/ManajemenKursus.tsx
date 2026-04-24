import React, { useState } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import { 
  HiOutlinePencilSquare, 
  HiOutlineTrash, 
  HiOutlinePlus, 
  HiOutlineCloudArrowUp, 
  HiOutlineVideoCamera, 
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ManajemenKursus: React.FC = () => {
  const [currentStep, setCurrentStep] = useState("step1");

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto space-y-8 pb-20">
        
        <Tabs value={currentStep} onValueChange={setCurrentStep} className="space-y-10">
          <div className="bg-white p-2 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between sticky top-20 z-20">
            <TabsList className="bg-transparent gap-2 h-auto p-0">
              {[
                { id: "step1", label: "Kursus" },
                { id: "step2", label: "Jadwal" },
                { id: "step3", label: "Materi" },
                { id: "step4", label: "Publish" }
              ].map((step, idx) => (
                <TabsTrigger
                  key={step.id}
                  value={step.id}
                  className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-emerald-100 rounded-xl px-6 py-2.5 text-sm font-bold transition-all"
                >
                  <span className="mr-2 opacity-50">{idx + 1}</span>
                  {step.label}
                </TabsTrigger>
              ))}
            </TabsList>
            <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-6 border-l border-gray-100">
              Manajemen Kurikulum
            </div>
          </div>

          <TabsContent value="step1" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-12 gap-8">
              <div className="col-span-5">
                <Card className="rounded-[2rem] border-none shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold flex items-center gap-3">
                      <span className="w-1.5 h-6 bg-emerald-500 rounded-full"></span>
                      Data Kursus Baru
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form className="space-y-5">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Nama Kursus</label>
                        <Input className="rounded-xl border-gray-200 py-6" placeholder="Contoh: Web Development Dasar" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Deskripsi</label>
                        <textarea className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none h-32" placeholder="Jelaskan mengenai kursus ini..."></textarea>
                      </div>
                      <div className="flex gap-3 pt-2">
                        <Button variant="outline" className="flex-1 rounded-2xl py-6 font-bold text-gray-500">Batal</Button>
                        <Button className="flex-1 rounded-2xl py-6 font-bold shadow-lg shadow-emerald-200">Buat Kursus</Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </div>
              <div className="col-span-7">
                <Card className="rounded-[2rem] border-none shadow-sm overflow-hidden h-full">
                  <CardHeader className="bg-gray-50/50 border-b">
                    <CardTitle className="text-xl font-bold">Daftar Kursus</CardTitle>
                  </CardHeader>
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="px-6 py-5 font-bold uppercase text-[10px] tracking-widest">Nama Kursus</TableHead>
                        <TableHead className="px-6 py-5 font-bold uppercase text-[10px] tracking-widest text-center">Peserta</TableHead>
                        <TableHead className="px-6 py-5 font-bold uppercase text-[10px] tracking-widest text-center">Status</TableHead>
                        <TableHead className="px-6 py-5 font-bold uppercase text-[10px] tracking-widest text-center">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow className="hover:bg-gray-50/30">
                        <TableCell className="px-6 py-6 font-bold text-gray-800">UI/UX Design for Beginners</TableCell>
                        <TableCell className="px-6 py-6 text-center text-gray-600 font-medium">32 Orang</TableCell>
                        <TableCell className="px-6 py-6 text-center">
                          <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 rounded-full font-bold text-[9px] uppercase">Aktif</Badge>
                        </TableCell>
                        <TableCell className="px-6 py-6">
                          <div className="flex justify-center gap-2">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"><HiOutlinePencilSquare className="text-lg" /></Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"><HiOutlineTrash className="text-lg" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="step2" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-12 gap-8">
              <div className="col-span-7">
                <Card className="rounded-[2rem] border-none shadow-sm p-4">
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
                        <SelectTrigger className="rounded-xl border-gray-200 py-6">
                          <SelectValue placeholder="UI/UX Design for Beginners" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          <SelectItem value="uiux">UI/UX Design for Beginners</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Waktu Pelaksanaan</label>
                      <div className="flex flex-wrap gap-3">
                        {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'].map(day => (
                          <label key={day} className="flex items-center gap-3 px-6 py-3 border border-gray-100 rounded-2xl hover:bg-gray-50 cursor-pointer transition-all hover:border-emerald-200 group">
                            <input type="checkbox" className="w-5 h-5 accent-emerald-500 rounded-md" />
                            <span className="text-sm font-bold text-gray-600 group-hover:text-emerald-700">{day}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Tgl Mulai</label>
                        <Input type="date" className="rounded-xl border-gray-200 py-6" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Tgl Selesai</label>
                        <Input type="date" className="rounded-xl border-gray-200 py-6" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div className="col-span-5">
                <Card className="rounded-[2rem] border-none shadow-sm h-full p-4">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold flex items-center gap-3">
                      <span className="w-1.5 h-6 bg-blue-500 rounded-full"></span>
                      Assign Role
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Nama Materi</label>
                      <Input className="rounded-xl border-gray-200 py-6" placeholder="Judul Materi..." />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Pilih Pengajar</label>
                      <Select>
                        <SelectTrigger className="rounded-xl border-gray-200 py-6">
                          <SelectValue placeholder="Pilih Pengajar" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          <SelectItem value="ahmad">Dr. Ahmad Subarjo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Pilih Asisten</label>
                      <Select>
                        <SelectTrigger className="rounded-xl border-gray-200 py-6">
                          <SelectValue placeholder="Pilih Asisten" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          <SelectItem value="budi">Budi Santoso</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex gap-3 pt-6">
                      <Button variant="outline" className="flex-1 rounded-2xl py-7 font-bold text-gray-500">Batal</Button>
                      <Button className="flex-1 rounded-2xl py-7 font-bold bg-gray-900 hover:bg-black shadow-xl shadow-gray-200 tracking-widest uppercase text-xs">Simpan Jadwal</Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="step3" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-12 gap-8">
              <div className="col-span-7">
                <Card className="rounded-[2.5rem] border-none shadow-sm p-4">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold flex items-center gap-3">
                      <span className="w-1.5 h-6 bg-purple-500 rounded-full"></span>
                      Upload & Konfigurasi Materi
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Nama Materi</label>
                      <Input className="rounded-xl border-gray-200 py-6" placeholder="Judul Materi..." />
                    </div>
                    <div className="p-10 border-2 border-dashed border-gray-100 rounded-[2rem] text-center hover:border-emerald-300 transition-all group cursor-pointer bg-gray-50/30">
                      <HiOutlineCloudArrowUp className="text-5xl mx-auto mb-4 text-gray-300 group-hover:text-emerald-500 transition-colors" />
                      <p className="text-sm font-black text-gray-700">Tarik file ke sini atau klik untuk unggah</p>
                      <p className="text-[10px] text-gray-400 mt-2 font-bold uppercase tracking-widest">MP4, PDF, ZIP up to 50MB</p>
                    </div>
                    <div className="bg-gray-50/50 p-8 rounded-[2rem] border border-gray-100">
                      <div className="flex justify-between items-center mb-6">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Kuis Terintegrasi AI</label>
                        <Badge className="bg-gray-900 text-white font-bold text-[9px] px-3">10 SOAL</Badge>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-2xl shadow-sm">
                          <span className="w-8 h-8 bg-emerald-500 text-white rounded-xl flex items-center justify-center text-[11px] font-black shadow-lg shadow-emerald-100">1</span>
                          <Input className="flex-1 bg-transparent border-none focus:ring-0 shadow-none px-0 font-bold" placeholder="Tulis pertanyaan..." />
                          <HiOutlineCheckCircle className="text-emerald-500 text-xl" />
                        </div>
                        <Button variant="ghost" className="w-full py-8 border border-dashed border-gray-200 rounded-2xl text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:bg-white hover:border-emerald-200">
                          <HiOutlinePlus className="mr-2 text-lg" /> Tambah Soal Manual
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div className="col-span-5">
                <Card className="rounded-[2.5rem] border-none shadow-sm h-full p-4">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold flex items-center gap-3 text-red-600">
                      <span className="w-1.5 h-6 bg-red-500 rounded-full"></span>
                      Bank Soal Ujian Akhir
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-3">
                      {[1, 2, 3].map(num => (
                        <div key={num} className="p-5 border border-gray-50 rounded-2xl bg-gray-50/50 flex items-center gap-4 group hover:bg-red-50 hover:border-red-100 transition-all cursor-pointer">
                          <HiOutlineDocumentText className="text-2xl text-gray-300 group-hover:text-red-400" />
                          <span className="text-sm font-bold text-gray-600 group-hover:text-red-700 tracking-tight">Butir Soal Ke-{num}</span>
                        </div>
                      ))}
                    </div>
                    <Button variant="outline" className="w-full py-10 border-2 border-dashed border-gray-100 rounded-[2rem] text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] hover:bg-red-50 hover:border-red-200 hover:text-red-500 transition-all">
                      <HiOutlinePlus className="mr-2 text-xl" /> Tambah Soal Ujian
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="step4" className="animate-in fade-in zoom-in duration-500">
            <Card className="bg-white p-16 rounded-[3rem] border-none shadow-2xl shadow-emerald-900/5 text-center max-w-4xl mx-auto relative overflow-hidden">
              <div className="absolute top-0 right-0 p-12 opacity-5 text-[15rem] text-emerald-600 rotate-12">
                <HiOutlineRocketLaunch />
              </div>
              <CardContent className="relative z-10">
                <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-[2rem] flex items-center justify-center text-5xl mx-auto mb-10 shadow-xl shadow-emerald-100 animate-bounce">
                  <HiOutlineRocketLaunch />
                </div>
                <h2 className="text-4xl font-black text-gray-900 mb-6 tracking-tight">Siap Untuk Di-Publish?</h2>
                <p className="text-gray-500 mb-16 max-w-lg mx-auto font-medium leading-relaxed">
                  Semua kurikulum, jadwal, dan materi telah divalidasi oleh sistem. Pastikan untuk memeriksa kembali bobot nilai sebelum mempublikasikannya ke peserta.
                </p>
                <div className="flex gap-5 max-w-lg mx-auto">
                  <Button variant="outline" onClick={() => setCurrentStep("step1")} className="flex-1 rounded-[1.5rem] py-8 text-sm font-bold text-gray-400 hover:text-gray-600 hover:bg-gray-50 border-gray-100">
                    Batalkan
                  </Button>
                  <Button className="flex-[2] rounded-[1.5rem] py-8 bg-emerald-500 hover:bg-emerald-600 text-white font-black shadow-2xl shadow-emerald-200 text-sm uppercase tracking-[0.2em] transform hover:scale-105 active:scale-95 transition-all">
                    Publish Sekarang
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default ManajemenKursus;
