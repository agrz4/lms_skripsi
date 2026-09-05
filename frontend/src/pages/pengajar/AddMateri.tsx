import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  HiOutlinePlayCircle,
  HiOutlinePlus,
  HiOutlineTrash,
  HiOutlineArrowLeft,
  HiOutlineFolder,
  HiOutlineCheck,
  HiOutlineDocumentText,
  HiOutlineArrowUpTray
} from 'react-icons/hi2';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BulkImportSoalModal } from '@/components/BulkImportSoalModal';
import api from '../../lib/api';

interface VideoItem {
  id?: string;
  nama: string;
  source: 'tiktok' | 'upload' | 'zoom';
  url: string;
  rekamanUrl?: string;
  uploading?: boolean;
}

interface SubMateriItem {
  id?: string;
  nama: string;
  url: string;
  uploading?: boolean;
}

const AddMateri: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const pertemuanId = searchParams.get('pertemuanId');

  const [allMeetings, setAllMeetings] = useState<any[]>([]);
  const [selectedMeetingId, setSelectedMeetingId] = useState<string>('');
  const [meeting, setMeeting] = useState<any>(null);

  const [videos, setVideos] = useState<VideoItem[]>([
    { nama: '', source: 'upload', url: '' }
  ]);
  const [subMateri, setSubMateri] = useState<SubMateriItem[]>([
    { nama: '', url: '' }
  ]);
  const [refleksi, setRefleksi] = useState<string>('');

  const [pgQuestions, setPgQuestions] = useState<string>('');
  const [newQuestion, setNewQuestion] = useState<string>('');
  const [isBulkImportOpen, setIsBulkImportOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
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
    fetchAllMeetingsAndInit();
  }, [pertemuanId]);

  const fetchAllMeetingsAndInit = async () => {
    setLoading(true);
    try {
      const pertemuanRes = await api.get('/pertemuan');
      const allPertemuan = pertemuanRes.data || [];

      // Sort: first by course name, then by meeting order (urutan)
      const sortedPertemuan = [...allPertemuan].sort((a: any, b: any) => {
        const nameA = a.mataKuliah?.nama || '';
        const nameB = b.mataKuliah?.nama || '';
        const cmp = nameA.localeCompare(nameB);
        if (cmp !== 0) return cmp;
        return a.urutan - b.urutan;
      });

      setAllMeetings(sortedPertemuan);

      if (pertemuanId) {
        setSelectedMeetingId(pertemuanId);
        const currentMeeting = sortedPertemuan.find((p: any) => p.id === pertemuanId);
        setMeeting(currentMeeting || null);

        const materiRes = await api.get(`/materi?pertemuanId=${pertemuanId}`);
        const existingMateri = materiRes.data || [];

        const loadedVideos: VideoItem[] = [];
        const loadedSubMateri: SubMateriItem[] = [];
        let loadedRefleksi = '';

        // Separate Zoom-related items
        const zoomVideosFromBackend = existingMateri.filter((m: any) => m.videoUrl && (m.videoUrl.toLowerCase().includes('zoom.us') || m.videoUrl.toLowerCase().includes('zoomlink')));
        const zoomRecordingVideos = existingMateri.filter((m: any) => m.videoUrl && m.nama && (m.nama.toLowerCase().includes('rekaman zoom') || m.nama.toLowerCase().includes('zoom video')));
        const otherVideos = existingMateri.filter((m: any) => m.videoUrl &&
          !(m.videoUrl.toLowerCase().includes('zoom.us') || m.videoUrl.toLowerCase().includes('zoomlink')) &&
          !(m.nama && (m.nama.toLowerCase().includes('rekaman zoom') || m.nama.toLowerCase().includes('zoom video')))
        );

        // Group Zoom link and its recordings
        if (zoomVideosFromBackend.length > 0 || zoomRecordingVideos.length > 0) {
          const mainZoomLink = zoomVideosFromBackend[0]?.videoUrl || '';
          const mainZoomId = zoomVideosFromBackend[0]?.id;
          const firstRecording = zoomRecordingVideos[0]?.videoUrl || '';

          loadedVideos.push({
            id: mainZoomId,
            nama: zoomVideosFromBackend[0]?.nama || 'Zoom Meeting',
            source: 'zoom',
            url: mainZoomLink,
            rekamanUrl: firstRecording
          });

          // If there are more zoom recordings, load them as upload source
          for (let i = 1; i < zoomRecordingVideos.length; i++) {
            loadedVideos.push({
              id: zoomRecordingVideos[i].id,
              nama: zoomRecordingVideos[i].nama,
              source: 'upload',
              url: zoomRecordingVideos[i].videoUrl
            });
          }
        }

        // Load other videos
        otherVideos.forEach((m: any) => {
          let src: 'tiktok' | 'upload' | 'zoom' = 'upload';
          if (m.videoUrl.includes('tiktok') || m.videoUrl.includes('youtube') || m.videoUrl.includes('instagram') || m.videoUrl.startsWith('http')) {
            src = 'tiktok';
          }
          loadedVideos.push({
            id: m.id,
            nama: m.nama || `Video ${loadedVideos.length + 1}`,
            source: src,
            url: m.videoUrl
          });
        });

        existingMateri.forEach((m: any) => {
          if (m.refleksi && !loadedRefleksi) {
            loadedRefleksi = m.refleksi;
          }
          if (m.fileUrl) {
            loadedSubMateri.push({
              id: m.id,
              nama: m.nama || `Sub Materi ${loadedSubMateri.length + 1}`,
              url: m.fileUrl
            });
          }
        });

        // Initialize defaults if empty
        if (loadedVideos.length === 0) {
          loadedVideos.push({ nama: 'Video 1', source: 'upload', url: '' });
        }
        if (loadedSubMateri.length === 0) {
          loadedSubMateri.push({ nama: 'Sub Materi 1', url: '' });
        }

        setVideos(loadedVideos);
        setSubMateri(loadedSubMateri);
        setRefleksi(loadedRefleksi);

        const pgRes = await api.get(`/materi/latihan-pg?pertemuanId=${pertemuanId}`);
        const existingPg = pgRes.data || [];
        if (existingPg.length > 0) {
          const questionsString = existingPg.map((q: any) => q.pertanyaan).join('\n');
          setPgQuestions(questionsString);
        } else {
          setPgQuestions('');
        }
      } else {
        setSelectedMeetingId('');
        setMeeting(null);
        setVideos([{ nama: 'Video 1', source: 'upload', url: '' }]);
        setSubMateri([{ nama: 'Sub Materi 1', url: '' }]);
        setRefleksi('');
        setPgQuestions('');
      }
    } catch (error) {
      console.error('Error fetching meeting/materi details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMeetingChange = (meetingId: string) => {
    if (meetingId) {
      navigate(`/pengajar/add-materi?pertemuanId=${meetingId}`);
    } else {
      navigate(`/pengajar/add-materi`);
    }
  };

  const handleAddVideo = () => {
    setVideos([...videos, { nama: `Video ${videos.length + 1}`, source: 'upload', url: '' }]);
  };

  const handleRemoveVideo = (index: number) => {
    const updated = videos.filter((_, idx) => idx !== index);
    setVideos(updated.length > 0 ? updated : [{ nama: 'Video 1', source: 'upload', url: '' }]);
  };

  const handleUpdateVideo = (index: number, key: keyof VideoItem, value: any) => {
    setVideos((prev) => {
      const updated = [...prev];
      if (updated[index]) {
        updated[index] = { ...updated[index], [key]: value };
      }
      return updated;
    });
  };

  const handleAddSubMateri = () => {
    setSubMateri([...subMateri, { nama: `Sub Materi ${subMateri.length + 1}`, url: '' }]);
  };

  const handleRemoveSubMateri = (index: number) => {
    const updated = subMateri.filter((_, idx) => idx !== index);
    setSubMateri(updated.length > 0 ? updated : [{ nama: 'Sub Materi 1', url: '' }]);
  };

  const handleUpdateSubMateri = (index: number, key: keyof SubMateriItem, value: any) => {
    setSubMateri((prev) => {
      const updated = [...prev];
      if (updated[index]) {
        updated[index] = { ...updated[index], [key]: value };
      }
      return updated;
    });
  };

  const handleVideoUpload = async (index: number, file: File, isZoomRekaman?: boolean) => {
    handleUpdateVideo(index, 'uploading', true);
    const formData = new FormData();
    formData.append('video', file);
    try {
      const res = await api.post('/materi/upload-video', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data && res.data.success) {
        setVideos((prev) => {
          const updated = [...prev];
          if (updated[index]) {
            if (isZoomRekaman) {
              updated[index] = {
                ...updated[index],
                rekamanUrl: res.data.fileUrl
              };
            } else {
              updated[index] = {
                ...updated[index],
                url: res.data.fileUrl,
                nama: updated[index].nama && !updated[index].nama.startsWith('Video') ? updated[index].nama : file.name
              };
            }
          }
          return updated;
        });
      }
    } catch (error: any) {
      console.error(error);
      alert('Gagal upload video: ' + (error.response?.data?.message || error.message));
    } finally {
      handleUpdateVideo(index, 'uploading', false);
    }
  };

  const handlePdfUpload = async (index: number, file: File) => {
    handleUpdateSubMateri(index, 'uploading', true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await api.post('/materi/upload-submateri', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data && res.data.success) {
        setSubMateri((prev) => {
          const updated = [...prev];
          if (updated[index]) {
            updated[index] = {
              ...updated[index],
              url: res.data.fileUrl,
              nama: updated[index].nama && !updated[index].nama.startsWith('Sub Materi') ? updated[index].nama : file.name
            };
          }
          return updated;
        });
      }
    } catch (error: any) {
      console.error(error);
      alert('Gagal upload modul: ' + (error.response?.data?.message || error.message));
    } finally {
      handleUpdateSubMateri(index, 'uploading', false);
    }
  };

  const handleSaveMateri = async (goToNext: boolean = false) => {
    if (!meeting) {
      alert('Detail pertemuan tidak ditemukan.');
      return;
    }
    setSaving(true);
    try {
      // 1. Delete existing materi for this meeting
      const existingRes = await api.get(`/materi?pertemuanId=${meeting.id}`);
      const existingMateri = existingRes.data || [];
      for (const m of existingMateri) {
        await api.delete(`/materi/${m.id}`);
      }

      // 2. Prepare payloads
      const payloads: any[] = [];

      // Add videos
      videos.forEach((v, idx) => {
        if (v.url.trim() || v.nama.trim() || (v.source === 'zoom' && (v.url.trim() || v.rekamanUrl?.trim()))) {
          if (v.source === 'zoom') {
            if (v.url.trim()) {
              payloads.push({
                nama: v.nama || `Zoom Meeting`,
                videoUrl: v.url,
                fileUrl: null
              });
            }
            if (v.rekamanUrl && v.rekamanUrl.trim()) {
              payloads.push({
                nama: `${v.nama || 'Pertemuan'} (Rekaman Zoom)`,
                videoUrl: v.rekamanUrl,
                fileUrl: null
              });
            }
          } else {
            payloads.push({
              nama: v.nama || `Video ${idx + 1}`,
              videoUrl: v.url || null,
              fileUrl: null
            });
          }
        }
      });

      // Add sub-materi PDFs
      subMateri.forEach((sm, idx) => {
        if (sm.url.trim() || sm.nama.trim()) {
          payloads.push({
            nama: sm.nama || `Sub Materi ${idx + 1}`,
            videoUrl: null,
            fileUrl: sm.url || null
          });
        }
      });

      // If no payloads were created, add a default record
      if (payloads.length === 0) {
        payloads.push({
          nama: 'Materi Utama',
          videoUrl: null,
          fileUrl: null
        });
      }

      // Attach reflection text to the first record
      payloads[0].refleksi = refleksi || null;

      // 3. Post to backend
      for (const p of payloads) {
        p.pertemuanId = meeting.id;
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
        pertemuanId: meeting.id,
        soalList
      });

      alert('Seluruh materi dan latihan soal berhasil disimpan!');

      if (goToNext) {
        const nextMeeting = allMeetings.find((p: any) => p.urutan === meeting.urutan + 1 && p.mataKuliahId === meeting.mataKuliahId);
        if (nextMeeting) {
          navigate(`/pengajar/add-materi?pertemuanId=${nextMeeting.id}`);
        } else {
          alert('Ini adalah pertemuan terakhir.');
          navigate('/pengajar/monitoring');
        }
      } else {
        navigate('/pengajar/monitoring');
      }
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
        return `${parsed.pertanyaan} (Kunci: ${parsed.correctAnswer})`;
      }
    } catch (e) { }
    return qStr;
  };

  const handleRemoveQuestion = (indexToRemove: number) => {
    const list = pgQuestions.split('\n').filter((_, idx) => idx !== indexToRemove);
    setPgQuestions(list.join('\n'));
  };

  if (loading) {
    return (
      <div className="p-8 bg-[#F3F4F6] min-h-screen flex items-center justify-center font-sans">
        <p className="text-xs font-black text-gray-400 uppercase tracking-widest animate-pulse">Loading data materi...</p>
      </div>
    );
  }

  const questionsList = pgQuestions.split('\n').map(q => q.trim()).filter(q => q.length > 0);

  return (
    <div className="p-8 bg-[#F3F4F6] min-h-screen pb-36 text-left font-sans">
      {/* Title & Subtitle */}
      <div className="mb-8">
        <h1 className="text-2xl font-black text-gray-900 mb-1">Edit/Add Materi</h1>
        <p className="text-xs text-gray-500 font-medium">Bisa tambah banyak video · Sub materi dalam satu pertemuan</p>
      </div>

      {/* Dropdown Selector */}
      <div className="w-full bg-white rounded-xl shadow-sm border border-gray-200 p-2 mb-6">
        <select
          value={selectedMeetingId}
          onChange={(e) => handleMeetingChange(e.target.value)}
          className="w-full bg-transparent border-none text-xs font-bold text-gray-700 focus:outline-none cursor-pointer p-2"
        >
          <option value="">-- Pilih Pertemuan --</option>
          {allMeetings.map((p: any) => (
            <option key={p.id} value={p.id}>
              {p.mataKuliah ? `[${p.mataKuliah.nama}] ` : ''}P{p.urutan} - {p.topik || 'Tanpa Topik'}
            </option>
          ))}
        </select>
      </div>

      {!selectedMeetingId ? (
        <Card className="rounded-xl border border-gray-200 shadow-sm bg-white p-16 text-center">
          <div className="max-w-md mx-auto space-y-5">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-3xl mx-auto">
              <HiOutlinePlayCircle />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-black text-gray-900">Belum Ada Pertemuan yang Dipilih</h3>
              <p className="text-xs font-semibold text-gray-400 leading-relaxed">
                Silakan pilih salah satu pertemuan di atas untuk mengelola modul materi, video ajar, file PDF, dan latihan soal.
              </p>
            </div>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Left Column: Media & Sub-Materi */}
          <div className="lg:col-span-7 space-y-6">

            {/* Konten Video Card */}
            <Card className="rounded-xl border border-gray-200 shadow-sm bg-white p-6 space-y-6">
              <div>
                <h2 className="text-sm font-bold text-gray-900">Konten Video (Bisa Lebih dari 1)</h2>
              </div>

              <div className="space-y-6">
                {videos.map((v, idx) => (
                  <div key={idx} className="p-4 border border-gray-150 rounded-xl bg-slate-50/50 space-y-4 relative">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-gray-800">
                        Video {idx + 1} — {v.nama || 'Intro CSS'}
                      </label>
                      {videos.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveVideo(idx)}
                          className="text-red-500 hover:text-red-750 font-bold uppercase text-[10px]"
                        >
                          Hapus Video
                        </button>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Input
                        value={v.nama}
                        onChange={(e) => handleUpdateVideo(idx, 'nama', e.target.value)}
                        className="bg-white border border-gray-200 rounded-lg py-2 px-3 text-xs font-semibold text-gray-850"
                        placeholder="Nama video..."
                      />
                    </div>

                    {/* Radio Options */}
                    <div className="flex gap-4 items-center">
                      {([
                        { key: 'tiktok', label: 'TikTok/Link' },
                        { key: 'upload', label: 'Upload Lokal' },
                        { key: 'zoom', label: 'Zoom' }
                      ] as const).map((opt) => (
                        <label key={opt.key} className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-700">
                          <input
                            type="radio"
                            name={`video-source-${idx}`}
                            checked={v.source === opt.key}
                            onChange={() => handleUpdateVideo(idx, 'source', opt.key)}
                            className="w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-500"
                          />
                          <span>{opt.label}</span>
                        </label>
                      ))}
                    </div>

                    {/* Upload or View Block */}
                    {v.source === 'tiktok' && (
                      <div className="bg-[#efeefd] text-[#5850ec] rounded-lg p-4 border border-[#c5c0f9] space-y-2">
                        <label className="text-[10px] font-black uppercase text-gray-700">Link TikTok / Reels:</label>
                        <Input
                          value={v.url}
                          onChange={(e) => handleUpdateVideo(idx, 'url', e.target.value)}
                          className="bg-white border-none rounded-md py-4 px-3 text-xs font-semibold text-gray-800 placeholder:text-gray-400"
                          placeholder="https://tiktok.com/@..."
                        />
                      </div>
                    )}

                    {v.source === 'zoom' && (
                      <div className="bg-[#efeefd] text-[#5850ec] rounded-lg p-4 border border-[#c5c0f9] space-y-4 text-left">
                        <div>
                          <label className="text-[10px] font-black uppercase text-gray-700 block mb-1">Link Zoom Meeting:</label>
                          <Input
                            value={v.url}
                            onChange={(e) => handleUpdateVideo(idx, 'url', e.target.value)}
                            className="bg-white border-none rounded-md py-3 px-3 text-xs font-semibold text-gray-800 placeholder:text-gray-400 w-full"
                            placeholder="https://zoom.us/j/..."
                          />
                        </div>
                        <div className="border-t border-purple-200/50 pt-3">
                          <label className="text-[10px] font-black uppercase text-gray-700 block mb-2">Upload File Rekaman Zoom (.mp4) — Opsional:</label>
                          {v.rekamanUrl ? (
                            <div className="bg-[#d2e3fc] text-[#1967d2] font-semibold text-xs py-3 px-4 rounded-lg flex items-center justify-between shadow-sm">
                              <span className="truncate max-w-[80%]">{v.rekamanUrl.substring(v.rekamanUrl.lastIndexOf('/') + 1)}</span>
                              <button
                                type="button"
                                onClick={() => handleUpdateVideo(idx, 'rekamanUrl', '')}
                                className="text-red-500 hover:text-red-750 font-bold uppercase text-[10px] shrink-0"
                              >
                                Hapus
                              </button>
                            </div>
                          ) : (
                            <div className="h-12 bg-white border border-slate-200 border-dashed rounded-xl flex items-center px-4 hover:bg-slate-100/30 transition-colors cursor-pointer relative">
                              <input
                                type="file"
                                accept="video/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleVideoUpload(idx, file, true);
                                }}
                                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                              />
                              <div className="flex items-center gap-2">
                                <HiOutlineFolder className="text-gray-300 text-lg" />
                                <span className="text-xs font-semibold text-gray-450">
                                  {v.uploading ? 'Mengunggah...' : 'Upload Video Rekaman (.mp4)'}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {v.source === 'upload' && (
                      <div className="space-y-2">
                        {v.url ? (
                          <div className="bg-[#d2e3fc] text-[#1967d2] font-semibold text-xs py-4 px-6 rounded-lg flex items-center justify-between shadow-sm">
                            <div className="flex items-center gap-2.5 truncate">
                              <span className="shrink-0">▶</span>
                              <span className="truncate">{v.url.substring(v.url.lastIndexOf('/') + 1)}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleUpdateVideo(idx, 'url', '')}
                              className="text-red-500 hover:text-red-750 font-bold uppercase text-[10px] shrink-0"
                            >
                              Hapus
                            </button>
                          </div>
                        ) : (
                          <div className="h-14 bg-white border border-slate-200 border-dashed rounded-xl flex items-center px-4 hover:bg-slate-100/50 transition-colors cursor-pointer relative">
                            <input
                              type="file"
                              accept="video/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleVideoUpload(idx, file);
                              }}
                              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                            />
                            <div className="flex items-center gap-2.5">
                              <HiOutlineFolder className="text-gray-300 text-xl" />
                              <span className="text-xs font-semibold text-gray-400">
                                {v.uploading ? 'Mengunggah...' : 'Upload Video (.mp4)'}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Add Video Button */}
              <button
                type="button"
                onClick={handleAddVideo}
                className="w-full bg-white hover:bg-gray-50 border border-dashed border-gray-300 text-gray-500 font-bold py-4 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                + Tambah Video/Link Lagi
              </button>
            </Card>

            {/* Sub Materi Card */}
            <Card className="rounded-xl border border-gray-200 shadow-sm bg-white p-6 space-y-6">
              <div>
                <h2 className="text-sm font-bold text-gray-900">Sub Materi dalam Pertemuan Ini</h2>
                <p className="text-[10px] font-bold text-gray-400 mt-1">Setiap kursus bisa punya banyak sub-materi dalam satu pertemuan</p>
              </div>

              <div className="space-y-4">
                {subMateri.map((sm, idx) => (
                  <div key={idx} className="space-y-3">
                    <Input
                      value={sm.nama}
                      onChange={(e) => handleUpdateSubMateri(idx, 'nama', e.target.value)}
                      className="bg-white border border-gray-200 rounded-lg py-2 px-3 text-xs font-semibold text-gray-850"
                      placeholder="Nama sub-materi..."
                    />

                    {sm.url ? (
                      <div className={`p-4 rounded-xl flex items-center justify-between font-bold text-xs ${idx === 0
                          ? 'bg-[#e6f4ea] text-[#137333] border border-green-150'
                          : 'bg-white text-gray-700 border border-gray-200 shadow-sm'
                        }`}>
                        <div className="flex items-center gap-2.5 truncate pr-2">
                          <HiOutlineDocumentText className="text-lg shrink-0" />
                          <span className="truncate">{sm.nama || `Sub Materi ${idx + 1}`}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveSubMateri(idx)}
                          className="text-red-500 hover:text-red-750 font-bold uppercase text-[10px] shrink-0"
                        >
                          Hapus
                        </button>
                      </div>
                    ) : (
                      <div className="h-14 bg-white border border-slate-200 border-dashed rounded-xl flex items-center px-4 hover:bg-slate-100/50 transition-colors cursor-pointer relative">
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handlePdfUpload(idx, file);
                          }}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        />
                        <div className="flex items-center gap-2.5">
                          <HiOutlineFolder className="text-gray-300 text-xl" />
                          <span className="text-xs font-semibold text-gray-400">
                            {sm.uploading ? 'Mengunggah...' : 'Upload PDF (.pdf)'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Add Sub-Materi Button */}
              <button
                type="button"
                onClick={handleAddSubMateri}
                className="w-full bg-white hover:bg-gray-50 border border-dashed border-gray-300 text-gray-500 font-bold py-4 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                + Tambah Sub Materi
              </button>
            </Card>

          </div>

          {/* Right Column: Quiz, Tasks & Reflection */}
          <div className="lg:col-span-5 space-y-6">

            {/* Latihan & Refleksi Configuration Card */}
            <Card className="rounded-xl border border-gray-200 shadow-sm bg-white p-6 space-y-6">

              <div>
                <h2 className="text-sm font-bold text-gray-900 pb-2 border-b border-gray-100">Latihan & Refleksi</h2>
              </div>

              {/* Latihan PG (Green Dot) */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  <h3 className="text-xs font-extrabold uppercase text-gray-500 tracking-wider">Latihan PG (Opsional)</h3>
                </div>

                {/* PG List Box */}
                <div className="bg-gray-50 border border-gray-150 rounded-xl p-4 space-y-2 max-h-56 overflow-y-auto">
                  {questionsList.length > 0 ? (
                    questionsList.map((q, qidx) => (
                      <div key={qidx} className="flex items-center justify-between text-xs font-bold text-gray-700 py-1">
                        <span className="truncate pr-2">Soal {qidx + 1} — {getQuestionDisplay(q)}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveQuestion(qidx)}
                          className="text-red-500 hover:text-red-700 text-[10px] uppercase font-bold shrink-0"
                        >
                          Hapus
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs font-medium text-gray-400 italic">Belum ada soal PG</p>
                  )}
                  <p className="text-[10px] font-bold text-gray-400 italic pt-2 border-t border-gray-200/50">...hingga 10 soal</p>
                </div>

                {/* Add PG Input */}
                <div className="space-y-3">
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
                      className="bg-slate-50 border border-gray-200 rounded-xl py-5 pl-4 pr-12 text-xs font-semibold text-gray-800 placeholder:text-gray-450 focus:bg-white transition-all shadow-none"
                      placeholder="Format: Soal | A | B | C | D | Kunci (Contoh: Apa itu HTML? | Markup | Script | Style | Lang | A)"
                    />
                    <div className="absolute right-4 w-5 h-5 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                      <HiOutlineCheck className="text-xs stroke-[3px]" />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      onClick={handleAddQuestion}
                      className="flex-1 bg-[#10b981] hover:bg-[#059669] text-white font-bold h-9 text-xs rounded-lg"
                    >
                      + Soal PG
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setIsBulkImportOpen(true)}
                      className="bg-[#f3f4f6] hover:bg-[#e5e7eb] text-gray-700 border border-gray-300 rounded-lg h-9 text-xs font-bold px-3.5 flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <HiOutlineArrowUpTray className="text-sm text-emerald-600" />
                      Import Bulk
                    </Button>
                  </div>
                </div>
              </div>

              {/* Latihan Upload */}
              <div className="space-y-4 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                  <h3 className="text-xs font-extrabold uppercase text-gray-500 tracking-wider">Latihan Upload</h3>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-650">Deskripsi Tugas Upload</label>
                  <textarea
                    value={tugasCoding}
                    onChange={(e) => setTugasCoding(e.target.value)}
                    className="w-full bg-slate-50 border border-gray-200 rounded-xl p-4 text-xs font-semibold text-gray-800 h-28 focus:bg-white focus:outline-none transition-all resize-none"
                    placeholder="Instruksi tugas coding..."
                  />
                  <p className="text-[10px] font-bold text-gray-400">Peserta upload screenshot/file sebagai bukti</p>
                </div>
              </div>

              {/* Latihan (Red Dot) */}
              <div className="space-y-4 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  <h3 className="text-xs font-extrabold uppercase text-gray-500 tracking-wider">Latihan (Input Peserta)</h3>
                </div>

                {/* AI Review Alert Box */}
                <div className="p-3 bg-[#fce8e6] text-[#c5221f] rounded-lg text-[10px] font-bold leading-normal">
                  Peserta input latihan manual - AI beri skor referensi untuk Asisten
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-650">Pertanyaan Latihan</label>
                  <textarea
                    value={refleksi}
                    onChange={(e) => setRefleksi(e.target.value)}
                    className="w-full bg-slate-50 border border-gray-200 rounded-xl p-4 text-xs font-semibold text-gray-800 h-28 focus:bg-white focus:outline-none transition-all resize-none"
                    placeholder="Tuliskan pertanyaan latihan utama..."
                  />
                </div>
              </div>

              {/* Save Button */}
              <Button
                type="button"
                onClick={() => handleSaveMateri(false)}
                disabled={saving}
                className="w-full bg-[#10b981] hover:bg-[#059669] text-white font-bold py-3.5 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-sm transition-all"
              >
                {saving ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    💾 Simpan Materi
                  </>
                )}
              </Button>

            </Card>

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

export default AddMateri;
