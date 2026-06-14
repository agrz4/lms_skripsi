import React, { useState, useEffect } from 'react';
import { useMataKuliahStore, type MataKuliah } from '../../store/useMataKuliahStore';
import { usePengajarStore } from '../../store/usePengajarStore';
import { useNavigate } from 'react-router-dom';
import { 
  HiOutlinePlus, 
  HiOutlineMagnifyingGlass,
  HiOutlinePencilSquare,
  HiOutlineComputerDesktop,
  HiOutlineUserGroup,
  HiOutlineArrowPathRoundedSquare
} from 'react-icons/hi2';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";

// Fallback dummy data to ensure visual parity with the screenshot when DB is empty
const dummyCourses = [
  { 
    id: 'dummy-1', 
    nama: 'Web Dev Beginner', 
    kode: 'WD-2025-01', 
    level: 'Beginner', 
    pengajarNama: 'Dr. Andi',
    jadwalText: '10/14',
    materiText: '8/14',
    pesertaCount: 32,
    aiStatus: 'Siap',
    published: true
  },
  { 
    id: 'dummy-2', 
    nama: 'Web Dev Intermediate', 
    kode: 'WD-2025-02', 
    level: 'Intermediate', 
    pengajarNama: 'Dr. Siti',
    jadwalText: '',
    materiText: '',
    pesertaCount: 0,
    aiStatus: 'Proses',
    published: false
  },
  { 
    id: 'dummy-3', 
    nama: 'Web Dev Advance', 
    kode: 'WD-2025-03', 
    level: 'Advance', 
    pengajarNama: 'Dr. Reza',
    jadwalText: '0/14',
    materiText: '0/14',
    pesertaCount: 0,
    aiStatus: 'Belum',
    published: false
  }
];

