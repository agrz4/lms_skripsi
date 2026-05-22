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
  HiOutlineShieldCheck
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

// Local mock fallback if API fails or DB is not synced
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
    mataKuliah: { nama: 'Dasar Pemrograman Web', kode: 'MK001' },
    pertemuanId: 'sim-pert-3',
    pertemuan: { urutan: 3, topik: 'CSS Layout' },
    dibuatOleh: 'sim-user-1',
    pembuat: { nama: 'Dr. Ahmad Dosen', role: 'DOSEN' },
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
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
    status: 'PENDING',
    mataKuliahId: 'sim-mk-1',
    mataKuliah: { nama: 'Dasar Pemrograman Web', kode: 'MK001' },
    pertemuanId: 'sim-pert-1',
    pertemuan: { urutan: 1, topik: 'Intro Web Dev' },
    dibuatOleh: 'sim-user-1',
    pembuat: { nama: 'Dr. Ahmad Dosen', role: 'DOSEN' },
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    evaluasi: [
      {
        id: 'sim-eval-2',
        skorKualitas: 9.2,
        tingkatKesulitan: 'mudah',
        isDuplikat: true,
        saranPerbaikan: 'Soal terdeteksi mirip 92% dengan soal pertemuan 1 kelas paralel lainnya. Disarankan mengganti jenis gambarnya.'
      }
    ]
  }
];

