import React, { useState, useEffect } from 'react';
import { useMataKuliahStore, type MataKuliah } from '../../store/useMataKuliahStore';
import { 
  HiOutlineCheck,
} from 'react-icons/hi2';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { useNavigate } from 'react-router-dom';

const ManajemenMateri: React.FC = () => {
  const navigate = useNavigate();
  const { mataKuliahList, fetchMataKuliah } = useMataKuliahStore();
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  useEffect(() => {
    fetchMataKuliah();
  }, [fetchMataKuliah]);

  const selectedCourse = mataKuliahList.find(mk => mk.id === selectedCourseId);

  // Real materials logic based on pertemuan data
  const meetings = selectedCourse?.pertemuan || [];
  const totalMeetings = selectedCourse?.jumlahPertemuan || meetings.length || 14;
  const filledMaterialsCount = meetings.filter(p => p.materi && p.materi.length > 0).length;

  return (
    <div className="p-8 bg-[#F3F4F6] min-h-screen pb-20">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-1">Menu Materi</h1>
        <p className="text-sm text-gray-500 font-medium">Pilih kursus → Lihat jadwal ({totalMeetings} sesi) → Klik Add Materi per pertemuan</p>
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
                className={`w-56 h-16 rounded-xl transition-all border-2 flex items-center justify-between px-6 font-bold text-xs ${
                  selectedCourseId === mk.id 
                    ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100" 
                    : "bg-white border-gray-100 text-gray-400 hover:border-gray-200"
                }`}
              >
                <span className="truncate pr-2">{mk.nama}</span>
                {selectedCourseId === mk.id && <HiOutlineCheck className="text-lg shrink-0" />}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pertemuan Section */}
      {selectedCourseId && (
        <Card className="rounded-[2rem] border-none shadow-sm bg-white overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="p-8 border-b border-gray-50 bg-gray-50/20">
            <h2 className="text-xl font-black text-gray-900">
              Materi Pembelajaran: {selectedCourse?.nama}
            </h2>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Kelola Materi per Sesi ({totalMeetings} Pertemuan)</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-white">
                <tr className="border-b border-gray-50">
                  <th className="py-4 px-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">Sesi</th>
                  <th className="py-4 px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Topik</th>
                  <th className="py-4 px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Tanggal</th>
                  <th className="py-4 px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Video</th>
                  <th className="py-4 px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Modul PDF</th>
                  <th className="py-4 px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Tugas PG</th>
                  <th className="py-4 px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
                  <th className="py-4 px-8 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {meetings.map((p) => {
                  const hasMateri = p.materi && p.materi.length > 0;
                  const videoCount = p.materi?.filter((m: any) => m.tipe === 'VIDEO').length || 0;
                  const pdfCount = p.materi?.filter((m: any) => m.tipe === 'PDF').length || 0;
                  
                  return (
                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-5 px-8">
                        <span className="text-xs font-black text-indigo-600">P-{p.urutan}</span>
                      </td>
                      <td className="py-5 px-4 text-xs font-bold text-gray-700">{p.topik || 'Belum diatur'}</td>
                      <td className="py-5 px-4 text-xs font-bold text-gray-500">
                        {p.tgl ? new Date(p.tgl).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }) : '—'}
                      </td>
                      <td className="py-5 px-4 text-center">
                        {videoCount > 0 ? (
                          <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 px-3 py-1 rounded-lg">{videoCount} Video</span>
                        ) : <span className="text-gray-200">—</span>}
                      </td>
                      <td className="py-5 px-4 text-center">
                        {pdfCount > 0 ? (
                          <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 px-3 py-1 rounded-lg">{pdfCount} PDF</span>
                        ) : <span className="text-gray-200">—</span>}
                      </td>
                      <td className="py-5 px-4 text-center">
                        {p.topik ? (
                          <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 px-3 py-1 rounded-lg">✓ Ada</span>
                        ) : <span className="text-gray-200">—</span>}
                      </td>
                      <td className="py-5 px-4 text-center">
                        <Badge className={`rounded-full px-4 py-1 text-[9px] font-black uppercase tracking-wider border-none ${
                          hasMateri ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400'
                        }`}>
                          {hasMateri ? 'Lengkap' : 'Kosong'}
                        </Badge>
                      </td>
                      <td className="py-5 px-8 text-right">
                        <Button 
                          onClick={() => navigate(`/admin/add-materi?pertemuanId=${p.id}`)}
                          className={`h-8 px-6 rounded-full text-[10px] font-bold uppercase transition-all ${
                            hasMateri ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : 'bg-indigo-600 text-white hover:bg-indigo-700'
                          }`}
                        >
                          {hasMateri ? 'Edit' : 'Add Materi'}
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="p-8 bg-indigo-600 flex items-center justify-between">
            <div className="text-white">
              <p className="text-sm font-bold opacity-80">Progres Kelengkapan Materi</p>
              <p className="text-[10px] font-medium opacity-60 uppercase tracking-widest mt-1">Lengkapi {totalMeetings} materi untuk publish</p>
            </div>
            <div className="flex items-center gap-6">
               <div className="text-right">
                 <p className="text-2xl font-black text-white leading-none">{filledMaterialsCount}/{totalMeetings}</p>
                 <p className="text-[9px] font-bold text-indigo-200 uppercase mt-1">Sesi Terisi</p>
               </div>
               <div className="w-64 h-3 bg-white/10 rounded-full overflow-hidden border border-white/10">
                  <div 
                    className="h-full bg-white shadow-[0_0_20px_rgba(255,255,255,0.4)] transition-all duration-1000" 
                    style={{ width: `${(filledMaterialsCount / totalMeetings) * 100}%` }}
                  ></div>
               </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ManajemenMateri;
