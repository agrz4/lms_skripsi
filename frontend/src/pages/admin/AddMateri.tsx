import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  HiOutlineArrowLeft, 
  HiOutlinePlus,
  HiOutlineTrash,
  HiOutlineCheck,
  HiOutlineFolder,
  HiOutlinePlayCircle,
  HiOutlineDocumentText,
  HiOutlineLink,
  HiOutlineArrowUpTray
} from 'react-icons/hi2';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { BulkImportSoalModal } from '@/components/BulkImportSoalModal';
import api from '../../lib/api';

const AddMateriAdmin: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const pertemuanId = searchParams.get('pertemuanId');
  
  const [meeting, setMeeting] = useState<any>(null);
  const [allMeetings, setAllMeetings] = useState<any[]>([]);

  const [jenisUtama, setJenisUtama] = useState('Micro Learning');
  const [topik, setTopik] = useState('');
  
  // States for unified/multiple files
  const [zoomLink, setZoomLink] = useState('');
  const [zoomVideos, setZoomVideos] = useState<string[]>([]);
  const [microLearningItems, setMicroLearningItems] = useState<{ type: 'link' | 'upload'; url: string }[]>([]);
  const [pdfItems, setPdfItems] = useState<string[]>([]);

  const [refleksi, setRefleksi] = useState('');
  const [pgQuestions, setPgQuestions] = useState<string>('');
  const [newQuestion, setNewQuestion] = useState<string>('');
  const [isBulkImportOpen, setIsBulkImportOpen] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [uploadingZoomVideo, setUploadingZoomVideo] = useState<boolean>(false);
  const [uploadingMicroVideo, setUploadingMicroVideo] = useState<boolean>(false);
  const [uploadingPdf, setUploadingPdf] = useState<boolean>(false);
  const [tugasCoding, setTugasCoding] = useState<string>(
    'Buatlah program sesuai instruksi pada modul ajar, kemudian unggah screenshot hasil run dan file source code (.zip) sebagai bukti praktikum.'
  );

  const handleBulkImport = (newQuestions: string[], mode: 'append' | 'replace') => {
    if (mode === 'replace') {
      setPgQuestions(newQuestions.join('\n'));
    } else {
      const updated = pgQuestions.trim()
        ? `${pgQuestions.trim()}\n${newQuestions.join('\n')}`
        : newQuestions.join('\n');
      setPgQuestions(updated);
    }
  };

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
      
      // 4. Fetch existing materials and reconstruct split arrays
      api.get(`/materi?pertemuanId=${pertemuanId}`)
        .then(res => {
          const existingMateri = res.data || [];
          if (existingMateri.length > 0) {
            const zoomVids: string[] = [];
            const microItems: { type: 'link' | 'upload'; url: string }[] = [];
            const pdfs: string[] = [];
            let zLink = '';
            let mainTopik = '';
            let mainRefleksi = '';

            existingMateri.forEach((m: any) => {
              if (m.nama && !mainTopik) {
                mainTopik = m.nama;
              }
              if (m.refleksi && !mainRefleksi) {
                mainRefleksi = m.refleksi;
              }

              if (m.fileUrl) {
                pdfs.push(m.fileUrl);
              }

              if (m.videoUrl) {
                const url = m.videoUrl;
                if (url.includes('zoom.us') || url.includes('zoomLink')) {
                  zLink = url;
                } else if (m.nama && (m.nama.includes('Rekaman Zoom') || m.nama.includes('Zoom Video'))) {
                  zoomVids.push(url);
                } else if (url.includes('tiktok') || url.includes('youtube') || url.includes('instagram') || (m.nama && m.nama.includes('Micro Learning'))) {
                  const isTikTokOrWeb = url.includes('tiktok') || url.includes('youtube') || url.includes('instagram') || url.startsWith('http');
                  microItems.push({
                    type: isTikTokOrWeb && !url.includes('/public/uploads/videos') ? 'link' : 'upload',
                    url
                  });
                } else {
                  microItems.push({ type: 'upload', url });
                }
              }
            });

            // Set states
            setTopik(mainTopik);
            setRefleksi(mainRefleksi);
            setZoomLink(zLink);
            setZoomVideos(zoomVids);
            setMicroLearningItems(microItems);
            setPdfItems(pdfs);

            // Determine active jenisUtama based on what elements exist
            if (zLink || zoomVids.length > 0) {
              setJenisUtama('Zoom/Meet');
            } else if (pdfs.length > 0 && microItems.length === 0) {
              setJenisUtama('General PDF');
            } else {
              setJenisUtama('Micro Learning');
            }
          } else {
            setTopik('');
            setRefleksi('');
            setZoomLink('');
            setZoomVideos([]);
            setMicroLearningItems([]);
            setPdfItems([]);
            setJenisUtama('Micro Learning');
          }
        })
        .catch(err => console.error('Failed to fetch materi', err));
    }
  }, [pertemuanId]);

  const handleZoomVideoUpload = async (file: File) => {
    setUploadingZoomVideo(true);
    const formData = new FormData();
    formData.append('video', file);
    try {
      const res = await api.post('/materi/upload-video', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data && res.data.success) {
        setZoomVideos(prev => [...prev, res.data.fileUrl]);
      }
    } catch (error: any) {
      console.error(error);
      alert('Gagal upload video zoom: ' + (error.response?.data?.message || error.message));
    } finally {
      setUploadingZoomVideo(false);
    }
  };

  const handleMicroVideoUpload = async (file: File) => {
    setUploadingMicroVideo(true);
    const formData = new FormData();
    formData.append('video', file);
    try {
      const res = await api.post('/materi/upload-video', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data && res.data.success) {
        setMicroLearningItems(prev => [...prev, { type: 'upload', url: res.data.fileUrl }]);
      }
    } catch (error: any) {
      console.error(error);
      alert('Gagal upload video micro: ' + (error.response?.data?.message || error.message));
    } finally {
      setUploadingMicroVideo(false);
    }
  };

  const handlePdfUpload = async (file: File) => {
    setUploadingPdf(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await api.post('/materi/upload-submateri', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data && res.data.success) {
        setPdfItems(prev => [...prev, res.data.fileUrl]);
      }
    } catch (error: any) {
      console.error(error);
      alert('Gagal upload dokumen PDF: ' + (error.response?.data?.message || error.message));
    } finally {
      setUploadingPdf(false);
    }
  };

  const handleSave = async (goToNext: boolean = false) => {
    if (!pertemuanId || !meeting) {
      alert('Data pertemuan belum dimuat.');
      return;
    }
    setSaving(true);
    try {
      // 1. Fetch existing materi for this meeting to delete them first
      const existingRes = await api.get(`/materi?pertemuanId=${pertemuanId}`);
      const existingMateri = existingRes.data || [];
      for (const m of existingMateri) {
        await api.delete(`/materi/${m.id}`);
      }

      // 2. Prepare new records list
      const payloads: any[] = [];
      
      // Add Zoom Link
      if (zoomLink.trim()) {
        payloads.push({
          nama: topik || 'Zoom Meeting',
          videoUrl: zoomLink,
          fileUrl: null
        });
      }
      
      // Add Zoom Videos
      zoomVideos.forEach((url) => {
        payloads.push({
          nama: `${topik || 'Pertemuan'} (Rekaman Zoom)`,
          videoUrl: url,
          fileUrl: null
        });
      });
      
      // Add Micro Learning items
      microLearningItems.forEach((item) => {
        if (item.url.trim()) {
          payloads.push({
            nama: `${topik || 'Pertemuan'} (Micro Learning)`,
            videoUrl: item.url,
            fileUrl: null
          });
        }
      });
      
      // Add PDF items
      pdfItems.forEach((url) => {
        payloads.push({
          nama: `${topik || 'Pertemuan'} (PDF)`,
          videoUrl: null,
          fileUrl: url
        });
      });

      // If no assets were created, make a default record
      if (payloads.length === 0) {
        payloads.push({
          nama: topik || 'Materi Baru',
          videoUrl: null,
          fileUrl: null
        });
      }

      // Attach reflection text to the first record
      payloads[0].refleksi = refleksi || null;

      // 3. Post all new records to backend
      for (const p of payloads) {
        p.pertemuanId = pertemuanId;
        p.mataKuliahId = meeting.mataKuliahId;
        await api.post('/materi', p);
      }

      // 4. Save PG questions
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
    const parts = newQuestion.split('|').map(p => p.trim());
    let formatted = newQuestion.trim();
    if (parts.length >= 6) {
      const qObj = {
        pertanyaan: parts[0],
        options: {
          A: parts[1],
          B: parts[2],
          C: parts[3],
          D: parts[4]
        },
        correctAnswer: parts[5].toUpperCase()
      };
      formatted = JSON.stringify(qObj);
    }
    const updated = pgQuestions ? `${pgQuestions}\n${formatted}` : formatted;
    setPgQuestions(updated);
    setNewQuestion('');
  };

  const getQuestionDisplay = (qStr: string) => {
    try {
      if (qStr.trim().startsWith('{')) {
        const parsed = JSON.parse(qStr);
        return `${parsed.pertanyaan} (Kunci: ${parsed.correctAnswer || 'A'})`;
      }
    } catch (e) { }
    return qStr;
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

  return (
    <div className="p-8 bg-[#E5E7EB] min-h-screen pb-24 text-left font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 max-w-7xl mx-auto">
        <div className="flex items-center gap-4">
          <button 
            type="button"
            onClick={() => navigate('/admin/materi')}
            className="flex items-center gap-1.5 bg-white hover:bg-gray-50 text-gray-800 font-bold border border-gray-300 rounded-xl px-4 py-2 text-xs shadow-sm transition-colors"
          >
            <HiOutlineArrowLeft className="text-base" /> Kembali ke Materi
          </button>
          <div>
            <h1 className="text-2xl font-black text-gray-900 leading-tight">
              Add Materi — Pertemuan {meeting?.urutan || '?'}
            </h1>
            <p className="text-xs font-semibold text-gray-500 mt-1">
              {meeting?.mataKuliah?.nama || 'Unknown Course'} · {formattedDate} · {formattedTime} · {lecturerName}
            </p>
          </div>
        </div>
      </div>

      {!pertemuanId ? (
        <Card className="rounded-2xl border border-slate-200/50 shadow-sm bg-white p-16 text-center max-w-7xl mx-auto">
          <div className="max-w-md mx-auto space-y-5">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-3xl mx-auto">
              <HiOutlinePlayCircle />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-black text-gray-900">Belum Ada Pertemuan yang Dipilih</h3>
              <p className="text-xs font-semibold text-gray-500 leading-relaxed">
                Silakan pilih salah satu pertemuan dari menu materi untuk mengelola modul materi, video ajar, file PDF, dan latihan soal.
              </p>
            </div>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-7xl mx-auto">
          
          {/* Left Column: Media & Contents */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Main Pembelajaran Card */}
            <Card className="rounded-2xl border border-slate-250/60 shadow-sm bg-white p-8 space-y-6">
              <div>
                <h2 className="text-base font-black text-gray-950">Konten Pembelajaran</h2>
              </div>

              {/* Topik Pertemuan Input */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 block">Topik Pertemuan</label>
                <Input 
                  value={topik}
                  onChange={(e) => setTopik(e.target.value)}
                  className="bg-white border border-gray-300 rounded-xl py-5 px-4 text-xs font-semibold text-gray-800 placeholder:text-gray-400 focus:ring-2 focus:ring-purple-500/20 transition-all"
                  placeholder={`Judul topik pertemuan ${meeting?.urutan || ''}...`}
                />
              </div>

              {/* Jenis Utama Radio Buttons */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 block">Jenis Utama</label>
                <div className="flex gap-6 items-center">
                  {[
                    { key: 'Zoom/Meet', label: 'Zoom/Meet' },
                    { key: 'Micro Learning', label: 'Micro Learning' },
                    { key: 'General PDF', label: 'General PDF' }
                  ].map((opt) => (
                    <label key={opt.key} className="flex items-center gap-2.5 cursor-pointer select-none">
                      <input
                        type="radio"
                        name="jenisUtama"
                        checked={jenisUtama === opt.key}
                        onChange={() => setJenisUtama(opt.key)}
                        className="sr-only"
                      />
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                        jenisUtama === opt.key ? 'border-purple-600 bg-white' : 'border-gray-300 bg-white'
                      }`}>
                        {jenisUtama === opt.key && (
                          <div className="w-2.5 h-2.5 bg-purple-600 rounded-full" />
                        )}
                      </div>
                      <span className={`text-xs font-extrabold ${jenisUtama === opt.key ? 'text-gray-900' : 'text-gray-400'}`}>
                        {opt.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Dashed zoom meeting container */}
              <div className="border border-dashed border-slate-300 rounded-xl p-6 bg-slate-50/50 space-y-4">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight italic">Jika Zoom/Meet:</p>
                
                {/* Link Zoom Input */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Link Zoom</label>
                  <Input 
                    value={zoomLink}
                    onChange={(e) => setZoomLink(e.target.value)}
                    className="bg-white border border-gray-300 rounded-lg py-4 px-3 text-xs font-semibold text-gray-800 placeholder:text-gray-400 focus:ring-2 focus:ring-purple-500/20 transition-all"
                    placeholder="https://zoom.us/j/..."
                  />
                </div>

                {/* Upload Rekaman */}
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-gray-500 uppercase block">Upload Rekaman</label>
                  
                  {zoomVideos.map((url, idx) => (
                    <div key={idx} className="h-14 bg-white border border-slate-200 rounded-xl flex items-center justify-between px-4 shadow-sm">
                      <div className="flex items-center gap-2.5 truncate pr-2">
                        <HiOutlineFolder className="text-yellow-500 text-xl shrink-0" />
                        <span className="text-xs font-semibold text-gray-700 truncate">
                          {url.substring(url.lastIndexOf('/') + 1) || 'Video Uploaded'}
                        </span>
                      </div>
                      <button 
                        type="button"
                        onClick={() => setZoomVideos(zoomVideos.filter((_, i) => i !== idx))}
                        className="text-red-500 hover:text-red-750 text-[10px] font-bold uppercase shrink-0"
                      >
                        Hapus
                      </button>
                    </div>
                  ))}

                  {/* Add Video Slot Button */}
                  <div className="relative h-14 bg-white border border-slate-200 border-dashed rounded-xl flex items-center px-4 hover:bg-slate-100/30 transition-colors cursor-pointer">
                    <input 
                      type="file" 
                      accept="video/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleZoomVideoUpload(file);
                      }}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    <div className="flex items-center gap-2.5">
                      <HiOutlineFolder className="text-gray-300 text-xl" />
                      <span className="text-xs font-semibold text-gray-400">
                        {uploadingZoomVideo ? 'Mengunggah...' : `Upload Video ${zoomVideos.length + 1} (.mp4)`}
                      </span>
                    </div>
                  </div>

                  <div className="pt-1">
                    <button 
                      type="button"
                      className="text-xs font-bold text-gray-500 flex items-center gap-1.5 hover:text-gray-800 transition-colors"
                    >
                      <HiOutlinePlus className="text-sm" /> Tambah video
                    </button>
                  </div>
                </div>
              </div>

            </Card>

            {/* Micro Learning Card */}
            <Card className="rounded-2xl border border-slate-250/60 shadow-sm bg-white p-8 space-y-4">
              <div>
                <h2 className="text-base font-black text-gray-950">Micro Learning (aktif):</h2>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Video/Link</p>
              </div>

              <div className="border border-dashed border-slate-300 rounded-xl p-6 bg-slate-50/50 space-y-4">
                
                {microLearningItems.map((item, idx) => (
                  <div key={idx} className="space-y-2">
                    {item.type === 'link' ? (
                      <div className="flex items-center gap-3 w-full">
                        <div className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                          <HiOutlineLink className="text-gray-600 text-lg" />
                        </div>
                        <Input
                          value={item.url}
                          onChange={(e) => {
                            const updated = [...microLearningItems];
                            updated[idx].url = e.target.value;
                            setMicroLearningItems(updated);
                          }}
                          className="bg-white border border-gray-300 rounded-xl py-3 px-3.5 text-xs font-semibold text-gray-850 placeholder:text-gray-400 flex-1 focus:ring-2 focus:ring-purple-500/20"
                          placeholder="Masukkan link video TikTok / Reels / YouTube Shorts..."
                        />
                        <button
                          type="button"
                          onClick={() => setMicroLearningItems(microLearningItems.filter((_, i) => i !== idx))}
                          className="text-red-500 hover:text-red-750 text-xs font-bold shrink-0 px-2"
                        >
                          Hapus
                        </button>
                      </div>
                    ) : (
                      <div className="h-14 bg-white border border-slate-200 rounded-xl flex items-center justify-between px-4 shadow-sm">
                        <div className="flex items-center gap-2.5 truncate pr-2">
                          <HiOutlinePlayCircle className="text-purple-600 text-xl shrink-0" />
                          <span className="text-xs font-semibold text-gray-700 truncate">
                            {item.url.substring(item.url.lastIndexOf('/') + 1) || 'Local Video Uploaded'}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setMicroLearningItems(microLearningItems.filter((_, i) => i !== idx))}
                          className="text-red-500 hover:text-red-750 text-[10px] font-bold uppercase shrink-0"
                        >
                          Hapus
                        </button>
                      </div>
                    )}
                  </div>
                ))}

                {/* Default display showing empty state slot matching mockup if empty */}
                {microLearningItems.length === 0 && (
                  <div className="h-14 bg-white border border-slate-200 border-dashed rounded-xl flex items-center px-4">
                    <div className="flex items-center gap-2.5">
                      <HiOutlinePlayCircle className="text-gray-300 text-xl" />
                      <span className="text-xs font-semibold text-gray-400">Belum ada video / link ditambahkan</span>
                    </div>
                  </div>
                )}

                {/* Adding options */}
                <div className="flex flex-wrap gap-4 pt-2 border-t border-slate-200/60 mt-4">
                  <button 
                    type="button"
                    onClick={() => setMicroLearningItems(prev => [...prev, { type: 'link', url: 'https://www.tiktok.com/' }])}
                    className="text-xs font-bold text-gray-500 flex items-center gap-1.5 hover:text-gray-800 transition-colors"
                  >
                    <HiOutlinePlus className="text-sm" /> Tambah link TikTok/Reels
                  </button>

                  <div className="relative">
                    <input 
                      type="file" 
                      accept="video/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleMicroVideoUpload(file);
                      }}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    <button 
                      type="button"
                      className="text-xs font-bold text-gray-500 flex items-center gap-1.5 hover:text-gray-800 transition-colors"
                    >
                      <HiOutlinePlus className="text-sm" /> {uploadingMicroVideo ? 'Uploading...' : 'Tambah video/link'}
                    </button>
                  </div>
                </div>

              </div>
            </Card>

            {/* PDF Card */}
            <Card className="rounded-2xl border border-slate-250/60 shadow-sm bg-white p-8 space-y-4">
              <div>
                <h2 className="text-base font-black text-gray-950">PDF:</h2>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Upload PDF (bisa lebih dari 1)</p>
              </div>

              <div className="border border-dashed border-slate-300 rounded-xl p-6 bg-slate-50/50 space-y-4">
                
                {pdfItems.map((url, idx) => (
                  <div key={idx} className="h-14 bg-white border border-slate-200 rounded-xl flex items-center justify-between px-4 shadow-sm">
                    <div className="flex items-center gap-2.5 truncate pr-2">
                      <HiOutlineDocumentText className="text-blue-500 text-xl shrink-0" />
                      <span className="text-xs font-semibold text-gray-700 truncate">
                        {url.substring(url.lastIndexOf('/') + 1) || `PDF Document ${idx + 1}`}
                      </span>
                    </div>
                    <button 
                      type="button"
                      onClick={() => setPdfItems(pdfItems.filter((_, i) => i !== idx))}
                      className="text-red-500 hover:text-red-750 text-[10px] font-bold uppercase shrink-0"
                    >
                      Hapus
                    </button>
                  </div>
                ))}

                {/* File selector input */}
                <div className="relative h-14 bg-white border border-slate-200 border-dashed rounded-xl flex items-center px-4 hover:bg-slate-100/30 transition-colors cursor-pointer">
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
                    <HiOutlineDocumentText className="text-gray-300 text-xl" />
                    <span className="text-xs font-semibold text-gray-400">
                      {uploadingPdf ? 'Mengunggah...' : `Upload PDF ${pdfItems.length + 1}`}
                    </span>
                  </div>
                </div>

                <div className="pt-1">
                  <button 
                    type="button"
                    className="text-xs font-bold text-gray-500 flex items-center gap-1.5 hover:text-gray-800 transition-colors"
                  >
                    <HiOutlinePlus className="text-sm" /> Tambah PDF
                  </button>
                </div>

              </div>
            </Card>

          </div>

          {/* Right Column: Quiz, Tasks & Reflection */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Latihan & Refleksi Configuration Card */}
            <Card className="rounded-2xl border border-slate-250/60 shadow-sm bg-white p-8 space-y-6">
              
              <div className="pb-4 border-b border-slate-150">
                <h2 className="text-base font-black text-gray-950">Latihan & Tes Formatif</h2>
              </div>

              {/* Latihan PG (Green Dot) */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  <h3 className="text-xs font-extrabold uppercase text-gray-500 tracking-wider">Tes Formatif</h3>
                </div>

                {/* PG List */}
                {questionsList.length > 0 && (
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {questionsList.map((q, qidx) => (
                      <div key={qidx} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-150 rounded-xl group hover:border-slate-200 transition-colors">
                        <span className="text-xs font-bold text-gray-700 truncate pr-2">
                          Soal Tes Formatif {qidx + 1} — {getQuestionDisplay(q)}
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
                <div className="space-y-1">
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
                      className="bg-slate-50 border-slate-200 rounded-xl py-5 pl-4 pr-12 text-xs font-semibold text-gray-800 placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 transition-all"
                      placeholder="Format: Soal | A | B | C | D | Kunci"
                    />
                    <div className="absolute right-4 w-5 h-5 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                      <HiOutlineCheck className="text-xs stroke-[3px]" />
                    </div>
                  </div>
                  <p className="text-[10px] font-bold text-gray-400 text-right mt-1 italic">... hingga 10 soal</p>
                </div>

                <div className="flex gap-2">
                  <Button 
                    type="button"
                    onClick={handleAddQuestion}
                    className="flex-1 bg-[#047857] hover:bg-[#065F46] text-white font-black py-4 rounded-xl text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer"
                  >
                    + Soal Tes Formatif
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setIsBulkImportOpen(true)}
                    className="bg-[#f3f4f6] hover:bg-[#e5e7eb] text-gray-700 border border-gray-300 rounded-xl px-4 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs"
                  >
                    <HiOutlineArrowUpTray className="text-sm text-emerald-600" />
                    Import Bulk
                  </Button>
                </div>
              </div>

              {/* Tugas Coding (Indigo/Blue Dot) */}
              <div className="space-y-4 pt-6 border-t border-slate-150">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                  <h3 className="text-xs font-extrabold uppercase text-gray-500 tracking-wider">Latihan Upload (Screenshot/File)</h3>
                </div>

                <textarea 
                  value={tugasCoding}
                  onChange={(e) => setTugasCoding(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs font-semibold text-gray-800 h-28 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
                  placeholder="Instruksi Tugas Coding..."
                />
                <p className="text-[10px] font-medium text-gray-400 leading-normal">
                  Peserta akan upload screenshot coding / file program sebagai bukti latihan
                </p>
              </div>

              {/* Refleksi (Red Dot) */}
              <div className="space-y-4 pt-6 border-t border-slate-150">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  <h3 className="text-xs font-extrabold uppercase text-gray-500 tracking-wider">Latihan</h3>
                </div>

                {/* AI Review Alert Box */}
                <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl">
                  <p className="text-[10px] text-rose-700 font-bold leading-relaxed">
                    Latihan di-input oleh peserta secara manual. AI akan memberi saran skor sebagai referensi untuk Asisten.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-700 block">Pertanyaan Latihan</label>
                  <textarea 
                    value={refleksi}
                    onChange={(e) => setRefleksi(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs font-semibold text-gray-800 h-28 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all"
                    placeholder="Tuliskan pertanyaan latihan utama untuk pertemuan ini..."
                  />
                </div>
              </div>

            </Card>

            {/* AI Processes Card with gradient background */}
            <div className="bg-gradient-to-r from-blue-800 to-cyan-500 p-6 rounded-2xl text-white shadow-xl space-y-5">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
                <h3 className="text-[10px] font-black uppercase tracking-wider text-white">AI Proses Setelah Simpan</h3>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                <span className="px-3 py-1 bg-slate-700/60 rounded-full text-[9px] font-black uppercase tracking-wider text-slate-200">
                  Materi
                </span>
                <span className="px-3 py-1 bg-indigo-600/80 rounded-full text-[9px] font-black uppercase tracking-wider text-indigo-100">
                  RAG
                </span>
                <span className="px-3 py-1 bg-blue-600/80 rounded-full text-[9px] font-black uppercase tracking-wider text-blue-100">
                  SLM
                </span>
                <span className="px-3 py-1 bg-[#10B981] rounded-full text-[9px] font-black uppercase tracking-wider text-white">
                  Auto Correct Refleksi
                </span>
              </div>

              <p className="text-[10px] font-medium text-white/90 leading-relaxed pt-1">
                Skor AI untuk refleksi = referensi Asisten - Nilai final ditentukan Asisten.
              </p>
            </div>

            {/* Actions Buttons direct below the banner */}
            <div className="flex gap-3 pt-4 justify-end">
              <Button 
                type="button"
                variant="outline" 
                onClick={() => navigate('/admin/materi')}
                className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-750 font-bold text-xs py-5 px-6 rounded-xl transition-all"
                disabled={saving}
              >
                + Kembali
              </Button>

              <Button 
                type="button"
                onClick={() => handleSave(true)}
                disabled={saving}
                className="bg-[#047857] hover:bg-[#065F46] text-white font-black py-5 px-6 rounded-xl text-xs uppercase tracking-wider flex items-center gap-2 shadow-md transition-all"
              >
                {saving ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    Simpan & Add Pertemuan Berikutnya +
                  </>
                )}
              </Button>
            </div>

          </div>

        </div>
      )}

      {/* Bulk Import Modal */}
      <BulkImportSoalModal
        isOpen={isBulkImportOpen}
        onClose={() => setIsBulkImportOpen(false)}
        onImport={handleBulkImport}
        existingCount={questionsList.length}
      />

    </div>
  );
};

export default AddMateriAdmin;
