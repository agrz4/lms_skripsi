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
    <div className="p-8 bg-[#F3F4F6] min-h-screen pb-20">
      {/* Header & Course Selection */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-black text-gray-900 leading-none">End Kursus & Rekap Kelulusan</h1>
          <p className="text-sm text-gray-500 font-bold mt-2">Rekap nilai kumulatif, status kelulusan, dan penerbitan sertifikat digital</p>
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
        <div className="space-y-10">
          {/* Top Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatCard count={totalPeserta.toString()} label="Total Peserta" sub="Terdaftar" color="bg-[#1a3a5a]" icon={<HiOutlineUserGroup />} />
            <StatCard count={totalLulus.toString()} label="Lulus" sub="Skor >= 70" color="bg-[#1a4a2a]" icon={<HiOutlineAcademicCap />} />
            <StatCard count={totalTidakLulus.toString()} label="Tidak Lulus" sub="Skor < 70" color="bg-[#5a1a1a]" icon={<HiOutlineXCircle />} />
            <StatCard count={`${kelulusanPercent}%`} label="Rasio Kelulusan" sub="Persentase" color="bg-[#5a4a1a]" icon={<HiOutlineChartBar />} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Main Table */}
            <div className="lg:col-span-8">
              <Card className="rounded-[2rem] border-none shadow-sm bg-white overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50/50">
                      <tr>
                        <th className="py-5 px-8 text-[10px] font-black text-gray-400 uppercase tracking-widest">Nama</th>
                        <th className="py-5 px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Rata Refleksi</th>
                        <th className="py-5 px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Rata Tugas</th>
                        <th className="py-5 px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Ujian Akhir</th>
                        <th className="py-5 px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Total Skor</th>
                        <th className="py-5 px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
                        <th className="py-5 px-8 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Sertifikat</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {reportData.map((student) => {
                        const isSelected = selectedStudent?.userId === student.userId;
                        const nameInitial = student.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
                        
                        return (
                          <tr 
                            key={student.userId} 
                            onClick={() => setSelectedStudent(student)}
                            className={`hover:bg-gray-50/80 transition-colors cursor-pointer ${
                              isSelected ? 'bg-emerald-50/40' : ''
                            }`}
                          >
                            <td className="py-5 px-8">
                              <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black text-white ${
                                  student.status === 'Lulus' ? 'bg-emerald-500' : 'bg-purple-500'
                                }`}>
                                  {nameInitial}
                                </div>
                                <div>
                                  <span className="text-sm font-bold text-gray-900 block">{student.name}</span>
                                  <span className="text-[10px] text-gray-400 font-medium">{student.email}</span>
                                </div>
                              </div>
                            </td>
                            <td className="py-5 px-4 text-center text-sm font-bold text-gray-700">{student.avgRefleksi}</td>
                            <td className="py-5 px-4 text-center text-sm font-bold text-gray-700">{student.avgTugas}</td>
                            <td className="py-5 px-4 text-center text-sm font-bold text-gray-700">{student.examScore}</td>
                            <td className="py-5 px-4 text-center text-sm font-black text-emerald-700">{student.totalScore}</td>
                            <td className="py-5 px-4 text-center">
                              <Badge className={`rounded-full px-4 py-1 text-[9px] font-black border-none uppercase ${
                                student.status === 'Lulus' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'
                              }`}>
                                {student.status}
                              </Badge>
                            </td>
                            <td className="py-5 px-8 text-right" onClick={(e) => e.stopPropagation()}>
                              {student.status === 'Lulus' && (
                                !student.certificate ? (
                                  <Button 
                                    size="sm" 
                                    disabled={generatingCert === student.userId}
                                    onClick={() => handleGenerateCertificate(student.userId)}
                                    className="bg-amber-500 hover:bg-amber-600 text-white font-black text-[9px] rounded-lg px-4 h-7 border-none shadow-none uppercase tracking-wider"
                                  >
                                    {generatingCert === student.userId ? '...' : 'Buat'}
                                  </Button>
                                ) : (
                                  <Button 
                                    size="sm" 
                                    onClick={() => handleDownloadCertificate(student.certificate!.noSertifikat)}
                                    className="bg-emerald-500 hover:bg-emerald-600 text-white font-black text-[9px] rounded-lg px-3 h-7 border-none shadow-none"
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
            <div className="lg:col-span-4 space-y-6">
              {selectedStudent ? (
                <div className="bg-gradient-to-b from-blue-600 to-indigo-700 p-8 rounded-[2rem] shadow-2xl shadow-indigo-100 flex flex-col items-center text-center text-white relative overflow-hidden">
                  <div className="bg-white/10 backdrop-blur-md w-full rounded-[1.5rem] p-8 border border-white/20 relative z-10 shadow-inner">
                    <div className="flex justify-center mb-6">
                      <HiOutlineTrophy className="text-5xl text-yellow-400 drop-shadow-lg" />
                    </div>
                    <h2 className="text-xl font-bold text-yellow-400 mb-1">Sertifikat Kelulusan</h2>
                    <p className="text-[10px] font-bold text-white/70 mb-6 uppercase tracking-widest">HybridLMS - AI Academy</p>
                    
                    <div className="space-y-1 mb-6">
                      <p className="text-2xl font-black">{selectedStudent.name}</p>
                      <p className="text-[10px] font-bold text-white/60 mt-2">{courseName}</p>
                      <p className="text-[10px] font-bold text-white/60">Predikat Nilai:</p>
                      <p className="text-4xl font-black text-white">{selectedStudent.totalScore}</p>
                    </div>
                    
                    {selectedStudent.certificate ? (
                      <p className="text-[9px] font-mono text-emerald-300">ID: {selectedStudent.certificate.noSertifikat}</p>
                    ) : (
                      <p className="text-[9px] font-bold text-amber-300 uppercase tracking-widest animate-pulse">Belum Diterbitkan</p>
                    )}
                  </div>
                  
                  {/* Decorative elements */}
                  <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
                  <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-900/20 rounded-full blur-3xl"></div>
                </div>
              ) : (
                <div className="bg-white p-8 rounded-[2rem] text-center border border-gray-100 text-gray-400">
                  <HiOutlineTrophy className="text-4xl mx-auto mb-3 opacity-30" />
                  <p className="text-xs font-bold uppercase tracking-wider">Pilih Mahasiswa</p>
                  <p className="text-[10px] font-medium text-gray-500 mt-1">Pilih salah satu mahasiswa di tabel untuk melihat pratinjau sertifikat.</p>
                </div>
              )}

              {reportData.some(s => s.status === 'Lulus' && s.certificate) && (
                <Button 
                  onClick={handleDownloadAllCertificates}
                  className="w-full bg-[#f39c12] hover:bg-[#e67e22] text-white font-black rounded-xl py-7 shadow-xl shadow-orange-500/10 uppercase tracking-widest text-[10px]"
                >
                  <HiOutlineArrowDownTray className="mr-2 text-lg" /> Download Semua Sertifikat
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper Components
const StatCard: React.FC<{ count: string, label: string, sub: string, color: string, icon: React.ReactNode }> = ({ count, label, sub, color, icon }) => (
  <Card className={`${color} border-none rounded-[2.5rem] shadow-xl overflow-hidden relative group`}>
    <CardContent className="p-8 text-white relative z-10">
      <div className="flex justify-between items-start mb-6">
         <Badge className="bg-white/20 text-white border-none font-bold text-[10px] px-4 py-1.5 rounded-full backdrop-blur-md">{sub}</Badge>
      </div>
      <div>
         <p className="text-6xl font-black mb-2">{count}</p>
         <p className="text-sm font-bold text-white/70 uppercase tracking-widest">{label}</p>
      </div>
      <div className="w-full h-1 bg-white/20 rounded-full mt-8 overflow-hidden">
         <div className="h-full bg-white w-2/3 rounded-full"></div>
      </div>
    </CardContent>
    <div className="absolute -right-4 bottom-0 p-8 opacity-[0.03] text-[10rem] text-white transform rotate-12 group-hover:rotate-0 transition-all duration-700">
       {icon}
    </div>
  </Card>
);

export default LaporanAkhir;
