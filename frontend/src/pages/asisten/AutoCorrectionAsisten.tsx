import React, { useState, useEffect } from 'react';
import { 
  HiOutlineCpuChip, 
  HiOutlineInformationCircle,
  HiOutlineCheckCircle,
  HiOutlineClock
} from 'react-icons/hi2';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import api from '../../lib/api';

const AutoCorrectionAsisten: React.FC = () => {
  const [stats, setStats] = useState<any[]>([]);
  const [tableData, setTableData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSimulated, setIsSimulated] = useState<boolean>(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await api.get('/ai/stats-pg');
      if (res.data && res.data.success) {
        const payload = res.data.data;
        setIsSimulated(!!res.data.isSimulated);
        
        // Map stats cards
        const total = payload.totalSubmissions || 0;
        const avg = payload.averageScore || 0;
        const perfect = payload.distribution?.perfect || 0;

        setStats([
          { title: 'PG Dikoreksi AI', value: String(total), sub: 'Pengerjaan Terkoreksi', trend: 'Total', color: 'bg-[#1E3A5F]' },
          { title: 'Rata-rata Nilai PG', value: String(avg), sub: 'Skor Kelas (0-100)', trend: 'Rata-rata', color: 'bg-[#1B5E20]' },
          { title: 'Nilai Sempurna', value: String(perfect), sub: 'Peserta Dapat 100', trend: 'Sempurna', color: 'bg-[#556B2F]' },
        ]);

        // Map table data
        const mappedSubmissions = (payload.submissions || []).map((sub: any) => {
          const scoreVal = sub.score !== null ? sub.score : (sub.aiScore !== null ? sub.aiScore : 0);
          
          const courseStr = sub.pertemuan && sub.pertemuan.mataKuliah 
            ? `${sub.pertemuan.mataKuliah.nama} · ${sub.pertemuan.urutan === 'UAS' ? 'UAS' : `P${sub.pertemuan.urutan}`}`
            : 'Mata Kuliah';

          const totalQuestions = 30;
          const correctQuestions = Math.round((scoreVal / 100) * totalQuestions);
          const ratioStr = `${correctQuestions}/${totalQuestions}`;

          return {
            name: sub.user?.nama || 'Mahasiswa',
            email: sub.user?.email || '',
            course: courseStr,
            type: 'PG Auto',
            score: scoreVal,
            ratio: ratioStr,
            status: 'AI Selesai',
            statusColor: 'bg-emerald-100 text-emerald-600'
          };
        });

        setTableData(mappedSubmissions);
      }
    } catch (error) {
      console.error('Error fetching stats-pg:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 bg-[#F3F4F6] min-h-screen pb-20">
      {/* Banner Demo Mode */}
      {isSimulated && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-black uppercase rounded-2xl tracking-wider flex items-center justify-between shadow-sm">
          <span>⚠️ Belum ada data pengerjaan latihan riil di database. Menampilkan data simulasi pengerjaan otomatis (Demo Mode).</span>
          <button onClick={() => setIsSimulated(false)} className="underline hover:text-amber-950 font-black ml-4">TUTUP</button>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 leading-tight">Auto Correction AI</h1>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
           Web Dev Bootcamp · Pengerjaan Soal Pilihan Ganda Terkoreksi Otomatis
        </p>
      </div>

      {/* Info Banner */}
      <div className="bg-[#1A202C] p-5 rounded-2xl flex items-center gap-4 mb-10 shadow-lg">
         <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-400">
            <HiOutlineCpuChip className="text-xl" />
         </div>
         <p className="text-[11px] font-bold text-blue-100/80 leading-relaxed">
            🤖 AI otomatis mengoreksi Latihan PG. Untuk Refleksi Esai — AI memberikan skor referensi, asisten meng-input nilai final. Untuk Upload Screenshot/File — asisten me-review secara manual.
         </p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">
          Memuat statistik auto-correction...
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {stats.map((stat, idx) => (
              <Card key={idx} className={`${stat.color} rounded-[2.5rem] border-none p-10 text-white relative overflow-hidden shadow-2xl`}>
                 <div className="relative z-10">
                    <div className="flex justify-between items-start mb-6">
                       <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-2xl">
                          {idx === 0 ? '🤖' : idx === 1 ? '🟩' : '🟨'}
                       </div>
                       <Badge className="bg-white/20 text-white border-none font-black text-[10px] px-4 py-1 rounded-full uppercase">
                          {stat.trend}
                       </Badge>
                    </div>
                    <h3 className="text-6xl font-black mb-2">{stat.value}</h3>
                    <p className="text-lg font-black opacity-90">{stat.title}</p>
                    <p className="text-[11px] font-bold opacity-50 uppercase tracking-widest mt-1">{stat.sub}</p>
                    <div className="mt-8 h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                       <div className="h-full bg-white w-[60%] opacity-40"></div>
                    </div>
                 </div>
              </Card>
            ))}
          </div>

          {/* Detail Table */}
          <Card className="rounded-[2.5rem] border-none shadow-sm bg-white overflow-hidden">
             <div className="grid grid-cols-12 px-10 py-8 bg-white text-xs font-black text-gray-900">
                <div className="col-span-4">Nama Peserta</div>
                <div className="col-span-3">Kursus · Pertemuan</div>
                <div className="col-span-2">Jenis</div>
                <div className="col-span-1 text-center">Skor AI</div>
                <div className="col-span-1 text-center">Benar/Total</div>
                <div className="col-span-1 text-right">Status</div>
             </div>

             <div className="divide-y divide-gray-50">
                {tableData.length === 0 ? (
                  <div className="p-10 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Belum ada data pengerjaan latihan PG.
                  </div>
                ) : (
                  tableData.map((row, idx) => (
                    <div key={idx} className="grid grid-cols-12 px-10 py-8 items-center hover:bg-gray-50/50 transition-all group">
                       <div className="col-span-4 flex items-center gap-4">
                          <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center text-white font-black text-xs">
                             {(row.name || 'M').split(' ').filter(Boolean).map((n: string) => n[0]).join('').substring(0, 3).toUpperCase()}
                          </div>
                          <div>
                            <span className="text-sm font-black text-gray-800 block">{row.name}</span>
                            <span className="text-[10px] font-bold text-gray-400 block">{row.email}</span>
                          </div>
                       </div>
                       <div className="col-span-3 text-sm font-bold text-gray-500">
                          {row.course}
                       </div>
                       <div className="col-span-2">
                          <Badge className="bg-blue-50 text-blue-500 border-none font-black text-[9px] px-4 py-1 rounded-lg uppercase">
                             {row.type}
                          </Badge>
                       </div>
                       <div className="col-span-1 text-center font-black text-xs text-gray-900 pr-4">
                          {row.score}
                       </div>
                       <div className="col-span-1 text-center text-sm font-black text-gray-900">
                          {row.ratio}
                       </div>
                       <div className="col-span-1 text-right">
                          <Badge className={`${row.statusColor} border-none font-black text-[8px] px-3 py-1 rounded-full uppercase`}>
                             {row.status}
                          </Badge>
                       </div>
                    </div>
                  ))
                )}
             </div>
          </Card>
        </>
      )}
    </div>
  );
};

export default AutoCorrectionAsisten;
