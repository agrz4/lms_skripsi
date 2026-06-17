import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  HiOutlineUserGroup,
  HiOutlineAcademicCap,
  HiOutlineXCircle,
  HiOutlineChartBar,
  HiOutlineTrophy,
  HiOutlineArrowDownTray,
  HiOutlineBookOpen,
  HiOutlineSparkles,
  HiOutlineCheckCircle
} from 'react-icons/hi2';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

  // Selection for certificate preview
  const [selectedStudent, setSelectedStudent] = useState<StudentReport | null>(null);
  const [generatingCert, setGeneratingCert] = useState<string | null>(null);

  useEffect(() => {
    fetchMataKuliah();
  }, [fetchMataKuliah]);

  useEffect(() => {
    if (selectedCourseId) {
      fetchReport(selectedCourseId);
      setSearchParams({ courseId: selectedCourseId });
    } else {
      setReportData([]);
      setCourseName('');
      setSelectedStudent(null);
    }
  }, [selectedCourseId]);

  const fetchReport = async (courseId: string) => {
    setLoading(true);
    try {
      const response = await api.get(`/admin/laporan-akhir?courseId=${courseId}`);
      setReportData(response.data.data || []);
      setCourseName(response.data.courseName || '');

      // Auto select first student if available
      if (response.data.data && response.data.data.length > 0) {
        setSelectedStudent(response.data.data[0]);
      } else {
        setSelectedStudent(null);
      }
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

      // Refresh report data
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
        // Add a small delay between downloads to prevent browser blocking
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
  };

  // Stats calculations
  const totalPeserta = reportData.length;
  const totalLulus = reportData.filter(s => s.status === 'Lulus').length;
  const totalTidakLulus = totalPeserta - totalLulus;
  const kelulusanPercent = totalPeserta > 0 ? Math.round((totalLulus / totalPeserta) * 100) : 0;

  return (
    <div className="p-8 bg-gray-200/60 min-h-screen pb-20">
      {/* Header & Course Selection */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900 leading-none">End Kursus</h1>
          <p className="text-sm text-gray-500 font-bold mt-2">Rekap nilai permateri · Status kelulusan · Generate Sertifikat</p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-black text-gray-400 uppercase tracking-wider">Mata Kuliah:</span>
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

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest animate-pulse">Memproses Data Kelas...</p>
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
              gradientClass="from-[#182C44] to-[#111E2E]"
              borderLeftColor="border-l-[#3B82F6]"
              progress={50}
            />
            <StatCard
              count={totalLulus.toString()}
              label="Lulus"
              sub="+5 Hari Ini"
              gradientClass="from-[#064E3B] to-[#043E2E]"
              borderLeftColor="border-l-[#10B981]"
              progress={40}
            />
            <StatCard
              count={totalTidakLulus.toString()}
              label="Tidak Lulus"
              sub="+0 Hari Ini"
              gradientClass="from-[#7F1D1D] to-[#601515]"
              borderLeftColor="border-l-[#EF4444]"
              progress={20}
            />
            <StatCard
              count={`${kelulusanPercent}%`}
              label="Total Kelulusan"
              sub="+20% Hari Ini"
              gradientClass="from-[#B45309] to-[#78350F]"
              borderLeftColor="border-l-[#F59E0B]"
              progress={kelulusanPercent || 75}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Main Table */}
            <div className="lg:col-span-8">
              <Card className="rounded-xl border border-gray-200/80 shadow-sm bg-white overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50/70">
                      <tr className="border-b border-gray-100">
                        <th className="py-4 px-6 text-[10px] font-black text-gray-900 uppercase tracking-wider">NAMA</th>
                        <th className="py-4 px-3 text-[10px] font-black text-gray-900 uppercase tracking-wider text-center">P1</th>
                        <th className="py-4 px-3 text-[10px] font-black text-gray-900 uppercase tracking-wider text-center">P2</th>
                        <th className="py-4 px-3 text-[10px] font-black text-gray-900 uppercase tracking-wider text-center">P3</th>
                        <th className="py-4 px-4 text-[10px] font-black text-gray-900 uppercase tracking-wider text-center">Ujian</th>
                        <th className="py-4 px-4 text-[10px] font-black text-gray-900 uppercase tracking-wider text-center">Total</th>
                        <th className="py-4 px-4 text-[10px] font-black text-gray-900 uppercase tracking-wider text-center">Status</th>
                        <th className="py-4 px-6 text-[10px] font-black text-gray-900 uppercase tracking-wider text-right">Sertifikat</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {reportData.map((student) => {
                        const isSelected = selectedStudent?.userId === student.userId;
                        const nameInitial = student.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

                        // Derived score for P3 to match layout
                        const p3Score = Math.round((student.avgRefleksi + student.avgTugas) / 2);

                        return (
                          <tr
                            key={student.userId}
                            onClick={() => setSelectedStudent(student)}
                            className={`hover:bg-gray-50/80 transition-colors cursor-pointer ${isSelected ? 'bg-indigo-50/50' : ''
                              }`}
                          >
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black text-white ${student.status === 'Lulus' ? 'bg-emerald-500' : 'bg-purple-500'
                                  }`}>
                                  {nameInitial}
                                </div>
                                <div>
                                  <span className="text-xs font-bold text-gray-950 block">{student.name}</span>
                                  <span className="text-[10px] text-gray-400 font-bold block leading-none mt-0.5">{student.email}</span>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-3 text-center">
                              <ScoreIndicator score={student.avgRefleksi} />
                            </td>
                            <td className="py-4 px-3 text-center">
                              <ScoreIndicator score={student.avgTugas} />
                            </td>
                            <td className="py-4 px-3 text-center">
                              <ScoreIndicator score={p3Score} />
                            </td>
                            <td className="py-4 px-4 text-center text-xs font-black text-gray-900">{student.examScore}</td>
                            <td className="py-4 px-4 text-center text-xs font-black text-gray-900">{student.totalScore}</td>
                            <td className="py-4 px-4 text-center">
                              <span className={`rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-wider ${student.status === 'Lulus'
                                  ? 'bg-emerald-100/60 text-emerald-600 border border-emerald-200/50'
                                  : 'bg-red-100/60 text-red-600 border border-red-200/50'
                                }`}>
                                {student.status}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-right" onClick={(e) => e.stopPropagation()}>
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
              </Card>
            </div>

            {/* Certificate Preview sidebar */}
            <div className="lg:col-span-4 flex flex-col justify-between min-h-[400px]">
              {selectedStudent ? (
                <div className="bg-gradient-to-b from-[#3B82F6] to-[#1D4ED8] p-6 rounded-2xl shadow-xl flex flex-col items-center text-center text-white relative overflow-hidden border border-blue-400/30">
                  <div className="bg-[#1D4ED8]/40 backdrop-blur-md w-full rounded-xl p-6 border border-white/10 relative z-10 flex flex-col items-center">
                    <div className="flex justify-center mb-4">
                      <HiOutlineTrophy className="text-5xl text-yellow-400 drop-shadow-lg" />
                    </div>
                    <h2 className="text-lg font-extrabold text-yellow-400 mb-1 tracking-wide">Sertifikat Kelulusan</h2>
                    <p className="text-[9px] font-black text-white/70 mb-5 uppercase tracking-widest">HybridLMS · 2025</p>

                    <div className="space-y-1 mb-5 w-full">
                      <p className="text-xl font-black text-white truncate max-w-full px-2">{selectedStudent.name}</p>
                      <p className="text-[10px] font-bold text-blue-200/80 mt-1 uppercase tracking-wide truncate max-w-full px-2">
                        {courseName || 'Web Dev Bootcamp'} - Nilai
                      </p>
                      <p className="text-5xl font-black text-white py-1">{selectedStudent.totalScore}</p>
                    </div>

                    {selectedStudent.certificate ? (
                      <p className="text-[9px] font-mono text-emerald-300 font-semibold bg-emerald-950/40 px-2 py-0.5 rounded">
                        D: {selectedStudent.certificate.noSertifikat}
                      </p>
                    ) : (
                      <p className="text-[9px] font-black text-amber-300 uppercase tracking-widest animate-pulse">Belum Diterbitkan</p>
                    )}
                  </div>

                  {/* Decorative elements */}
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
                  <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-indigo-900/30 rounded-full blur-2xl"></div>
                </div>
              ) : (
                <div className="bg-white p-6 rounded-2xl text-center border border-gray-200 text-gray-400 flex flex-col items-center justify-center min-h-[300px]">
                  <HiOutlineTrophy className="text-4xl mx-auto mb-3 opacity-30 text-yellow-500" />
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-800">Pilih Mahasiswa</p>
                  <p className="text-[10px] font-bold text-gray-400 mt-1 max-w-[200px]">
                    Pilih salah satu mahasiswa di tabel untuk melihat pratinjau sertifikat.
                  </p>
                </div>
              )}

              {/* Full-width Download Semua button at the bottom of the column */}
              <div className="mt-4">
                <Button
                  onClick={handleDownloadAllCertificates}
                  disabled={!reportData.some(s => s.status === 'Lulus' && s.certificate)}
                  className="w-full bg-[#F59E0B] hover:bg-[#D97706] text-white font-extrabold rounded-xl py-6 shadow-md shadow-amber-500/10 uppercase tracking-wider text-[10px] flex items-center justify-center gap-2 border-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <HiOutlineArrowDownTray className="text-base" /> Download Semua Sertifikat
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper Components
const StatCard: React.FC<{
  count: string;
  label: string;
  sub: string;
  gradientClass: string;
  borderLeftColor: string;
  progress: number;
}> = ({ count, label, sub, gradientClass, borderLeftColor, progress }) => (
  <Card className={`relative overflow-hidden border-none rounded-xl bg-gradient-to-r ${gradientClass} ${borderLeftColor} border-l-[12px] shadow-sm`}>
    <CardContent className="p-6 text-white relative z-10 flex flex-col justify-between min-h-[140px]">
      <div className="flex justify-between items-start w-full">
        <div>
          <p className="text-5xl font-black tracking-tight leading-none text-white">{count}</p>
          <p className="text-xs font-extrabold text-white/80 mt-2 uppercase tracking-wide">{label}</p>
        </div>
        <span className="bg-white/15 text-white/95 font-bold text-[9px] px-2.5 py-1 rounded-full backdrop-blur-md">
          {sub}
        </span>
      </div>
      <div className="w-1/2 h-1 bg-white/20 rounded-full mt-4 overflow-hidden">
        <div className="h-full bg-white rounded-full" style={{ width: `${progress}%` }}></div>
      </div>
    </CardContent>
  </Card>
);

const ScoreIndicator: React.FC<{ score: number }> = ({ score }) => {
  const isPass = score >= 70;
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="flex items-center gap-1">
        <span className="text-[10px] text-gray-400 font-bold">Nilai</span>
        <span className="text-[10px] text-gray-900 font-black">{score}</span>
      </div>
      <div className="w-12 h-1 bg-gray-100 rounded-full mt-1 overflow-hidden">
        <div
          className={`h-full rounded-full ${isPass ? 'bg-emerald-500' : 'bg-red-500'}`}
          style={{ width: `${score}%` }}
        ></div>
      </div>
    </div>
  );
};

export default LaporanAkhir;
