import React, { useState, useEffect } from 'react';
import { 
  HiOutlineClock, 
  HiOutlineCheckCircle, 
  HiOutlineXCircle,
  HiOutlineQueueList,
  HiOutlineSparkles,
  HiOutlineArrowRight,
  HiOutlineEye,
  HiOutlineCpuChip,
  HiOutlineExclamationTriangle,
  HiOutlineShieldCheck,
  HiOutlineClipboardDocumentList,
  HiOutlineMagnifyingGlass,
  HiOutlineCheck
} from 'react-icons/hi2';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import api from '../../lib/api';

// Interface definitions
interface SoalEvaluasi {
  id: string;
  skorKualitas: number;
  tingkatKesulitan: string;
  isDuplikat: boolean;
  saranPerbaikan: string;
}

interface SoalItem {
  id: string;
  pertanyaan: string;
  tipesoal: string;
  status: string;
  mataKuliahId: string;
  mataKuliah: { nama: string; kode: string };
  pertemuanId: string | null;
  pertemuan: { urutan: number; topik: string } | null;
  dibuatOleh: string;
  pembuat: { nama: string; role: string };
  createdAt: string;
  evaluasi?: SoalEvaluasi[];
}

interface QueueStats {
  pending: number;
  approved: number;
  rejected: number;
  total: number;
}

// Local mock fallback matches mockup UI items
const localFallbackQueue: SoalItem[] = [
  {
    id: 'sim-soal-1',
    pertanyaan: JSON.stringify({
      soal: 'Manakah dari berikut ini yang merupakan cara yang benar untuk mendefinisikan layout CSS Grid?',
      options: {
        A: 'display: block-grid;',
        B: 'display: grid;',
        C: 'grid-template: layout;',
        D: 'display: flex-grid;'
      },
      jawaban: 'B'
    }),
    tipesoal: 'PILIHAN_GANDA',
    status: 'PENDING',
    mataKuliahId: 'sim-mk-1',
    mataKuliah: { nama: 'Web Dev Bootcamp', kode: 'MK001' },
    pertemuanId: 'sim-pert-3',
    pertemuan: { urutan: 3, topik: 'CSS Layout' },
    dibuatOleh: 'sim-user-1',
    pembuat: { nama: 'Dr. Siti', role: 'DOSEN' },
    createdAt: new Date(Date.now() - 7200000).toISOString(), // 2 jam lalu
    evaluasi: [
      {
        id: 'sim-eval-1',
        skorKualitas: 8.7,
        tingkatKesulitan: 'sedang',
        isDuplikat: false,
        saranPerbaikan: 'Soal sudah baik dan sangat relevan dengan topik CSS Layout.'
      }
    ]
  },
  {
    id: 'sim-soal-2',
    pertanyaan: JSON.stringify({
      soal: 'Apa fungsi utama dari tag HTML <img /> dalam pengembangan halaman web?',
      options: {
        A: 'Menampilkan video dari server lokal',
        B: 'Menyematkan berkas gambar/visual secara inline',
        C: 'Membuat tautan/hyperlink antar halaman',
        D: 'Memformat teks menjadi huruf tebal'
      },
      jawaban: 'B'
    }),
    tipesoal: 'PILIHAN_GANDA',
    status: 'APPROVED',
    mataKuliahId: 'sim-mk-2',
    mataKuliah: { nama: 'Web Dev', kode: 'MK002' },
    pertemuanId: 'sim-pert-1',
    pertemuan: { urutan: 1, topik: 'Intro Web Dev' },
    dibuatOleh: 'sim-user-1',
    pembuat: { nama: 'Dr. Siti', role: 'DOSEN' },
    createdAt: new Date(Date.now() - 86400000).toISOString(), // kemarin
    evaluasi: [
      {
        id: 'sim-eval-2',
        skorKualitas: 9.2,
        tingkatKesulitan: 'mudah',
        isDuplikat: false,
        saranPerbaikan: 'Soal terdeteksi mirip 92% dengan soal pertemuan 1 kelas paralel lainnya.'
      }
    ]
  }
];

