import React, { useState, useEffect } from 'react';
import { useMataKuliahStore, type MataKuliah } from '../../store/useMataKuliahStore';
import { usePengajarStore } from '../../store/usePengajarStore';
import { useNavigate } from 'react-router-dom';
import { 
  HiOutlinePlus, 
  HiOutlineMagnifyingGlass,
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiOutlineCheckCircle,
  HiOutlineClock
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

const ManajemenKursus: React.FC = () => {
  const navigate = useNavigate();
  const { mataKuliahList, isLoading, fetchMataKuliah, removeMataKuliah, updateMataKuliah } = useMataKuliahStore();
  const { pengajarList, fetchPengajar } = usePengajarStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  useEffect(() => {
    fetchMataKuliah();
    fetchPengajar();
  }, [fetchMataKuliah, fetchPengajar]);

  const selectedCourse = mataKuliahList.find(mk => mk.id === selectedCourseId);

  // Calculate real progress based on backend data
  const getProgress = (mk: MataKuliah) => {
    const totalSessions = 14;
    const jadwalCount = mk._count?.pertemuan || 0;
    
    // Count meetings that have at least one material
    const materiCount = mk.pertemuan?.filter(p => p.materi && p.materi.length > 0).length || 0;
    
    const isAiApproved = mk.published; // Placeholder for AI status
    return { jadwalCount, materiCount, isAiApproved, totalSessions };
  };

  const filteredCourses = mataKuliahList.filter(mk => 
    mk.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
    mk.kode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-8 bg-[#F3F4F6] min-h-screen">
      {/* Top Actions */}
      <div className="flex flex-wrap items-center gap-4 mb-8">
        <Button 
          onClick={() => navigate('/admin/buat-kursus')}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl px-6 py-6"
        >
          <HiOutlinePlus className="mr-2" /> Buat Kursus Baru
        </Button>
        <Button 
          onClick={() => navigate('/admin/course-map')}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl px-6 py-6"
        >
          <HiOutlinePlus className="mr-2" /> Buat Course Map
        </Button>

        <div className="relative flex-1 max-w-sm ml-auto">
          <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input 
            placeholder="Cari Kursus" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 rounded-xl border-gray-200 bg-white py-6"
          />
        </div>

        <Select defaultValue="all">
          <SelectTrigger className="w-32 rounded-xl border-gray-200 bg-indigo-500 text-white font-bold">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="all">Status</SelectItem>
            <SelectItem value="aktif">Aktif</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-[2.5rem] shadow-sm overflow-hidden border border-gray-100 mb-8">
        <Table>
          <TableHeader className="bg-white">
            <TableRow className="hover:bg-transparent border-b border-gray-100">
              <TableHead className="font-bold text-gray-900 py-6 pl-8">Nama Kursus</TableHead>
              <TableHead className="font-bold text-gray-900">Level</TableHead>
              <TableHead className="font-bold text-gray-900">Pengajar</TableHead>
              <TableHead className="font-bold text-gray-900">Jadwal</TableHead>
              <TableHead className="font-bold text-gray-900">Materi</TableHead>
              <TableHead className="font-bold text-gray-900">Peserta</TableHead>
              <TableHead className="font-bold text-gray-900">Ai Status</TableHead>
              <TableHead className="font-bold text-gray-900">Status</TableHead>
              <TableHead className="font-bold text-gray-900 pr-8">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
               <TableRow>
                 <TableCell colSpan={9} className="h-48 text-center">
                    <div className="flex flex-col items-center gap-2">
                       <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
                       <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Memuat Kursus...</p>
                    </div>
                 </TableCell>
               </TableRow>
            ) : filteredCourses.map((mk) => {
              const progress = getProgress(mk);
              const isSelected = selectedCourseId === mk.id;
              const pengajar = pengajarList.find(p => p.id === mk.pengajarId);
              
              return (
                <TableRow 
                  key={mk.id} 
                  className={`group cursor-pointer transition-colors ${isSelected ? 'bg-indigo-50/50' : 'hover:bg-gray-50/50'}`}
                  onClick={() => setSelectedCourseId(mk.id)}
                >
                  <TableCell className="py-5 pl-8">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-8 rounded-full ${mk.kode.startsWith('IF') ? 'bg-indigo-600' : 'bg-emerald-500'}`}></div>
                      <div>
                        <p className="font-bold text-gray-900 leading-tight">{mk.nama}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{mk.kode}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={`rounded-full px-4 py-1 text-[10px] font-bold uppercase border-none ${
                      mk.kode.startsWith('IF') ? 'bg-indigo-100 text-indigo-600' : 'bg-emerald-100 text-emerald-600'
                    }`}>
                      {mk.kode.startsWith('IF') ? 'Beginner' : 'Intermediate'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm font-bold text-gray-600">{pengajar?.nama || '-'}</TableCell>
                  <TableCell className="text-sm font-bold text-gray-600">{progress.jadwalCount}/{progress.totalSessions}</TableCell>
                  <TableCell className="text-sm font-bold text-gray-600">{progress.materiCount}/{progress.totalSessions}</TableCell>
                  <TableCell className="text-sm font-bold text-gray-600">{mk._count?.pendaftaran || 0}</TableCell>
                  <TableCell>
                    <Badge className={`${progress.materiCount >= 14 ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'} rounded-full px-3 py-1 text-[9px] font-extrabold uppercase tracking-widest border-none`}>
                      {progress.materiCount >= 14 ? 'Siap' : 'Pending'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={`rounded-full px-3 py-1 text-[9px] font-extrabold uppercase tracking-widest border-none ${
                      mk.published ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400'
                    }`}>
                      {mk.published ? 'Aktif' : 'Draft'}
                    </Badge>
                  </TableCell>
                  <TableCell className="pr-8">
                    <div className="flex items-center gap-2">
                      <Button 
                        disabled={mk.published}
                        onClick={(e) => {
                          e.stopPropagation();
                          updateMataKuliah(mk.id, { published: true });
                        }}
                        className={`h-8 px-4 rounded-lg text-[10px] font-bold uppercase tracking-wider border-none ${
                          mk.published ? 'bg-emerald-100 text-emerald-600 cursor-default' : 'bg-indigo-600 text-white hover:bg-indigo-700'
                        }`}
                      >
                        {mk.published ? 'Published' : 'Publish'}
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-indigo-600 hover:bg-indigo-50 rounded-lg"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeMataKuliah(mk.id);
                        }}
                      >
                        <HiOutlineTrash className="text-lg text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        <div className="p-6 border-t border-gray-50 flex items-center justify-between">
          <p className="text-xs text-gray-400 font-bold italic">
            {filteredCourses.length} kursus - Publish aktif jika Jadwal & Materi = 14/14
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="rounded-lg h-8 px-3 text-[10px] font-bold">Previous</Button>
            {[1, 2, 3].map(n => (
              <Button key={n} variant={n === 1 ? 'default' : 'outline'} size="sm" className={`rounded-lg h-8 w-8 p-0 text-[10px] font-bold ${n === 1 ? 'bg-indigo-600' : ''}`}>{n}</Button>
            ))}
            <Button variant="outline" size="sm" className="rounded-lg h-8 px-3 text-[10px] font-bold">Next</Button>
          </div>
        </div>
      </div>

      {/* Progress Footer */}
      {selectedCourseId && selectedCourse && (
        <div className="bg-indigo-200/50 rounded-3xl p-8 border border-indigo-200 animate-in slide-in-from-bottom-5 duration-500">
           <div className="flex items-center justify-between gap-8 max-w-5xl mx-auto">
              <div className="flex items-center gap-3 bg-white px-6 py-3 rounded-2xl shadow-sm border border-indigo-100 text-emerald-600 font-bold text-xs">
                <HiOutlineCheckCircle className="text-lg" /> Kursus dibuat
              </div>
              <div className="flex-1 h-[2px] bg-indigo-300"></div>
              <div className="flex items-center gap-3 bg-white px-6 py-3 rounded-2xl shadow-sm border border-indigo-100 text-emerald-600 font-bold text-xs">
                <HiOutlineCheckCircle className="text-lg" /> 14 jadwal terisi
              </div>
              <div className="flex-1 h-[2px] bg-indigo-300"></div>
              <div className="flex items-center gap-3 bg-white px-6 py-3 rounded-2xl shadow-sm border border-indigo-100 text-emerald-600 font-bold text-xs">
                <HiOutlineCheckCircle className="text-lg" /> 14 materi upload
              </div>
              <div className="flex-1 h-[2px] bg-indigo-300"></div>
              <div className="flex items-center gap-3 bg-white px-6 py-3 rounded-2xl shadow-sm border border-indigo-100 text-amber-600 font-bold text-xs">
                ⏳ AI soal approved
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default ManajemenKursus;
