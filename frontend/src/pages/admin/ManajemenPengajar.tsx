import React, { useState, useEffect } from 'react';
import { usePengajarStore, type Pengajar } from '../../store/usePengajarStore';
import {
  HiOutlinePlus,
  HiOutlineMagnifyingGlass,
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiOutlineEnvelope,
  HiOutlineChevronLeft,
  HiOutlineChevronRight
} from 'react-icons/hi2';
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
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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
    instansi: '',
    pelatihan: '',
    jadwal: ''
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
      instansi: '',
      pelatihan: '',
      jadwal: ''
    });
    setEditingId(null);
    setIsModalOpen(false);
  };

  const handleEdit = (p: Pengajar) => {
    setEditingId(p.id);
    setFormData({
      nama: p.nama,
      email: p.email,
      password: '',
      role: p.role as any,
      instansi: p.instansi || '',
      pelatihan: p.pelatihan || '',
      jadwal: p.jadwal || ''
    });
    setIsModalOpen(true);
  };

  // Dummy data for display based on screenshot
  const displayData = [
    { id: '1', nama: 'Dr. Ahmad Subarjo', initial: 'AS', instansi: 'Universitas Indonesia', email: 'Ahmad@ui.ac.id', pelatihan: 'Data Science', jadwal: 'Senin, 09:00', status: 'Aktif' },
    { id: '2', nama: 'Siti Aminah, Mkom', initial: 'SA', instansi: 'Institut Teknologi Bandung', email: 'Siti@itb.ac.id', pelatihan: 'Web Development', jadwal: 'Selasa, 13:00', status: 'Aktif' },
    { id: '3', nama: 'Budi Hartono', initial: 'BH', instansi: 'Universitas Gajah Mada', email: 'Budi@ugm.ac.id', pelatihan: 'Cyber Security', jadwal: 'Rabu, 10:00', status: 'Non Aktif' },
    { id: '4', nama: 'Ani Wijaya', initial: 'AW', instansi: 'Binus University', email: 'ani@binus.ac.id', pelatihan: 'UI/UX Design', jadwal: 'Kamis, 15:00', status: 'Non Aktif' },
  ];

  return (
    <div className="p-8 bg-[#F3F4F6] min-h-screen pb-20">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-1">Manajemen Pengajar</h1>
        <p className="text-sm text-gray-500 font-medium">Kelola data Pengajar dan Instruktur Pelatih anda</p>
      </div>

      <Card className="rounded-[2.5rem] border-none shadow-sm bg-white overflow-hidden">
        <CardContent className="p-0">
          {/* Toolbar */}
          <div className="p-8 flex items-center justify-between border-b border-gray-50">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-gray-400">Show</span>
                <Select defaultValue="10">
                  <SelectTrigger className="w-16 h-8 rounded-lg border-gray-100 bg-gray-50/50 text-[11px] font-bold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-[11px] font-bold text-gray-400">entries</span>
              </div>
              <div className="relative w-80 ml-4">
                <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  className="pl-10 h-10 rounded-lg border-gray-100 bg-white text-xs font-medium placeholder:text-gray-300"
                  placeholder="Cari Nama atau Instansi"
                />
              </div>
            </div>
            <Button
              onClick={() => setIsModalOpen(true)}
              className="bg-[#6366F1] hover:bg-[#4F46E5] text-white font-bold rounded-lg text-xs px-6 py-2 shadow-lg shadow-indigo-100"
            >
              <HiOutlinePlus className="mr-2" /> Tambah Pengajar
            </Button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-white">
                <TableRow className="border-none">
                  <TableHead className="py-6 px-8 text-[11px] font-black text-gray-900 uppercase tracking-widest">Nama</TableHead>
                  <TableHead className="py-6 px-4 text-[11px] font-black text-gray-900 uppercase tracking-widest">Instansi</TableHead>
                  <TableHead className="py-6 px-4 text-[11px] font-black text-gray-900 uppercase tracking-widest">Email</TableHead>
                  <TableHead className="py-6 px-4 text-[11px] font-black text-gray-900 uppercase tracking-widest">Pelatihan</TableHead>
                  <TableHead className="py-6 px-4 text-[11px] font-black text-gray-900 uppercase tracking-widest">Jadwal</TableHead>
                  <TableHead className="py-6 px-4 text-[11px] font-black text-gray-900 uppercase tracking-widest">Status</TableHead>
                  <TableHead className="py-6 px-8 text-[11px] font-black text-gray-900 uppercase tracking-widest text-center">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-50">
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-8 h-8 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Memuat data...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  pengajarList.map((item) => (
                    <TableRow key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-5 px-8">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black text-white bg-indigo-500">
                            {item.nama.charAt(0)}
                          </div>
                          <span className="text-xs font-bold text-gray-700">{item.nama}</span>
                        </div>
                      </td>
                      <td className="py-5 px-4 text-xs font-bold text-gray-500">{item.instansi || '-'}</td>
                      <td className="py-5 px-4 text-xs font-bold text-gray-500">{item.email}</td>
                      <td className="py-5 px-4 text-xs font-bold text-emerald-500">{item.pelatihan || '-'}</td>
                      <td className="py-5 px-4 text-xs font-bold text-gray-500">{item.jadwal || '-'}</td>
                      <td className="py-5 px-4">
                        <Badge className="rounded-full px-4 py-1 text-[9px] font-black uppercase tracking-wider border-none bg-emerald-100 text-emerald-600">
                          Aktif
                        </Badge>
                      </td>
                      <td className="py-5 px-8">
                        <div className="flex justify-center gap-3">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 rounded-lg border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                            onClick={() => handleEdit(item)}
                          >
                            <HiOutlinePencilSquare className="text-lg" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 rounded-lg border-red-200 text-red-600 hover:bg-red-50"
                            onClick={() => removePengajar(item.id)}
                          >
                            <HiOutlineTrash className="text-lg" />
                          </Button>
                        </div>
                      </td>
                    </TableRow>
                  ))
                )}
                {!isLoading && pengajarList.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center text-gray-400 italic text-xs font-bold uppercase tracking-widest">
                      Belum ada data pengajar.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="p-8 bg-white flex items-center justify-center gap-2">
            <Button variant="ghost" size="sm" className="text-xs font-bold text-gray-400"><HiOutlineChevronLeft className="mr-1" /> Previous</Button>
            <Button className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-bold text-xs">1</Button>
            <Button variant="outline" className="w-8 h-8 rounded-lg border-gray-100 bg-gray-100 text-gray-600 font-bold text-xs">2</Button>
            <Button variant="outline" className="w-8 h-8 rounded-lg border-gray-100 bg-gray-100 text-gray-600 font-bold text-xs">3</Button>
            <Button variant="ghost" size="sm" className="text-xs font-bold text-gray-400">Next <HiOutlineChevronRight className="ml-1" /></Button>
          </div>
        </CardContent>
      </Card>

      {/* Modal Add Pengajar using Shadcn Dialog */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-xl rounded-[1.5rem] p-0 overflow-hidden border-none shadow-2xl bg-white">
          <DialogHeader className="p-8 border-b border-gray-100 flex-row items-center gap-4">
            <div className="w-2.5 h-12 bg-[#2D7A8C] rounded-full"></div>
            <DialogTitle className="text-3xl font-bold text-gray-800">
              {editingId ? 'Edit Pengajar' : 'Tambah Pengajar'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="p-10 space-y-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">Nama Lengkap</label>
                <Input
                  name="nama"
                  value={formData.nama}
                  onChange={handleInputChange}
                  className="rounded-full border-gray-200 bg-gray-50/30 py-7 px-6 focus:bg-white transition-all text-gray-600"
                  placeholder="Nama Lengkap Pengajar..."
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">Instansi</label>
                  <Input
                    name="instansi"
                    value={formData.instansi}
                    onChange={handleInputChange}
                    className="rounded-full border-gray-200 bg-gray-50/30 py-7 px-6 focus:bg-white"
                    placeholder="Asal Instansi"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">Email</label>
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="rounded-full border-gray-200 bg-gray-50/30 py-7 px-6 focus:bg-white"
                    placeholder="email@instansi.ac.id"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">Pelatihan</label>
                  <Select onValueChange={(val) => handleSelectChange('pelatihan', val)} value={formData.pelatihan}>
                    <SelectTrigger className="rounded-full border-gray-200 bg-white py-7 px-6 text-gray-400">
                      <SelectValue placeholder="Pilih Pelatihan" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl">
                      <SelectItem value="web">Web Development</SelectItem>
                      <SelectItem value="ai">AI Fundamentals</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">Jadwal</label>
                  <Select onValueChange={(val) => handleSelectChange('jadwal', val)} value={formData.jadwal}>
                    <SelectTrigger className="rounded-full border-gray-200 bg-white py-7 px-6 text-gray-400">
                      <SelectValue placeholder="Pilih Jadwal" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl">
                      <SelectItem value="pagi">Pagi (09:00 - 12:00)</SelectItem>
                      <SelectItem value="siang">Siang (13:00 - 16:00)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 p-5 bg-[#93C5FD]/50 rounded-full border border-white shadow-sm">
              <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white shrink-0">
                <HiOutlineEnvelope className="text-xl" />
              </div>
              <p className="text-[10px] leading-snug text-white font-medium">
                Sistem Akan Membuatkan Password Sementara dan mengirimkannya secara otomatis ke alamat email pengajar di atas
              </p>
            </div>

            <div className="flex gap-6 pt-4 border-t border-gray-100">
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
                    instansi: '',
                    pelatihan: '',
                    jadwal: ''
                  });
                }}
                className="rounded-full py-7 flex-1 border-gray-400 text-gray-700 font-bold bg-[#F1F5F9]"
              >
                Batal
              </Button>
              <Button type="submit" className="rounded-full py-7 flex-[2] font-bold text-white bg-[#1D70B8] hover:bg-[#155a96] shadow-lg shadow-blue-100">
                {editingId ? 'Simpan Perubahan' : 'Simpan Pengajar'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManajemenPengajar;
