import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  HiOutlineArrowLeft, 
  HiOutlinePlus,
  HiOutlineTrash,
  HiOutlineCheck,
  HiOutlineFolder,
  HiOutlinePlayCircle
} from 'react-icons/hi2';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import api from '../../lib/api';

const AddMateriAdmin: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const pertemuanId = searchParams.get('pertemuanId');
  
  const [meeting, setMeeting] = useState<any>(null);
  const [allMeetings, setAllMeetings] = useState<any[]>([]);

  const [jenisUtama, setJenisUtama] = useState('Micro Learning');
  const [topik, setTopik] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [refleksi, setRefleksi] = useState('');
  const [materiId, setMateriId] = useState('');
  const [pgQuestions, setPgQuestions] = useState<string>('');
  const [newQuestion, setNewQuestion] = useState<string>('');
  const [saving, setSaving] = useState<boolean>(false);
  const [uploadingVideo, setUploadingVideo] = useState<boolean>(false);
  const [uploadingFile, setUploadingFile] = useState<boolean>(false);
  const [tugasCoding, setTugasCoding] = useState<string>(
    'Buatlah program sesuai instruksi pada modul ajar, kemudian unggah screenshot hasil run dan file source code (.zip) sebagai bukti praktikum.'
  );

  useEffect(() => {
    if (pertemuanId) {
      // 1. Fetch specific meeting details
      api.get(`/pertemuan/${pertemuanId}`)
        .then(res => {
          const mData = res.data;
          setMeeting(mData);
          
          // 2. Fetch all meetings of this course to support next session navigation
          if (mData?.mataKuliahId) {
            api.get(`/pertemuan?mataKuliahId=${mData.mataKuliahId}`)
              .then(allRes => {
                setAllMeetings(allRes.data || []);
              })
              .catch(err => console.error('Failed to fetch all meetings', err));
          }
        })
        .catch(err => console.error('Failed to fetch meeting detail', err));

      // 3. Fetch PG questions
      api.get(`/materi/latihan-pg?pertemuanId=${pertemuanId}`)
        .then(res => {
          const existingPg = res.data || [];
          if (existingPg.length > 0) {
            setPgQuestions(existingPg.map((q: any) => q.pertanyaan).join('\n'));
          } else {
            setPgQuestions('');
          }
        })
        .catch(err => console.error('Failed to fetch pg questions', err));
      
      // 4. Fetch existing materials
      api.get(`/materi?pertemuanId=${pertemuanId}`)
        .then(res => {
          const existingMateri = res.data || [];
          if (existingMateri.length > 0) {
            const m = existingMateri[0];
            setMateriId(m.id);
            setTopik(m.nama || '');
            setVideoUrl(m.videoUrl || '');
            setFileUrl(m.fileUrl || '');
            setRefleksi(m.refleksi || '');
            setJenisUtama(m.videoUrl && (m.videoUrl.includes('tiktok') || m.videoUrl.includes('youtube') || m.videoUrl.includes('http')) ? 'Micro Learning' : 'Zoom/Meet');
          } else {
            setMateriId('');
            setTopik('');
            setVideoUrl('');
            setFileUrl('');
            setRefleksi('');
            setJenisUtama('Micro Learning');
          }
        })
        .catch(err => console.error('Failed to fetch materi', err));
    }
  }, [pertemuanId]);

  const handleVideoUpload = async (file: File) => {
    setUploadingVideo(true);
    const formData = new FormData();
    formData.append('video', file);
    try {
      const res = await api.post('/materi/upload-video', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data && res.data.success) {
        setVideoUrl(res.data.fileUrl);
      }
    } catch (error: any) {
      console.error(error);
      alert('Gagal upload video: ' + (error.response?.data?.message || error.message));
    } finally {
      setUploadingVideo(false);
    }
  };

  const handlePdfUpload = async (file: File) => {
    setUploadingFile(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await api.post('/materi/upload-submateri', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data && res.data.success) {
        setFileUrl(res.data.fileUrl);
      }
    } catch (error: any) {
      console.error(error);
      alert('Gagal upload dokumen: ' + (error.response?.data?.message || error.message));
    } finally {
      setUploadingFile(false);
    }
  };

  const handleSave = async (goToNext: boolean = false) => {
    if (!pertemuanId || !meeting) {
      alert('Data pertemuan belum dimuat.');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        nama: topik,
        pertemuanId,
        mataKuliahId: meeting.mataKuliahId,
        videoUrl: videoUrl || null,
        fileUrl: fileUrl || null,
        refleksi: refleksi || null
      };

      if (materiId) {
        await api.put(`/materi/${materiId}`, payload);
      } else {
        await api.post('/materi', payload);
      }

      // Save PG questions
      const questions = pgQuestions
        .split('\n')
        .map(q => q.trim())
        .filter(q => q.length > 0);

      const soalList = questions.map(q => ({ pertanyaan: q }));
      await api.post('/materi/latihan-pg', {
        mataKuliahId: meeting.mataKuliahId,
        pertemuanId,
        soalList
      });

      alert('Materi dan latihan soal berhasil disimpan!');

      if (goToNext) {
        const currentUrutan = meeting?.urutan;
        if (currentUrutan) {
          const nextMeeting = allMeetings.find(s => s.urutan === currentUrutan + 1 && s.mataKuliahId === meeting.mataKuliahId);
          if (nextMeeting) {
            navigate(`/admin/add-materi?pertemuanId=${nextMeeting.id}`);
            return;
          }
        }
        alert('Ini adalah pertemuan terakhir.');
      }
      navigate('/admin/materi');
    } catch (error: any) {
      console.error(error);
      alert('Gagal menyimpan materi: ' + (error.response?.data?.message || error.message));
    } finally {
      setSaving(false);
    }
  };

  const handleAddQuestion = () => {
    if (!newQuestion.trim()) return;
    const updated = pgQuestions ? `${pgQuestions}\n${newQuestion.trim()}` : newQuestion.trim();
    setPgQuestions(updated);
    setNewQuestion('');
  };

  const handleRemoveQuestion = (indexToRemove: number) => {
    const list = pgQuestions.split('\n').filter((_, idx) => idx !== indexToRemove);
    setPgQuestions(list.join('\n'));
  };

  const formattedDate = meeting?.tgl 
    ? new Date(meeting.tgl).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
    : '—';
  
  const formattedDay = meeting?.tgl 
    ? new Date(meeting.tgl).toLocaleDateString('id-ID', { weekday: 'long' })
    : '—';

  const formattedTime = meeting?.jam ? `${formattedDay} ${meeting.jam}` : '—';
  const lecturerName = meeting?.dosen?.nama || meeting?.mataKuliah?.pengajar?.nama || 'Dosen Belum Ditentukan';

  const questionsList = pgQuestions.split('\n').map(q => q.trim()).filter(q => q.length > 0);

  // Status computation for status grid
  const hasVideo = !!videoUrl;
  const hasPdf = !!fileUrl;
  const hasReflection = !!refleksi;

  return (
    <div className="p-8 bg-[#F3F4F6] min-h-screen pb-36 text-left">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center shadow-sm cursor-pointer hover:bg-gray-50 transition-colors border border-slate-200/50" onClick={() => navigate('/admin/materi')}>
            <HiOutlineArrowLeft className="text-gray-700 text-base" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900 leading-tight">
              Add Materi — Pertemuan {meeting?.urutan || '?'}
            </h1>
            <p className="text-xs font-semibold text-gray-400 mt-0.5">
              {meeting?.mataKuliah?.nama || 'Unknown Course'} · {formattedDate} · {formattedTime} · {lecturerName}
            </p>
          </div>
        </div>
      </div>

      {!pertemuanId ? (
        <Card className="rounded-2xl border border-slate-200/50 shadow-sm bg-white p-16 text-center">
          <div className="max-w-md mx-auto space-y-5">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-3xl mx-auto">
              <HiOutlinePlayCircle />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-black text-gray-900">Belum Ada Pertemuan yang Dipilih</h3>
              <p className="text-xs font-semibold text-gray-400 leading-relaxed">
                Silakan pilih salah satu pertemuan dari menu materi untuk mengelola modul materi, video ajar, file PDF, dan latihan soal.
              </p>
            </div>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Media */}
          <div className="lg:col-span-7 space-y-6">
            <Card className="rounded-2xl border border-slate-200/50 shadow-sm bg-white p-8 space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                <h2 className="text-base font-black text-gray-950">Konten Pembelajaran</h2>
              </div>

              {/* Topik Pertemuan Input */}
              <div className="space-y-2">
                <Input 
                  value={topik}
                  onChange={(e) => setTopik(e.target.value)}
                  className="bg-slate-50 border-none rounded-xl py-5 px-4 text-xs font-semibold text-gray-800 placeholder:text-gray-450 focus:bg-white focus:ring-2 focus:ring-purple-500/20 transition-all"
                  placeholder="Masukkan nama sub-materi..."
                />
              </div>

              {/* Segmented Radio Tab Selector */}
              <div className="flex bg-slate-100/80 p-1 rounded-xl w-fit">
                {[
                  { key: 'Zoom/Meet', label: 'Zoom/Meet' },
                  { key: 'Micro Learning', label: 'Micro Learning' },
                  { key: 'General PDF', label: 'General PDF' }
                ].map((sourceOpt) => (
                  <button
                    key={sourceOpt.key}
                    type="button"
                    onClick={() => setJenisUtama(sourceOpt.key)}
                    className={`px-4 py-2 rounded-lg text-[10px] font-extrabold uppercase tracking-wide transition-all ${
                      jenisUtama === sourceOpt.key 
                        ? 'bg-purple-600 text-white shadow-sm' 
                        : 'text-gray-500 hover:text-gray-850 hover:bg-gray-200/30'
                    }`}
                  >
                    {sourceOpt.label}
                  </button>
                ))}
              </div>

              {/* Dashed upload container */}
              <div className="border border-dashed border-slate-200 rounded-xl p-6 bg-slate-50/30 space-y-4">
                
                {/* File Upload Lists (Folder-style) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Video Folder Slot */}
                  <div className="relative">
                    {videoUrl ? (
                      <div className="h-14 bg-white border border-slate-200/80 rounded-xl flex items-center justify-between px-4 shadow-sm">
                        <div className="flex items-center gap-2.5 truncate pr-2">
                          <HiOutlineFolder className="text-amber-500 text-xl shrink-0" />
                          <span className="text-xs font-semibold text-gray-700 truncate">
                            {videoUrl.substring(videoUrl.lastIndexOf('/') + 1) || 'Video Uploaded'}
                          </span>
                        </div>
                        <button 
                          type="button"
                          onClick={() => setVideoUrl('')}
                          className="text-red-500 hover:text-red-700 text-[10px] font-bold uppercase shrink-0"
                        >
                          Hapus
                        </button>
                      </div>
                    ) : (
                      <div className="h-14 bg-white border border-slate-200 border-dashed rounded-xl flex items-center px-4 hover:bg-slate-100/50 transition-colors cursor-pointer">
                        <input 
                          type="file" 
                          accept="video/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleVideoUpload(file);
                          }}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        />
                        <div className="flex items-center gap-2.5">
                          <HiOutlineFolder className="text-gray-300 text-xl" />
                          <span className="text-xs font-semibold text-gray-400">
                            {uploadingVideo ? 'Mengunggah...' : 'Upload Video (.mp4)'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* PDF Folder Slot */}
                  <div className="relative">
                    {fileUrl ? (
                      <div className="h-14 bg-white border border-slate-200/80 rounded-xl flex items-center justify-between px-4 shadow-sm">
                        <div className="flex items-center gap-2.5 truncate pr-2">
                          <HiOutlineFolder className="text-amber-500 text-xl shrink-0" />
                          <span className="text-xs font-semibold text-gray-700 truncate">
                            {fileUrl.substring(fileUrl.lastIndexOf('/') + 1) || 'PDF Uploaded'}
                          </span>
                        </div>
                        <button 
                          type="button"
                          onClick={() => setFileUrl('')}
                          className="text-red-500 hover:text-red-700 text-[10px] font-bold uppercase shrink-0"
                        >
                          Hapus
                        </button>
                      </div>
                    ) : (
                      <div className="h-14 bg-white border border-slate-200 border-dashed rounded-xl flex items-center px-4 hover:bg-slate-100/50 transition-colors cursor-pointer">
                        <input 
                          type="file" 
                          accept=".pdf,.doc,.docx"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handlePdfUpload(file);
                          }}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        />
                        <div className="flex items-center gap-2.5">
                          <HiOutlineFolder className="text-gray-300 text-xl" />
                          <span className="text-xs font-semibold text-gray-400">
                            {uploadingFile ? 'Mengunggah...' : 'Upload PDF (.pdf)'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                </div>

                {/* Add Video/Content Link Button */}
                <div className="pt-1">
                  <button 
                    type="button"
                    onClick={() => setJenisUtama('General PDF')} 
                    className="text-xs font-bold text-gray-600 flex items-center gap-1.5 hover:text-gray-900 transition-colors"
                  >
                    <HiOutlinePlus className="text-sm" /> Tambah video
                  </button>
                </div>

              </div>

              {/* TikTok Micro Learning input Section */}
              <div className={`space-y-3 p-5 border border-dashed rounded-xl transition-all ${
                jenisUtama === 'Micro Learning' ? 'border-purple-300 bg-purple-50/20' : 'border-slate-200 bg-slate-50/20 opacity-50'
              }`}>
                <label className="text-xs font-bold text-gray-700 flex items-center gap-2">
                  <svg className="w-3.5 h-3.5 fill-current text-gray-800" viewBox="0 0 24 24">
                    <path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.86-.74-3.94-1.72-.01 2.92 0 5.85-.01 8.78-.04 1.9-.6 3.79-1.8 5.23-1.4 1.73-3.7 2.76-5.94 2.72-2.67.05-5.26-1.37-6.53-3.72-1.39-2.51-1.2-5.77.49-8.08 1.4-1.97 3.76-3.1 6.18-2.95v4.06c-1.22-.12-2.5.38-3.15 1.43-.7 1.09-.55 2.65.37 3.55.93.97 2.53 1.08 3.58.21.65-.52.96-1.4.92-2.23V0h3.29z"/>
                  </svg>
                  Micro Learning (aktif):
                </label>
                
                <div className="relative">
                  <Input 
                    value={jenisUtama === 'Micro Learning' ? videoUrl : ''}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    disabled={jenisUtama !== 'Micro Learning'}
                    className="bg-white border-slate-200 rounded-lg py-5 px-3.5 text-xs font-semibold text-gray-800 placeholder:text-gray-400"
                    placeholder="Masukkan link video TikTok / Reels / YouTube Shorts..."
                  />
                </div>
              </div>

            </Card>
          </div>

          {/* Right Column: Quiz, Tasks & Reflection */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Main Details Configuration Card */}
            <Card className="rounded-2xl border border-slate-200/50 shadow-sm bg-white p-8 space-y-8">
              
              {/* Latihan PG (Green Dot) */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  <h3 className="text-xs font-extrabold uppercase text-gray-450 tracking-wider">Latihan Pilihan Ganda</h3>
                </div>

                {/* PG List */}
                {questionsList.length > 0 && (
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {questionsList.map((q, qidx) => (
                      <div key={qidx} className="flex items-center justify-between p-3 bg-slate-50/80 border border-slate-100/50 rounded-xl group hover:border-slate-200 transition-colors">
                        <span className="text-xs font-bold text-gray-700 truncate pr-2">
                          Soal {qidx + 1} — {q}
                        </span>
                        <button 
                          type="button"
                          onClick={() => handleRemoveQuestion(qidx)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <HiOutlineTrash className="text-base" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* PG Input Box */}
                <div className="relative flex items-center">
                  <Input 
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddQuestion();
                      }
                    }}
                    className="bg-slate-50 border-none rounded-xl py-5 pl-4 pr-12 text-xs font-semibold text-gray-800 placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 transition-all"
                    placeholder="Tambah pertanyaan PG..."
                  />
                  <div className="absolute right-4 w-5 h-5 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                    <HiOutlineCheck className="text-xs stroke-[3px]" />
                  </div>
                </div>

                <Button 
                  type="button"
                  onClick={handleAddQuestion}
                  className="w-full bg-[#10B981] hover:bg-[#059669] text-white font-black py-4 rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/10 transition-all"
                >
                  + Soal PG
                </Button>
              </div>

              {/* Tugas Coding (Purple Dot) */}
              <div className="space-y-4 pt-6 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                  <h3 className="text-xs font-extrabold uppercase text-gray-450 tracking-wider">Tugas Praktikum / Coding</h3>
                </div>

                <textarea 
                  value={tugasCoding}
                  onChange={(e) => setTugasCoding(e.target.value)}
                  className="w-full bg-slate-50 border-none rounded-xl p-4 text-xs font-semibold text-gray-800 h-28 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
                  placeholder="Instruksi Tugas Coding..."
                />
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">
                  Peserta akan upload screenshot coding / file program sebagai bukti latihan.
                </p>
              </div>

              {/* Refleksi (Red Dot) */}
              <div className="space-y-4 pt-6 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  <h3 className="text-xs font-extrabold uppercase text-gray-450 tracking-wider">Refleksi Materi</h3>
                </div>

                {/* AI Review Alert Box */}
                <div className="p-4 bg-rose-50/80 border border-rose-100/50 rounded-xl">
                  <p className="text-[10px] text-rose-700 font-bold leading-relaxed">
                    Refleksi di-input oleh peserta secara manual. AI akan memberi saran skor sebagai referensi untuk Asisten.
                  </p>
                </div>

                <textarea 
                  value={refleksi}
                  onChange={(e) => setRefleksi(e.target.value)}
                  className="w-full bg-slate-50 border-none rounded-xl p-4 text-xs font-semibold text-gray-800 h-28 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all"
                  placeholder="Tuliskan pertanyaan refleksi utama untuk pertemuan ini..."
                />
              </div>

            </Card>

            {/* Status Card (Blue Dot & Slate background) */}
            <div className="bg-[#1E293B] p-6 rounded-2xl text-white shadow-xl space-y-5">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
                <h3 className="text-[10px] font-black uppercase tracking-wider text-slate-300">Status Upload</h3>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center bg-white/5 rounded-xl p-3 border border-white/5">
                  <span className="text-xs font-bold text-slate-200">Video Modul</span>
                  <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
                    hasVideo ? 'bg-emerald-500/20 text-emerald-450' : 'bg-white/10 text-white/50'
                  }`}>
                    {hasVideo ? 'Lengkap' : 'Belum Ada'}
                  </span>
                </div>

                <div className="flex justify-between items-center bg-white/5 rounded-xl p-3 border border-white/5">
                  <span className="text-xs font-bold text-slate-200">Dokumen PDF</span>
                  <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
                    hasPdf ? 'bg-emerald-500/20 text-emerald-450' : 'bg-white/10 text-white/50'
                  }`}>
                    {hasPdf ? 'Lengkap' : 'Belum Ada'}
                  </span>
                </div>

                <div className="flex justify-between items-center bg-white/5 rounded-xl p-3 border border-white/5">
                  <span className="text-xs font-bold text-slate-200">Refleksi</span>
                  <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
                    hasReflection ? 'bg-emerald-500/20 text-emerald-450' : 'bg-white/10 text-white/50'
                  }`}>
                    {hasReflection ? 'Lengkap' : 'Draft'}
                  </span>
                </div>

                <div className="flex justify-between items-center bg-white/5 rounded-xl p-3 border border-white/5">
                  <span className="text-xs font-bold text-slate-200">Latihan PG</span>
                  <span className="px-3 py-1 rounded-full text-[9px] font-black bg-white/10 text-white/60 uppercase tracking-wider">
                    {questionsList.length} Soal
                  </span>
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* Floating Action Bar / Footer Bar */}
      {pertemuanId && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 w-[calc(100%-2rem)] lg:w-[calc(100%-4rem)] max-w-7xl bg-white/95 backdrop-blur-md border border-slate-250 py-4 px-8 rounded-2xl flex justify-between items-center shadow-xl z-40">
          <div className="hidden sm:block">
            <p className="text-xs font-bold text-gray-500">
              {meeting?.topik ? `Topik: ${meeting.topik}` : 'Materi Draf Baru'}
            </p>
          </div>
          
          <div className="flex gap-3 ml-auto">
            <Button 
              type="button"
              variant="outline" 
              onClick={() => navigate('/admin/materi')}
              className="bg-slate-50 border-none hover:bg-slate-100 text-gray-700 font-bold text-xs py-5 px-6 rounded-xl transition-all"
              disabled={saving}
            >
              Batal
            </Button>

            <Button 
              type="button"
              onClick={() => handleSave(true)}
              disabled={saving}
              className="bg-[#059669] hover:bg-[#047857] text-white font-black py-5 px-6 rounded-xl text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-emerald-500/10 transition-all"
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  💾 Simpan & Add Pertemuan Berikutnya +
                </>
              )}
            </Button>
          </div>
        </div>
      )}

    </div>
  );
};

export default AddMateriAdmin;
