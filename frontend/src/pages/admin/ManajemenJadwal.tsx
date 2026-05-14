import React, { useState, useEffect } from 'react';
import { useMataKuliahStore, type MataKuliah } from '../../store/useMataKuliahStore';
import { usePengajarStore } from '../../store/usePengajarStore';
import { 
  HiOutlinePlus, 
  HiOutlinePencilSquare,
} from 'react-icons/hi2';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const ManajemenJadwal: React.FC = () => {
  const { mataKuliahList, fetchMataKuliah } = useMataKuliahStore();
  const { pengajarList, fetchPengajar } = usePengajarStore();

  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  useEffect(() => {
    fetchMataKuliah();
    fetchPengajar();
  }, [fetchMataKuliah, fetchPengajar]);

  const selectedCourse = mataKuliahList.find(mk => mk.id === selectedCourseId);

  // Dummy sessions data based on screenshot
  const sessions = [
    { id: 1, date: '05 Mar 2025', day: 'Rabu', time: '09:00', topic: 'Intro to HTML', instructor: 'Dr. Ahmad Subarjo', initial: 'AS', status: 'Selesai' },
    { id: 2, date: '12 Mar 2025', day: 'Rabu', time: '09:00', topic: 'HTML Semantic', instructor: 'Dr. Ahmad Subarjo', initial: 'AS', status: 'Selesai' },
    { id: 3, date: '19 Mar 2025', day: 'Rabu', time: '09:00', topic: 'CSS Layout', instructor: 'Siti Aminah, Mkom', initial: 'SA', status: 'Berlangsung' },
    { id: 4, date: '', day: '', time: '', topic: '', instructor: '', initial: '', status: 'Terjadwal' },
  ];

  return (
    <div className="p-8 bg-[#F3F4F6] min-h-screen pb-20">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-1">Menu Penjadwalan</h1>
        <p className="text-sm text-gray-500 font-medium">Pilih kursus → Tabel jadwal → Add jadwal per pertemuan hingga lengkap</p>
      </div>

      {/* Pilih Kursus Section */}
      <Card className="rounded-[2rem] border-none shadow-sm bg-white mb-8">
        <CardContent className="p-8">
          <h2 className="text-sm font-bold text-gray-900 mb-4">Pilih Kursus</h2>
          <div className="flex flex-wrap gap-4">
            {mataKuliahList.map((mk) => (
              <button
                key={mk.id}
                onClick={() => setSelectedCourseId(mk.id)}
                className={`w-40 h-16 rounded-xl transition-all border-2 flex items-center justify-center font-bold text-xs ${
                  selectedCourseId === mk.id 
                    ? "bg-indigo-100 border-indigo-500 text-indigo-700 shadow-sm" 
                    : "bg-white border-gray-100 text-gray-400 hover:border-gray-200"
                }`}
              >
                {mk.nama.split(' ').slice(0, 2).join(' ')}
              </button>
            ))}
            <button className="w-40 h-16 rounded-xl border-2 border-dashed border-gray-200 text-gray-300 flex items-center justify-center hover:border-gray-300 transition-all">
               <HiOutlinePlus />
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Tabel Jadwal Section */}
      {selectedCourseId && (
        <Card className="rounded-[2rem] border-none shadow-sm bg-white overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="p-6 border-b border-gray-50 flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-900">
              Step 2: Tabel Jadwal — {selectedCourse?.nama} (14 Pertemuan)
            </h2>
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-[10px] px-4 py-2">
              <HiOutlinePlus className="mr-1" /> Add Jadwal
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <tbody className="divide-y divide-gray-50">
                {sessions.map((s) => (
                  <tr key={s.id} className={`${s.id % 2 === 1 ? 'bg-white' : 'bg-indigo-50/30'} hover:bg-gray-50/50 transition-colors`}>
                    <td className="py-5 px-8">
                      <span className="text-[11px] font-bold text-gray-500">Pertemuan {s.id}</span>
                    </td>
                    <td className="py-5 px-4 text-[11px] font-bold text-gray-900">{s.date || '—'}</td>
                    <td className="py-5 px-4 text-[11px] font-bold text-gray-400">{s.day ? `${s.day} · ${s.time}` : '—'}</td>
                    <td className="py-5 px-4 text-[11px] font-bold text-gray-900">{s.topic || '—'}</td>
                    <td className="py-5 px-4">
                      {s.instructor ? (
                        <div className="flex items-center gap-2">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-black text-white ${s.id % 2 === 0 ? 'bg-emerald-500' : 'bg-indigo-500'}`}>
                            {s.initial}
                          </div>
                          <span className="text-[11px] font-bold text-gray-600">{s.instructor}</span>
                        </div>
                      ) : '—'}
                    </td>
                    <td className="py-5 px-4">
                      <Badge className={`rounded-full px-3 py-0.5 text-[9px] font-black uppercase tracking-wider border-none ${
                        s.status === 'Selesai' ? 'bg-emerald-100 text-emerald-600' : 
                        s.status === 'Berlangsung' ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-400'
                      }`}>
                        {s.status}
                      </Badge>
                    </td>
                    <td className="py-5 px-8 text-right">
                      <Button variant="ghost" size="sm" className="h-8 rounded-lg text-indigo-600 hover:bg-indigo-50 font-bold text-[10px]">
                        {s.status === 'Terjadwal' ? 'Edit' : <HiOutlinePencilSquare className="text-lg" />}
                      </Button>
                    </td>
                  </tr>
                ))}
                {/* Dummy for 5-14 */}
                <tr className="bg-indigo-50/30">
                   <td colSpan={7} className="py-5 px-8 text-[11px] font-bold text-gray-400 italic">Pertemuan 5-14</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="p-6 bg-white border-t border-gray-50 flex items-center justify-between">
            <p className="text-[11px] text-gray-400 font-bold">
              4 dari 14 pertemuan terisi - Progress: 4/14
            </p>
            <div className="w-48 h-2 bg-gray-100 rounded-full overflow-hidden flex">
               <div className="h-full bg-indigo-500 w-[30%]"></div>
               <div className="h-full bg-gray-200 w-[70%]"></div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ManajemenJadwal;
