import React, { useState, useEffect } from 'react';

import { usePengajarStore, type Pengajar } from '../../store/usePengajarStore';
import DashboardSummary from '../../components/DashboardSummary';
import { HiOutlinePlus, HiOutlineMagnifyingGlass, HiOutlinePencilSquare, HiOutlineTrash, HiOutlineEnvelope } from 'react-icons/hi2';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ManajemenPengajar: React.FC = () => {
  const { pengajarList, isLoading, fetchPengajar, addPengajar, removePengajar, updatePengajar } = usePengajarStore();
  
  // UI State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    nama: '',
    email: '',
    password: 'password123',
    role: 'DOSEN' as 'DOSEN' | 'MAHASISWA' | 'ADMIN' | 'ASISTEN',
  });

  useEffect(() => {
    fetchPengajar();
  }, [fetchPengajar]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama || !formData.email) return;
    
    if (editingId) {
      await updatePengajar(editingId, formData);
    } else {
      await addPengajar(formData);
    }
    
    // Reset and Close
    setFormData({
      nama: '',
      email: '',
      password: 'password123',
      role: 'DOSEN',
    });
    setEditingId(null);
    setIsModalOpen(false);
  };

  const handleEdit = (p: Pengajar) => {
    setEditingId(p.id);
    setFormData({
      nama: p.nama,
      email: p.email,
      password: '', // Don't show password or allow changing it easily here
      role: p.role as any,
    });
    setIsModalOpen(true);
  };

  return (
    <>
      <div className="max-w-6xl mx-auto space-y-6">
        <DashboardSummary />
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Manajemen Pengajar</h1>
            <p className="text-sm text-muted-foreground mt-1">Kelola data pengajar dan instruktur pelatihan Anda.</p>
          </div>
          <Button 
            onClick={() => setIsModalOpen(true)}
            className="rounded-full px-6 shadow-lg shadow-emerald-100 font-bold"
          >
            <HiOutlinePlus className="mr-2 text-lg" /> Tambah Pengajar
          </Button>
        </div>

        <Card className="border-none shadow-sm overflow-hidden">
          <CardHeader className="bg-gray-50/50 border-b">
            <div className="relative max-w-sm">
              <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input
                className="pl-10 bg-white border-gray-200"
                placeholder="Cari nama atau instansi..."
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-gray-50/30">
                <TableRow>
                  <TableHead className="font-bold uppercase text-[10px] tracking-widest px-6">Nama</TableHead>
                  <TableHead className="font-bold uppercase text-[10px] tracking-widest px-6">Email</TableHead>
                  <TableHead className="font-bold uppercase text-[10px] tracking-widest px-6">Role</TableHead>
                  <TableHead className="font-bold uppercase text-[10px] tracking-widest px-6 text-center">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-32 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-8 h-8 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
                        <p className="text-sm text-gray-500 font-medium">Memuat data...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  pengajarList.map((item) => (
                    <TableRow key={item.id} className="hover:bg-gray-50/50 transition-colors group">
                      <TableCell className="px-6 py-4 font-semibold text-gray-900">{item.nama}</TableCell>
                      <TableCell className="px-6 py-4 text-gray-400 italic font-medium">{item.email}</TableCell>
                      <TableCell className="px-6 py-4">
                        <Badge variant="outline" className="rounded-full px-3 py-0.5 text-[10px] font-bold">
                          {item.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-6 py-4 text-center">
                        <div className="flex justify-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-blue-600 hover:bg-blue-50"
                            onClick={() => handleEdit(item)}
                          >
                            <HiOutlinePencilSquare className="text-lg" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-red-600 hover:bg-red-50"
                            onClick={() => removePengajar(item.id)}
                          >
                            <HiOutlineTrash className="text-lg" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
                {pengajarList.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center text-muted-foreground italic">
                      Belum ada data pengajar.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Modal Add Pengajar using Shadcn Dialog */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-lg rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black px-8 pt-8">
              {editingId ? 'Edit Data Pengguna' : 'Tambah Pengajar Baru'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Nama Lengkap</label>
                <Input
                  name="nama"
                  value={formData.nama}
                  onChange={handleInputChange}
                  className="rounded-xl border-gray-200 py-6"
                  placeholder="Nama Lengkap..."
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Email</label>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="rounded-xl border-gray-200 py-6"
                  placeholder="email@lms.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Role</label>
                <Select onValueChange={(val) => handleSelectChange('role', val)} defaultValue={formData.role} value={formData.role}>
                  <SelectTrigger className="rounded-xl border-gray-200 py-6">
                    <SelectValue placeholder="Pilih Role" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="DOSEN">DOSEN</SelectItem>
                    <SelectItem value="ASISTEN">ASISTEN</SelectItem>
                    <SelectItem value="MAHASISWA">MAHASISWA</SelectItem>
                    <SelectItem value="ADMIN">ADMIN</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
              <HiOutlineEnvelope className="text-2xl text-emerald-600 mt-0.5" />
              <p className="text-[10px] leading-relaxed text-emerald-800 font-medium">
                Sistem akan membuatkan password sementara dan mengirimkannya secara otomatis ke alamat email pengajar di atas.
              </p>
            </div>

            <DialogFooter className="gap-3 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingId(null);
                  setFormData({
                    nama: '',
                    email: '',
                    password: 'password123',
                    role: 'DOSEN',
                  });
                }} 
                className="rounded-2xl py-6 flex-1 border-gray-200"
              >
                Batal
              </Button>
              <Button type="submit" className="rounded-2xl py-6 flex-[2] font-bold uppercase tracking-widest shadow-xl shadow-emerald-200">
                {editingId ? 'Update Data' : 'Simpan Pengajar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ManajemenPengajar;