const AIReviewQueue: React.FC = () => {
  const [stats, setStats] = useState<QueueStats>({ pending: 2, approved: 8, rejected: 0, total: 10 });
  const [queue, setQueue] = useState<SoalItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSimulated, setIsSimulated] = useState<boolean>(false);
  const [dbNotSynced, setDbNotSynced] = useState<boolean>(false);
  
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
      <div className="flex justify-between items-center bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-gray-900 flex items-center gap-3">
            AI Review Queue
            <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-widest px-3 border-emerald-200 text-emerald-600 bg-emerald-50">Admin Board</Badge>
          </h1>
          <p className="text-sm text-muted-foreground mt-1 font-medium">Approve atau reject soal-soal hasil generate AI sebelum disajikan untuk latihan mahasiswa.</p>
        </div>
        <Button 
          onClick={fetchQueue}
          disabled={loading}
          variant="outline" 
          className="rounded-full font-bold text-xs border-emerald-100 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 shadow-sm transition-all"
        >
          Refresh Antrean
        </Button>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard count={String(stats.pending)} label="Menunggu" sub="Status Pending" color="bg-gradient-to-br from-amber-500 to-amber-600" icon={<HiOutlineClock />} />
        <StatCard count={String(stats.approved)} label="Approved" sub="Soal Aktif" color="bg-gradient-to-br from-emerald-600 to-emerald-700" icon={<HiOutlineCheckCircle />} />
        <StatCard count={String(stats.rejected)} label="Ditolak" sub="Soal Rejected" color="bg-gradient-to-br from-rose-600 to-rose-700" icon={<HiOutlineXCircle />} />
        <StatCard count={String(stats.total)} label="Total Soal" sub="Semua Status" color="bg-gradient-to-br from-indigo-900 to-slate-900" icon={<HiOutlineQueueList />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Queue List */}
        <div className="lg:col-span-8 space-y-6">
          {loading ? (
            <Card className="rounded-[2rem] border-none shadow-sm bg-white p-16 flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Loading antrean soal...</p>
              </div>
            </Card>
          ) : queue.length === 0 ? (
            <Card className="rounded-[2rem] border-none shadow-sm bg-white p-16 text-center">
              <div className="max-w-md mx-auto space-y-4">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-3xl">
                  <HiOutlineShieldCheck />
                </div>
                <h3 className="text-xl font-black text-gray-900">Antrean Bersih!</h3>
                <p className="text-sm text-gray-500 font-medium">
                  Tidak ada soal dari generator AI yang perlu di-review saat ini. Semua soal sudah disetujui atau ditolak.
                </p>
                <Button onClick={fetchQueue} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl px-6 h-10">
                  Perbarui Halaman
                </Button>
              </div>
            </Card>
          ) : (
            queue.map((item) => {
              const qParsed = parseQuestion(item.pertanyaan);
              const evalItem = item.evaluasi && item.evaluasi[0];
              const scoreKualitas = evalItem ? evalItem.skorKualitas : 8.5;
              const isDuplikat = evalItem ? evalItem.isDuplikat : false;

              return (
                <Card 
                  key={item.id} 
                  className={`rounded-[2rem] border-none shadow-sm bg-white overflow-hidden hover:shadow-lg transition-all border-l-[12px] duration-300 ${
                    isDuplikat ? 'border-amber-500 bg-amber-50/20' : 'border-emerald-500'
                  }`}
                >
                  <CardContent className="p-8 flex flex-col md:flex-row justify-between items-start gap-6">
                    <div className="space-y-4 flex-1">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[10px] font-black uppercase bg-slate-100 text-slate-700 px-3 py-1 rounded-md">
                            {item.mataKuliah.kode}
                          </span>
                          <span className="text-[10px] font-bold text-gray-400">
                            {item.mataKuliah.nama}
                          </span>
                          {item.pertemuan && (
                            <Badge className="bg-slate-200 text-slate-800 border-none font-bold text-[9px]">
                              Pertemuan {item.pertemuan.urutan}
                            </Badge>
                          )}
                        </div>
                        <h3 className="text-lg font-black text-gray-900 mt-2 leading-snug line-clamp-2">
                          {qParsed.soal}
                        </h3>
                        <p className="text-[10px] font-bold text-gray-400/80 uppercase mt-1">
                          Generator: {item.pembuat.nama} ({item.pembuat.role}) · {new Date(item.createdAt).toLocaleDateString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>

                      {/* AI Badges */}
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge className="bg-purple-100 text-purple-700 font-black text-[9px] px-3 py-1 border-none flex items-center gap-1">
                          <HiOutlineSparkles className="text-xs" /> RAG + SLM Evaluation
                        </Badge>
                        <span className={`text-[10px] font-black px-2.5 py-1 rounded-md ${
                          scoreKualitas >= 8 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          Skor AI: {scoreKualitas.toFixed(1)}/10
                        </span>
                        {isDuplikat && (
                          <span className="text-[10px] font-black bg-rose-100 text-rose-800 px-2.5 py-1 rounded-md flex items-center gap-1 animate-pulse">
                            ⚠️ Terdeteksi Duplikat (RAG)
                          </span>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 pt-2">
                        <Button 
                          onClick={() => {
                            setSelectedSoal(item);
                            setTinjauOpen(true);
                          }}
                          className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[10px] rounded-lg px-4 h-8 border-none transition-colors"
                        >
                          Tinjau Detail
                        </Button>
                        <Button 
                          onClick={() => handleApprove(item.id)}
                          disabled={actionLoading !== null}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded-lg px-4 h-8 shadow-sm transition-all"
                        >
                          {actionLoading === item.id ? 'Loading...' : 'Approve'}
                        </Button>
                        <Button 
                          onClick={() => handleReject(item.id)}
                          disabled={actionLoading !== null}
                          className="bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[10px] rounded-lg px-4 h-8 border-none transition-all"
                        >
                          {actionLoading === item.id ? 'Loading...' : 'Tolak'}
                        </Button>
                      </div>
                    </div>
                    
                    <Badge className="bg-amber-100 text-amber-800 font-bold text-[10px] px-4 py-2 rounded-xl flex items-center gap-1.5 border-none self-end md:self-start">
                      <HiOutlineClock /> Pending Review
                    </Badge>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Sidebar Right */}
        <div className="lg:col-span-4 space-y-8">
          {/* Guidelines card */}
          <Card className="rounded-[2rem] border-none shadow-sm bg-white p-8">
            <h2 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2">
              <HiOutlineShieldCheck className="text-emerald-500 text-xl" /> Panduan Review
            </h2>
            <div className="space-y-4">
              <GuidelineItem text="Soal harus selaras dengan materi pertemuan" />
              <GuidelineItem text="Keberadaan kunci jawaban harus valid & tunggal" />
              <GuidelineItem text="Tata bahasa jelas & tidak ambigu untuk peserta" />
              <GuidelineItem text="Tinjau skor kesamaan RAG untuk menghindari duplikasi" />
            </div>
          </Card>

          {/* AI Workflow diagram card */}
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-8 rounded-[2rem] border border-white shadow-xl shadow-emerald-950/5">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping"></div>
              <h2 className="text-sm font-black text-emerald-900 uppercase tracking-wider">Alur Evaluasi AI</h2>
            </div>
            
            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-between gap-2">
                <span className="bg-indigo-600 text-white font-bold text-[8px] px-2 py-1 rounded uppercase">Materi RAG</span>
                <HiOutlineArrowRight className="text-emerald-500 text-xs" />
                <span className="bg-purple-600 text-white font-bold text-[8px] px-2 py-1 rounded uppercase">Generasi SLM</span>
                <HiOutlineArrowRight className="text-emerald-500 text-xs" />
              </div>
              <div className="flex items-center gap-2 justify-end">
                <span className="bg-amber-500 text-white font-bold text-[8px] px-2 py-1 rounded uppercase">Similarity Check</span>
                <HiOutlineArrowRight className="text-emerald-500 text-xs" />
                <span className="bg-emerald-600 text-white font-bold text-[8px] px-2.5 py-1 rounded uppercase">Queue Admin ✓</span>
              </div>
            </div>

            <p className="text-[10px] text-emerald-800 font-bold leading-relaxed">
              Setiap soal yang dibuat oleh model AI (SLM) akan diperiksa kemiripannya dengan bank soal lama menggunakan RAG vector distance, dihitung skor kualitas bahasa, lalu dimasukkan ke antrean persetujuan.
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
            <div className="bg-white rounded-[2.5rem] w-full max-w-2xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
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
                  <span className="text-[10px] font-black text-indigo-600 uppercase tracking-wider bg-indigo-50 px-2.5 py-1 rounded-md">
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
  <Card className={`${color} border-none rounded-[2rem] shadow-lg overflow-hidden relative group transform hover:translate-y-[-2px] transition-all duration-300`}>
    <CardContent className="p-8 text-white relative z-10">
      <div className="flex justify-between items-start mb-6">
        <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center text-xl backdrop-blur-md">
          {icon}
        </div>
        <Badge className="bg-white/20 text-white border-none font-bold text-[9px] px-3 py-1 rounded-full">{sub}</Badge>
      </div>
      <div>
        <p className="text-5xl font-black mb-2 tracking-tight">{count}</p>
        <p className="text-xs font-bold text-white/70 uppercase tracking-widest">{label}</p>
      </div>
    </CardContent>
    <div className="absolute top-0 right-0 p-10 opacity-[0.07] text-8xl text-white transform rotate-12 group-hover:rotate-0 transition-all duration-500 pointer-events-none">
      {icon}
    </div>
  </Card>
);

const GuidelineItem: React.FC<{ text: string }> = ({ text }) => (
  <div className="flex items-start gap-3">
    <div className="w-4 h-4 bg-emerald-500 text-white rounded flex items-center justify-center text-[10px] mt-0.5 shrink-0">✓</div>
    <span className="text-xs font-bold text-gray-600 leading-tight">{text}</span>
  </div>
);

export default AIReviewQueue;
