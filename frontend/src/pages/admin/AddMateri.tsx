import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMateriStore } from '../../store/useMateriStore';
import { useJadwalStore } from '../../store/useJadwalStore';
import { useMataKuliahStore } from '../../store/useMataKuliahStore';
import { 
  HiOutlineArrowLeft, 
  HiOutlinePlus,
  HiOutlineVideoCamera,
  HiOutlineDocumentText,
  HiOutlineLink,
  HiOutlineCheckCircle,
  HiOutlineLockClosed
} from 'react-icons/hi2';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const AddMateriAdmin: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const pertemuanId = searchParams.get('pertemuanId');
  
  const { addMateri, isLoading } = useMateriStore();
  const { jadwalList, fetchJadwal } = useJadwalStore();
  const { mataKuliahList } = useMataKuliahStore();

  const [jenisUtama, setJenisUtama] = useState('Micro Learning');
  const [topik, setTopik] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [refleksi, setRefleksi] = useState('');

  // Find current session and course
  const session = jadwalList.find(s => s.id === pertemuanId);
  const course = mataKuliahList.find(mk => mk.id === session?.mataKuliahId);

  useEffect(() => {
    if (session?.mataKuliahId) {
      fetchJadwal(session.mataKuliahId);
    }
  }, [session?.mataKuliahId, fetchJadwal]);

  useEffect(() => {
    if (session) {
      setTopik(session.topik || '');
    }
  }, [session]);

  const handleSave = async () => {
    if (!pertemuanId || !course?.id) return;

    await addMateri({
      nama: topik,
      pertemuanId,
      mataKuliahId: course.id,
      videoUrl,
      fileUrl,
      refleksi
    });

    navigate('/admin/materi');
  };

  return (
    <div className="p-8 bg-[#F3F4F6] min-h-screen pb-20">
      {/* Header */}
      <div className="flex items-center gap-6 mb-10">
        <Button 
          variant="outline" 
          onClick={() => navigate('/admin/materi')}
          className="bg-white border-none shadow-sm rounded-xl font-bold text-xs py-6 px-6"
        >
          <HiOutlineArrowLeft className="mr-2" /> Kembali ke Materi
        </Button>
        <div>
          <h1 className="text-3xl font-black text-gray-900 leading-none">
            Add Materi — Pertemuan {session?.urutan || '?'}
          </h1>
          <p className="text-sm text-gray-500 font-bold mt-2 uppercase tracking-tight">
            {course?.nama || 'Unknown Course'} — {session?.tgl ? new Date(session.tgl).toLocaleDateString('id-ID', { day: '2-digit', month: 'long' }) : 'No Date'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Left Column */}
        <div className="col-span-7 space-y-8">
          <Card className="rounded-[2rem] border-none shadow-sm bg-white p-10">
            <h2 className="text-lg font-black text-gray-900 mb-8">Konten Pembelajaran</h2>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-gray-900 ml-1">Topik Pertemuan</label>
                <Input 
                  placeholder="Judul topik pertemuan..." 
                  value={topik}
                  onChange={(e) => setTopik(e.target.value)}
                  className="rounded-xl border-gray-100 bg-gray-50/50 py-7 focus:bg-white transition-all font-bold text-sm" 
                />
              </div>

              <div className="space-y-3">
                <label className="text-[11px] font-bold text-gray-900 ml-1">Jenis Utama</label>
                <div className="flex gap-6">
                   {['Zoom/Meet', 'Micro Learning', 'General PDF'].map((type) => (
                     <label key={type} className="flex items-center gap-2 cursor-pointer group">
                        <div 
                          onClick={() => setJenisUtama(type)}
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                            jenisUtama === type ? 'border-indigo-600 bg-indigo-600 shadow-lg shadow-indigo-100' : 'border-gray-200 group-hover:border-gray-300'
                          }`}
                        >
                          {jenisUtama === type && <div className="w-2 h-2 bg-white rounded-full"></div>}
                        </div>
                        <span className={`text-xs font-bold ${jenisUtama === type ? 'text-gray-900' : 'text-gray-400'}`}>{type}</span>
                     </label>
                   ))}
                </div>
              </div>

              {/* Video URL Section */}
              <div className="pt-6 border-t border-dashed border-gray-100 space-y-6">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest italic">Video Pembelajaran (YouTube/Vimeo):</p>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-gray-900 ml-1 flex items-center gap-2">
                    <HiOutlineVideoCamera className="text-indigo-600" /> Link Video
                  </label>
                  <Input 
                    placeholder="https://youtube.com/watch?v=..." 
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    className="rounded-xl border-gray-100 bg-gray-50/50 py-7 focus:bg-white" 
                  />
                </div>
              </div>

              {/* PDF URL Section */}
              <div className="pt-6 border-t border-dashed border-gray-100 space-y-6">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest italic">Modul Pembelajaran (Link PDF/Drive):</p>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-gray-900 ml-1 flex items-center gap-2">
                    <HiOutlineDocumentText className="text-indigo-600" /> Link Modul/File
                  </label>
                  <Input 
                    placeholder="https://drive.google.com/..." 
                    value={fileUrl}
                    onChange={(e) => setFileUrl(e.target.value)}
                    className="rounded-xl border-gray-100 bg-gray-50/50 py-7 focus:bg-white" 
                  />
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column */}
        <div className="col-span-5 space-y-8">
           <Card className="rounded-[2rem] border-none shadow-sm bg-white p-10">
              <h2 className="text-lg font-black text-gray-900 mb-8">Refleksi Materi</h2>
              <div className="space-y-6">
                 <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                    <p className="text-[9px] text-red-600 font-bold leading-relaxed">
                       Tuliskan pertanyaan refleksi untuk peserta setelah mempelajari materi ini.
                    </p>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[11px] font-bold text-gray-900 ml-1">Pertanyaan Refleksi</label>
                    <textarea 
                      rows={5}
                      value={refleksi}
                      onChange={(e) => setRefleksi(e.target.value)}
                      placeholder="Apa yang Anda pelajari hari ini? Apa kesulitan yang Anda hadapi?"
                      className="w-full rounded-xl border-gray-100 bg-gray-50/50 p-4 focus:bg-white transition-all text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                 </div>
              </div>
           </Card>

           {/* AI Status */}
           <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-8 rounded-[2rem] border border-white shadow-xl shadow-indigo-100">
              <div className="flex items-center gap-2 mb-6">
                 <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                 <p className="text-[11px] font-black text-indigo-600">AI Enhancement Ready</p>
              </div>
              <p className="text-[9px] text-indigo-400 font-bold italic">
                Sistem akan memproses materi untuk membantu AI dalam mengevaluasi refleksi mahasiswa.
              </p>
           </div>

           <div className="flex gap-4 pt-4">
              <Button 
                variant="outline" 
                onClick={() => navigate('/admin/materi')}
                className="flex-1 bg-white border-none shadow-sm rounded-xl py-8 font-bold text-[10px] text-gray-900"
              >
                Batal
              </Button>
              <Button 
                onClick={handleSave}
                disabled={isLoading}
                className="flex-[3] bg-[#0E341E] hover:bg-[#0a2616] text-white font-black rounded-xl py-8 shadow-2xl shadow-emerald-900/10 uppercase tracking-[0.2em] text-[10px]"
              >
                {isLoading ? 'Menyimpan...' : (
                  <>
                    <HiOutlineLockClosed className="mr-2 text-lg" /> Simpan Materi
                  </>
                )}
              </Button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AddMateriAdmin;
