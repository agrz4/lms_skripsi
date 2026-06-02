import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMateriStore } from '../../store/useMateriStore';
import { useJadwalStore } from '../../store/useJadwalStore';
import { 
  HiOutlineArrowLeft, 
  HiOutlineChevronLeft, 
  HiOutlineChevronRight,
  HiOutlinePlayCircle,
  HiOutlineDocumentArrowDown,
  HiOutlineCheckCircle,
  HiOutlineCloudArrowUp,
  HiOutlineSparkles
} from 'react-icons/hi2';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import api from '../../lib/api';

const MateriSesi: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const pertemuanId = searchParams.get('pertemuanId');

  const { materiList, fetchMateriByPertemuan } = useMateriStore();
  const { jadwalList } = useJadwalStore();
  
  // State variables for Reflection
  const [refleksi, setRefleksi] = useState('');
  const [isSubmittingRefleksi, setIsSubmittingRefleksi] = useState(false);
  const [aiScoreRef, setAiScoreRef] = useState<number | null>(null);

  // State variables for Screenshot Upload
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [isUploadingScreenshot, setIsUploadingScreenshot] = useState(false);
  const [screenshotProgress, setScreenshotProgress] = useState(0);
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null);

  // State variables for ZIP File Upload
  const [programFile, setProgramFile] = useState<File | null>(null);
  const [isUploadingProgram, setIsUploadingProgram] = useState(false);
  const [programProgress, setProgramProgress] = useState(0);
  const [programUrl, setProgramUrl] = useState<string | null>(null);

  // Visual feedback banner state
  const [banner, setBanner] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Dynamic fetched pertemuan details
  const [pertemuanDetail, setPertemuanDetail] = useState<any>(null);
  const [progressDetail, setProgressDetail] = useState<any>(null);

  // Find session info
  const session = jadwalList.find(s => s.id === pertemuanId);
  const videos = materiList.filter(m => m.videoUrl && !m.videoUrl.toLowerCase().includes('tiktok'));
  const tiktokVideos = materiList.filter(m => m.videoUrl && m.videoUrl.toLowerCase().includes('tiktok'));
  const pdfs = materiList.filter(m => m.fileUrl);

  const currentUrutan = pertemuanDetail?.urutan || session?.urutan;
  const prevSession = currentUrutan ? jadwalList.find(s => s.urutan === currentUrutan - 1) : null;
  const nextSession = currentUrutan ? jadwalList.find(s => s.urutan === currentUrutan + 1) : null;

  // Fetch materials & past submissions on load
  useEffect(() => {
    if (pertemuanId) {
      fetchMateriByPertemuan(pertemuanId);

      // Fetch single pertemuan detail
      api.get(`/pertemuan/${pertemuanId}`)
        .then(res => setPertemuanDetail(res.data))
        .catch(err => console.error('Failed to fetch pertemuan detail', err));

      // Fetch progress list to find this meeting's progress
      api.get('/student/status/progres')
        .then(res => {
          const list = res.data.data || [];
          const prog = list.find((p: any) => p.pertemuanId === pertemuanId);
          if (prog) setProgressDetail(prog);
        })
        .catch(err => console.error('Failed to fetch student progress', err));

      // Ambil data tugas/refleksi yang sudah dikumpulkan sebelumnya
      api.get(`/student/submissions?pertemuanId=${pertemuanId}`)
        .then(response => {
          const subs = response.data.data;
          const reflectionSub = subs.find((s: any) => s.type === 'REFLEKSI');
          const screenshotSub = subs.find((s: any) => s.type === 'SCREENSHOT');
          const programSub = subs.find((s: any) => s.type === 'FILE_UPLOAD');

          if (reflectionSub) {
            setRefleksi(reflectionSub.content || '');
            if (reflectionSub.aiScore) {
              setAiScoreRef(reflectionSub.aiScore);
            }
          }
          if (screenshotSub) setScreenshotUrl(screenshotSub.fileUrl || '');
          if (programSub) setProgramUrl(programSub.fileUrl || '');
        })
        .catch(err => console.error('Gagal mengambil data submission sebelumnya', err));
    }
  }, [pertemuanId, fetchMateriByPertemuan]);

  // Handler for uploading Screenshot
  const handleScreenshotUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingScreenshot(true);
    setScreenshotProgress(0);

    const interval = setInterval(() => {
      setScreenshotProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 10;
      });
    }, 100);

    try {
      const formData = new FormData();
      formData.append('pertemuanId', pertemuanId || '');
      formData.append('type', 'SCREENSHOT');
      formData.append('file', file);

      const response = await api.post('/student/upload/tugas', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      clearInterval(interval);
      setScreenshotProgress(100);
      setTimeout(() => {
        setIsUploadingScreenshot(false);
        setScreenshotUrl(response.data.data.fileUrl);
        showBanner('success', `Screenshot "${file.name}" berhasil diupload!`);
      }, 500);
    } catch (err) {
      clearInterval(interval);
      setIsUploadingScreenshot(false);
      showBanner('error', 'Gagal mengupload screenshot');
    }
  };

  // Handler for uploading ZIP Program File
  const handleProgramUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setProgramFile(file);
    setIsUploadingProgram(true);
    setProgramProgress(0);

    const interval = setInterval(() => {
      setProgramProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 10;
      });
    }, 100);

    try {
      const formData = new FormData();
      formData.append('pertemuanId', pertemuanId || '');
      formData.append('type', 'FILE_UPLOAD');
      formData.append('file', file);

      const response = await api.post('/student/upload/tugas', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      clearInterval(interval);
      setProgramProgress(100);
      setTimeout(() => {
        setIsUploadingProgram(false);
        setProgramUrl(response.data.data.fileUrl);
        showBanner('success', `File program "${file.name}" berhasil diupload!`);
      }, 500);
    } catch (err) {
      clearInterval(interval);
      setIsUploadingProgram(false);
      showBanner('error', 'Gagal mengupload file program');
    }
  };

  // Handler for submitting Reflection
  const handleRefleksiSubmit = async () => {
    if (!refleksi.trim()) {
      showBanner('error', 'Tuliskan esai refleksi Anda terlebih dahulu!');
      return;
    }

    setIsSubmittingRefleksi(true);
    try {
      const response = await api.post('/student/refleksi/submit', {
        pertemuanId,
        content: refleksi
      });

      const score = response.data.data.aiScore;
      setAiScoreRef(score);
      showBanner('success', `Refleksi berhasil dikirim! AI menilai: ${score}/100.`);
      
      // Update progress pertemuan ke completed secara otomatis
      await api.post('/student/status/progres', {
        pertemuanId,
        isCompleted: true
      });
    } catch (err) {
      showBanner('error', 'Gagal mengirim jawaban refleksi');
    } finally {
      setIsSubmittingRefleksi(false);
    }
  };

  const showBanner = (type: 'success' | 'error', text: string) => {
    setBanner({ type, text });
    setTimeout(() => setBanner(null), 5000);
  };

  return (
    <div className="p-8 bg-[#F3F4F6] min-h-screen pb-20 text-left">
      {/* Visual Feedback Floating Banner */}
      {banner && (
        <div className={`fixed top-6 right-6 z-50 p-4 rounded-xl shadow-2xl flex items-center gap-3 animate-bounce border text-xs font-black ${
          banner.type === 'success' ? 'bg-emerald-500 border-emerald-600 text-white' : 'bg-red-500 border-red-600 text-white'
        }`}>
          <span>{banner.type === 'success' ? '⚡' : '⚠️'}</span>
          <span>{banner.text}</span>
        </div>
      )}

      {/* Header Navigation */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={() => navigate(-1)}
            className="bg-white border-none shadow-sm rounded-xl font-bold text-[10px] uppercase py-6 px-6"
          >
            <HiOutlineArrowLeft className="mr-2" /> List Pertemuan
          </Button>
          <div>
            <h1 className="text-2xl font-black text-gray-900 leading-tight text-left">
               P{pertemuanDetail?.urutan || session?.urutan || '—'} — {pertemuanDetail?.topik || session?.topik || 'CSS Layout & Flexbox'}
            </h1>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1 text-left">
               {pertemuanDetail?.mataKuliah?.nama || 'Web Dev Bootcamp'} · {pertemuanDetail?.mataKuliah?.tipeKursus || 'Online'} · {pertemuanDetail?.tgl ? new Date(pertemuanDetail.tgl).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Belum Ada Tanggal'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {prevSession && (
            <Button 
              variant="outline" 
              onClick={() => navigate(`/user/materi-sesi?pertemuanId=${prevSession.id}`)}
              className="bg-white border-none shadow-sm rounded-xl py-6 px-6 font-black text-xs"
            >
              <HiOutlineChevronLeft className="mr-2" /> P{prevSession.urutan}
            </Button>
          )}
          {nextSession && (
            <Button 
              onClick={() => navigate(`/user/materi-sesi?pertemuanId=${nextSession.id}`)}
              className="bg-blue-600 hover:bg-blue-700 text-white border-none shadow-lg shadow-blue-100 rounded-xl py-6 px-6 font-black text-xs"
            >
              P{nextSession.urutan} <HiOutlineChevronRight className="ml-2" />
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Content: Videos & Files */}
        <div className="lg:col-span-8 space-y-8">
          <Card className="rounded-[2.5rem] border-none shadow-sm bg-white p-10">
            <h2 className="text-xl font-black text-gray-900 mb-8 text-left">Video Materi ({videos.length + tiktokVideos.length} Video)</h2>
            
            <div className="space-y-12">
              {videos.map((v, i) => (
                <div key={v.id} className="space-y-6">
                  <h3 className="text-sm font-black text-gray-700 text-left">Video {i + 1} — {v.nama}</h3>
                  <div className="aspect-video w-full bg-gray-100 rounded-[2rem] flex items-center justify-center border border-gray-50 overflow-hidden relative group">
                    <HiOutlinePlayCircle className="text-8xl text-gray-300 group-hover:text-blue-500 transition-all cursor-pointer animate-pulse" />
                    <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gray-200">
                      <div className="h-full bg-indigo-500 w-[40%]"></div>
                    </div>
                  </div>
                </div>
              ))}

              {tiktokVideos.map((v, i) => (
                <div key={v.id} className="space-y-6">
                   <h3 className="text-sm font-black text-gray-700 text-left">Video {videos.length + i + 1} — {v.nama} (TikTok)</h3>
                   <div 
                     onClick={() => window.open(v.videoUrl, '_blank')}
                     className="aspect-video w-full bg-gray-50 rounded-[2rem] flex items-center justify-center border-2 border-dashed border-gray-200 group cursor-pointer hover:bg-gray-100/50 transition-all"
                   >
                      <div className="flex flex-col items-center gap-3 text-center">
                         <HiOutlinePlayCircle className="text-6xl text-gray-300 group-hover:text-indigo-500 transition-all" />
                         <div>
                            <p className="text-xs font-black text-gray-500">{v.videoUrl.replace('https://', '').replace('http://', '')}</p>
                            <p className="text-[10px] font-bold text-gray-400">Klik untuk buka di TikTok</p>
                         </div>
                      </div>
                   </div>
                </div>
              ))}

              {videos.length === 0 && tiktokVideos.length === 0 && (
                <div className="text-center py-12 text-xs font-bold text-gray-300 italic">
                   Belum ada video pembelajaran untuk sesi ini
                </div>
              )}

              {/* Sub Materi / PDF Section */}
              <div className="pt-10 border-t border-gray-50 space-y-6">
                <h3 className="text-sm font-black text-gray-700 text-left">Sub Materi</h3>
                <div className="space-y-3">
                   {pdfs.length > 0 ? pdfs.map((p, i) => (
                     <div 
                       key={p.id} 
                       onClick={() => navigate(`/user/view-pdf?pertemuanId=${pertemuanId}&url=${encodeURIComponent(p.fileUrl)}&name=${encodeURIComponent(p.nama)}`)}
                       className="flex items-center justify-between p-5 bg-gray-50 border border-gray-100 rounded-2xl group hover:border-blue-400 hover:bg-blue-50/30 transition-all cursor-pointer shadow-sm"
                     >
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                              <HiOutlineDocumentArrowDown className="text-xl text-blue-500" />
                           </div>
                           <span className="text-xs font-black text-gray-700">Sub Materi {i+1}: {p.nama}</span>
                        </div>
                        <Button className="bg-[#0E341E] hover:bg-[#0a2616] text-white font-black text-[10px] rounded-lg px-6 uppercase tracking-wider">
                           Buka PDF
                        </Button>
                     </div>
                   )) : (
                     <div className="text-center py-4 text-xs font-bold text-gray-300 italic">Belum ada file PDF</div>
                   )}
                </div>
              </div>
            </div>
          </Card>

          {/* Latihan PG Section */}
          <Card className="rounded-[2.5rem] border-none shadow-sm bg-white p-10">
             <div className="flex justify-between items-center mb-8">
                <div>
                   <h2 className="text-xl font-black text-gray-900 text-left">Latihan PG (10 Soal)</h2>
                   <p className="text-xs font-bold text-gray-400 mt-1 text-left">Jawab 10 soal pilihan ganda · AI langsung koreksi dan beri nilai</p>
                </div>
                <Badge className="bg-emerald-100 text-emerald-600 border-none font-black text-[9px] px-4 py-1 uppercase tracking-widest">
                   AI Auto Koreksi
                </Badge>
             </div>
             <Button className="w-full bg-[#10B981] hover:bg-[#059669] text-white font-black py-8 rounded-2xl shadow-xl shadow-emerald-100 uppercase tracking-widest text-xs">
                Mulai Latihan PG →
             </Button>
          </Card>

          {/* Latihan Upload Section */}
          <Card className="rounded-[2.5rem] border-none shadow-sm bg-white p-10">
             <div className="flex justify-between items-center mb-8">
                <div>
                   <h2 className="text-xl font-black text-gray-900 text-left">Latihan Praktik</h2>
                   <p className="text-xs font-bold text-gray-400 mt-1 text-left">Buat layout CSS sederhana dan upload screenshot hasilnya + file zip project</p>
                </div>
                <Badge className="bg-blue-100 text-blue-600 border-none font-black text-[9px] px-4 py-1 uppercase tracking-widest">
                   Screenshot/File
                </Badge>
             </div>
             <div className="space-y-4">
                {/* Input Files (Hidden) */}
                <input 
                  type="file" 
                  id="screenshot-input" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleScreenshotUpload} 
                />
                <input 
                  type="file" 
                  id="program-input" 
                  accept=".zip,.rar,.tar.gz" 
                  className="hidden" 
                  onChange={handleProgramUpload} 
                />

                {/* Box Screenshot */}
                <div 
                  onClick={() => !isUploadingScreenshot && document.getElementById('screenshot-input')?.click()}
                  className={`w-full p-8 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-3 transition-all cursor-pointer ${
                    screenshotUrl ? 'border-emerald-300 bg-emerald-50/20' : 
                    isUploadingScreenshot ? 'border-blue-300 bg-blue-50/10 animate-pulse' : 'border-gray-100 bg-gray-50/50 hover:border-blue-300'
                  }`}
                >
                   {isUploadingScreenshot ? (
                     <div className="w-full space-y-2 text-center">
                       <div className="flex justify-between text-[10px] font-black text-blue-600 uppercase tracking-wider">
                         <span>Mengupload screenshot...</span>
                         <span>{screenshotProgress}%</span>
                       </div>
                       <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                         <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${screenshotProgress}%` }}></div>
                       </div>
                     </div>
                   ) : screenshotUrl ? (
                     <div className="flex items-center gap-3 w-full justify-between">
                       <div className="flex items-center gap-3">
                         <div className="w-10 h-8 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600 font-bold text-sm shadow-sm">
                           ✓
                         </div>
                         <div className="text-left">
                           <p className="text-xs font-black text-emerald-950 font-black">Screenshot Terupload</p>
                           <p className="text-[9px] text-gray-400 font-bold truncate max-w-xs">{screenshotUrl.split('/').pop()}</p>
                         </div>
                       </div>
                       <Badge className="bg-emerald-100 text-emerald-600 border-none font-bold text-[9px] px-3 py-1">Ganti File</Badge>
                     </div>
                   ) : (
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-8 bg-amber-100 rounded-lg flex items-center justify-center text-amber-500 text-lg shadow-sm">
                           📸
                        </div>
                        <span className="text-xs font-black text-gray-500">Upload Screenshot (.png/.jpg)</span>
                     </div>
                   )}
                </div>

                {/* Box ZIP Program File */}
                <div 
                  onClick={() => !isUploadingProgram && document.getElementById('program-input')?.click()}
                  className={`w-full p-8 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-3 transition-all cursor-pointer ${
                    programUrl ? 'border-emerald-300 bg-emerald-50/20' : 
                    isUploadingProgram ? 'border-blue-300 bg-blue-50/10 animate-pulse' : 'border-gray-100 bg-gray-50/50 hover:border-blue-300'
                  }`}
                >
                   {isUploadingProgram ? (
                     <div className="w-full space-y-2 text-center">
                       <div className="flex justify-between text-[10px] font-black text-blue-600 uppercase tracking-wider">
                         <span>Mengupload file program...</span>
                         <span>{programProgress}%</span>
                       </div>
                       <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                         <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${programProgress}%` }}></div>
                       </div>
                     </div>
                   ) : programUrl ? (
                     <div className="flex items-center gap-3 w-full justify-between">
                       <div className="flex items-center gap-3">
                         <div className="w-10 h-8 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600 font-bold text-sm shadow-sm">
                           ✓
                         </div>
                         <div className="text-left">
                           <p className="text-xs font-black text-emerald-950 font-black">File Program Terupload</p>
                           <p className="text-[9px] text-gray-400 font-bold truncate max-w-xs">{programUrl.split('/').pop()}</p>
                         </div>
                       </div>
                       <Badge className="bg-emerald-100 text-emerald-600 border-none font-bold text-[9px] px-3 py-1">Ganti File</Badge>
                     </div>
                   ) : (
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-500 text-lg shadow-sm">
                           🗜️
                        </div>
                        <span className="text-xs font-black text-gray-500">Upload File Program (.zip)</span>
                     </div>
                   )}
                </div>
             </div>
          </Card>
        </div>

        {/* Sidebar: Refleksi & Status */}
        <div className="lg:col-span-4 space-y-8">
          {/* Refleksi Card */}
          <Card className="rounded-[2.5rem] border-2 border-emerald-100 shadow-xl shadow-emerald-50 bg-[#E9F7F2] p-8">
             <div className="flex items-center gap-2 mb-4 justify-between">
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                   <h3 className="text-sm font-black text-emerald-900 uppercase">Refleksi Pertemuan {session?.urutan}</h3>
                </div>
                {aiScoreRef !== null && (
                  <Badge className="bg-emerald-600 text-white border-none font-black text-[10px] px-3 py-1 uppercase tracking-widest shadow-lg shadow-emerald-100">
                     AI: {aiScoreRef}/100
                  </Badge>
                )}
             </div>
             <div className="text-[11px] font-bold text-emerald-800/70 leading-relaxed mb-6 text-left space-y-2">
                <span className="text-emerald-900 block font-black mb-1">Pertanyaan Refleksi:</span>
                {materiList.filter(m => m.refleksi && m.refleksi.trim()).length > 0 ? (
                   materiList
                      .filter(m => m.refleksi && m.refleksi.trim())
                      .map((m, idx, arr) => (
                         <p key={m.id || idx} className="bg-white/40 p-2.5 rounded-xl border border-emerald-100/50">
                            {arr.length > 1 ? `${idx + 1}. ` : ''}{m.refleksi}
                         </p>
                      ))
                ) : (
                   <p className="bg-white/40 p-2.5 rounded-xl border border-emerald-100/50">
                      Jelaskan apa yang kamu pelajari pada pertemuan ini dan bagaimana penerapannya dalam layout web?
                   </p>
                )}
             </div>
             <textarea 
               value={refleksi}
               onChange={(e) => setRefleksi(e.target.value)}
               placeholder="Tuliskan Refleksimu di sini..."
               className="w-full h-48 bg-white border-none rounded-[1.5rem] p-6 text-xs font-medium focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all text-left"
             />
             <p className="text-[9px] font-bold text-emerald-800/40 italic mt-3 mb-6 text-left">
                AI akan memberi skor referensi · Nilai final dari Asisten
             </p>
             <Button 
               onClick={handleRefleksiSubmit}
               disabled={isSubmittingRefleksi}
               className="w-full bg-[#10B981] hover:bg-[#059669] text-white font-black py-6 rounded-xl shadow-lg shadow-emerald-100 uppercase tracking-widest text-[10px]"
             >
                {isSubmittingRefleksi ? 'Sedang Menilai (AI)...' : 'Submit Refleksi'}
             </Button>
          </Card>

          {/* Status Tracker Card */}
          <Card className="rounded-[2.5rem] border-none shadow-sm bg-white overflow-hidden">
             <div className="p-8 pb-4 text-left">
                <h3 className="text-base font-black text-gray-900">Status P{pertemuanDetail?.urutan || session?.urutan}</h3>
             </div>
             <div className="divide-y divide-gray-50">
                {(() => {
                  const statusItems = [];

                  videos.forEach((v, idx) => {
                    const isWatched = progressDetail && progressDetail.watchedTime >= 100;
                    statusItems.push({
                      name: v.nama,
                      status: isWatched ? 'Selesai' : progressDetail?.watchedTime ? `${progressDetail.watchedTime}% ditonton` : 'Belum ditonton',
                      color: isWatched ? 'text-emerald-500 bg-emerald-50' : progressDetail?.watchedTime ? 'text-amber-500 bg-amber-50' : 'text-gray-300 bg-gray-50'
                    });
                  });

                  tiktokVideos.forEach((v, idx) => {
                    const isWatched = progressDetail?.isCompleted || screenshotUrl;
                    statusItems.push({
                      name: `${v.nama} (TikTok)`,
                      status: isWatched ? 'Selesai' : 'Belum',
                      color: isWatched ? 'text-emerald-500 bg-emerald-50' : 'text-gray-300 bg-gray-50'
                    });
                  });

                  statusItems.push({
                    name: 'Latihan PG',
                    status: progressDetail?.isCompleted ? 'Selesai' : 'Belum',
                    color: progressDetail?.isCompleted ? 'text-emerald-500 bg-emerald-50' : 'text-gray-300 bg-gray-50'
                  });

                  statusItems.push({
                    name: 'Upload Screenshot',
                    status: screenshotUrl ? 'Selesai' : 'Belum',
                    color: screenshotUrl ? 'text-emerald-500 bg-emerald-50' : 'text-gray-300 bg-gray-50'
                  });

                  statusItems.push({
                    name: 'Upload ZIP Program',
                    status: programUrl ? 'Selesai' : 'Belum',
                    color: programUrl ? 'text-emerald-500 bg-emerald-50' : 'text-gray-300 bg-gray-50'
                  });

                  statusItems.push({
                    name: 'Refleksi Jawaban',
                    status: aiScoreRef !== null ? 'Selesai' : 'Belum',
                    color: aiScoreRef !== null ? 'text-emerald-500 bg-emerald-50' : 'text-gray-300 bg-gray-50'
                  });

                  return statusItems.map((item, idx) => (
                    <div key={idx} className="p-6 flex justify-between items-center">
                       <span className="text-xs font-bold text-gray-500">{item.name}</span>
                       <Badge className={`${item.color} border-none font-black text-[8px] px-3 py-0.5 rounded-full uppercase`}>
                          {item.status}
                       </Badge>
                    </div>
                  ));
                })()}
             </div>
          </Card>

          {/* AI Hint Section */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-8 rounded-[2.5rem] border border-white shadow-xl shadow-indigo-100/50">
             <div className="flex items-center gap-2 mb-4">
                <HiOutlineSparkles className="text-indigo-600" />
                <h3 className="text-xs font-black text-indigo-900 uppercase text-left">AI Learning Buddy</h3>
             </div>
             <p className="text-[10px] text-indigo-800/60 font-bold leading-relaxed text-left">
                Tulis refleksi dengan mendalam! Engine AI Gemini akan menilai kualitas penjelasan esaimu secara instan untuk membantu Asisten memberi nilai terbaik.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MateriSesi;
