import React, { useState, useEffect } from 'react';
import { useMataKuliahStore, type MataKuliah } from '../../store/useMataKuliahStore';
import { useJadwalStore } from '../../store/useJadwalStore';
import { useMateriStore } from '../../store/useMateriStore';
import { usePengajarStore } from '../../store/usePengajarStore';

import { 
  HiOutlinePencilSquare, 
  HiOutlineTrash, 
  HiOutlinePlus, 
  HiOutlineCloudArrowUp, 
  HiOutlineDocumentText, 
  HiOutlineRocketLaunch,
  HiOutlineCheckCircle,
  HiOutlineComputerDesktop,
  HiOutlineUserGroup,
  HiOutlineArrowPathRoundedSquare,
  HiOutlineMagnifyingGlass
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
  const { mataKuliahList, isLoading, fetchMataKuliah, addMataKuliah, removeMataKuliah, updateMataKuliah } = useMataKuliahStore();
  const { addJadwal } = useJadwalStore();
  const { addMateri } = useMateriStore();
  const { pengajarList, fetchPengajar } = usePengajarStore();

  const [currentStep, setCurrentStep] = useState("step1");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nama: '',
    kode: '',
    pengajarId: '',
    kapasitas: 29,
    deskripsi: '',
    kategori: '',
    statusPendaftaran: '',
    tipeKursus: 'Online'
  });

  const [jadwalData, setJadwalData] = useState({
    mataKuliahId: '',
    hari: [] as string[],
    tglMulai: '',
    tglSelesai: '',
    dosenId: '',
    asistenId: '',
  });

  const [materiData, setMateriData] = useState({
    nama: '',
    mataKuliahId: '',
    fileUrl: '',
  });

  const steps = ["step1", "step2", "step3", "step4"];
  const handleStepChange = (newStep: string) => setCurrentStep(newStep);
  const stepIndex = steps.indexOf(currentStep);

  useEffect(() => {
    fetchMataKuliah();
    fetchPengajar();
  }, [fetchMataKuliah, fetchPengajar]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let finalKode = formData.kode;
    if (!finalKode && formData.nama) {
      finalKode = formData.nama.substring(0, 3).toUpperCase() + Math.random().toString(36).substring(2, 5).toUpperCase();
    }

    if (!formData.nama || !finalKode) return;
    
    const dataToSave = { ...formData, kode: finalKode, published: false };
    
    if (editingId) {
      await updateMataKuliah(editingId, dataToSave);
      setEditingId(null);
    } else {
      await addMataKuliah(dataToSave);
    }
    
    setFormData({ 
      nama: '', 
      kode: '',
      pengajarId: '',
      kapasitas: 29,
      deskripsi: '',
      kategori: '',
      statusPendaftaran: '',
      tipeKursus: 'Online'
    });
  };

  const handleEdit = (mk: MataKuliah) => {
    setEditingId(mk.id);
    setFormData({ 
      nama: mk.nama, 
      kode: mk.kode,
      pengajarId: '', 
      kapasitas: 29,
      deskripsi: '',
      kategori: '',
      statusPendaftaran: '',
      tipeKursus: 'Online'
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({ 
      nama: '', 
      kode: '',
      pengajarId: '',
      kapasitas: 29,
      deskripsi: '',
      kategori: '',
      statusPendaftaran: '',
      tipeKursus: 'Online'
    });
  };

  return (
    <>
      <div className="max-w-6xl mx-auto pb-20 overflow-hidden px-4">
        
        {/* Step Header */}
        <div className="bg-[#EAEFF4] p-4 rounded-2xl flex items-center justify-between mb-8">
          <div className="flex items-center gap-4 flex-1">
            {[
              { id: "step1", label: "Kursus", status: "Sedang Diisi" },
              { id: "step2", label: "Jadwal", status: "Belum diisi" },
              { id: "step3", label: "Materi", status: "Belum diisi" },
              { id: "step4", label: "Publish", status: "Menunggu" }
            ].map((step, idx) => {
              const isActive = currentStep === step.id;
              const isCompleted = idx < steps.indexOf(currentStep);
              return (
                <div key={step.id} className="flex items-center flex-1 last:flex-none">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                      isActive ? "bg-[#10B981] text-white" : 
                      isCompleted ? "bg-[#10B981] text-white" : "bg-white text-gray-400 border border-gray-200"
                    }`}>
                      {idx + 1}
                    </div>
                    <div>
                      <div className={`text-sm font-bold ${isActive ? "text-gray-900" : "text-gray-500"}`}>
                        {step.label}
                      </div>
                      <div className={`text-xs ${isActive ? "text-emerald-500" : "text-gray-400"}`}>
                        {step.status}
                      </div>
                    </div>
                  </div>
                  {idx < 3 && (
                    <div className="flex-1 mx-4 h-[2px] bg-gray-300"></div>
                  )}
                </div>
              );
            })}
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
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Nama Kursus</label>
                          <Input 
                            name="nama"
                            value={formData.nama}
                            onChange={handleInputChange}
                            className="rounded-xl border-gray-100 bg-gray-50/50 py-5 focus:bg-white transition-all" 
                            placeholder="Contoh: Web Development Dasar" 
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Pilih Pengajar</label>
                            <Select onValueChange={(val) => setFormData(prev => ({ ...prev, pengajarId: val }))} value={formData.pengajarId}>
                              <SelectTrigger className="rounded-xl border-gray-100 bg-gray-50/50 py-5">
                                <SelectValue placeholder="Pilih Pengajar">
                                  {pengajarList.find(p => p.id === formData.pengajarId)?.nama}
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent className="rounded-xl">
                                {pengajarList.map(p => (
                                  <SelectItem key={p.id} value={p.id}>{p.nama}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Kapasitas Peserta</label>
                            <Input 
                              type="number"
                              name="kapasitas"
                              value={formData.kapasitas}
                              onChange={(e) => setFormData(prev => ({ ...prev, kapasitas: parseInt(e.target.value) }))}
                              className="rounded-xl border-gray-100 bg-gray-50/50 py-5 focus:bg-white transition-all" 
                              placeholder="29" 
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Deskripsi</label>
                          <textarea 
                            name="deskripsi"
                            value={formData.deskripsi}
                            onChange={(e) => setFormData(prev => ({ ...prev, deskripsi: e.target.value }))}
                            className="w-full rounded-xl border-gray-100 bg-gray-50/50 p-3 focus:bg-white transition-all min-h-[100px] text-sm" 
                            placeholder="Jelaskan Mengenai Kursus Ini..." 
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Kategori</label>
                            <Select onValueChange={(val) => setFormData(prev => ({ ...prev, kategori: val }))} value={formData.kategori}>
                              <SelectTrigger className="rounded-xl border-gray-100 bg-gray-50/50 py-5">
                                <SelectValue placeholder="Pilih Kategori" />
                              </SelectTrigger>
                              <SelectContent className="rounded-xl">
                                <SelectItem value="programming">Programming</SelectItem>
                                <SelectItem value="design">Design</SelectItem>
                                <SelectItem value="business">Business</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Status Pendaftaran</label>
                            <Input 
                              name="statusPendaftaran"
                              value={formData.statusPendaftaran}
                              onChange={(e) => setFormData(prev => ({ ...prev, statusPendaftaran: e.target.value }))}
                              className="rounded-xl border-gray-100 bg-gray-50/50 py-5 focus:bg-white transition-all" 
                              placeholder="Aktif" 
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Tipe Kursus</label>
                          <div className="flex gap-2">
                            {[
                              { id: 'Online', icon: <HiOutlineComputerDesktop className="text-xl" /> },
                              { id: 'Offline', icon: <HiOutlineUserGroup className="text-xl" /> },
                              { id: 'Hybrid', icon: <HiOutlineArrowPathRoundedSquare className="text-xl" /> }
                            ].map(type => (
                              <button
                                key={type.id}
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, tipeKursus: type.id }))}
                                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${
                                  formData.tipeKursus === type.id 
                                    ? "bg-emerald-100 text-emerald-700 border-2 border-emerald-500" 
                                    : "bg-gray-50 text-gray-600 border border-gray-100 hover:bg-gray-100"
                                }`}
                              >
                                {type.icon}
                                {type.id}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="flex gap-4 pt-2">
                          <Button 
                            type="button"
                            variant="outline" 
                            className="flex-1 rounded-xl py-6 font-bold text-gray-500 border-gray-100"
                            onClick={handleCancelEdit}
                          >
                            {editingId ? 'Batal' : 'Reset'}
                          </Button>
                          <Button 
                            type="submit"
                            className="flex-1 rounded-xl py-6 font-bold shadow-xl shadow-emerald-100 bg-emerald-500 hover:bg-emerald-600"
                          >
                            {editingId ? 'Update Kursus' : 'Buat Kursus'}
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                </div>
                <div className="col-span-7">
                  <Card className="rounded-[2.5rem] border-none shadow-sm overflow-hidden h-full bg-white p-6">
                    <CardHeader className="p-0 mb-4">
                      <CardTitle className="text-xl font-bold">Daftar Kursus</CardTitle>
                    </CardHeader>
                    
                    <div className="relative mb-4">
                      <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <Input 
                        placeholder="Cari Kursus" 
                        className="pl-10 rounded-xl border-gray-100 bg-gray-50/50 py-5 focus:bg-white transition-all"
                      />
                    </div>

                    <div className="space-y-4 overflow-y-auto max-h-[500px]">
                      {isLoading ? (
                        <div className="text-center text-gray-400 py-10">Loading...</div>
                      ) : mataKuliahList.length === 0 ? (
                        <div className="text-center text-gray-400 py-10 italic">Belum ada kursus.</div>
                      ) : (
                        mataKuliahList.map((mk) => (
                          <div key={mk.id} className="bg-[#F8FAFC] p-4 rounded-2xl border border-gray-100 hover:shadow-sm transition-all">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h3 className="font-bold text-gray-900">{mk.nama}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                  <div className="flex -space-x-2">
                                    <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold">B</div>
                                    <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-xs font-bold">Z</div>
                                    <div className="w-6 h-6 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-xs font-bold">+29</div>
                                  </div>
                                  <span className="text-xs text-gray-500 font-medium">{mk._count?.pendaftaran || 0} / {mk.kapasitas || 0} Peserta</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge className={`rounded-full px-3 py-1 font-bold text-[10px] uppercase ${
                                  mk.statusPendaftaran === "Aktif" ? "bg-emerald-100 text-emerald-700" : 
                                  mk.statusPendaftaran === "Segera" ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-700"
                                }`}>
                                  {mk.statusPendaftaran || "Segera"}
                                </Badge>
                              </div>
                            </div>
                            
                            <div className="mt-3 flex items-center justify-between gap-4">
                              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div className="h-full bg-[#10B981]" style={{ width: `${Math.min(((mk._count?.pendaftaran || 0) / (mk.kapasitas || 1)) * 100, 100)}%` }}></div>
                              </div>
                              <div className="flex gap-2">
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 text-purple-600 hover:bg-purple-50 rounded-lg transition-all"
                                  onClick={() => handleEdit(mk)}
                                >
                                  <HiOutlinePencilSquare className="text-lg" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                  onClick={() => removeMataKuliah(mk.id)}
                                >
                                  <HiOutlineTrash className="text-lg" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
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
                        <Select onValueChange={(val) => setJadwalData(prev => ({ ...prev, mataKuliahId: val }))} value={jadwalData.mataKuliahId}>
                          <SelectTrigger className="rounded-2xl border-gray-100 bg-gray-50/50 py-7">
                            <SelectValue placeholder="Pilih Kursus" />
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl border-gray-100">
                            {mataKuliahList.map(mk => (
                              <SelectItem key={mk.id} value={mk.id}>{mk.nama}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-4">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Waktu Pelaksanaan</label>
                        <div className="flex flex-wrap gap-3">
                          {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'].map(day => (
                            <label key={day} className="flex items-center gap-3 px-6 py-4 border border-gray-100 rounded-2xl hover:bg-gray-50 cursor-pointer transition-all hover:border-blue-200 group bg-gray-50/30">
                              <input 
                                type="checkbox" 
                                className="w-5 h-5 accent-blue-500 rounded-md" 
                                checked={jadwalData.hari.includes(day)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setJadwalData(prev => ({ ...prev, hari: [...prev.hari, day] }));
                                  } else {
                                    setJadwalData(prev => ({ ...prev, hari: prev.hari.filter(d => d !== day) }));
                                  }
                                }}
                              />
                              <span className="text-sm font-bold text-gray-600 group-hover:text-blue-700">{day}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-6 pt-2">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Tgl Mulai</label>
                          <Input type="date" className="rounded-2xl border-gray-100 bg-gray-50/50 py-7" value={jadwalData.tglMulai} onChange={(e) => setJadwalData(prev => ({ ...prev, tglMulai: e.target.value }))} />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Tgl Selesai</label>
                          <Input type="date" className="rounded-2xl border-gray-100 bg-gray-50/50 py-7" value={jadwalData.tglSelesai} onChange={(e) => setJadwalData(prev => ({ ...prev, tglSelesai: e.target.value }))} />
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
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Pilih Pengajar</label>
                        <Select onValueChange={(val) => setJadwalData(prev => ({ ...prev, dosenId: val }))} value={jadwalData.dosenId}>
                          <SelectTrigger className="rounded-2xl border-gray-100 bg-gray-50/50 py-7">
                            <SelectValue placeholder="Pilih Pengajar" />
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl">
                            {pengajarList.filter(u => u.role === 'DOSEN').map(u => (
                              <SelectItem key={u.id} value={u.id}>{u.nama}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Pilih Asisten</label>
                        <Select onValueChange={(val) => setJadwalData(prev => ({ ...prev, asistenId: val }))} value={jadwalData.asistenId}>
                          <SelectTrigger className="rounded-2xl border-gray-100 bg-gray-50/50 py-7">
                            <SelectValue placeholder="Pilih Asisten" />
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl">
                            {pengajarList.filter(u => u.role === 'ASISTEN').map(u => (
                              <SelectItem key={u.id} value={u.id}>{u.nama}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex gap-4 pt-6">
                        <Button variant="outline" className="flex-1 rounded-2xl py-7 font-bold text-gray-500 border-gray-100" onClick={() => handleStepChange("step1")}>Batal</Button>
                        <Button 
                          className="flex-1 rounded-2xl py-7 font-bold bg-gray-900 hover:bg-black shadow-xl shadow-gray-200 tracking-widest uppercase text-xs" 
                          onClick={async () => {
                            if (!jadwalData.mataKuliahId || !jadwalData.dosenId || !jadwalData.asistenId || !jadwalData.tglMulai || !jadwalData.tglSelesai || jadwalData.hari.length === 0) {
                              alert('Harap isi semua field (Kursus, Hari, Tanggal, Pengajar, dan Asisten)!');
                              return;
                            }
                            try {
                              await addJadwal(jadwalData);
                              handleStepChange("step3");
                            } catch (error) {
                              alert('Gagal menyimpan jadwal. Pastikan semua ID valid.');
                            }
                          }}
                        >
                          Simpan Jadwal
                        </Button>
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
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Pilih Kursus</label>
                        <Select onValueChange={(val) => setMateriData(prev => ({ ...prev, mataKuliahId: val }))} value={materiData.mataKuliahId}>
                          <SelectTrigger className="rounded-2xl border-gray-100 bg-gray-50/50 py-7">
                            <SelectValue placeholder="Pilih Kursus" />
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl border-gray-100">
                            {mataKuliahList.map(mk => (
                              <SelectItem key={mk.id} value={mk.id}>{mk.nama}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Nama Materi</label>
                        <Input className="rounded-2xl border-gray-100 bg-gray-50/50 py-7" placeholder="Judul Materi..." value={materiData.nama} onChange={(e) => setMateriData(prev => ({ ...prev, nama: e.target.value }))} />
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
                          <Button 
                            className="flex-[2] rounded-2xl py-8 font-bold bg-emerald-500 hover:bg-emerald-600 text-white shadow-xl shadow-emerald-100" 
                            onClick={async () => {
                              if (!materiData.mataKuliahId || !materiData.nama) {
                                alert('Harap isi semua field');
                                return;
                              }
                              await addMateri(materiData);
                              handleStepChange("step4");
                            }}
                          >
                            Simpan Materi & Lanjutkan
                          </Button>
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
                  <p className="text-gray-500 mb-8 max-w-lg mx-auto font-medium text-lg leading-relaxed">
                    Semua kurikulum, jadwal, dan materi telah divalidasi oleh sistem. Pastikan untuk memeriksa kembali bobot nilai sebelum mempublikasikannya ke peserta.
                  </p>
                  <div className="max-w-lg mx-auto mb-12">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 block mb-2 text-left">Pilih Kursus untuk Di-Publish</label>
                    <Select onValueChange={(val) => setMateriData(prev => ({ ...prev, mataKuliahId: val }))} value={materiData.mataKuliahId}>
                      <SelectTrigger className="rounded-2xl border-gray-100 bg-gray-50/50 py-7">
                        <SelectValue placeholder="Pilih Kursus" />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-gray-100">
                        {mataKuliahList.filter(mk => !mk.published).map(mk => (
                          <SelectItem key={mk.id} value={mk.id}>{mk.nama}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-6 max-w-lg mx-auto">
                    <Button variant="outline" onClick={() => handleStepChange("step1")} className="flex-1 rounded-[2rem] py-9 text-sm font-black text-gray-400 hover:text-gray-600 hover:bg-gray-50 border-gray-100 uppercase tracking-widest">
                      Batalkan
                    </Button>
                    <Button 
                      className="flex-[2] rounded-[2rem] py-9 bg-emerald-500 hover:bg-emerald-600 text-white font-black shadow-2xl shadow-emerald-200 text-sm uppercase tracking-[0.25em] transform hover:scale-105 active:scale-95 transition-all"
                      onClick={async () => {
                        if (!materiData.mataKuliahId) {
                          alert('Harap pilih kursus yang akan di-publish');
                          return;
                        }
                        await updateMataKuliah(materiData.mataKuliahId, { published: true });
                        alert('Kursus berhasil di-publish!');
                        handleStepChange("step1");
                      }}
                    >
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
