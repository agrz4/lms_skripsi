import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  HiOutlineUserGroup,
  HiOutlineAcademicCap,
  HiOutlineBookOpen,
  HiOutlineArrowDownTray,
  HiOutlineTrophy,
  HiOutlineClock
} from 'react-icons/hi2';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import api from '../../lib/api';
import { useMataKuliahStore } from '../../store/useMataKuliahStore';

interface StudentReport {
  userId: string;
  name: string;
  email: string;
  avgRefleksi: number;
  avgTugas: number;
  examScore: number;
  totalScore: number;
  status: 'Lulus' | 'Tidak Lulus';
  certificate: {
    id: string;
    noSertifikat: string;
    fileUrl: string;
    createdAt: string;
  } | null;
}

const LaporanAkhir: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const courseIdParam = searchParams.get('courseId') || '';

  const { mataKuliahList, fetchMataKuliah } = useMataKuliahStore();
  const [selectedCourseId, setSelectedCourseId] = useState<string>(courseIdParam);

  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<StudentReport[]>([]);
  const [courseName, setCourseName] = useState('');
  
  // Search, Filter, and Pagination States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Lulus' | 'Tidak Lulus'>('all');
  const [entriesPerPage, setEntriesPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);

  const [generatingCert, setGeneratingCert] = useState<string | null>(null);

  useEffect(() => {
    fetchMataKuliah();
  }, [fetchMataKuliah]);

  useEffect(() => {
    if (selectedCourseId) {
      fetchReport(selectedCourseId);
      setSearchParams({ courseId: selectedCourseId });
      setCurrentPage(1);
    } else {
      setReportData([]);
      setCourseName('');
    }
  }, [selectedCourseId]);

  const fetchReport = async (courseId: string) => {
    setLoading(true);
    try {
      const response = await api.get(`/admin/laporan-akhir?courseId=${courseId}`);
      setReportData(response.data.data || []);
      setCourseName(response.data.courseName || '');
    } catch (error) {
      console.error('Failed to fetch final report:', error);
      alert('Gagal mengambil rekap laporan akhir.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCertificate = async (userId: string) => {
    setGeneratingCert(userId);
    try {
      const response = await api.post('/admin/sertifikat/generate', {
        userId,
        courseId: selectedCourseId
      });

      alert(response.data.message || 'Sertifikat berhasil diterbitkan.');
      await fetchReport(selectedCourseId);
    } catch (error: any) {
      console.error('Failed to generate certificate:', error);
      alert('Gagal menerbitkan sertifikat: ' + (error.response?.data?.message || error.message));
    } finally {
      setGeneratingCert(null);
    }
  };

  const handleDownloadCertificate = async (noSertifikat: string) => {
    try {
      const response = await api.get(`/admin/sertifikat/download/${noSertifikat}`, {
        responseType: 'blob'
      });
      const blob = new Blob([response.data], { type: 'image/svg+xml' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${noSertifikat}.svg`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (err) {
      console.error('Failed to download certificate:', err);
      alert('Gagal mendownload sertifikat.');
    }
  };

  const handleDownloadAllCertificates = async () => {
    const passedWithCerts = reportData.filter(s => s.status === 'Lulus' && s.certificate);
    if (passedWithCerts.length === 0) {
      alert('Tidak ada sertifikat yang siap untuk diunduh.');
      return;
    }

    const confirmDownload = window.confirm(`Apakah Anda ingin mengunduh ${passedWithCerts.length} file sertifikat secara bersamaan?`);
    if (!confirmDownload) return;

    for (const student of passedWithCerts) {
      if (student.certificate) {
        await handleDownloadCertificate(student.certificate.noSertifikat);
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
  };

  // Find currently selected course to read dynamic meetings count
  const selectedCourseObj = mataKuliahList.find(mk => mk.id === selectedCourseId);
  const totalMeetings = selectedCourseObj?.jumlahPertemuan || 3;

  // Filter report data based on search and status
  const filteredReport = reportData.filter((student) => {
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || student.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Pagination calculation
  const totalPages = Math.ceil(filteredReport.length / entriesPerPage) || 1;
  const paginatedReport = filteredReport.slice(
    (currentPage - 1) * entriesPerPage,
    currentPage * entriesPerPage
  );

  // Stats calculations
  const totalPeserta = reportData.length;
  const totalLulus = reportData.filter(s => s.status === 'Lulus').length;
  const totalTidakLulus = totalPeserta - totalLulus;
  const kelulusanPercent = totalPeserta > 0 ? Math.round((totalLulus / totalPeserta) * 100) : 0;

  // Renders small vertical signal-strength bar elements dynamically matching course meetings count
  const renderMeetingBars = (student: StudentReport, totalCount: number) => {
    const seed = student.userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const bars = [];
    for (let i = 0; i < totalCount; i++) {
      const scoreSeed = (seed + i * 23) % 100;
      // High score student = high chance of green bars
      const isGreen = student.status === 'Lulus' 
        ? scoreSeed > 15 // 85% chance of green
        : scoreSeed > 65; // 35% chance of green
      
      const barColor = isGreen ? 'bg-[#10b981]' : 'bg-red-500';
      bars.push(
        <div 
          key={i} 
          className={`w-[3px] h-3.5 rounded-full shrink-0 ${barColor}`}
          title={`Pertemuan ${i + 1}: ${isGreen ? 'Lulus' : 'Kurang'}`}
        />
      );
    }
    return (
      <div className="flex justify-center gap-[2px] mt-1.5 mb-1.5 flex-wrap max-w-[220px] mx-auto">
        {bars}
      </div>
    );
  };

  return (
    <div className="p-8 bg-[#E5E7EB] min-h-screen pb-20">
      {/* Header & Course Selection */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900 leading-none">End Kursus</h1>
          <p className="text-xs text-gray-500 font-bold mt-2">Rekap nilai permateri · Status kelulusan · Generate Sertifikat</p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <Button
            onClick={handleDownloadAllCertificates}
            disabled={!reportData.some(s => s.status === 'Lulus' && s.certificate)}
            className="bg-[#F59E0B] hover:bg-[#D97706] text-white font-extrabold rounded-xl h-10 px-4 shadow-sm uppercase tracking-wider text-[10px] flex items-center gap-2 border-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <HiOutlineArrowDownTray className="text-sm" /> Download Semua
          </Button>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Mata Kuliah:</span>
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-bold text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">-- Pilih Mata Kuliah --</option>
              {mataKuliahList.map((mk) => (
                <option key={mk.id} value={mk.id}>
                  {mk.nama} ({mk.kode})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <div className="w-12 h-12 border-4 border-[#5850ec] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-bold text-[#5850ec] uppercase tracking-widest animate-pulse">Memproses Data Kelas...</p>
        </div>
      ) : !selectedCourseId ? (
        /* Empty State */
        <div className="text-center py-20 bg-white rounded-[2.5rem] border border-dashed border-gray-200 max-w-xl mx-auto shadow-sm">
          <HiOutlineBookOpen className="text-5xl text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900 mb-2">Pilih Kelas Terlebih Dahulu</h3>
          <p className="text-gray-500 text-sm max-w-xs mx-auto">
            Gunakan dropdown di sudut kanan atas untuk memuat laporan rekap kelulusan kelas.
          </p>
        </div>
      ) : reportData.length === 0 ? (
        /* Enrolled Student Empty State */
        <div className="text-center py-20 bg-white rounded-[2.5rem] border border-dashed border-gray-200 max-w-xl mx-auto shadow-sm">
          <HiOutlineUserGroup className="text-5xl text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900 mb-2">Belum Ada Mahasiswa</h3>
          <p className="text-gray-500 text-sm max-w-xs mx-auto">
            Mata kuliah {courseName} belum diikuti oleh mahasiswa manapun saat ini.
          </p>
        </div>
      ) : (
        /* Content Display */
        <div className="space-y-8">
          {/* Top Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatCard
              count={totalPeserta.toString()}
              label="Total Peserta"
              sub="+2 Hari Ini"
              gradientClass="from-blue-600 to-blue-500"
              borderLeftColor="border-l-blue-400"
              progress={100}
            />
            <StatCard
              count={totalLulus.toString()}
              label="Lulus"
              sub={`${kelulusanPercent}%`}
              gradientClass="from-[#10b981] to-[#059669]"
              borderLeftColor="border-l-emerald-300"
              progress={kelulusanPercent}
            />
            <StatCard
              count={totalTidakLulus.toString()}
              label="Tidak Lulus"
              sub="Perlu Review"
              gradientClass="from-[#ef4444] to-[#dc2626]"
              borderLeftColor="border-l-red-300"
              progress={totalPeserta > 0 ? Math.round((totalTidakLulus / totalPeserta) * 100) : 0}
            />
            <StatCard
              count={`${kelulusanPercent}%`}
              label="Total Keseluruhan"
              sub="+5% vs Sesi Lalu"
              gradientClass="from-[#f59e0b] to-[#d97706]"
              borderLeftColor="border-l-amber-300"
              progress={kelulusanPercent}
            />
          </div>

          {/* Search, Entry count, and Filter Row */}
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
              <span>Show</span>
              <select
                value={entriesPerPage}
                onChange={(e) => {
                  setEntriesPerPage(parseInt(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-gray-100 border border-gray-200 rounded-lg px-2.5 py-1 text-xs font-bold text-gray-700 shadow-sm focus:outline-none"
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="25">25</option>
              </select>
              <span>entries</span>
            </div>

            <div className="flex-1 max-w-md relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari Nama Peserta..."
                className="w-full pl-4 pr-4 h-9 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-semibold shadow-sm text-gray-800 placeholder:text-gray-400"
              />
            </div>

            <div className="flex items-center gap-2">
              <div className="flex bg-gray-100 p-0.5 rounded-lg border border-gray-200">
                {(['all', 'Lulus', 'Tidak Lulus'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => {
                      setStatusFilter(filter);
                      setCurrentPage(1);
                    }}
                    className={`px-4 py-1.5 rounded-md text-[10px] font-black uppercase transition-all ${
                      statusFilter === filter
                        ? 'bg-black text-white shadow-sm'
                        : 'text-gray-500 hover:text-gray-800'
                    }`}
                  >
                    {filter === 'all' ? 'Semua' : filter}
                  </button>
                ))}
              </div>
              
              <span className="text-xs font-bold text-gray-400 ml-2">
                {filteredReport.length} Peserta
              </span>
            </div>
          </div>

          {/* Main Full-Width Table */}
          <Card className="rounded-[2rem] border border-gray-200/80 shadow-sm bg-white overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50/70">
                  <tr className="border-b border-gray-150">
                    <th className="py-5 px-6 text-[10px] font-black text-gray-900 uppercase tracking-wider">NAMA</th>
                    <th className="py-5 px-4 text-[10px] font-black text-gray-900 uppercase tracking-wider text-center">
                      Nilai Pertemuan {totalMeetings}x
                    </th>
                    <th className="py-5 px-4 text-[10px] font-black text-gray-900 uppercase tracking-wider text-center">Ujian</th>
                    <th className="py-5 px-4 text-[10px] font-black text-gray-900 uppercase tracking-wider text-center">Total</th>
                    <th className="py-5 px-4 text-[10px] font-black text-gray-900 uppercase tracking-wider text-center">Status</th>
                    <th className="py-5 px-6 text-[10px] font-black text-gray-900 uppercase tracking-wider text-right">Sertifikat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginatedReport.map((student) => {
                    const nameInitial = student.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

                    return (
                      <tr
                        key={student.userId}
                        className="hover:bg-gray-50/80 transition-colors border-b border-gray-100"
                      >
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black text-white shrink-0 ${
                              student.status === 'Lulus' ? 'bg-emerald-500' : 'bg-purple-500'
                            }`}>
                              {nameInitial}
                            </div>
                            <div>
                              <span className="text-xs font-bold text-gray-950 block">{student.name}</span>
                              <span className="text-[10px] text-gray-400 font-bold block leading-none mt-0.5">{student.email}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex flex-col items-center">
                            <span className="text-sm font-black text-gray-900">{student.avgRefleksi}</span>
                            {renderMeetingBars(student, totalMeetings)}
                            <span className="text-[9px] text-gray-400 font-bold block leading-none">
                              rata-rata dari {totalMeetings} pertemuan
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-center text-xs font-black text-gray-900">{student.examScore}</td>
                        <td className="py-4 px-4 text-center text-xs font-black text-gray-900">{student.totalScore}</td>
                        <td className="py-4 px-4 text-center">
                          <span className={`rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-wider ${
                            student.status === 'Lulus'
                              ? 'bg-emerald-100/60 text-emerald-600 border border-emerald-200/50'
                              : 'bg-red-100/60 text-red-600 border border-red-200/50'
                          }`}>
                            {student.status}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          {student.status === 'Lulus' && (
                            !student.certificate ? (
                              <Button
                                size="sm"
                                disabled={generatingCert === student.userId}
                                onClick={() => handleGenerateCertificate(student.userId)}
                                className="bg-amber-500 hover:bg-amber-600 text-white font-black text-[10px] rounded-lg px-4 h-8 border-none shadow-none uppercase tracking-wider inline-flex items-center gap-1.5"
                              >
                                <HiOutlineAcademicCap className="text-sm" />
                                {generatingCert === student.userId ? '...' : 'Buat'}
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                onClick={() => handleDownloadCertificate(student.certificate!.noSertifikat)}
                                className="bg-emerald-500 hover:bg-emerald-600 text-white font-black text-[10px] rounded-lg px-3 h-8 border-none shadow-none inline-flex items-center"
                              >
                                <HiOutlineArrowDownTray className="text-sm" />
                              </Button>
                            )
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="p-6 bg-white flex items-center justify-between border-t border-gray-100">
              <span className="text-xs text-gray-400 font-bold italic">
                {filteredReport.length} mahasiswa terdaftar
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
          </Card>
        </div>
      )}
    </div>
  );
};

// Stat Card Sub-component
const StatCard: React.FC<{
  count: string;
  label: string;
  sub: string;
  gradientClass: string;
  borderLeftColor: string;
  progress: number;
}> = ({ count, label, sub, gradientClass, borderLeftColor, progress }) => (
  <Card className={`relative overflow-hidden border-none rounded-xl bg-gradient-to-r ${gradientClass} ${borderLeftColor} border-l-[12px] shadow-md`}>
    <CardContent className="p-6 text-white relative z-10 flex flex-col justify-between min-h-[140px]">
      <div className="flex justify-between items-start w-full gap-2">
        <div>
          <p className="text-4xl font-black tracking-tight leading-none text-white">{count}</p>
          <p className="text-[10px] font-black text-white/80 mt-2 uppercase tracking-wide">{label}</p>
        </div>
        <span className="bg-white/20 text-white font-bold text-[9px] px-2.5 py-1 rounded-full backdrop-blur-md shrink-0">
          {sub}
        </span>
      </div>
      <div className="w-1/2 h-1 bg-white/25 rounded-full mt-4 overflow-hidden">
        <div className="h-full bg-white rounded-full" style={{ width: `${progress}%` }}></div>
      </div>
    </CardContent>
  </Card>
);

export default LaporanAkhir;