const ManajemenKursus: React.FC = () => {
  const navigate = useNavigate();
  const { mataKuliahList, isLoading, fetchMataKuliah, updateMataKuliah, addMataKuliah } = useMataKuliahStore();
  const { pengajarList, fetchPengajar } = usePengajarStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage] = useState(10);

  // Modal Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nama: '',
    kode: '',
    pengajarId: '',
    kapasitas: 29,
    deskripsi: '',
    kategori: 'Beginner',
    level: 'Beginner',
    statusPendaftaran: 'Aktif',
    tipeKursus: 'Online'
  });

  useEffect(() => {
    fetchMataKuliah();
    fetchPengajar();
  }, [fetchMataKuliah, fetchPengajar]);

  // Determine display courses: fall back to dummy if database is empty
  const displayCourses = mataKuliahList.length > 0 ? mataKuliahList.map(mk => {
    const pengajar = pengajarList.find(p => p.id === mk.pengajarId);
    
    // Calculate real progress
    const totalSessions = 14;
    const jadwalCount = mk._count?.pertemuan || 0;
    const materiCount = mk.pertemuan?.filter(p => p.materi && p.materi.length > 0).length || 0;
    
    let aiStatus = 'Belum';
    if (mk.published) {
      aiStatus = 'Siap';
    } else if (jadwalCount > 0 || materiCount > 0) {
      aiStatus = 'Proses';
    }

    return {
      id: mk.id,
      nama: mk.nama,
      kode: mk.kode,
      level: mk.level || 'Beginner',
      pengajarNama: pengajar?.nama || '-',
      pengajarId: mk.pengajarId || '',
      jadwalText: jadwalCount > 0 ? `${jadwalCount}/${totalSessions}` : (mk.published ? `0/${totalSessions}` : ''),
      materiText: materiCount > 0 ? `${materiCount}/${totalSessions}` : (mk.published ? `0/${totalSessions}` : ''),
      pesertaCount: mk._count?.pendaftaran || 0,
      aiStatus: aiStatus,
      published: mk.published,
      // Keep raw values for footer card
      rawJadwalCount: jadwalCount,
      rawMateriCount: materiCount,
      rawPublished: mk.published,
      deskripsi: mk.deskripsi || '',
      kapasitas: mk.kapasitas || 29,
      kategori: mk.kategori || 'Beginner',
      statusPendaftaran: mk.statusPendaftaran || 'Aktif',
      tipeKursus: mk.tipeKursus || 'Online',
      isDummy: false
    };
  }) : dummyCourses.map(c => ({
    ...c,
    pengajarId: '',
    rawJadwalCount: c.jadwalText ? parseInt(c.jadwalText.split('/')[0]) : 0,
    rawMateriCount: c.materiText ? parseInt(c.materiText.split('/')[0]) : 0,
    rawPublished: c.published,
    deskripsi: '',
    kapasitas: 29,
    kategori: c.level,
    statusPendaftaran: 'Aktif',
    tipeKursus: 'Online',
    isDummy: true
  }));

  // Filter based on search query
  const filteredCourses = displayCourses.filter(c => 
    c.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.kode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination calculation
  const totalPages = Math.ceil(filteredCourses.length / entriesPerPage) || 1;
  const paginatedCourses = filteredCourses.slice(
    (currentPage - 1) * entriesPerPage,
    currentPage * entriesPerPage
  );

  // Selected course details for the footer progress card
  const selectedCourse = displayCourses.find(c => c.id === selectedCourseId);

  // Dynamic progress values for the requirements footer card
  const requirements = selectedCourse ? {
    isCreated: true,
    isJadwalFilled: selectedCourse.rawJadwalCount >= 14,
    jadwalText: selectedCourse.rawJadwalCount >= 14 ? '14 jadwal terisi' : `${selectedCourse.rawJadwalCount}/14 jadwal terisi`,
    isMateriUploaded: selectedCourse.rawMateriCount >= 14,
    materiText: selectedCourse.rawMateriCount >= 14 ? '14 materi upload' : `${selectedCourse.rawMateriCount}/14 materi upload`,
    isAiApproved: selectedCourse.rawPublished, // Using published status as indicator for AI approved
  } : {
    isCreated: true,
    isJadwalFilled: true,
    jadwalText: '14 jadwal terisi',
    isMateriUploaded: true,
    materiText: '14 materi upload',
    isAiApproved: false, // Hourglass by default to match screenshot
  };

  const instructors = pengajarList.filter(p => p.role === 'DOSEN' || p.role === 'ADMIN' || p.role === 'ASISTEN');
  const displayInstructors: any[] = [...instructors];
  
  if (displayInstructors.length === 0) {
    displayInstructors.push(
      { id: 'dummy-andi', nama: 'Dr. Andi', role: 'DOSEN', createdAt: '' },
      { id: 'dummy-siti', nama: 'Dr. Siti', role: 'DOSEN', createdAt: '' },
      { id: 'dummy-reza', nama: 'Dr. Reza', role: 'DOSEN', createdAt: '' }
    );
  }

  // If the course's active pengajarId is not in the list, dynamically append it to show the name/label instead of raw UUID
  if (formData.pengajarId && !displayInstructors.some(p => p.id === formData.pengajarId)) {
    const foundInFullList = pengajarList.find(p => p.id === formData.pengajarId);
    if (foundInFullList) {
      displayInstructors.push(foundInFullList);
    } else {
      displayInstructors.push({
        id: formData.pengajarId,
        nama: `Pengajar (${formData.pengajarId.substring(0, 8)}...)`,
        role: 'DOSEN',
        createdAt: ''
      });
    }
  }

  const handleEdit = (course: typeof displayCourses[0]) => {
    setEditingId(course.id);
    setFormData({
      nama: course.nama,
      kode: course.kode,
      pengajarId: course.pengajarId || '',
      kapasitas: course.kapasitas || 29,
      deskripsi: course.deskripsi || '',
      kategori: course.kategori || 'Beginner',
      level: course.level || 'Beginner',
      statusPendaftaran: course.statusPendaftaran || 'Aktif',
      tipeKursus: course.tipeKursus || 'Online'
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama) return;

    let finalKode = formData.kode;
    if (!finalKode) {
      finalKode = formData.nama.substring(0, 3).toUpperCase() + Math.floor(100 + Math.random() * 900);
    }

    // Map "Hybird" to "Hybrid" to prevent Prisma Enum validation error in backend
    let finalTipeKursus = formData.tipeKursus;
    if (finalTipeKursus === 'Hybird') {
      finalTipeKursus = 'Hybrid';
    }

    // Strip out dummy instructor IDs to prevent Prisma ForeignKey validation error in backend
    let finalPengajarId = formData.pengajarId;
    if (!finalPengajarId || finalPengajarId.startsWith('dummy-')) {
      finalPengajarId = '';
    }

    if (editingId) {
      // Find if edited course is dummy, if so just alert
      const target = displayCourses.find(c => c.id === editingId);
      if (target?.isDummy) {
        alert('Dummy course tidak dapat diedit secara permanen.');
      } else {
        await updateMataKuliah(editingId, {
          nama: formData.nama,
          kode: finalKode,
          pengajarId: finalPengajarId || undefined,
          kapasitas: formData.kapasitas,
          deskripsi: formData.deskripsi,
          kategori: formData.kategori,
          level: formData.level,
          statusPendaftaran: formData.statusPendaftaran,
          tipeKursus: finalTipeKursus
        });
        alert('Kursus berhasil diperbarui!');
        fetchMataKuliah();
      }
    } else {
      await addMataKuliah({
        nama: formData.nama,
        kode: finalKode,
        pengajarId: finalPengajarId || undefined,
        kapasitas: formData.kapasitas,
        deskripsi: formData.deskripsi,
        kategori: formData.kategori,
        level: formData.level,
        statusPendaftaran: formData.statusPendaftaran,
        tipeKursus: finalTipeKursus,
        published: false
      });
      alert('Kursus berhasil dibuat!');
      fetchMataKuliah();
    }

    setIsModalOpen(false);
    setEditingId(null);
  };

  const renderPublishButton = (course: typeof displayCourses[0]) => {
    const isPublished = course.published;
    const isPublishable = course.rawJadwalCount === 14 && course.rawMateriCount === 14;

    if (isPublished) {
      return (
        <Button 
          className="bg-[#e6f4ea] text-[#137333] font-bold text-[10px] h-8 px-4 rounded-lg border-none cursor-default hover:bg-[#e6f4ea] shadow-none"
          onClick={(e) => e.stopPropagation()}
        >
          Publish
        </Button>
      );
    }

    if (isPublishable) {
      return (
        <Button 
          className="bg-[#5850ec] hover:bg-[#4f46e5] text-white font-bold text-[10px] h-8 px-4 rounded-lg border-none shadow-sm transition-all"
          onClick={async (e) => {
            e.stopPropagation();
            if (!course.isDummy) {
              await updateMataKuliah(course.id, { published: true });
              fetchMataKuliah();
            }
          }}
        >
          Publish
        </Button>
      );
    }

    return (
      <Button 
        className="bg-[#f1f3f4] text-[#a8aab0] font-bold text-[10px] h-8 px-4 rounded-lg border-none cursor-not-allowed shadow-none hover:bg-[#f1f3f4]"
        onClick={(e) => e.stopPropagation()}
        disabled
      >
        Publish
      </Button>
    );
  };

  const getLevelBadgeStyles = (level: string) => {
    const lvl = level.toLowerCase();
    if (lvl === 'beginner') {
      return 'bg-[#e6f4ea] text-[#137333] hover:bg-[#e6f4ea]';
    } else if (lvl === 'intermediate') {
      return 'bg-[#fef7e0] text-[#b06000] hover:bg-[#fef7e0]';
    } else {
      return 'bg-[#f3f0ff] text-[#6b21a8] hover:bg-[#f3f0ff]';
    }
  };

  const getAiStatusBadgeStyles = (status: string) => {
    const stat = status.toLowerCase();
    if (stat === 'siap') {
      return 'bg-[#e6f4ea] text-[#137333] hover:bg-[#e6f4ea]';
    } else if (stat === 'proses') {
      return 'bg-[#feefe3] text-[#b06000] hover:bg-[#feefe3]';
    } else {
      return 'bg-[#f1f3f4] text-[#5f6368] hover:bg-[#f1f3f4]';
    }
  };

  const getTipeKursusStyles = (type: string) => {
    if (formData.tipeKursus.toLowerCase() === type.toLowerCase()) {
      return "bg-[#a8dfc4] text-[#137333] border-none font-bold shadow-sm";
    }
    return "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50";
  };

  return (
    <div className="p-8 bg-[#F3F4F6] min-h-screen pb-20">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-black text-gray-900 mb-1">Menu Kursus</h1>
        <p className="text-xs text-gray-500 font-medium">Buat kursus · Buat Course Map · Publish kursus ke peserta</p>
      </div>

      {/* Top Actions */}
      <div className="flex flex-wrap items-center gap-4 mb-8">
        <Button 
          onClick={() => {
            setEditingId(null);
            setFormData({
              nama: '',
              kode: '',
              pengajarId: '',
              kapasitas: 29,
              deskripsi: '',
              kategori: 'Beginner',
              level: 'Beginner',
              statusPendaftaran: 'Aktif',
              tipeKursus: 'Online'
            });
            setIsModalOpen(true);
          }}
          className="bg-[#5850ec] hover:bg-[#4f46e5] text-white font-semibold rounded-lg text-xs h-9 px-4 shadow-sm transition-all"
        >
          <HiOutlinePlus className="mr-1.5 text-sm" /> Buat Kursus Baru
        </Button>
        <Button 
          onClick={() => navigate('/admin/course-map')}
          className="bg-[#0070f3] hover:bg-[#0060df] text-white font-semibold rounded-lg text-xs h-9 px-4 shadow-sm transition-all"
        >
          <HiOutlinePlus className="mr-1.5 text-sm" /> Buat Course Map
        </Button>

        <div className="relative w-72 ml-auto">
          <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
          <Input 
            placeholder="Cari Kursus" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-8 rounded-lg border-gray-200 bg-white text-xs font-medium text-gray-800 placeholder:text-gray-400 focus-visible:ring-[#5850ec] focus-visible:border-[#5850ec] transition-all"
          />
        </div>

        <Select defaultValue="all">
          <SelectTrigger className="w-24 h-8 bg-[#5850ec] text-white hover:bg-[#4f46e5] font-semibold rounded-lg text-xs px-3 shadow-sm border-none flex items-center justify-between">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="all">Status</SelectItem>
            <SelectItem value="aktif">Aktif</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table Card */}
      <Card className="rounded-lg border border-gray-200 shadow-sm bg-white overflow-hidden mb-8">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-white">
                <TableRow className="border-b border-gray-150 hover:bg-transparent">
                  <TableHead className="py-4 px-6 text-xs font-black text-gray-900 tracking-wider">Nama Kursus</TableHead>
                  <TableHead className="py-4 px-4 text-xs font-black text-gray-900 tracking-wider">Level</TableHead>
                  <TableHead className="py-4 px-4 text-xs font-black text-gray-900 tracking-wider">Pengajar</TableHead>
                  <TableHead className="py-4 px-4 text-xs font-black text-gray-900 tracking-wider">Jadwal</TableHead>
                  <TableHead className="py-4 px-4 text-xs font-black text-gray-900 tracking-wider">Materi</TableHead>
                  <TableHead className="py-4 px-4 text-xs font-black text-gray-900 tracking-wider">Peserta</TableHead>
                  <TableHead className="py-4 px-4 text-xs font-black text-gray-900 tracking-wider">Ai Status</TableHead>
                  <TableHead className="py-4 px-4 text-xs font-black text-gray-900 tracking-wider">Status</TableHead>
                  <TableHead className="py-4 px-6 text-xs font-black text-gray-900 tracking-wider text-center">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 bg-white">
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="h-32 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-8 h-8 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Memuat Kursus...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedCourses.map((item) => {
                    const isSelected = selectedCourseId === item.id;
                    return (
                      <TableRow 
                        key={item.id} 
                        className={`transition-colors border-b border-gray-100 cursor-pointer ${
                          isSelected ? 'bg-indigo-50/40' : 'hover:bg-gray-50/50'
                        }`}
                        onClick={() => setSelectedCourseId(item.id)}
                      >
                        <TableCell className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className={`w-1.5 h-8 rounded-full shrink-0 ${
                              item.level.toLowerCase() === 'beginner' 
                                ? 'bg-[#5850ec]' 
                                : item.level.toLowerCase() === 'intermediate'
                                ? 'bg-[#10b981]'
                                : 'bg-[#3b82f6]'
                            }`}></div>
                            <div>
                              <p className="text-xs font-semibold text-gray-800 leading-none mb-0.5">{item.nama}</p>
                              <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">{item.kode}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-4 px-4">
                          <Badge className={`rounded-full px-3.5 py-0.5 text-[10px] font-bold border-none shadow-none uppercase ${getLevelBadgeStyles(item.level)}`}>
                            {item.level}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-4 px-4 text-xs font-semibold text-gray-800">{item.pengajarNama}</TableCell>
                        <TableCell className="py-4 px-4 text-xs font-semibold text-gray-850">{item.jadwalText || '-'}</TableCell>
                        <TableCell className="py-4 px-4 text-xs font-semibold text-gray-850">{item.materiText || '-'}</TableCell>
                        <TableCell className="py-4 px-4 text-xs font-semibold text-gray-800">{item.pesertaCount}</TableCell>
                        <TableCell className="py-4 px-4">
                          <Badge className={`rounded-full px-3.5 py-0.5 text-[10px] font-bold border-none shadow-none uppercase ${getAiStatusBadgeStyles(item.aiStatus)}`}>
                            {item.aiStatus}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-4 px-4">
                          <Badge className={`rounded-full px-3.5 py-0.5 text-[10px] font-bold border-none shadow-none uppercase ${
                            item.published 
                              ? 'bg-[#e6f4ea] text-[#137333]' 
                              : 'bg-[#f1f3f4] text-[#5f6368]'
                          }`}>
                            {item.published ? 'Aktif' : 'Draft'}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-4 px-6 text-center">
                          <div className="flex justify-center items-center gap-1">
                            {renderPublishButton(item)}
                            {item.id !== 'dummy-3' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEdit(item);
                                }}
                                className="text-[#5850ec] hover:text-[#4f46e5] p-1.5 transition-colors"
                              >
                                <HiOutlinePencilSquare className="text-xl" />
                              </button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
                {!isLoading && filteredCourses.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="h-32 text-center text-gray-400 italic text-xs font-bold uppercase tracking-widest">
                      Tidak ditemukan data kursus.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="p-6 bg-white flex items-center justify-between border-t border-gray-100">
            <span className="text-xs text-gray-400 font-bold italic">
              {filteredCourses.length} kursus · Publish aktif jika Jadwal & Materi = 14/14
            </span>
            <div className="flex items-center gap-4">
              <button
                className="text-xs font-semibold text-gray-400 hover:text-[#5850ec] disabled:opacity-50 disabled:pointer-events-none transition-colors"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-7 h-7 rounded-md font-bold text-xs transition-all ${
                      currentPage === page
                        ? "bg-[#5850ec] text-white shadow-sm"
                        : "bg-[#e5e7eb] text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              <button
                className="text-xs font-semibold text-gray-400 hover:text-[#5850ec] disabled:opacity-50 disabled:pointer-events-none transition-colors"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress Footer Requirements */}
      <div className="bg-[#dad5f8]/50 rounded-3xl p-6 border border-[#c5bcf0] mt-8">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2.5 h-2.5 rounded-full bg-[#5850ec]"></div>
          <h3 className="text-sm font-black text-[#5850ec]">Syarat Publish Kursus</h3>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 bg-white px-6 py-3 rounded-2xl shadow-sm border border-gray-100 text-[#137333] font-bold text-xs">
            ✓ Kursus dibuat
          </div>
          <div className={`flex items-center gap-1.5 bg-white px-6 py-3 rounded-2xl shadow-sm border border-gray-100 font-bold text-xs ${
            requirements.isJadwalFilled ? 'text-[#137333]' : 'text-[#b06000]'
          }`}>
            {requirements.isJadwalFilled ? '✓' : '⌛'} {requirements.jadwalText}
          </div>
          <div className={`flex items-center gap-1.5 bg-white px-6 py-3 rounded-2xl shadow-sm border border-gray-100 font-bold text-xs ${
            requirements.isMateriUploaded ? 'text-[#137333]' : 'text-[#b06000]'
          }`}>
            {requirements.isMateriUploaded ? '✓' : '⌛'} {requirements.materiText}
          </div>
          <div className={`flex items-center gap-1.5 bg-white px-6 py-3 rounded-2xl shadow-sm border border-gray-100 font-bold text-xs ${
            requirements.isAiApproved ? 'text-[#137333]' : 'text-[#b06000]'
          }`}>
            {requirements.isAiApproved ? '✓' : '⌛'} AI soal approved
          </div>
        </div>
      </div>

      {/* Add / Edit Course Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-xl rounded-[2rem] p-8 border-none shadow-2xl bg-white overflow-hidden">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-2.5 h-8 bg-[#0fc26a] rounded-full shrink-0"></div>
            <h2 className="text-xl font-bold text-gray-900 leading-none">
              {editingId ? 'Edit Data Kursus' : 'Data Kursus Baru'}
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nama Kursus */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 block">Nama Kursus</label>
              <Input
                value={formData.nama}
                onChange={(e) => setFormData(prev => ({ ...prev, nama: e.target.value }))}
                className="rounded-full border-gray-200 bg-white h-11 text-xs font-semibold px-5 text-gray-800 placeholder:text-gray-400 focus-visible:ring-[#5850ec] focus-visible:border-[#5850ec] transition-all"
                placeholder="Contoh: Web Development Dasar"
                required
              />
            </div>

            {/* Pilih Pengajar & Kapasitas Peserta */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 block">Pilih Pengajar</label>
                <Select 
                  onValueChange={(val) => setFormData(prev => ({ ...prev, pengajarId: val }))} 
                  value={formData.pengajarId}
                >
                  <SelectTrigger className="rounded-full border-gray-200 bg-white h-11 text-xs font-semibold px-5 text-gray-600">
                    <span className="line-clamp-1 flex flex-1 items-center gap-1.5 text-left text-gray-700">
                      {displayInstructors.find(p => p.id === formData.pengajarId)?.nama || "Pilih Pengajar"}
                    </span>
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {displayInstructors.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.nama}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 block">Kapasitas Peserta</label>
                <Input
                  type="number"
                  value={formData.kapasitas}
                  onChange={(e) => setFormData(prev => ({ ...prev, kapasitas: parseInt(e.target.value) || 0 }))}
                  className="rounded-full border-gray-200 bg-white h-11 text-xs font-semibold px-5 text-gray-800 focus-visible:ring-[#5850ec] focus-visible:border-[#5850ec] transition-all"
                  placeholder="29"
                  min={1}
                />
              </div>
            </div>

            {/* Deskripsi */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 block">Deskripsi</label>
              <textarea
                value={formData.deskripsi}
                onChange={(e) => setFormData(prev => ({ ...prev, deskripsi: e.target.value }))}
                className="w-full rounded-2xl border border-gray-200 bg-white p-4 text-xs font-semibold text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5850ec]/20 focus:border-[#5850ec] min-h-[100px] resize-none transition-all"
                placeholder="Jelaskan Mengenai Kursus Ini..."
              />
            </div>

            {/* Kategori & Status Pendaftaran */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 block">Kategori</label>
                <Select 
                  onValueChange={(val) => setFormData(prev => ({ ...prev, kategori: val, level: val }))} 
                  value={formData.kategori}
                >
                  <SelectTrigger className="rounded-full border-gray-200 bg-white h-11 text-xs font-semibold px-5 text-gray-600">
                    <SelectValue placeholder="Pilih Kategori" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="Beginner">Beginner</SelectItem>
                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                    <SelectItem value="Advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 block">Status Pendaftaran</label>
                <Select 
                  onValueChange={(val) => setFormData(prev => ({ ...prev, statusPendaftaran: val }))} 
                  value={formData.statusPendaftaran}
                >
                  <SelectTrigger className="rounded-full border-gray-200 bg-white h-11 text-xs font-semibold px-5 text-gray-600">
                    <SelectValue placeholder="Status Pendaftaran" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="Aktif">Aktif</SelectItem>
                    <SelectItem value="Segera">Segera</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Tipe Kursus */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 block">Tipe Kursus</label>
              <div className="flex gap-4">
                {[
                  { id: 'Online', icon: <HiOutlineComputerDesktop className="text-sm" /> },
                  { id: 'Offline', icon: <HiOutlineUserGroup className="text-sm" /> },
                  { id: 'Hybird', icon: <HiOutlineArrowPathRoundedSquare className="text-sm" /> }
                ].map(type => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, tipeKursus: type.id }))}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border text-xs font-bold transition-all ${getTipeKursusStyles(type.id)}`}
                  >
                    {type.icon}
                    <span>{type.id}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                className="rounded-full h-11 border border-gray-200 text-gray-700 font-bold bg-white hover:bg-gray-50 text-sm shadow-none"
              >
                Batal
              </Button>
              <Button 
                type="submit" 
                className="rounded-full h-11 bg-[#0fc26a] hover:bg-[#0db05f] text-white font-bold text-sm shadow-sm transition-all"
              >
                {editingId ? 'Simpan Perubahan' : 'Buat Kursus'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManajemenKursus;
