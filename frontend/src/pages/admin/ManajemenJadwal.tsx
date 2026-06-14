import React, { useState, useEffect } from 'react';
import { useMataKuliahStore } from '../../store/useMataKuliahStore';
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
    hari: 'Senin',
    dosenId: '',
    asistenId: '',
    jenisPembelajaran: 'Zoom/Meet',
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

  // Automatically select the first course on load
  useEffect(() => {
    if (mataKuliahList.length > 0 && !selectedCourseId) {
      setSelectedCourseId(mataKuliahList[0].id);
    }
  }, [mataKuliahList, selectedCourseId]);

  const selectedCourse = mataKuliahList.find(mk => mk.id === selectedCourseId);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateVal = e.target.value;
    setFormData(prev => {
      const updated = { ...prev, tgl: dateVal };
      if (dateVal) {
        const parts = dateVal.split('-');
        const date = new Date(Date.UTC(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2])));
        const dayIndex = date.getUTCDay();
        const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
        updated.hari = days[dayIndex];
      }
      return updated;
    });
  };

  const handleHariChange = (val: string) => {
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const targetDayIndex = days.indexOf(val);
    if (targetDayIndex === -1) return;

    setFormData(prev => {
      const updated = { ...prev, hari: val };
      if (prev.tgl) {
        const parts = prev.tgl.split('-');
        const date = new Date(Date.UTC(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2])));
        const currentDayIndex = date.getUTCDay();
        const diff = targetDayIndex - currentDayIndex;
        date.setUTCDate(date.getUTCDate() + diff);
        
        const year = date.getUTCFullYear();
        const month = String(date.getUTCMonth() + 1).padStart(2, '0');
        const day = String(date.getUTCDate()).padStart(2, '0');
        updated.tgl = `${year}-${month}-${day}`;
      }
      return updated;
    });
  };

  const handleEditClick = (session: Pertemuan) => {
    setEditingSession(session);

    let initialHari = 'Senin';
    if (session.tgl) {
      const date = new Date(session.tgl);
      const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
      initialHari = days[date.getUTCDay()];
    }

    setFormData({
      topik: session.topik && session.topik !== `Pertemuan ${session.urutan}` ? session.topik : '',
      tgl: session.tgl ? new Date(session.tgl).toISOString().split('T')[0] : '',
      jam: session.jam || '',
      hari: initialHari,
      dosenId: session.dosenId || 'unassigned',
      asistenId: session.asistenId || 'unassigned',
      jenisPembelajaran: 'Zoom/Meet',
    });
    setIsEditModalOpen(true);
  };

  const handleSave = async () => {
    if (editingSession) {
      const payload = {
        topik: formData.topik || `Pertemuan ${editingSession.urutan}`,
        tgl: formData.tgl || null,
        jam: formData.jam || null,
        dosenId: formData.dosenId === 'unassigned' ? null : formData.dosenId,
        asistenId: formData.asistenId === 'unassigned' ? null : formData.asistenId,
      };
      await updatePertemuan(editingSession.id, payload);
      setIsEditModalOpen(false);
      if (selectedCourseId) fetchJadwal(selectedCourseId);
    }
  };

  const handleAddJadwalClick = () => {
    // Open modal for the first unconfigured session
    const nextSession = jadwalList.find(s => !s.tgl || !s.jam) || jadwalList[0];
    if (nextSession) {
      handleEditClick(nextSession);
    }
  };

  const formatTanggal = (dateStr?: string) => {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
  };

  const formatHariJam = (dateStr?: string, jamStr?: string) => {
    if (!dateStr && !jamStr) return '—';
    let dayName = '';
    if (dateStr) {
      const date = new Date(dateStr);
      dayName = date.toLocaleDateString('id-ID', { weekday: 'long', timeZone: 'UTC' });
    }
    if (dayName && jamStr) {
      return `${dayName} - ${jamStr}`;
    }
    return dayName || jamStr || '—';
  };

  const getStatus = (session: Pertemuan) => {
    if (!session.tgl) return { label: 'Terjadwal', className: 'bg-gray-100 text-gray-500 border border-gray-150' };
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const sessionDate = new Date(session.tgl);
    sessionDate.setHours(0, 0, 0, 0);
    
    if (sessionDate < today) {
      return { label: 'Selesai', className: 'bg-emerald-50 text-emerald-600 border border-emerald-100' };
    } else if (sessionDate.getTime() === today.getTime()) {
      return { label: 'Berlangsung', className: 'bg-amber-50 text-amber-600 border border-amber-100' };
    } else {
      return { label: 'Terjadwal', className: 'bg-gray-100 text-gray-500 border border-gray-150' };
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const getAvatarColor = (name: string) => {
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return hash % 2 === 0 ? 'bg-emerald-500' : 'bg-[#357ABD]';
  };

  // Determine configuration index to group trailing empty sessions
  const lastActiveIndex = [...jadwalList].reverse().findIndex(s => {
    const hasDate = !!s.tgl;
    const hasTime = !!s.jam;
    const hasInstructor = !!s.dosenId;
    const hasCustomTopic = s.topik && s.topik !== `Pertemuan ${s.urutan}`;
    return hasDate || hasTime || hasInstructor || hasCustomTopic;
  });

  const lastActiveUrutan = lastActiveIndex !== -1 ? (14 - lastActiveIndex) : 0;
  const showUpToUrutan = Math.min(14, lastActiveUrutan + 1);

  const individualSessions = jadwalList.filter(s => s.urutan <= showUpToUrutan);
  const groupedSessions = jadwalList.filter(s => s.urutan > showUpToUrutan);
  const filledCount = jadwalList.filter(s => s.tgl && s.jam).length;
  
  const selectedDosenName = formData.dosenId === 'unassigned' || !formData.dosenId
    ? ''
    : (pengajarList.find(p => p.id === formData.dosenId)?.nama || editingSession?.dosen?.nama || formData.dosenId);

  const selectedAsistenName = formData.asistenId === 'unassigned' || !formData.asistenId
    ? ''
    : (pengajarList.find(p => p.id === formData.asistenId)?.nama || editingSession?.asisten?.nama || formData.asistenId);

  const isEditMode = !!(editingSession?.tgl || editingSession?.jam);

  return (
    <div className="p-8 bg-[#F3F4F6] min-h-screen pb-20">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-1">Menu Penjadwalan</h1>
        <p className="text-sm text-gray-500 font-medium">{"Pilih kursus -> Tabel jadwal -> Add jadwal per pertemuan hingga lengkap"}</p>
      </div>

      {/* Pilih Kursus Section */}
      <Card className="rounded-[2rem] border-none shadow-sm bg-white mb-8">
        <CardContent className="p-8">
          <h2 className="text-[15px] font-extrabold text-gray-800 mb-4">Pilih Kursus</h2>
          <div className="flex flex-wrap gap-3">
            {mataKuliahList.map((mk) => {
              const isSelected = selectedCourseId === mk.id;
              return (
                <button
                  key={mk.id}
                  onClick={() => setSelectedCourseId(mk.id)}
                  className={`px-5 py-3.5 rounded-2xl transition-all border font-bold text-xs flex items-center gap-1.5 cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${
                    isSelected 
                      ? "bg-[#ECEEFE] border-[#5D5FEF] text-[#5D5FEF] shadow-sm font-extrabold" 
                      : "bg-white border-gray-200 text-gray-400 hover:bg-gray-50"
                  }`}
                >
                  {mk.nama}
                  {isSelected && <span>✓</span>}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Tabel Jadwal Section */}
      {selectedCourseId && (
        <Card className="rounded-[2rem] border-none shadow-sm bg-white overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="p-8 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-gray-800">
                Step 2: Tabel Jadwal — {selectedCourse?.nama} ({jadwalList.length} Pertemuan)
              </h2>
            </div>
            <Button 
              onClick={handleAddJadwalClick}
              className="bg-[#5D5FEF] hover:bg-[#4D4FCF] text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-indigo-100 cursor-pointer border-none"
            >
              <HiOutlinePlus className="text-sm stroke-[3]" /> Add Jadwal
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="py-4 px-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">PERTEMUAN</th>
                  <th className="py-4 px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">TANGGAL</th>
                  <th className="py-4 px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">HARI & JAM</th>
                  <th className="py-4 px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">TOPIK</th>
                  <th className="py-4 px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">PENGAJAR ASSIGNED</th>
                  <th className="py-4 px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">STATUS</th>
                  <th className="py-4 px-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isJadwalLoading ? (
                  <tr>
                    <td colSpan={7} className="py-20 text-center">
                       <div className="flex flex-col items-center gap-2">
                          <div className="w-8 h-8 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
                          <p className="text-[10px] text-gray-400 font-bold uppercase">Memuat Sesi...</p>
                       </div>
                    </td>
                  </tr>
                ) : (
                  <>
                    {individualSessions.map((s) => {
                      const instructor = pengajarList.find(p => p.id === s.dosenId);
                      const status = getStatus(s);
                      
                      return (
                        <tr key={s.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="py-4 px-8 text-xs font-semibold text-gray-800">
                            Pertemuan {s.urutan}
                          </td>
                          <td className="py-4 px-4 text-xs font-medium text-gray-600">
                            {s.tgl ? formatTanggal(s.tgl) : '—'}
                          </td>
                          <td className="py-4 px-4 text-xs font-medium text-gray-600">
                            {formatHariJam(s.tgl, s.jam)}
                          </td>
                          <td className="py-4 px-4 text-xs font-semibold text-gray-800 max-w-xs truncate">
                            {s.topik && s.topik !== `Pertemuan ${s.urutan}` ? s.topik : '—'}
                          </td>
                          <td className="py-4 px-4">
                            {instructor ? (
                              <div className="flex items-center gap-2">
                                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-black text-white ${getAvatarColor(instructor.nama)}`}>
                                  {getInitials(instructor.nama)}
                                </div>
                                <span className="text-xs font-semibold text-gray-800">{instructor.nama}</span>
                              </div>
                            ) : (
                              <span className="text-xs font-medium text-gray-400">Belum diassign</span>
                            )}
                          </td>
                          <td className="py-4 px-4">
                            <span className={`inline-block rounded-full px-3 py-1 text-[9px] font-bold uppercase tracking-wider ${status.className}`}>
                              {status.label}
                            </span>
                          </td>
                          <td className="py-4 px-8">
                            {s.tgl && s.jam ? (
                              <button
                                onClick={() => handleEditClick(s)}
                                className="text-[#5D5FEF] hover:text-[#4D4FCF] text-lg cursor-pointer transition-all hover:scale-110 bg-transparent border-none p-0 flex items-center"
                                title="Edit Jadwal"
                              >
                                <HiOutlinePencilSquare />
                              </button>
                            ) : (
                              <button 
                                onClick={() => handleEditClick(s)}
                                className="bg-emerald-50 text-emerald-600 hover:bg-emerald-100 font-bold px-3 py-1.5 rounded-xl text-[10px] cursor-pointer transition-all border border-emerald-100 flex items-center gap-1"
                              >
                                <HiOutlinePlus className="text-[10px]" /> Add Jadwal
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                    {groupedSessions.length > 0 && (
                      <tr className="bg-indigo-50/20">
                        <td className="py-4 px-8 text-xs font-semibold text-gray-400">
                          Pertemuan {groupedSessions[0].urutan}-{groupedSessions[groupedSessions.length - 1].urutan}
                        </td>
                        <td colSpan={6} className="py-4 px-4 text-xs font-medium text-gray-400">
                          Belum ada materi · <span className="text-[#5D5FEF] font-bold cursor-pointer hover:underline" onClick={handleAddJadwalClick}>Klik Add Jadwal untuk mengisi</span>
                        </td>
                      </tr>
                    )}
                  </>
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer with Progress */}
          <div className="p-6 border-t border-gray-100 flex items-center justify-between bg-white">
            <div className="text-xs text-gray-500 font-bold">
              {filledCount} dari {jadwalList.length} pertemuan terisi · Progress: {filledCount}/{jadwalList.length}
            </div>
            <div className="flex items-center gap-2">
              <div className="w-64 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#5D5FEF] transition-all duration-500" 
                  style={{ width: `${(filledCount / (jadwalList.length || 14)) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Edit Session Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl p-0 overflow-hidden border-none shadow-2xl bg-white">
          <DialogHeader className={`p-6 ${isEditMode ? 'bg-[#5D5FEF]' : 'bg-emerald-600'} text-white flex-row items-center justify-between transition-colors duration-350`}>
            <DialogTitle className="text-lg font-bold text-white flex items-center gap-2">
              {isEditMode ? <HiOutlinePencilSquare className="text-xl" /> : <HiOutlinePlus className="text-xl stroke-[3]" />}
              {isEditMode ? 'Form Edit Jadwal' : 'Form Add Jadwal'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            {/* Kursus */}
            <div className="space-y-1.5">
               <label className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                 Kursus
               </label>
               <div className="h-11 px-3 border border-gray-300 rounded-xl bg-gray-50 flex items-center justify-between text-xs text-gray-500 font-semibold">
                 <span>{selectedCourse?.nama}</span>
                 <span>▼</span>
               </div>
            </div>

            {/* Nomor Pertemuan */}
            <div className="space-y-1.5">
               <label className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                 Nomor Pertemuan
               </label>
               <div className="h-11 px-3 border border-gray-300 rounded-xl bg-gray-50 flex items-center text-xs text-gray-500 font-semibold">
                 Pertemuan ke-{editingSession?.urutan} (1-14)
               </div>
            </div>

            {/* Tanggal */}
            <div className="space-y-1.5">
               <label className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                 Tanggal
               </label>
               <Input 
                 type="date"
                 value={formData.tgl}
                 onChange={handleDateChange}
                 className="h-11 rounded-xl border-gray-300 font-semibold text-xs text-gray-700 focus:ring-2 focus:ring-[#5D5FEF] bg-white shadow-none"
               />
            </div>

            {/* Hari & Jam */}
            <div className="space-y-1.5">
               <label className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                 Hari & Jam
               </label>
               <div className="grid grid-cols-2 gap-4">
                 <Select 
                   value={formData.hari} 
                   onValueChange={handleHariChange}
                 >
                   <SelectTrigger className="h-11 rounded-xl border-gray-300 font-semibold text-xs text-gray-700 bg-white">
                     <SelectValue placeholder="Pilih Hari" />
                   </SelectTrigger>
                   <SelectContent className="rounded-xl border-gray-200">
                     {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'].map(d => (
                       <SelectItem key={d} value={d} className="font-semibold text-xs py-2">
                         {d}
                       </SelectItem>
                     ))}
                   </SelectContent>
                 </Select>

                 <Input 
                   type="text"
                   placeholder="09:00"
                   value={formData.jam}
                   onChange={(e) => setFormData({...formData, jam: e.target.value})}
                   className="h-11 rounded-xl border-gray-300 font-semibold text-xs text-gray-700 bg-white shadow-none"
                 />
               </div>
            </div>

            {/* Assign Pengajar */}
            <div className="space-y-1.5">
               <label className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                 Assign Pengajar
               </label>
               <Select 
                 value={formData.dosenId} 
                 onValueChange={(val) => setFormData({...formData, dosenId: val})}
               >
                 <SelectTrigger className="h-11 rounded-xl border-gray-300 font-semibold text-xs text-gray-700 bg-white">
                    <span className="line-clamp-1 flex flex-1 items-center gap-1.5 text-left text-gray-800">
                      {selectedDosenName || "Pilih pengajar"}
                    </span>
                 </SelectTrigger>
                 <SelectContent className="rounded-xl border-gray-200 animate-none">
                   <SelectItem value="unassigned" className="font-semibold text-xs py-2 text-gray-400">Belum diassign / Pilih pengajar</SelectItem>
                   {pengajarList.filter(p => p.role?.toUpperCase() === 'DOSEN' || p.role?.toUpperCase() === 'ADMIN').map(p => (
                     <SelectItem key={p.id} value={p.id} className="font-semibold text-xs py-2">
                        {p.nama} ({p.role})
                     </SelectItem>
                   ))}
                   {/* Fallback to show the name from editingSession or full list if not found in filtered list */}
                   {formData.dosenId && formData.dosenId !== 'unassigned' && !pengajarList.filter(p => p.role?.toUpperCase() === 'DOSEN' || p.role?.toUpperCase() === 'ADMIN').some(p => p.id === formData.dosenId) && (() => {
                     const foundUser = pengajarList.find(p => p.id === formData.dosenId);
                     const labelText = foundUser ? `${foundUser.nama} (${foundUser.role})` : (editingSession?.dosen?.nama || 'Dosen');
                     return (
                       <SelectItem key={formData.dosenId} value={formData.dosenId} className="font-semibold text-xs py-2">
                         {labelText}
                       </SelectItem>
                     );
                   })()}
                 </SelectContent>
               </Select>
            </div>

            {/* Assign Asisten */}
            <div className="space-y-1.5">
               <label className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                 Assign Asisten
               </label>
               <Select 
                 value={formData.asistenId} 
                 onValueChange={(val) => setFormData({...formData, asistenId: val})}
               >
                 <SelectTrigger className="h-11 rounded-xl border-gray-300 font-semibold text-xs text-gray-700 bg-white">
                    <span className="line-clamp-1 flex flex-1 items-center gap-1.5 text-left text-gray-800">
                      {selectedAsistenName || "Pilih asisten"}
                    </span>
                 </SelectTrigger>
                 <SelectContent className="rounded-xl border-gray-200 animate-none">
                   <SelectItem value="unassigned" className="font-semibold text-xs py-2 text-gray-400">Belum diassign / Pilih asisten</SelectItem>
                   {pengajarList.filter(p => p.role?.toUpperCase() === 'ASISTEN').map(p => (
                     <SelectItem key={p.id} value={p.id} className="font-semibold text-xs py-2">
                        {p.nama}
                     </SelectItem>
                   ))}
                   {/* Fallback to show the name from editingSession or full list if not found in filtered list */}
                   {formData.asistenId && formData.asistenId !== 'unassigned' && !pengajarList.filter(p => p.role?.toUpperCase() === 'ASISTEN').some(p => p.id === formData.asistenId) && (() => {
                     const foundUser = pengajarList.find(p => p.id === formData.asistenId);
                     const labelText = foundUser ? foundUser.nama : (editingSession?.asisten?.nama || 'Asisten');
                     return (
                       <SelectItem key={formData.asistenId} value={formData.asistenId} className="font-semibold text-xs py-2">
                         {labelText}
                       </SelectItem>
                     );
                   })()}
                 </SelectContent>
               </Select>
            </div>

            {/* Topik Pertemuan */}
            <div className="space-y-1.5">
               <label className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                 Topik Pertemuan
               </label>
               <Input 
                 placeholder="Judul topik pertemuan ini..."
                 value={formData.topik}
                 onChange={(e) => setFormData({...formData, topik: e.target.value})}
                 className="h-11 rounded-xl border-gray-300 font-semibold text-xs text-gray-700 bg-white shadow-none"
               />
            </div>

            {/* Jenis Pembelajaran */}
            <div className="space-y-1.5 pt-2">
               <label className="text-xs font-bold text-gray-900 uppercase tracking-wider block mb-2">
                 Jenis Pembelajaran
               </label>
               <div className="flex items-center gap-6">
                 {(['Zoom/Meet', 'Micro', 'PDF'] as const).map((type) => (
                   <label key={type} className="flex items-center gap-2 text-xs font-semibold text-gray-700 cursor-pointer">
                     <input 
                       type="radio" 
                       name="jenisPembelajaran" 
                       value={type} 
                       checked={formData.jenisPembelajaran === type}
                       onChange={(e) => setFormData({...formData, jenisPembelajaran: e.target.value})}
                       className="w-4 h-4 text-[#5D5FEF] border-gray-300 focus:ring-[#5D5FEF]"
                     />
                     <span>{type}</span>
                   </label>
                 ))}
               </div>
            </div>
          </div>

          <DialogFooter className="p-6 bg-white border-t border-gray-100 flex flex-row items-center justify-between sm:justify-between gap-4">
             <Button 
               variant="outline" 
               onClick={() => setIsEditModalOpen(false)}
               className="h-10 px-8 font-bold text-gray-700 rounded-xl border-gray-300 hover:bg-gray-50 text-xs w-[45%]"
             >
                Batal
             </Button>
             <Button 
                onClick={handleSave}
                className={`h-10 px-8 ${isEditMode ? 'bg-[#1D60C1] hover:bg-[#154D9E]' : 'bg-emerald-600 hover:bg-emerald-700'} font-bold text-white rounded-xl border-none shadow-none text-xs w-[45%] flex items-center justify-center gap-1.5 transition-all`}
              >
                 {isEditMode ? 'Update Jadwal' : 'Tambah Jadwal'}
              </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManajemenJadwal;

