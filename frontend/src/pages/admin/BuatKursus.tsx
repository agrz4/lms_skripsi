import React, { useState, useEffect } from 'react';
import { useMataKuliahStore } from '../../store/useMataKuliahStore';
import { usePengajarStore } from '../../store/usePengajarStore';
import { useNavigate } from 'react-router-dom';
import { 
  HiOutlineBookOpen,
  HiOutlineComputerDesktop,
  HiOutlineUserGroup,
  HiOutlineArrowPathRoundedSquare,
  HiOutlineArrowLeft
} from 'react-icons/hi2';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const BuatKursus: React.FC = () => {
  const navigate = useNavigate();
  const { addMataKuliah } = useMataKuliahStore();
  const { pengajarList, fetchPengajar } = usePengajarStore();

  const [formData, setFormData] = useState({
    nama: '',
    kode: '',
    pengajarId: '',
    kapasitas: 29,
    deskripsi: '',
    kategori: '',
    level: '',
    statusPendaftaran: 'Aktif',
    tipeKursus: 'Online'
  });

  useEffect(() => {
    fetchPengajar();
  }, [fetchPengajar]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama) return;
    
    let finalKode = formData.kode;
    if (!finalKode) {
       finalKode = formData.nama.substring(0, 3).toUpperCase() + Math.floor(100 + Math.random() * 900);
    }

    await addMataKuliah({ ...formData, kode: finalKode, published: false });
    alert('Kursus berhasil dibuat!');
    navigate('/admin/kursus');
  };

  return (
    <div className="p-8 bg-[#F3F4F6] min-h-screen flex items-center justify-center">
      <Card className="max-w-2xl w-full rounded-[3rem] border-none shadow-2xl bg-white overflow-hidden">
        <CardHeader className="bg-indigo-600 p-10 text-white relative">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/admin/kursus')}
            className="absolute left-6 top-6 text-white hover:bg-white/10"
          >
            <HiOutlineArrowLeft className="text-xl" />
          </Button>
          <div className="text-center">
             <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-md">
                <HiOutlineBookOpen className="text-3xl" />
             </div>
             <CardTitle className="text-2xl font-black">Buat Kursus Baru</CardTitle>
             <p className="text-indigo-100 text-sm font-medium mt-1">Langkah awal membangun kurikulum terbaik.</p>
          </div>
        </CardHeader>
        <CardContent className="p-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Nama Kursus</label>
              <Input 
                value={formData.nama}
                onChange={(e) => setFormData(prev => ({ ...prev, nama: e.target.value }))}
                placeholder="Contoh: Web Development Bootcamp"
                className="rounded-2xl border-gray-100 bg-gray-50/50 py-7 focus:bg-white transition-all text-sm font-bold"
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Kategori / Level</label>
                <Select onValueChange={(val: string) => setFormData(prev => ({ ...prev, kategori: val, level: val }))}>
                  <SelectTrigger className="rounded-2xl border-gray-100 bg-gray-50/50 py-7">
                    <SelectValue placeholder="Pilih Kategori / Level" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl">
                    <SelectItem value="Dasar">Dasar</SelectItem>
                    <SelectItem value="Lanjutan">Lanjutan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Kapasitas</label>
                <Input 
                  type="number"
                  value={formData.kapasitas}
                  onChange={(e) => setFormData(prev => ({ ...prev, kapasitas: parseInt(e.target.value) }))}
                  className="rounded-2xl border-gray-100 bg-gray-50/50 py-7 focus:bg-white transition-all text-sm font-bold"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Tipe Pembelajaran</label>
              <div className="flex gap-4">
                {[
                  { id: 'Online', icon: <HiOutlineComputerDesktop /> },
                  { id: 'Offline', icon: <HiOutlineUserGroup /> },
                  { id: 'Hybrid', icon: <HiOutlineArrowPathRoundedSquare /> }
                ].map(type => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, tipeKursus: type.id }))}
                    className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-bold transition-all border-2 ${
                      formData.tipeKursus === type.id 
                        ? "bg-indigo-50 text-indigo-600 border-indigo-500 shadow-sm" 
                        : "bg-white text-gray-400 border-gray-100 hover:bg-gray-50"
                    }`}
                  >
                    {type.icon}
                    <span className="text-xs">{type.id}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Deskripsi Singkat</label>
              <textarea 
                value={formData.deskripsi}
                onChange={(e) => setFormData(prev => ({ ...prev, deskripsi: e.target.value }))}
                className="w-full rounded-2xl border-gray-100 bg-gray-50/50 p-5 focus:bg-white transition-all min-h-[120px] text-sm font-medium" 
                placeholder="Apa yang akan dipelajari di kursus ini?..."
              />
            </div>

            <div className="pt-4">
              <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl py-8 shadow-2xl shadow-indigo-100 uppercase tracking-widest text-sm">
                Konfirmasi & Buat Kursus
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default BuatKursus;
