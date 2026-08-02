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

        setStats([
          { 
            title: 'PG Di Koreksi', 
            value: String(total || 38), 
            sub: 'Dari Total 48 Peserta', 
            trend: '+5 Hari Ini', 
            color: 'bg-gradient-to-br from-[#1E3A5F] via-[#102A43] to-[#0A1A2E]',
            width: 'w-[80%]'
          },
          { 
            title: 'Essai Selesai', 
            value: '22', 
            sub: 'sudah di koreksi manual', 
            trend: '+3 Hari Ini', 
            color: 'bg-gradient-to-br from-[#1B5E20] via-[#14532D] to-[#062413]',
            width: 'w-[45%]'
          },
          { 
            title: 'Upload Menunggu', 
            value: '10', 
            sub: 'Menunggu Koreksi Manual', 
            trend: '-3 Dari Kemarin', 
            color: 'bg-gradient-to-br from-[#556B2F] via-[#3F6212] to-[#1A2E05]',
            width: 'w-[20%]'
          },
        ]);

        // Map table data
        const mappedSubmissions = (payload.submissions || []).map((sub: any) => {
          const scoreVal = sub.score !== null ? sub.score : (sub.aiScore !== null ? sub.aiScore : 0);
          
          const courseStr = sub.pertemuan && sub.pertemuan.mataKuliah 
            ? `${sub.pertemuan.mataKuliah.nama} · ${sub.pertemuan.urutan === 'UAS' ? 'UAS' : `P${sub.pertemuan.urutan}`}`
            : 'Mata Kuliah';

          const isHigh = scoreVal >= 70;
          const totalQuestions = isHigh ? 30 : 10;
          const correctQuestions = Math.round((scoreVal / 100) * totalQuestions);
          const ratioStr = `${correctQuestions}/${totalQuestions}`;

          return {
            name: sub.user?.nama || 'Mahasiswa',
            email: sub.user?.email || '',
            course: courseStr,
            type: isHigh ? 'Tes Formatif' : 'Latihan',
            score: scoreVal,
            ratio: ratioStr,
            status: isHigh ? 'Selesai' : 'Tunggu Asisten',
            statusColor: isHigh ? 'bg-emerald-50 text-emerald-500' : 'bg-purple-50 text-purple-500'
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
        <h1 className="text-3xl font-black text-gray-900 leading-tight">Skema Penilaian</h1>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
           Web Dev Bootcamp · P2 HTML Dasar · Upload Screenshot Coding
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
                       <div className={`h-full bg-white ${stat.width || 'w-[60%]'} opacity-40`}></div>
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
                          <Badge className={`border-none font-black text-[9px] px-4 py-1 rounded-lg uppercase ${
                            row.type === 'Tes Formatif' ? 'bg-blue-50 text-blue-500' : 'bg-purple-50 text-purple-500'
                          }`}>
                             {row.type}
                          </Badge>
                       </div>
                       <div className="col-span-1 flex flex-col items-center justify-center pr-4">
                          <span className={`font-black text-xs ${row.score >= 70 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>{row.score}</span>
                          <div className="w-12 h-1 bg-gray-200 rounded-full mt-1 overflow-hidden">
                             <div 
                               className={`h-full ${row.score >= 70 ? 'bg-[#10B981]' : 'bg-[#EF4444]'}`} 
                               style={{ width: `${row.score}%` }}
                             ></div>
                          </div>
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
