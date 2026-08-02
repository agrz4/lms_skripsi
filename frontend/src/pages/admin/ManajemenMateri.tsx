import React, { useState, useEffect } from 'react';
import { useMataKuliahStore } from '../../store/useMataKuliahStore';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from 'react-router-dom';

const ManajemenMateri: React.FC = () => {
  const navigate = useNavigate();
  const { mataKuliahList, fetchMataKuliah } = useMataKuliahStore();
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  useEffect(() => {
    fetchMataKuliah();
  }, [fetchMataKuliah]);

  // Automatically select the first course on load
  useEffect(() => {
    if (mataKuliahList.length > 0 && !selectedCourseId) {
      setSelectedCourseId(mataKuliahList[0].id);
    }
  }, [mataKuliahList, selectedCourseId]);

  const selectedCourse = mataKuliahList.find(mk => mk.id === selectedCourseId);

  // Real materials logic based on pertemuan data
  const meetings = selectedCourse?.pertemuan || [];
  const totalMeetings = selectedCourse?.jumlahPertemuan || meetings.length || 14;
  const filledMaterialsCount = meetings.filter(p => p.materi && p.materi.length > 0).length;

  const formatTanggal = (dateStr?: string) => {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', timeZone: 'UTC' });
  };

  const getJenisPembelajaran = (p: any) => {
    if (!p.materi || p.materi.length === 0) return '—';
    
    const hasZoom = p.materi.some((m: any) => 
      (m.videoUrl && (m.videoUrl.includes('zoom.us') || m.videoUrl.includes('zoomLink'))) ||
      (m.nama && (m.nama.includes('Zoom') || m.nama.includes('Rekaman Zoom')))
    );
    if (hasZoom) return 'Zoom';
    
    const hasMicro = p.materi.some((m: any) => 
      (m.nama && m.nama.includes('Micro Learning')) || 
      (m.videoUrl && (m.videoUrl.includes('tiktok') || m.videoUrl.includes('youtube') || m.videoUrl.includes('instagram')))
    );
    if (hasMicro) return 'Micro';
    
    const hasVideo = p.materi.some((m: any) => m.videoUrl);
    if (hasVideo) return 'Zoom';
    
    return 'PDF';
  };

  const getMeetingStatus = (p: any) => {
    const hasMateri = p.materi && p.materi.length > 0;
    if (!hasMateri) return '—';
    
    const videoCount = p.materi ? p.materi.filter((m: any) => m.videoUrl).length : 0;
    const hasRef = p.materi && p.materi.some((m: any) => m.refleksi && m.refleksi.trim().length > 0);
    const soalCount = p.soal ? p.soal.length : 0;
    
    const isComplete = videoCount > 0 && hasRef && soalCount > 0;
    return isComplete ? 'Lengkap' : 'Kurang';
  };

  // Group trailing empty sessions
  const lastActiveIndex = [...meetings].reverse().findIndex(s => {
    const hasDate = !!s.tgl;
    const hasCustomTopic = s.topik && s.topik !== `Pertemuan ${s.urutan}`;
    const hasMateri = s.materi && s.materi.length > 0;
    return hasDate || hasCustomTopic || hasMateri;
  });

  const lastActiveUrutan = lastActiveIndex !== -1 ? (totalMeetings - lastActiveIndex) : 0;
  const showUpToUrutan = Math.min(totalMeetings, lastActiveUrutan + 1);

  const individualMeetings = meetings.filter(s => s.urutan <= showUpToUrutan);
  const groupedMeetings = meetings.filter(s => s.urutan > showUpToUrutan);

  return (
    <div className="p-8 bg-[#F3F4F6] min-h-screen pb-20 text-left font-sans">
      {/* Title block */}
      <div className="mb-8">
        <h1 className="text-2xl font-black text-gray-900 mb-1">Menu Materi</h1>
        <p className="text-xs text-gray-500 font-medium">
          Pilih kursus &rarr; Lihat {totalMeetings} jadwal &rarr; Klik Add Materi per pertemuan
        </p>
      </div>

      {/* Pilih Kursus Card */}
      <Card className="rounded-xl border border-gray-200 shadow-sm bg-white mb-8">
        <CardContent className="p-6">
          <h2 className="text-sm font-bold text-gray-900 mb-4">Pilih Kursus</h2>
          <div className="flex flex-wrap gap-3">
            {mataKuliahList.map((mk) => {
              const isSelected = selectedCourseId === mk.id;
              return (
                <button
                  key={mk.id}
                  onClick={() => setSelectedCourseId(mk.id)}
                  className={`px-5 py-3 rounded-lg transition-all border font-bold text-xs flex items-center gap-1.5 cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${
                    isSelected 
                      ? "bg-[#efeefd] border-[#c5c0f9] text-[#5850ec] shadow-sm font-extrabold" 
                      : "bg-white border-gray-250 text-gray-400 hover:bg-gray-50 hover:border-gray-300"
                  }`}
                >
                  <span>{mk.nama}</span>
                  {isSelected && <span className="font-semibold">✓</span>}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Pertemuan Table Card */}
      {selectedCourseId && (
        <Card className="rounded-xl border border-gray-200 shadow-sm bg-white overflow-hidden">
          <div className="p-6 border-b border-gray-150 bg-white">
            <h2 className="text-base font-black text-gray-900">
              {totalMeetings} Pertemuan — {selectedCourse?.nama}
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-150 bg-white">
                  <th className="py-4 px-6 text-[10px] font-black text-gray-900 uppercase tracking-wider">PERTEMUAN</th>
                  <th className="py-4 px-4 text-[10px] font-black text-gray-900 uppercase tracking-wider">TOPIK</th>
                  <th className="py-4 px-4 text-[10px] font-black text-gray-900 uppercase tracking-wider">TANGGAL</th>
                  <th className="py-4 px-4 text-[10px] font-black text-gray-900 uppercase tracking-wider">JENIS</th>
                  <th className="py-4 px-4 text-[10px] font-black text-gray-900 uppercase tracking-wider">VIDEO</th>
                  <th className="py-4 px-4 text-[10px] font-black text-gray-900 uppercase tracking-wider">LATIHAN</th>
                  <th className="py-4 px-4 text-[10px] font-black text-gray-900 uppercase tracking-wider">TES FORMATIF</th>
                  <th className="py-4 px-4 text-[10px] font-black text-gray-900 uppercase tracking-wider">STATUS</th>
                  <th className="py-4 px-6 text-[10px] font-black text-gray-900 uppercase tracking-wider text-center">AKSI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {individualMeetings.map((p) => {
                  const hasMateri = p.materi && p.materi.length > 0;
                  const videoCount = p.materi ? p.materi.filter((m: any) => m.videoUrl).length : 0;
                  const hasRefleksi = p.materi && p.materi.some((m: any) => m.refleksi && m.refleksi.trim().length > 0);
                  const soalCount = p.soal ? p.soal.length : 0;
                  
                  const jenis = getJenisPembelajaran(p);
                  const status = getMeetingStatus(p);

                  const showTopic = p.topik && p.topik !== `Pertemuan ${p.urutan}` ? p.topik : 'Belum Ada Topik';
                  const isTopicDefault = showTopic === 'Belum Ada Topik';

                  return (
                    <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 px-6 text-xs font-semibold text-gray-800">
                        P{p.urutan}
                      </td>
                      <td className={`py-4 px-4 text-xs font-semibold ${isTopicDefault ? 'text-gray-400 font-medium' : 'text-gray-800'}`}>
                        {showTopic}
                      </td>
                      <td className="py-4 px-4 text-xs font-medium text-gray-500">
                        {p.tgl ? formatTanggal(p.tgl) : '—'}
                      </td>
                      <td className="py-4 px-4">
                        {jenis === 'Zoom' && (
                          <span className="bg-[#efeefd] text-[#5850ec] px-2.5 py-1 rounded-md text-[10px] font-bold">Zoom</span>
                        )}
                        {jenis === 'Micro' && (
                          <span className="bg-[#e6f4ea] text-[#137333] px-2.5 py-1 rounded-md text-[10px] font-bold">Micro</span>
                        )}
                        {jenis === 'PDF' && (
                          <span className="bg-gray-100 text-gray-600 px-2.5 py-1 rounded-md text-[10px] font-bold">PDF</span>
                        )}
                        {jenis === '—' && <span className="text-gray-400">—</span>}
                      </td>
                      <td className="py-4 px-4">
                        {videoCount > 0 ? (
                          <span className="bg-[#e6f4ea] text-[#137333] px-2.5 py-1 rounded-md text-[10px] font-bold">
                            {videoCount} Video
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        {hasMateri ? (
                          hasRefleksi ? (
                            <span className="text-[#137333] text-xs font-bold">✓ Ada</span>
                          ) : (
                            <span className="bg-[#fce8e6] text-[#c5221f] px-2.5 py-1 rounded-md text-[10px] font-bold">Belum</span>
                          )
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        {hasMateri ? (
                          soalCount > 0 ? (
                            <span className="bg-[#efeefd] text-[#5850ec] px-2.5 py-1 rounded-md text-[10px] font-bold">
                              {soalCount} PG
                            </span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        {status === 'Lengkap' && (
                          <span className="bg-[#e6f4ea] text-[#137333] px-2.5 py-1 rounded-md text-[10px] font-bold uppercase">Lengkap</span>
                        )}
                        {status === 'Kurang' && (
                          <span className="bg-[#fce8e6] text-[#c5221f] px-2.5 py-1 rounded-md text-[10px] font-bold uppercase">Kurang</span>
                        )}
                        {status === '—' && <span className="text-gray-400">—</span>}
                      </td>
                      <td className="py-4 px-6 text-center">
                        {hasMateri ? (
                          <Button
                            onClick={() => navigate(`/admin/add-materi?pertemuanId=${p.id}`)}
                            className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 rounded-lg px-4 py-1.5 h-8 text-[11px] font-bold transition-all shadow-sm"
                          >
                            Edit
                          </Button>
                        ) : (
                          <Button
                            onClick={() => navigate(`/admin/add-materi?pertemuanId=${p.id}`)}
                            className="bg-[#374151] hover:bg-[#1f2937] text-white border-none rounded-full px-4 py-1.5 h-8 text-[11px] font-bold transition-all shadow-sm"
                          >
                            Kosong
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {groupedMeetings.length > 0 && (
                  <tr className="bg-[#f8fafc]/80">
                    <td className="py-4 px-6 text-xs font-semibold text-gray-400">
                      {groupedMeetings.length > 1 
                        ? `P${groupedMeetings[0].urutan}-P${groupedMeetings[groupedMeetings.length - 1].urutan}`
                        : `P${groupedMeetings[0].urutan}`}
                    </td>
                    <td colSpan={8} className="py-4 px-4 text-xs font-medium text-gray-450 italic">
                      Belum ada materi · Tambahkan satu per satu
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Progress bar footer matching UI mockup */}
          <div className="p-6 bg-white flex items-center justify-between border-t border-gray-150">
            <span className="text-xs text-gray-400 font-bold italic">
              {filledMaterialsCount}/{totalMeetings} pertemuan sudah ada materi
            </span>
            <div className="flex items-center gap-2">
              <div className="w-64 h-2.5 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
                <div 
                  className="h-full bg-[#5850ec] rounded-full transition-all duration-500" 
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
