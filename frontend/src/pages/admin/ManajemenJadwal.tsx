import React, { useState, useEffect } from 'react';
import { useMataKuliahStore, type MataKuliah } from '../../store/useMataKuliahStore';
import { usePengajarStore } from '../../store/usePengajarStore';
import { useJadwalStore, type Pertemuan } from '../../store/useJadwalStore';
import { 
  HiOutlinePlus, 
  HiOutlinePencilSquare,
  HiOutlineCalendar,
  HiOutlineClock,
  HiOutlineAcademicCap
} from 'react-icons/hi2';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ManajemenJadwal: React.FC = () => {
  const { mataKuliahList, fetchMataKuliah } = useMataKuliahStore();
  const { pengajarList, fetchPengajar } = usePengajarStore();
  const { jadwalList, fetchJadwal, updatePertemuan, isLoading: isJadwalLoading } = useJadwalStore();

  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<Pertemuan | null>(null);
  const [formData, setFormData] = useState({
    topik: '',
    tgl: '',
    jam: '',
    dosenId: '',
  });

  useEffect(() => {
    fetchMataKuliah();
    fetchPengajar();
  }, [fetchMataKuliah, fetchPengajar]);

  useEffect(() => {
    if (selectedCourseId) {
      fetchJadwal(selectedCourseId);
    }
  }, [selectedCourseId, fetchJadwal]);

  const selectedCourse = mataKuliahList.find(mk => mk.id === selectedCourseId);

  const handleEditClick = (session: Pertemuan) => {
    setEditingSession(session);
    setFormData({
      topik: session.topik || '',
      tgl: session.tgl ? new Date(session.tgl).toISOString().split('T')[0] : '',
      jam: session.jam || '',
      dosenId: session.dosenId || '',
    });
    setIsEditModalOpen(true);
  };

  const handleSave = async () => {
    if (editingSession) {
      await updatePertemuan(editingSession.id, formData);
      setIsEditModalOpen(false);
      if (selectedCourseId) fetchJadwal(selectedCourseId);
    }
  };

  const filledCount = jadwalList.filter(s => s.tgl && s.jam && s.topik).length;

  return (
    <div className="p-8 bg-[#F3F4F6] min-h-screen pb-20">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-1">Menu Penjadwalan</h1>
        <p className="text-sm text-gray-500 font-medium">Pilih kursus → Tabel jadwal → Isi detail per pertemuan</p>
      </div>

      {/* Pilih Kursus Section */}
      <Card className="rounded-[2rem] border-none shadow-sm bg-white mb-8">
        <CardContent className="p-8">
          <h2 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-widest opacity-50">Step 1: Pilih Kursus</h2>
          <div className="flex flex-wrap gap-4">
            {mataKuliahList.map((mk) => (
              <button
                key={mk.id}
                onClick={() => setSelectedCourseId(mk.id)}
                className={`w-40 h-16 rounded-xl transition-all border-2 flex flex-col items-center justify-center font-bold text-xs p-2 ${
                  selectedCourseId === mk.id 
                    ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200" 
                    : "bg-white border-gray-100 text-gray-400 hover:border-gray-200"
                }`}
              >
                <span className="truncate w-full text-center">{mk.nama}</span>
                <span className={`text-[9px] mt-1 ${selectedCourseId === mk.id ? 'text-indigo-100' : 'text-gray-300'}`}>{mk.kode}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tabel Jadwal Section */}
      {selectedCourseId && (
        <Card className="rounded-[2rem] border-none shadow-sm bg-white overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-indigo-50/20">
            <div>
              <h2 className="text-xl font-black text-gray-900">
                Tabel Jadwal: {selectedCourse?.nama}
              </h2>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Lengkapi 14 Pertemuan</p>
            </div>
            <div className="text-right">
               <div className="text-[20px] font-black text-indigo-600 leading-none">{filledCount}/14</div>
               <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Terisi</div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="py-4 px-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">Sesi</th>
                  <th className="py-4 px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Tanggal</th>
                  <th className="py-4 px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Waktu</th>
                  <th className="py-4 px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Topik Pembahasan</th>
                  <th className="py-4 px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Pengajar</th>
                  <th className="py-4 px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                  <th className="py-4 px-8 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {isJadwalLoading ? (
                  <tr>
                    <td colSpan={7} className="py-20 text-center">
                       <div className="flex flex-col items-center gap-2">
                          <div className="w-8 h-8 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
                          <p className="text-[10px] text-gray-400 font-bold uppercase">Memuat Sesi...</p>
                       </div>
                    </td>
                  </tr>
                ) : jadwalList.map((s) => {
                  const instructor = pengajarList.find(p => p.id === s.dosenId);
                  const isFilled = s.tgl && s.jam && s.topik;
                  
                  return (
                    <tr key={s.id} className={`${s.urutan % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'} hover:bg-gray-100/50 transition-colors`}>
                      <td className="py-5 px-8">
                        <span className="text-[11px] font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">P-{s.urutan}</span>
                      </td>
                      <td className="py-5 px-4 text-[11px] font-bold text-gray-900">
                        {s.tgl ? new Date(s.tgl).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                      </td>
                      <td className="py-5 px-4 text-[11px] font-bold text-gray-500">{s.jam || '—'}</td>
                      <td className="py-5 px-4 text-[11px] font-bold text-gray-900 max-w-xs truncate">{s.topik || 'Belum diatur'}</td>
                      <td className="py-5 px-4">
                        {instructor ? (
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-black text-white bg-emerald-500">
                              {instructor.nama.charAt(0)}
                            </div>
                            <span className="text-[11px] font-bold text-gray-600">{instructor.nama}</span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-gray-300 font-bold italic">Belum dipilih</span>
                        )}
                      </td>
                      <td className="py-5 px-4">
                        <Badge className={`rounded-full px-3 py-0.5 text-[9px] font-black uppercase tracking-wider border-none ${
                          isFilled ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                        }`}>
                          {isFilled ? 'Siap' : 'Pending'}
                        </Badge>
                      </td>
                      <td className="py-5 px-8 text-center">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleEditClick(s)}
                          className={`h-8 rounded-lg font-bold text-[10px] ${isFilled ? 'border-gray-200 text-gray-500' : 'border-indigo-200 text-indigo-600 hover:bg-indigo-50'}`}
                        >
                          <HiOutlinePencilSquare className="mr-1 text-sm" /> {isFilled ? 'Edit' : 'Set Jadwal'}
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="p-10 bg-indigo-600 flex items-center justify-between">
            <div>
              <p className="text-sm text-indigo-100 font-bold mb-1">Total Progres Penjadwalan</p>
              <p className="text-xs text-white/60 font-medium">Lengkapi semua sesi untuk mempublikasikan kursus secara resmi</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="text-2xl font-black text-white">{Math.round((filledCount/14)*100)}%</div>
              <div className="w-64 h-3 bg-white/10 rounded-full overflow-hidden border border-white/10">
                <div 
                  className="h-full bg-white shadow-[0_0_20px_rgba(255,255,255,0.5)] transition-all duration-1000" 
                  style={{ width: `${(filledCount/14)*100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Edit Session Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-md rounded-[1.5rem] p-0 overflow-hidden border-none shadow-2xl bg-white">
          <DialogHeader className="p-8 border-b border-gray-100 flex-row items-center gap-4">
             <div className="w-2.5 h-12 bg-indigo-600 rounded-full"></div>
             <div>
                <DialogTitle className="text-2xl font-black text-gray-800">
                  Set Jadwal Sesi {editingSession?.urutan}
                </DialogTitle>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{selectedCourse?.nama}</p>
             </div>
          </DialogHeader>
          
          <div className="p-8 space-y-6">
            <div className="space-y-2">
               <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                 <HiOutlineAcademicCap className="text-indigo-600" /> Topik Pembahasan
               </label>
               <Input 
                 placeholder="Contoh: Pengenalan HTML & CSS Modern"
                 value={formData.topik}
                 onChange={(e) => setFormData({...formData, topik: e.target.value})}
                 className="h-12 rounded-xl border-gray-100 bg-gray-50/50 font-bold text-gray-700"
               />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                   <HiOutlineCalendar className="text-indigo-600" /> Tanggal
                 </label>
                 <Input 
                   type="date"
                   value={formData.tgl}
                   onChange={(e) => setFormData({...formData, tgl: e.target.value})}
                   className="h-12 rounded-xl border-gray-100 bg-gray-50/50 font-bold text-gray-700"
                 />
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                   <HiOutlineClock className="text-indigo-600" /> Jam Mulai
                 </label>
                 <Input 
                   type="time"
                   value={formData.jam}
                   onChange={(e) => setFormData({...formData, jam: e.target.value})}
                   className="h-12 rounded-xl border-gray-100 bg-gray-50/50 font-bold text-gray-700"
                 />
              </div>
            </div>

            <div className="space-y-2">
               <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                 <HiOutlineAcademicCap className="text-indigo-600" /> Pilih Pengajar Sesi
               </label>
               <Select 
                 value={formData.dosenId} 
                 onValueChange={(val) => setFormData({...formData, dosenId: val})}
               >
                 <SelectTrigger className="h-12 rounded-xl border-gray-100 bg-gray-50/50 font-bold text-gray-700">
                   <SelectValue placeholder="Pilih Dosen/Instruktur" />
                 </SelectTrigger>
                 <SelectContent className="rounded-xl border-gray-100">
                   {pengajarList.map(p => (
                     <SelectItem key={p.id} value={p.id} className="font-bold text-xs py-3">
                        {p.nama} ({p.role})
                     </SelectItem>
                   ))}
                 </SelectContent>
               </Select>
            </div>
          </div>

          <DialogFooter className="p-8 bg-gray-50/50 border-t border-gray-100 gap-3">
             <Button 
               variant="ghost" 
               onClick={() => setIsEditModalOpen(false)}
               className="rounded-full h-12 px-8 font-black text-gray-400 uppercase tracking-widest text-[10px]"
             >
                Batal
             </Button>
             <Button 
               onClick={handleSave}
               className="rounded-full h-12 px-8 bg-indigo-600 hover:bg-indigo-700 font-black text-white uppercase tracking-widest text-[10px] shadow-lg shadow-indigo-200"
             >
                Simpan Jadwal
             </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManajemenJadwal;
