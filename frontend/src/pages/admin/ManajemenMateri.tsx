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

  // Dummy materials data based on screenshot
  const materials = [
    { id: 'P1', topic: 'Intro Web Dev', date: '5 Mar', type: 'Zoom', video: '1 Video', reflection: 'Ada', pg: '10 PG', status: 'Lengkap' },
    { id: 'P2', topic: 'HTML Dasar', date: '12 Mar', type: 'Zoom', video: '2 Video', reflection: 'Ada', pg: '10 PG', status: 'Lengkap' },
    { id: 'P3', topic: 'CSS Layout', date: '19 Mar', type: 'Micro', video: '1 Video', reflection: 'Belum', pg: '—', status: 'Kurang' },
    { id: 'P4', topic: 'Belum Ada Topik', date: '26 Mar', type: '—', video: '—', reflection: '—', pg: '—', status: 'Kosong' },
  ];

  return (
    <div className="p-8 bg-[#F3F4F6] min-h-screen pb-20">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-1">Menu Materi</h1>
        <p className="text-sm text-gray-500 font-medium">Pilih kursus → Lihat 14 jadwal → Klik Add Materi per pertemuan</p>
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
                className={`w-48 h-16 rounded-xl transition-all border-2 flex items-center justify-between px-6 font-bold text-xs ${
                  selectedCourseId === mk.id 
                    ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100" 
                    : "bg-white border-gray-100 text-gray-400 hover:border-gray-200"
                }`}
              >
                {mk.nama.split(' ').slice(0, 3).join(' ')}
                {selectedCourseId === mk.id && <HiOutlineCheck className="text-lg" />}
              </button>
            ))}
            <button className="w-48 h-16 rounded-xl border-2 border-gray-100 text-gray-300 flex items-center justify-center hover:border-gray-200 transition-all text-xs font-bold">
               Web Dev Intermediate
            </button>
            <button className="w-48 h-16 rounded-xl border-2 border-gray-100 text-gray-300 flex items-center justify-center hover:border-gray-200 transition-all text-xs font-bold">
               Kecerdasan AI Dasar
            </button>
          </div>
        </CardContent>
      </Card>

      {/* 14 Pertemuan Section */}
      {selectedCourseId && (
        <Card className="rounded-[2rem] border-none shadow-sm bg-white overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="p-8 border-b border-gray-50">
            <h2 className="text-base font-bold text-gray-900">
              14 Pertemuan — {selectedCourse?.nama}
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-white">
                <tr>
                  <th className="py-4 px-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">Pertemuan</th>
                  <th className="py-4 px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Topik</th>
                  <th className="py-4 px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Tanggal</th>
                  <th className="py-4 px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Jenis</th>
                  <th className="py-4 px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Video</th>
                  <th className="py-4 px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Refleksi</th>
                  <th className="py-4 px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Latihan PG</th>
                  <th className="py-4 px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
                  <th className="py-4 px-8 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {materials.map((m) => (
                  <tr key={m.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-5 px-8">
                      <span className="text-xs font-bold text-gray-600">{m.id}</span>
                    </td>
                    <td className="py-5 px-4 text-xs font-bold text-gray-600">{m.topic}</td>
                    <td className="py-5 px-4 text-xs font-bold text-gray-600">{m.date}</td>
                    <td className="py-5 px-4">
                      {m.type !== '—' && (
                        <Badge className={`rounded-full px-3 py-0.5 text-[9px] font-bold border-none ${
                          m.type === 'Zoom' ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'
                        }`}>
                          {m.type}
                        </Badge>
                      )}
                    </td>
                    <td className="py-5 px-4 text-center">
                      {m.video !== '—' ? (
                        <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 px-3 py-1 rounded-lg">{m.video}</span>
                      ) : <span className="text-gray-200">—</span>}
                    </td>
                    <td className="py-5 px-4 text-center">
                      {m.reflection === 'Ada' ? (
                        <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 px-3 py-1 rounded-lg">✓ Ada</span>
                      ) : m.reflection === 'Belum' ? (
                        <span className="text-[10px] font-bold text-red-400 bg-red-50 px-3 py-1 rounded-lg">Belum</span>
                      ) : <span className="text-gray-200">—</span>}
                    </td>
                    <td className="py-5 px-4 text-center">
                      {m.pg !== '—' ? (
                        <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 px-3 py-1 rounded-lg">{m.pg}</span>
                      ) : <span className="text-gray-400 bg-gray-100 px-3 py-1 rounded-lg text-[10px]"> — </span>}
                    </td>
                    <td className="py-5 px-4 text-center">
                      <Badge className={`rounded-full px-4 py-1 text-[9px] font-black uppercase tracking-wider border-none ${
                        m.status === 'Lengkap' ? 'bg-emerald-100 text-emerald-600' : 
                        m.status === 'Kurang' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-400'
                      }`}>
                        {m.status}
                      </Badge>
                    </td>
                    <td className="py-5 px-8 text-right">
                      <Button 
                        onClick={() => navigate('/admin/materi/add')}
                        className={`h-8 px-6 rounded-full text-[10px] font-bold uppercase transition-all ${
                          m.status === 'Kosong' ? 'bg-gray-400 text-white' : 
                          m.status === 'Kurang' ? 'bg-red-200 text-red-700 hover:bg-red-300' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {m.status === 'Kosong' ? 'Kosong' : 'Edit'}
                      </Button>
                    </td>
                  </tr>
                ))}
                {/* Dummy for 5-14 */}
                <tr>
                   <td colSpan={9} className="py-6 px-8 text-[11px] font-bold text-gray-400 italic">
                      P5–P14 &nbsp;&nbsp;&nbsp; Belum ada materi - Tambahkan satu per satu
                   </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="p-8 bg-white border-t border-gray-50 flex items-center justify-between">
            <p className="text-xs text-gray-400 font-bold">
              3/14 pertemuan sudah ada materi
            </p>
            <div className="w-64 h-2.5 bg-gray-100 rounded-full overflow-hidden">
               <div className="h-full bg-indigo-600 w-[21%] rounded-full shadow-lg shadow-indigo-200"></div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ManajemenMateri;