const AIReviewQueue: React.FC = () => {
  const [stats, setStats] = useState<QueueStats>({ pending: 3, approved: 8, rejected: 0, total: 270 });
  const [queue, setQueue] = useState<SoalItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSimulated, setIsSimulated] = useState<boolean>(false);
  const [dbNotSynced, setDbNotSynced] = useState<boolean>(false);
  
  // Custom state for mockup Refleksi Card interactivity
  const [refleksiStatus, setRefleksiStatus] = useState<'REVIEW' | 'APPROVED'>('REVIEW');

  // Review Drawer / Modal State
  const [selectedSoal, setSelectedSoal] = useState<SoalItem | null>(null);
  const [tinjauOpen, setTinjauOpen] = useState<boolean>(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/soal/queue');
      if (res.data && res.data.success) {
        setStats(res.data.stats);
        setQueue(res.data.queue || []);
        setIsSimulated(!!res.data.isSimulated);
        setDbNotSynced(false);
      }
    } catch (err) {
      console.warn("Gagal mengambil antrean soal dari backend (kemungkinan skema DB belum di-push). Mengaktifkan fallback lokal.", err);
      setDbNotSynced(true);
      setQueue(localFallbackQueue);
      setStats({
        pending: localFallbackQueue.length,
        approved: 12,
        rejected: 2,
        total: 12 + 2 + localFallbackQueue.length
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const handleApprove = async (soalId: string) => {
    setActionLoading(soalId);
    try {
      if (dbNotSynced || soalId.startsWith('sim-')) {
        // Simulasi Aksi Lokal
        await new Promise(resolve => setTimeout(resolve, 800));
        setQueue(prev => prev.filter(item => item.id !== soalId));
        setStats(prev => ({
          ...prev,
          pending: Math.max(0, prev.pending - 1),
          approved: prev.approved + 1,
          total: prev.total
        }));
        if (selectedSoal?.id === soalId) {
          setTinjauOpen(false);
          setSelectedSoal(null);
        }
      } else {
        const res = await api.post('/admin/soal/approve', { soalId });
        if (res.data && res.data.success) {
          await fetchQueue();
          setTinjauOpen(false);
          setSelectedSoal(null);
        }
      }
    } catch (err: any) {
      console.error("Gagal menyetujui soal:", err);
      alert("Gagal menyetujui soal: " + (err.response?.data?.message || err.message));
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (soalId: string) => {
    setActionLoading(soalId);
    try {
      if (dbNotSynced || soalId.startsWith('sim-')) {
        // Simulasi Aksi Lokal
        await new Promise(resolve => setTimeout(resolve, 800));
        setQueue(prev => prev.filter(item => item.id !== soalId));
        setStats(prev => ({
          ...prev,
          pending: Math.max(0, prev.pending - 1),
          rejected: prev.rejected + 1,
          total: prev.total
        }));
        if (selectedSoal?.id === soalId) {
          setTinjauOpen(false);
          setSelectedSoal(null);
        }
      } else {
        const res = await api.post('/admin/soal/reject', { soalId });
        if (res.data && res.data.success) {
          await fetchQueue();
          setTinjauOpen(false);
          setSelectedSoal(null);
        }
      }
    } catch (err: any) {
      console.error("Gagal menolak soal:", err);
      alert("Gagal menolak soal: " + (err.response?.data?.message || err.message));
    } finally {
      setActionLoading(null);
    }
  };

  // Parser helper to parse stringified JSON of question
  const parseQuestion = (pertanyaanStr: string) => {
    try {
      if (pertanyaanStr && (pertanyaanStr.startsWith('{') || pertanyaanStr.startsWith('['))) {
        const parsed = JSON.parse(pertanyaanStr);
        if (parsed && typeof parsed === 'object') {
          return {
            soal: parsed.soal || pertanyaanStr,
            options: parsed.options || null,
            jawaban: parsed.jawaban || ''
          };
        }
      }
    } catch (e) {
      // JSON parsing failed, return plain text
    }
    return {
      soal: pertanyaanStr,
      options: null,
      jawaban: ''
    };
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 relative">
      {/* Warning Banners */}
      {dbNotSynced && (
        <div className="p-4 bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold rounded-2xl tracking-wide flex items-center justify-between shadow-md">
          <span className="flex items-center gap-2">
            <HiOutlineExclamationTriangle className="text-lg text-amber-600 animate-bounce" />
            <span>Skema database belum disinkronisasi. Menampilkan data simulasi lokal. Jalankan <code>npx prisma db push</code> di terminal WSL Anda untuk mengaktifkan database.</span>
          </span>
          <button onClick={() => setDbNotSynced(false)} className="underline hover:text-amber-950 font-black ml-4">TUTUP</button>
        </div>
      )}

      {isSimulated && !dbNotSynced && (
        <div className="p-4 bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs font-bold rounded-2xl tracking-wide flex items-center justify-between shadow-md">
          <span className="flex items-center gap-2">
            <HiOutlineCpuChip className="text-lg text-indigo-600 animate-pulse" />
            <span>Belum ada antrean soal riil berstatus PENDING di database. Menampilkan simulasi soal hasil generate AI.</span>
          </span>
          <button onClick={() => setIsSimulated(false)} className="underline hover:text-indigo-950 font-black ml-4">TUTUP</button>
        </div>
      )}

      {/* Header Section */}
      <div className="flex justify-between items-center bg-white p-8 rounded-2xl shadow-sm border border-gray-150">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-gray-900 flex items-center gap-3">
            AI Review Queue
            <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-widest px-3 border-emerald-200 text-emerald-600 bg-emerald-50">Admin Board</Badge>
          </h1>
          <p className="text-xs font-semibold text-gray-500 mt-1">Soal AI yang di-generate dari materi - Approve sebelum aktif ke peserta</p>
        </div>
        <Button 
          onClick={fetchQueue}
          disabled={loading}
          variant="outline" 
          className="rounded-xl font-bold text-xs border-gray-300 text-gray-700 bg-white hover:bg-gray-50 shadow-sm transition-all h-10 px-5"
        >
          Refresh Antrean
        </Button>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard count={String(stats.pending)} label="Menunggu" sub="+2 Hari Ini" color="bg-[#182C44]" icon={<HiOutlineClock />} />
        <StatCard count={String(stats.approved)} label="Approved" sub="+5 Hari Ini" color="bg-[#312E81]" icon={<HiOutlineCheckCircle />} />
        <StatCard count="0" label="Di Tolak" sub="+0 Hari Ini" color="bg-[#7F1D1D]" icon={<HiOutlineXCircle />} />
        <StatCard count="270" label="Total Soal" sub="+50 Hari Ini" color="bg-[#064E3B]" icon={<HiOutlineQueueList />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Queue List */}
        <div className="lg:col-span-8 space-y-6">
          {loading ? (
            <Card className="rounded-2xl border-none shadow-sm bg-white p-16 flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="w-10 h-10 border-4 border-[#047857] border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Loading antrean...</p>
              </div>
            </Card>
          ) : queue.length === 0 ? (
            <Card className="rounded-2xl border-none shadow-sm bg-white p-16 text-center">
              <div className="max-w-md mx-auto space-y-4">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-3xl">
                  <HiOutlineShieldCheck />
                </div>
                <h3 className="text-xl font-black text-gray-900">Antrean Bersih!</h3>
                <p className="text-xs text-gray-500 font-semibold leading-relaxed">
                  Tidak ada soal dari generator AI yang perlu di-review saat ini. Semua soal sudah disetujui atau ditolak.
                </p>
                <Button onClick={fetchQueue} className="bg-[#047857] hover:bg-[#065F46] text-white font-bold text-xs rounded-xl px-6 h-10">
                  Perbarui Halaman
                </Button>
              </div>
            </Card>
          ) : (
            (() => {
              const elements: React.ReactNode[] = [];

              queue.forEach((item, idx) => {
                const qParsed = parseQuestion(item.pertanyaan);
                const evalItem = item.evaluasi && item.evaluasi[0];
                const scoreKualitas = evalItem ? evalItem.skorKualitas : 8.5;

                // Render item
                if (item.status === 'PENDING') {
                  // Pending Question Card (yellowish / amber theme)
                  elements.push(
                    <Card 
                      key={item.id} 
                      className="rounded-2xl border-none shadow-sm bg-[#FFFDF5] border-l-[12px] border-amber-500 overflow-hidden hover:shadow-md transition-all duration-300"
                    >
                      <CardContent className="p-8 flex flex-col md:flex-row justify-between items-start gap-6">
                        <div className="space-y-4 flex-1 text-left">
                          <div>
                            <h3 className="text-lg font-black text-gray-950 mt-1 leading-snug">
                              {item.mataKuliah.nama} — P{item.pertemuan?.urutan || '?'}: {item.pertemuan?.topik || ''}
                            </h3>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight mt-1">
                              Generate: 2 jam lalu · 30 soal PG · {item.pembuat.nama}
                            </p>
                          </div>

                          {/* AI Badges */}
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="bg-indigo-600 text-white font-black text-[9px] px-3 py-1 rounded-md flex items-center gap-1 border-none">
                              RAG + SLM
                            </span>
                            <span className="text-[9px] font-black bg-amber-100 text-amber-800 px-3 py-1 rounded-md">
                              Akurasi: {(scoreKualitas * 10).toFixed(0)}%
                            </span>
                          </div>

                          {/* Action buttons */}
                          <div className="flex flex-wrap items-center gap-2 pt-1.5">
                            <Button 
                              onClick={() => {
                                setSelectedSoal(item);
                                setTinjauOpen(true);
                              }}
                              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] rounded-lg px-4.5 h-8.5 shadow-sm transition-all flex items-center gap-1.5"
                            >
                              <HiOutlineEye className="text-xs" /> Tinjau
                            </Button>
                            <Button 
                              onClick={() => handleApprove(item.id)}
                              disabled={actionLoading !== null}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded-lg px-4.5 h-8.5 shadow-sm transition-all flex items-center gap-1.5"
                            >
                              <HiOutlineCheck className="text-xs" /> {actionLoading === item.id ? 'Loading...' : 'Approve'}
                            </Button>
                            <Button 
                              onClick={() => handleReject(item.id)}
                              disabled={actionLoading !== null}
                              className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] rounded-lg px-4.5 h-8.5 shadow-sm transition-all flex items-center gap-1.5"
                            >
                              <HiOutlineXCircle className="text-xs" /> {actionLoading === item.id ? 'Loading...' : 'Tolak'}
                            </Button>
                          </div>
                        </div>
                        
                        <Badge className="bg-amber-100 text-amber-800 font-bold text-[10px] px-4 py-2 rounded-xl flex items-center gap-1.5 border-none shrink-0">
                          <HiOutlineClock /> Pending
                        </Badge>
                      </CardContent>
                    </Card>
                  );
                } else {
                  // Approved Question Card (green theme)
                  elements.push(
                    <Card 
                      key={item.id} 
                      className="rounded-2xl border-none shadow-sm bg-[#ECFDF5]/60 border-l-[12px] border-emerald-500 overflow-hidden hover:shadow-md transition-all duration-300"
                    >
                      <CardContent className="p-8 flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="space-y-1 flex-1 text-left">
                          <h3 className="text-lg font-black text-gray-950 leading-snug">
                            {item.mataKuliah.nama} — P{item.pertemuan?.urutan || '?'}: {item.pertemuan?.topik || ''}
                          </h3>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight mt-1">
                            Approved kemarin · Aktif ke peserta ✓
                          </p>
                        </div>
                        
                        <Badge className="bg-emerald-100 text-emerald-800 font-bold text-[10px] px-4 py-2 rounded-xl flex items-center gap-1.5 border-none shrink-0">
                          <HiOutlineCheckCircle /> Aktif
                        </Badge>
                      </CardContent>
                    </Card>
                  );
                }

                // Inject Refleksi Auto Score Card at index 1
                if (idx === 0) {
                  if (refleksiStatus === 'REVIEW') {
                    elements.push(
                      <Card 
                        key="refleksi-auto-score-card"
                        className="rounded-2xl border-none shadow-sm bg-[#F5F3FF]/70 border-l-[12px] border-indigo-500 overflow-hidden hover:shadow-md transition-all duration-300"
                      >
                        <CardContent className="p-8 flex flex-col md:flex-row justify-between items-start gap-6">
                          <div className="space-y-4 flex-1 text-left">
                            <div>
                              <h3 className="text-lg font-black text-gray-950 mt-1 leading-snug">
                                Web Dev Bootcamp — P4: Refleksi Auto Score
                              </h3>
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight mt-1">
                                Generate: 8 jam lalu · Skor AI untuk refleksi peserta
                              </p>
                            </div>

                            {/* Warning notification sub-card */}
                            <div className="p-4 bg-indigo-50/60 border border-indigo-100 rounded-xl text-[10px] font-bold text-indigo-900 leading-relaxed">
                              AI akan otomatis scoring refleksi peserta menggunakan model ini sebagai referensi untuk Asisten.
                            </div>

                            {/* Action buttons */}
                            <div className="flex flex-wrap items-center gap-2 pt-1">
                              <Button 
                                onClick={() => alert('Fitur Tinjau detail evaluasi model Refleksi sedang disiapkan.')}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] rounded-lg px-4.5 h-8.5 shadow-sm transition-all flex items-center gap-1.5"
                              >
                                <HiOutlineEye className="text-xs" /> Tinjau
                              </Button>
                              <Button 
                                onClick={() => {
                                  setRefleksiStatus('APPROVED');
                                  setStats(prev => ({ ...prev, pending: Math.max(0, prev.pending - 1), approved: prev.approved + 1 }));
                                }}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded-lg px-4.5 h-8.5 shadow-sm transition-all flex items-center gap-1.5"
                              >
                                <HiOutlineCheck className="text-xs" /> Approve
                              </Button>
                            </div>
                          </div>
                          
                          <Badge className="bg-indigo-100 text-indigo-850 font-bold text-[10px] px-4 py-2 rounded-xl flex items-center gap-1.5 border-none shrink-0">
                            <HiOutlineMagnifyingGlass /> Review
                          </Badge>
                        </CardContent>
                      </Card>
                    );
                  } else {
                    elements.push(
                      <Card 
                        key="refleksi-auto-score-card"
                        className="rounded-2xl border-none shadow-sm bg-[#ECFDF5]/60 border-l-[12px] border-emerald-500 overflow-hidden hover:shadow-md transition-all duration-300"
                      >
                        <CardContent className="p-8 flex flex-col md:flex-row justify-between items-center gap-6">
                          <div className="space-y-1 flex-1 text-left">
                            <h3 className="text-lg font-black text-gray-950 leading-snug">
                              Web Dev Bootcamp — P4: Refleksi Auto Score
                            </h3>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight mt-1">
                              Approved baru saja · Aktif ke peserta ✓
                            </p>
                          </div>
                          
                          <Badge className="bg-emerald-100 text-emerald-800 font-bold text-[10px] px-4 py-2 rounded-xl flex items-center gap-1.5 border-none shrink-0">
                            <HiOutlineCheckCircle /> Aktif
                          </Badge>
                        </CardContent>
                      </Card>
                    );
                  }
                }
              });

              return elements;
            })()
          )}
        </div>

        {/* Sidebar Right */}
        <div className="lg:col-span-4 space-y-8 text-left">
          
          {/* Guidelines card */}
          <Card className="rounded-2xl border border-gray-150 shadow-sm bg-white p-8">
            <h2 className="text-base font-black text-gray-950 mb-6 flex items-center gap-2">
              <HiOutlineClipboardDocumentList className="text-emerald-600 text-xl" /> Panduan
            </h2>
            <div className="space-y-4">
              <GuidelineItem text="Soal relevan materi" />
              <GuidelineItem text="Jawaban benar akurat" />
              <GuidelineItem text="Bahasa jelas" />
              <GuidelineItem text="Tingkat kesulitan sesuai" />
            </div>
          </Card>

          {/* AI Workflow diagram card */}
          <div className="bg-gradient-to-r from-blue-700 to-indigo-950 p-8 rounded-2xl text-white shadow-xl space-y-5">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 bg-cyan-300 rounded-full animate-ping"></div>
              <h2 className="text-xs font-black text-white uppercase tracking-wider">Alur AI ke Kursus</h2>
            </div>
            
            <div className="space-y-4 text-white/95">
              <div className="flex items-center gap-2.5">
                <span className="bg-slate-700/60 text-white font-bold text-[8px] px-2.5 py-1 rounded uppercase tracking-wider">Materi Upload</span>
                <span className="text-white/40">→</span>
                <span className="bg-indigo-600 text-white font-bold text-[8px] px-2.5 py-1 rounded uppercase tracking-wider">RAG Kursus</span>
                <span className="text-white/40">→</span>
              </div>
              <div className="flex items-center gap-2.5 pl-6">
                <span className="bg-blue-600 text-white font-bold text-[8px] px-2.5 py-1 rounded uppercase tracking-wider">SLM</span>
                <span className="text-white/40">→</span>
                <span className="bg-emerald-600 text-white font-bold text-[8px] px-2.5 py-1 rounded uppercase tracking-wider">Auto Correct ✓</span>
              </div>
            </div>

            <p className="text-[10px] font-medium text-white/90 leading-relaxed pt-2">
              AI terikat per kursus - Jika kursus ada refleksi + AI auto score tersedia untuk Asisten sebagai referensi.
            </p>
          </div>

        </div>
      </div>

      {/* Tinjau Drawer / Modal (Custom Premium overlay) */}
      {tinjauOpen && selectedSoal && (() => {
        const qParsed = parseQuestion(selectedSoal.pertanyaan);
        const evalItem = selectedSoal.evaluasi && selectedSoal.evaluasi[0];
        const scoreKualitas = evalItem ? evalItem.skorKualitas : 8.5;
        const isDuplikat = evalItem ? evalItem.isDuplikat : false;
        
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/65 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
              {/* Header Gradient */}
              <div className="bg-gradient-to-r from-emerald-600 to-indigo-900 p-8 text-white relative">
                <h3 className="text-2xl font-black leading-tight">Tinjau Soal AI</h3>
                <p className="text-xs text-white/70 font-semibold mt-1">
                  {selectedSoal.mataKuliah.nama} ({selectedSoal.mataKuliah.kode}) 
                  {selectedSoal.pertemuan ? ` · Pertemuan ${selectedSoal.pertemuan.urutan} - ${selectedSoal.pertemuan.topik}` : ''}
                </p>
                <button 
                  onClick={() => setTinjauOpen(false)}
                  className="absolute top-6 right-6 text-white/80 hover:text-white font-black text-lg bg-white/10 hover:bg-white/20 w-8 h-8 rounded-full flex items-center justify-center transition-all"
                >
                  ✕
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="p-8 space-y-6 overflow-y-auto flex-1">
                {/* Question Text */}
                <div className="space-y-2">
                  <span className="text-[10px] font-black text-indigo-650 uppercase tracking-wider bg-indigo-50 px-2.5 py-1 rounded-md">
                    Pertanyaan ({selectedSoal.tipesoal.replace('_', ' ')})
                  </span>
                  <p className="text-lg font-bold text-gray-900 leading-snug">
                    {qParsed.soal}
                  </p>
                </div>

                {/* Multiple Choice Options */}
                {qParsed.options && (
                  <div className="space-y-3">
                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-wider bg-emerald-50 px-2.5 py-1 rounded-md">
                      Pilihan Jawaban
                    </span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-left">
                      {Object.entries(qParsed.options).map(([key, val]) => {
                        const isCorrect = key === qParsed.jawaban;
                        return (
                          <div 
                            key={key} 
                            className={`p-4 rounded-xl border font-bold text-sm transition-colors flex items-start gap-3 ${
                              isCorrect 
                                ? 'bg-emerald-50/50 border-emerald-500 text-emerald-900' 
                                : 'bg-slate-50 border-slate-200 text-slate-700'
                            }`}
                          >
                            <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black shrink-0 ${
                              isCorrect ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-700'
                            }`}>
                              {key}
                            </span>
                            <span className="leading-tight">{val}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* AI RAG Evaluation Stats */}
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4">
                  <span className="text-[10px] font-black text-purple-600 uppercase tracking-wider bg-purple-50 px-2.5 py-1 rounded-md flex items-center gap-1.5 w-max">
                    <HiOutlineSparkles /> Analisis & Rekomendasi AI
                  </span>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-100 text-center">
                      <p className="text-[10px] font-bold text-gray-400 uppercase">Skor Kualitas</p>
                      <p className={`text-2xl font-black mt-1 ${
                        scoreKualitas >= 8 ? 'text-emerald-600' : 'text-amber-500'
                      }`}>{scoreKualitas.toFixed(1)}/10</p>
                    </div>

                    <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-100 text-center">
                      <p className="text-[10px] font-bold text-gray-400 uppercase">Kesulitan</p>
                      <p className="text-sm font-black text-indigo-700 capitalize mt-2.5">
                        {evalItem?.tingkatKesulitan || 'sedang'}
                      </p>
                    </div>

                    <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-100 text-center">
                      <p className="text-[10px] font-bold text-gray-400 uppercase">Duplikasi (RAG)</p>
                      <p className={`text-xs font-black mt-2.5 ${
                        isDuplikat ? 'text-rose-600 animate-pulse' : 'text-emerald-600'
                      }`}>
                        {isDuplikat ? 'Terdeteksi' : 'Unik'}
                      </p>
                    </div>
                  </div>

                  {evalItem?.saranPerbaikan && (
                    <div className="bg-white p-4 rounded-xl border border-indigo-50/50">
                      <p className="text-[10px] font-black text-indigo-700 uppercase tracking-wider mb-1">Catatan / Saran AI</p>
                      <p className="text-xs text-slate-600 font-medium leading-relaxed">
                        {evalItem.saranPerbaikan}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Footer */}
              <div className="bg-slate-50 p-6 border-t border-slate-100 flex items-center justify-between gap-3">
                <Button 
                  onClick={() => setTinjauOpen(false)}
                  className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold text-xs rounded-xl px-5 h-10 shadow-xs"
                >
                  Tutup
                </Button>
                
                <div className="flex items-center gap-3">
                  <Button 
                    onClick={() => handleReject(selectedSoal.id)}
                    disabled={actionLoading !== null}
                    className="bg-rose-50 hover:bg-rose-100 text-rose-700 border-none font-bold text-xs rounded-xl px-5 h-10 transition-colors"
                  >
                    {actionLoading === selectedSoal.id ? 'Loading...' : 'Tolak Soal'}
                  </Button>
                  <Button 
                    onClick={() => handleApprove(selectedSoal.id)}
                    disabled={actionLoading !== null}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white border-none font-bold text-xs rounded-xl px-5 h-10 shadow-md transition-all"
                  >
                    {actionLoading === selectedSoal.id ? 'Loading...' : 'Setujui & Aktifkan'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

// Helper Components
const StatCard: React.FC<{ count: string, label: string, sub: string, color: string, icon: React.ReactNode }> = ({ count, label, sub, color, icon }) => (
  <Card className={`${color} border-none rounded-2xl shadow-md overflow-hidden relative group transition-all duration-300`}>
    <CardContent className="p-6 text-white relative z-10 text-left">
      <div className="flex justify-between items-center mb-6">
        <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center text-lg backdrop-blur-md">
          {icon}
        </div>
        <span className="bg-white/15 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
          {sub}
        </span>
      </div>
      <div className="space-y-1">
        <p className="text-4xl font-black tracking-tight">{count}</p>
        <p className="text-sm font-bold opacity-80">{label}</p>
      </div>
      {/* Horizontal faded white line */}
      <div className="mt-4 h-[1px] bg-white/20 w-full"></div>
    </CardContent>
  </Card>
);

const GuidelineItem: React.FC<{ text: string }> = ({ text }) => (
  <div className="flex items-start gap-3">
    <div className="w-5 h-5 bg-[#10B981] text-white rounded flex items-center justify-center text-xs shrink-0 font-bold">
      ✓
    </div>
    <span className="text-xs font-bold text-gray-650 leading-tight">{text}</span>
  </div>
);

export default AIReviewQueue;
