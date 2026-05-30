import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  HiOutlinePlayCircle, 
  HiOutlineDocumentPlus, 
  HiOutlinePlus,
  HiOutlineCloudArrowUp,
  HiOutlineLink,
  HiOutlineVideoCamera,
  HiOutlineChatBubbleBottomCenterText,
  HiOutlineArrowUpTray,
  HiOutlineTrash,
  HiOutlineArrowLeft
} from 'react-icons/hi2';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import api from '../../lib/api';

interface MateriItem {
  id?: string;
  nama: string;
  videoSource: 'tiktok' | 'upload' | 'zoom';
  videoUrl: string;
  fileUrl: string;
  refleksi: string;
  uploadingVideo?: boolean;
  uploadingFile?: boolean;
}

const AddMateri: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const pertemuanId = searchParams.get('pertemuanId');

  const [allMeetings, setAllMeetings] = useState<any[]>([]);
  const [selectedMeetingId, setSelectedMeetingId] = useState<string>('');
  const [meeting, setMeeting] = useState<any>(null);
  const [materiItems, setMateriItems] = useState<MateriItem[]>([
    { nama: '', videoSource: 'upload', videoUrl: '', fileUrl: '', refleksi: '' }
  ]);
  const [pgQuestions, setPgQuestions] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);

  useEffect(() => {
    fetchAllMeetingsAndInit();
  }, [pertemuanId]);

  const fetchAllMeetingsAndInit = async () => {
    setLoading(true);
    try {
      // 1. Get all meetings list
      const pertemuanRes = await api.get('/pertemuan');
      const allPertemuan = pertemuanRes.data || [];
      setAllMeetings(allPertemuan);

      if (pertemuanId) {
        setSelectedMeetingId(pertemuanId);
        const currentMeeting = allPertemuan.find((p: any) => p.id === pertemuanId);
        
        if (currentMeeting) {
          setMeeting(currentMeeting);
        } else {
          setMeeting(null);
        }

        // 2. Get existing materials
        const materiRes = await api.get(`/materi?pertemuanId=${pertemuanId}`);
        const existingMateri = materiRes.data || [];
        
        if (existingMateri.length > 0) {
          const mapped = existingMateri.map((m: any) => ({
            id: m.id,
            nama: m.nama,
            videoSource: m.videoUrl && (m.videoUrl.includes('tiktok') || m.videoUrl.includes('youtube') || m.videoUrl.includes('http')) ? 'tiktok' : 'upload',
            videoUrl: m.videoUrl || '',
            fileUrl: m.fileUrl || '',
            refleksi: m.refleksi || ''
          }));
          setMateriItems(mapped);
        } else {
          setMateriItems([{ nama: '', videoSource: 'upload', videoUrl: '', fileUrl: '', refleksi: '' }]);
        }

        // 3. Get existing PG questions
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
        setMateriItems([{ nama: '', videoSource: 'upload', videoUrl: '', fileUrl: '', refleksi: '' }]);
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

  const handleAddField = () => {
    setMateriItems([...materiItems, { nama: '', videoSource: 'upload', videoUrl: '', fileUrl: '', refleksi: '' }]);
  };

  const handleRemoveField = async (index: number) => {
    const item = materiItems[index];
    if (item.id) {
      if (confirm('Apakah Anda yakin ingin menghapus sub-materi ini secara permanen dari database?')) {
        try {
          await api.delete(`/materi/${item.id}`);
          alert('Sub-materi berhasil dihapus!');
        } catch (err: any) {
          alert('Gagal menghapus sub-materi: ' + (err.response?.data?.message || err.message));
          return;
        }
      }
    }
    const newItems = materiItems.filter((_, idx) => idx !== index);
    setMateriItems(newItems.length > 0 ? newItems : [{ nama: '', videoSource: 'upload', videoUrl: '', fileUrl: '', refleksi: '' }]);
  };

  const handleUpdateItem = (index: number, key: keyof MateriItem, value: any) => {
    const newItems = [...materiItems];
    newItems[index] = { ...newItems[index], [key]: value };
    setMateriItems(newItems);
  };

  const handleVideoUpload = async (index: number, file: File) => {
    handleUpdateItem(index, 'uploadingVideo', true);
    const formData = new FormData();
    formData.append('video', file);
    try {
      const res = await api.post('/materi/upload-video', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data && res.data.success) {
        handleUpdateItem(index, 'videoUrl', res.data.fileUrl);
        alert('Video berhasil di-upload!');
      }
    } catch (error: any) {
      console.error(error);
      alert('Gagal upload video: ' + (error.response?.data?.message || error.message));
    } finally {
      handleUpdateItem(index, 'uploadingVideo', false);
    }
  };

  const handlePdfUpload = async (index: number, file: File) => {
    handleUpdateItem(index, 'uploadingFile', true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await api.post('/materi/upload-submateri', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data && res.data.success) {
        handleUpdateItem(index, 'fileUrl', res.data.fileUrl);
        alert('Dokumen sub-materi berhasil di-upload!');
      }
    } catch (error: any) {
      console.error(error);
      alert('Gagal upload dokumen: ' + (error.response?.data?.message || error.message));
    } finally {
      handleUpdateItem(index, 'uploadingFile', false);
    }
  };

  const handleSaveMateri = async () => {
    if (!meeting) {
      alert('Detail pertemuan tidak ditemukan.');
      return;
    }
    setSaving(true);
    try {
      // 1. Save materials one by one
      for (const item of materiItems) {
        if (!item.nama.trim()) continue;

        const payload = {
          nama: item.nama,
          mataKuliahId: meeting.mataKuliahId,
          pertemuanId: meeting.id,
          fileUrl: item.fileUrl || null,
          videoUrl: item.videoUrl || null,
          refleksi: item.refleksi || null
        };

        if (item.id) {
          // Update
          await api.put(`/materi/${item.id}`, payload);
        } else {
          // Create
          await api.post('/materi', payload);
        }
      }

      // 2. Save PG questions if any
      const questions = pgQuestions
        .split('\n')
        .map(q => q.trim())
        .filter(q => q.length > 0);

      if (questions.length > 0) {
        const soalList = questions.map(q => ({ pertanyaan: q }));
        await api.post('/materi/latihan-pg', {
          mataKuliahId: meeting.mataKuliahId,
          pertemuanId: meeting.id,
          soalList
        });
      }

      alert('Seluruh materi dan latihan soal berhasil disimpan!');
      navigate('/pengajar/monitoring');
    } catch (error: any) {
      console.error(error);
      alert('Gagal menyimpan materi: ' + (error.response?.data?.message || error.message));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 bg-[#F3F4F6] min-h-screen flex items-center justify-center">
        <p className="text-xs font-black text-gray-400 uppercase tracking-widest animate-pulse">Loading data materi...</p>
      </div>
    );
  }

  const topicName = meeting 
    ? `P${meeting.urutan} - ${meeting.topik || 'Tanpa Topik'}` 
    : 'Pilih Pertemuan';

  return (
    <div className="p-8 bg-[#F3F4F6] min-h-screen pb-20">
      {/* Header */}
      <div className="flex items-center gap-6 mb-8">
        <Button 
          variant="outline" 
          onClick={() => navigate('/pengajar/monitoring')}
          className="bg-white border-none shadow-sm rounded-xl font-bold text-[10px] uppercase py-6 px-6"
        >
          <HiOutlineArrowLeft className="mr-2" /> Kembali
        </Button>
        <div>
          <h1 className="text-3xl font-black text-gray-900 leading-tight">Edit/Add Materi — <span className="text-blue-600">{topicName}</span></h1>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
             {meeting ? `Mata Kuliah: ${meeting.mataKuliah?.nama || '—'} | ` : ''}Kelola video, file sub-materi, refleksi, dan latihan soal pilihan ganda
          </p>
        </div>
      </div>

      {/* Pertemuan Selection Card */}
      <Card className="rounded-[2.5rem] border-none shadow-sm bg-white p-10 mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <h2 className="text-xl font-black text-gray-900">Pilih Pertemuan</h2>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-relaxed">
              Pilih sesi pertemuan untuk menambahkan atau mengedit materi pembelajaran. Materi akan terintegrasi langsung dengan modul mahasiswa pada pertemuan yang dipilih.
            </p>
          </div>
          <div className="w-full md:w-80">
            <select
              value={selectedMeetingId}
              onChange={(e) => handleMeetingChange(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-xs font-black text-gray-700 focus:ring-4 focus:ring-blue-50 focus:outline-none cursor-pointer"
            >
              <option value="">-- Pilih Pertemuan --</option>
              {allMeetings.map((p: any) => (
                <option key={p.id} value={p.id}>
                  Pertemuan {p.urutan} - {p.topik || 'Tanpa Topik'} ({p.mataKuliah?.nama || 'Tanpa MK'})
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {!selectedMeetingId ? (
        <Card className="rounded-[2.5rem] border-none shadow-sm bg-white p-16 text-center">
          <div className="max-w-md mx-auto space-y-6">
            <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-4xl mx-auto">
              <HiOutlinePlayCircle />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-black text-gray-900">Belum Ada Pertemuan yang Dipilih</h3>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-relaxed">
                Silakan pilih salah satu pertemuan di atas untuk mengelola modul materi, video ajar, file PDF, dan latihan soal.
              </p>
            </div>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Video, PDF & Reflection per Sub-Materi */}
          <div className="lg:col-span-7 space-y-8">
            <Card className="rounded-[2.5rem] border-none shadow-sm bg-white p-10">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-black text-gray-900">Konten Pembelajaran</h2>
                <Button onClick={handleAddField} className="bg-blue-600 hover:bg-blue-700 text-white font-black text-xs px-4 py-2 rounded-xl flex items-center gap-2">
                  <HiOutlinePlus /> Tambah Sub-Materi
                </Button>
              </div>
              
              <div className="space-y-10">
                {materiItems.map((item, idx) => (
                  <div key={idx} className="p-8 bg-gray-50 rounded-[2rem] border border-gray-100 space-y-6 relative">
                    <div className="flex justify-between items-center">
                      <h3 className="text-sm font-black text-gray-700">Sub-Materi {idx + 1}</h3>
                      <Button 
                        variant="ghost" 
                        onClick={() => handleRemoveField(idx)} 
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg"
                      >
                        <HiOutlineTrash className="text-lg" />
                      </Button>
                    </div>

                    {/* Sub-Materi Name */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Nama Sub-Materi</label>
                      <Input 
                        value={item.nama}
                        onChange={(e) => handleUpdateItem(idx, 'nama', e.target.value)}
                        className="bg-white border-gray-200 rounded-xl py-6 text-xs font-bold text-gray-800"
                        placeholder="Contoh: CSS Grid & Flexbox"
                      />
                    </div>

                    {/* Video Source Option */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Sumber Video</label>
                      <RadioGroup 
                        value={item.videoSource} 
                        onValueChange={(val: any) => handleUpdateItem(idx, 'videoSource', val)}
                        className="flex gap-6 mb-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="tiktok" id={`tiktok-${idx}`} />
                          <Label htmlFor={`tiktok-${idx}`} className="text-[10px] font-black text-gray-400 uppercase cursor-pointer">Link/TikTok/YouTube</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="upload" id={`upload-${idx}`} />
                          <Label htmlFor={`upload-${idx}`} className="text-[10px] font-black text-orange-500 uppercase cursor-pointer">Upload Lokal</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {/* Video Input depending on source */}
                    {item.videoSource === 'tiktok' ? (
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-1">
                          <HiOutlineLink /> Link Video
                        </label>
                        <Input 
                          value={item.videoUrl}
                          onChange={(e) => handleUpdateItem(idx, 'videoUrl', e.target.value)}
                          className="bg-indigo-50/50 border-indigo-100 rounded-xl py-6 text-xs font-bold text-gray-800 placeholder:text-indigo-300"
                          placeholder="https://tiktok.com/@user/video or YouTube URL"
                        />
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-orange-400 uppercase tracking-widest flex items-center gap-1">
                          <HiOutlineCloudArrowUp /> File Video
                        </label>
                        {item.videoUrl ? (
                          <div className="h-16 bg-blue-100/50 rounded-2xl border border-blue-200 flex items-center justify-between px-6">
                            <span className="text-xs font-black text-blue-500 truncate max-w-xs">
                               ▶ {item.videoUrl.substring(item.videoUrl.lastIndexOf('/') + 1) || 'video.mp4'}
                            </span>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleUpdateItem(idx, 'videoUrl', '')}
                              className="text-red-500 text-xs font-black uppercase hover:bg-red-50"
                            >
                              Hapus
                            </Button>
                          </div>
                        ) : (
                          <div className="relative h-20 border-2 border-dashed border-gray-250 rounded-2xl flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition-all cursor-pointer">
                            <input 
                              type="file" 
                              accept="video/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleVideoUpload(idx, file);
                              }}
                              className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                            <div className="text-center">
                              <span className="text-xs font-black text-gray-400 uppercase">
                                {item.uploadingVideo ? 'Mengunggah Video...' : 'Pilih File Video (.mp4, .webm, etc.)'}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Document / PDF Sub-Materi */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">
                        <HiOutlineDocumentPlus /> Dokumen PDF / Modul
                      </label>
                      {item.fileUrl ? (
                        <div className="h-16 bg-emerald-50 rounded-2xl border border-emerald-250 flex items-center justify-between px-6">
                          <span className="text-xs font-black text-emerald-700 truncate max-w-xs">
                             📄 {item.fileUrl.substring(item.fileUrl.lastIndexOf('/') + 1) || 'document.pdf'}
                          </span>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleUpdateItem(idx, 'fileUrl', '')}
                            className="text-red-500 text-xs font-black uppercase hover:bg-red-50"
                          >
                            Hapus
                          </Button>
                        </div>
                      ) : (
                        <div className="relative h-20 border-2 border-dashed border-gray-250 rounded-2xl flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition-all cursor-pointer">
                          <input 
                            type="file" 
                            accept=".pdf,.doc,.docx"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handlePdfUpload(idx, file);
                            }}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                          />
                          <div className="text-center">
                            <span className="text-xs font-black text-gray-400 uppercase">
                              {item.uploadingFile ? 'Mengunggah File...' : 'Pilih File PDF / Modul Ajar'}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Reflection Question */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-rose-500 uppercase tracking-widest flex items-center gap-1">
                        <HiOutlineChatBubbleBottomCenterText /> Pertanyaan Refleksi Siswa
                      </label>
                      <textarea 
                        value={item.refleksi}
                        onChange={(e) => handleUpdateItem(idx, 'refleksi', e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-xl p-4 text-xs font-medium text-gray-800 h-20 focus:ring-4 focus:ring-rose-50 focus:outline-none"
                        placeholder="Masukkan pertanyaan refleksi untuk sub-materi ini..."
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Right Column: PG Questions & Submit */}
          <div className="lg:col-span-5 space-y-8">
            <Card className="rounded-[2.5rem] border-none shadow-sm bg-white p-10 space-y-8">
              {/* Latihan PG */}
              <div className="space-y-4">
                <h3 className="text-sm font-black text-emerald-600 uppercase tracking-widest flex items-center gap-1">
                  Latihan Pilihan Ganda (PG)
                </h3>
                <div className="p-4 bg-emerald-50 rounded-xl text-[10px] font-bold text-emerald-700 leading-tight">
                   Soal PG diindeks ke vector database untuk auto-correction. Masukkan satu pertanyaan per baris.
                </div>
                <textarea 
                  value={pgQuestions}
                  onChange={(e) => setPgQuestions(e.target.value)}
                  className="w-full bg-gray-50 border-none rounded-2xl p-6 text-xs font-medium text-gray-800 h-64 focus:ring-4 focus:ring-emerald-50 focus:outline-none"
                  placeholder="Contoh:&#10;1. Apa fungsi dari CSS Flexbox?&#10;2. Tag HTML manakah yang digunakan untuk membuat link?&#10;3. Bagaimana cara mendeklarasikan Grid layout?"
                />
              </div>

              {/* Save Button */}
              <Button 
                onClick={handleSaveMateri}
                disabled={saving}
                className="w-full bg-[#10B981] hover:bg-[#059669] text-white font-black py-8 rounded-[1.8rem] shadow-xl shadow-emerald-100 uppercase tracking-[0.2em] text-xs disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <HiOutlineArrowUpTray className="mr-2 text-xl" /> Simpan Seluruh Materi
                  </>
                )}
              </Button>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddMateri;
