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
  HiOutlineSparkles,
  HiOutlineVideoCamera,
  HiOutlineBookOpen,
  HiOutlineDocumentText,
  HiOutlinePencilSquare,
  HiOutlineArrowTopRightOnSquare,
  HiOutlineChevronUp,
  HiOutlineChevronDown,
  HiOutlineMagnifyingGlassMinus,
  HiOutlineMagnifyingGlassPlus,
  HiOutlineCheck,
  HiOutlineDocument,
  HiOutlinePaperClip,
  HiOutlinePencil
} from 'react-icons/hi2';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import api from '../../lib/api';

// High-quality mock questions for Latihan PG if none exist on the backend
const MOCK_CSS_SOAL = [
  {
    id: 'mock-1',
    pertanyaan: 'Properti CSS apa yang digunakan untuk mengaktifkan layout Flexbox?',
    options: {
      A: 'display: block',
      B: 'display: flex',
      C: 'position: absolute',
      D: 'float: left'
    },
    correctAnswer: 'B'
  },
  {
    id: 'mock-2',
    pertanyaan: 'Properti mana yang mengontrol arah perataan item flex di sepanjang sumbu utama (main axis)?',
    options: {
      A: 'align-items',
      B: 'flex-direction',
      C: 'justify-content',
      D: 'align-content'
    },
    correctAnswer: 'C'
  },
  {
    id: 'mock-3',
    pertanyaan: 'Nilai default dari properti flex-direction adalah...',
    options: {
      A: 'column',
      B: 'row-reverse',
      C: 'column-reverse',
      D: 'row'
    },
    correctAnswer: 'D'
  },
  {
    id: 'mock-4',
    pertanyaan: 'Bagaimana cara menyejajarkan flex items di sepanjang sumbu silang (cross axis)?',
    options: {
      A: 'justify-content',
      B: 'align-items',
      C: 'flex-wrap',
      D: 'align-self'
    },
    correctAnswer: 'B'
  },
  {
    id: 'mock-5',
    pertanyaan: 'Properti mana yang memungkinkan flex items untuk membungkus ke baris baru jika tidak cukup ruang?',
    options: {
      A: 'flex-wrap',
      B: 'flex-flow',
      C: 'align-content',
      D: 'flex-grow'
    },
    correctAnswer: 'A'
  },
  {
    id: 'mock-6',
    pertanyaan: 'Apa kegunaan dari properti flex-grow?',
    options: {
      A: 'Menentukan seberapa besar item akan menyusut',
      B: 'Menentukan ukuran awal item sebelum sisa ruang didistribusikan',
      C: 'Menentukan kemampuan item untuk tumbuh jika ada ruang tersisa',
      D: 'Menyejajarkan item flex secara individu'
    },
    correctAnswer: 'C'
  },
  {
    id: 'mock-7',
    pertanyaan: 'Nilai justify-content mana yang mendistribusikan ruang secara merata sehingga jarak antar item sama besar?',
    options: {
      A: 'space-between',
      B: 'space-around',
      C: 'space-evenly',
      D: 'center'
    },
    correctAnswer: 'C'
  },
  {
    id: 'mock-8',
    pertanyaan: 'Properti mana yang digunakan untuk menentukan urutan kemunculan item flex secara visual?',
    options: {
      A: 'order',
      B: 'z-index',
      C: 'flex-order',
      D: 'index'
    },
    correctAnswer: 'A'
  },
  {
    id: 'mock-9',
    properyShorthand: true,
    pertanyaan: 'Properti shorthand flex menggabungkan properti apa saja?',
    options: {
      A: 'flex-direction, flex-wrap, flex-flow',
      B: 'flex-grow, flex-shrink, flex-basis',
      C: 'justify-content, align-items, align-self',
      D: 'flex-grow, flex-basis, flex-flow'
    },
    correctAnswer: 'B'
  },
  {
    id: 'mock-10',
    pertanyaan: 'Bagaimana cara memusatkan suatu elemen secara horizontal dan vertikal sekaligus menggunakan Flexbox?',
    options: {
      A: 'justify-content: center; align-items: center;',
      B: 'text-align: center; vertical-align: middle;',
      C: 'margin: auto;',
      D: 'align-content: center; justify-items: center;'
    },
    correctAnswer: 'A'
  }
];

const MateriSesi: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const pertemuanId = searchParams.get('pertemuanId');

  // Active Tab: zoom, materi, pdf, latihan, upload_tugas, refleksi
  const [activeTab, setActiveTab] = useState<string>(searchParams.get('tab') || 'zoom');

  const { materiList, fetchMateriByPertemuan } = useMateriStore();
  const { jadwalList } = useJadwalStore();
  
  // State variables for Reflection
  const [refleksi, setRefleksi] = useState('');
  const [isSubmittingRefleksi, setIsSubmittingRefleksi] = useState(false);
  const [aiScoreRef, setAiScoreRef] = useState<number | null>(null);
  const [aiFeedbackRef, setAiFeedbackRef] = useState<string>('');

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

  // Toggle for Edit Upload Mode
  const [isEditingUpload, setIsEditingUpload] = useState(false);

  // Visual feedback banner state
  const [banner, setBanner] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Dynamic fetched pertemuan details
  const [pertemuanDetail, setPertemuanDetail] = useState<any>(null);
  const [progressDetail, setProgressDetail] = useState<any>(null);

  // Selected PDF Url & Name
  const [selectedPdfUrl, setSelectedPdfUrl] = useState<string>('');
  const [selectedPdfName, setSelectedPdfName] = useState<string>('');

  // PDF Viewer States
  const [pdfZoom, setPdfZoom] = useState(100);
  const [pdfCurrentPage, setPdfCurrentPage] = useState(1);
  const pdfTotalPages = 18;

  // Latihan PG State
  const [pgSoalList, setPgSoalList] = useState<any[]>([]);
  const [activePgIdx, setActivePgIdx] = useState(0);
  const [pgAnswers, setPgAnswers] = useState<{ [key: string]: string }>({});
  const [pgScore, setPgScore] = useState<number | null>(null);
  const [pgSubmitted, setPgSubmitted] = useState(false);

  // Find session info
  const session = jadwalList.find(s => s.id === pertemuanId);
  const videos = materiList.filter(m => m.videoUrl && !m.videoUrl.toLowerCase().includes('tiktok'));
  const tiktokVideos = materiList.filter(m => m.videoUrl && m.videoUrl.toLowerCase().includes('tiktok'));
  const pdfs = materiList.filter(m => m.fileUrl);

  const currentUrutan = pertemuanDetail?.urutan || session?.urutan;
  const prevSession = currentUrutan ? jadwalList.find(s => s.urutan === currentUrutan - 1) : null;
  const nextSession = currentUrutan ? jadwalList.find(s => s.urutan === currentUrutan + 1) : null;

  // Sync tab updates to URL
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    const newParams = new URLSearchParams(searchParams);
    newParams.set('tab', tab);
    setSearchParams(newParams);
  };

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
            if (reflectionSub.feedback) {
              setAiFeedbackRef(reflectionSub.feedback);
            }
          }
          if (screenshotSub) setScreenshotUrl(screenshotSub.fileUrl || '');
          if (programSub) setProgramUrl(programSub.fileUrl || '');
        })
        .catch(err => console.error('Gagal mengambil data submission sebelumnya', err));

      // Fetch Latihan PG
      api.get(`/materi/latihan-pg?pertemuanId=${pertemuanId}`)
        .then(res => {
          setPgSoalList(res.data || []);
        })
        .catch(err => console.error('Failed to fetch pg questions', err));

      // Restore quiz from LocalStorage
      const savedScore = localStorage.getItem(`pgScore_${pertemuanId}`);
      if (savedScore) {
        setPgScore(parseInt(savedScore, 10));
        setPgSubmitted(true);
      }
      const savedAnswers = localStorage.getItem(`pgAnswers_${pertemuanId}`);
      if (savedAnswers) {
        setPgAnswers(JSON.parse(savedAnswers));
      }
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
        setIsEditingUpload(false);
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
        setIsEditingUpload(false);
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
      if (response.data.data.feedback) {
        setAiFeedbackRef(response.data.data.feedback);
      }
      showBanner('success', `Refleksi berhasil dikirim! AI menilai: ${score}/100.`);
      
      // Update progress pertemuan ke completed secara otomatis
      await api.post('/student/status/progres', {
        pertemuanId,
        isCompleted: true
      });

      // Refetch progress
      const res = await api.get('/student/status/progres');
      const list = res.data.data || [];
      const prog = list.find((p: any) => p.pertemuanId === pertemuanId);
      if (prog) setProgressDetail(prog);
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

  // Latihan PG Handler
  const handleSelectAnswer = (soalId: string, optionKey: string) => {
    if (pgSubmitted) return;
    const newAnswers = { ...pgAnswers, [soalId]: optionKey };
    setPgAnswers(newAnswers);
    localStorage.setItem(`pgAnswers_${pertemuanId}`, JSON.stringify(newAnswers));
  };

  const handleQuizSubmit = async () => {
    const questions = pgSoalList.length > 0 ? pgSoalList : MOCK_CSS_SOAL;
    let correct = 0;
    questions.forEach(q => {
      const correctAns = q.correctAnswer || 'A';
      if (pgAnswers[q.id] === correctAns) {
        correct += 1;
      }
    });

    const score = Math.round((correct / questions.length) * 100);
    setPgScore(score);
    setPgSubmitted(true);
    localStorage.setItem(`pgScore_${pertemuanId}`, score.toString());
    showBanner('success', `Latihan PG berhasil dinilai AI: ${score}/100.`);

    // If reflection is already submitted, update general progress to completed
    if (aiScoreRef !== null) {
      await api.post('/student/status/progres', {
        pertemuanId,
        isCompleted: true
      });
      const res = await api.get('/student/status/progres');
      const list = res.data.data || [];
      const prog = list.find((p: any) => p.pertemuanId === pertemuanId);
      if (prog) setProgressDetail(prog);
    }
  };

  const isCompleted = progressDetail?.isCompleted || (aiScoreRef !== null && pgSubmitted);

  const activePdfUrl = selectedPdfUrl || (pdfs.length > 0 ? pdfs[0].fileUrl : '');
  const activePdfName = selectedPdfName || (pdfs.length > 0 ? pdfs[0].nama : 'Materi Sesi.pdf');

  // Check if current tab is full width (requires hiding the sidebar)
  const isFullWidthTab = activeTab === 'upload_tugas' || activeTab === 'refleksi';

  // Extract filenames from URLs
  const screenshotFileName = screenshotUrl ? screenshotUrl.substring(screenshotUrl.lastIndexOf('/') + 1) : `screenshot_${pertemuanDetail?.urutan || session?.urutan || '1'}.png`;
  const programFileName = programUrl ? programUrl.substring(programUrl.lastIndexOf('/') + 1) : `program_html.zip`;

  // Display status strings
  const hasUploadedFiles = screenshotUrl || programUrl;

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

      {/* Breadcrumbs Navigation */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-500 font-bold">
          <span 
            onClick={() => navigate(-1)} 
            className="hover:text-blue-600 cursor-pointer flex items-center gap-1.5"
          >
            <HiOutlineArrowLeft className="text-base" /> List Pertemuan
          </span>
          <span className="text-gray-400 font-normal">&gt;</span>
          <span className="text-gray-800">
            P{pertemuanDetail?.urutan || session?.urutan || '1'} — {pertemuanDetail?.topik || session?.topik || 'Intro Web Development'}
          </span>
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

      {/* Main Banner Card */}
      <Card className="rounded-[1.5rem] border-none shadow-sm bg-[#4A90E2] text-white p-8 mb-6 relative overflow-hidden flex justify-between items-center">
        <div className="z-10">
          <h1 className="text-2xl font-black leading-tight text-left">
             P{pertemuanDetail?.urutan || session?.urutan || '1'}— {pertemuanDetail?.topik || session?.topik || 'Intro Web Dev'}
          </h1>
          <p className="text-xs font-bold opacity-80 mt-2 text-left uppercase tracking-wider">
             {pertemuanDetail?.mataKuliah?.nama || 'Web Dev Bootcamp'} · {pertemuanDetail?.mataKuliah?.tipeKursus || 'Micro Learning'} · {pertemuanDetail?.tgl ? new Date(pertemuanDetail.tgl).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '19 Mar 2025'}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2 z-10">
          {isCompleted ? (
            <Badge className="bg-emerald-500/20 text-emerald-250 border border-emerald-500/30 font-black text-xs px-4 py-1.5 rounded-full uppercase tracking-wider">
              ✓ Selesai
            </Badge>
          ) : (
            <Badge className="bg-amber-500/20 text-amber-250 border border-amber-500/30 font-black text-xs px-4 py-1.5 rounded-full uppercase tracking-wider">
              Dalam Proses
            </Badge>
          )}
          <span className="text-[10px] opacity-20 font-black">P4 →</span>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-24 translate-x-24"></div>
      </Card>

      {/* Button Row Tabs Navigation */}
      <div className="flex flex-wrap gap-2.5 mb-8">
        <Button 
          variant="outline" 
          onClick={() => navigate(-1)}
          className="bg-white border border-gray-250 shadow-sm rounded-xl font-bold text-xs py-5 px-6 hover:bg-gray-50 text-gray-700"
        >
          <HiOutlineArrowLeft className="mr-2 text-base" /> Kembali
        </Button>

        <Button 
          onClick={() => handleTabChange('zoom')}
          className={`rounded-xl font-bold text-xs py-5 px-6 shadow-sm flex items-center gap-2 border transition-all ${
            activeTab === 'zoom' 
              ? 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600' 
              : 'bg-white text-gray-750 border-gray-250 hover:bg-gray-50'
          }`}
        >
          <HiOutlineVideoCamera className="text-base" /> Zoom Rekaman
        </Button>

        <Button 
          onClick={() => handleTabChange('materi')}
          className={`rounded-xl font-bold text-xs py-5 px-6 shadow-sm flex items-center gap-2 border transition-all ${
            activeTab === 'materi' 
              ? 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600' 
              : 'bg-white text-gray-750 border-gray-250 hover:bg-gray-50'
          }`}
        >
          <HiOutlineBookOpen className="text-base" /> View Materi
        </Button>

        <Button 
          onClick={() => handleTabChange('pdf')}
          className={`rounded-xl font-bold text-xs py-5 px-6 shadow-sm flex items-center gap-2 border transition-all ${
            activeTab === 'pdf' 
              ? 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600' 
              : 'bg-white text-gray-750 border-gray-250 hover:bg-gray-50'
          }`}
        >
          <HiOutlineDocumentText className="text-base" /> View PDF
        </Button>

        <Button 
          onClick={() => handleTabChange('latihan')}
          className={`rounded-xl font-bold text-xs py-5 px-6 shadow-sm flex items-center gap-2 border transition-all ${
            activeTab === 'latihan' 
              ? 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600' 
              : 'bg-white text-gray-750 border-gray-250 hover:bg-gray-50'
          }`}
        >
          <HiOutlinePencilSquare className="text-base" /> Latihan PG
        </Button>

        <Button 
          onClick={() => handleTabChange('upload_tugas')}
          className={`rounded-xl font-bold text-xs py-5 px-6 shadow-sm flex items-center gap-2 border transition-all ${
            activeTab === 'upload_tugas' 
              ? 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600' 
              : 'bg-white text-gray-750 border-gray-250 hover:bg-gray-50'
          }`}
        >
          Upload Tugas
        </Button>

        <Button 
          onClick={() => handleTabChange('refleksi')}
          className={`rounded-xl font-bold text-xs py-5 px-6 shadow-sm flex items-center gap-2 border transition-all ${
            activeTab === 'refleksi' 
              ? 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600' 
              : 'bg-white text-gray-750 border-gray-250 hover:bg-gray-50'
          }`}
        >
          Refleksi
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Content Area */}
        <div className={`${isFullWidthTab ? 'lg:col-span-12' : 'lg:col-span-8'} space-y-8`}>
          
          {/* TAB 1: Zoom Rekaman */}
          {activeTab === 'zoom' && (
            <div className="space-y-8">
              {/* Online Meeting Card */}
              <Card className="rounded-[2rem] border border-gray-200 shadow-sm bg-white p-8">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6">Online Meeting (Zoom/Meet)</h3>
                <div className="bg-[#EBF5FF] border border-[#D0E7FF] p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className="w-14 h-14 bg-[#2D8CFF] rounded-xl flex items-center justify-center shadow-md shrink-0">
                      <svg className="w-8 h-8 text-white fill-current" viewBox="0 0 24 24">
                        <path d="M17.472 10.373a1.599 1.599 0 0 0-1.6 1.6v.053a10.978 10.978 0 0 1-5.748 5.748h-.053a1.599 1.599 0 0 0-1.6-1.6H5.2c-.88 0-1.6.72-1.6 1.6V19.4c0 .88.72 1.6 1.6 1.6H8.4a1.6 1.6 0 0 0 1.6-1.6v-.053a10.978 10.978 0 0 1 5.748-5.748h.053a1.599 1.599 0 0 0 1.6 1.6H18.8c.88 0 1.6-.72 1.6-1.6V11.973a1.599 1.599 0 0 0-1.6-1.6h-1.328zM5.2 2.6H8.4a1.6 1.6 0 0 1 1.6 1.6v3.2c0 .88-.72 1.6-1.6 1.6H5.2c-.88 0-1.6-.72-1.6-1.6V4.2c0-.88.72-1.6 1.6-1.6zm13.6 0H18.8a1.6 1.6 0 0 1 1.6 1.6v3.2a1.6 1.6 0 0 1-1.6 1.6H18.8a1.6 1.6 0 0 1-1.6-1.6V4.2c0-.88.72-1.6 1.6-1.6z"/>
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-base font-black text-blue-950">Kelas sudah selesai</h4>
                      <p className="text-xs font-bold text-blue-700/60 mt-1">
                        Rabu, 5 Feb 2025 · 09:00~11:00 WIB
                      </p>
                    </div>
                  </div>
                  <Button className="w-full sm:w-auto bg-[#10B981] hover:bg-[#059669] text-white font-black text-xs py-3 px-6 rounded-xl flex items-center gap-1.5 justify-center cursor-default">
                    <HiOutlineCheck className="text-base" /> Selesai
                  </Button>
                </div>
              </Card>

              {/* Video Recording 1 */}
              <div className="space-y-3">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                   <HiOutlineVideoCamera className="text-base" /> Rekaman Zoom (Video 1)
                </h3>
                <div className="aspect-video w-full bg-[#182C44] rounded-[2rem] flex flex-col items-center justify-center border border-gray-50 relative group overflow-hidden shadow-sm">
                  <div className="w-20 h-20 bg-black/40 text-white rounded-full flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-all cursor-pointer shadow-2xl border border-white/10">
                    <HiOutlinePlayCircle className="text-5xl" />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 pt-12 flex justify-between items-end text-white/90">
                    <span className="text-xs font-bold tracking-wide font-mono">rekaman_p1_intro_uiux.mp4</span>
                    <span className="text-xs font-bold font-mono">0:00 / 1:45:30</span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-600/40">
                    <div className="h-full bg-blue-500 w-0 group-hover:w-[20%] transition-all duration-500"></div>
                  </div>
                </div>
              </div>

              {/* Video Recording 2 */}
              <div className="space-y-3">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                   <HiOutlineVideoCamera className="text-base" /> Rekaman Zoom (Video 2 — Q&A Session)
                </h3>
                <div className="aspect-video w-full bg-[#182C44] rounded-[2rem] flex flex-col items-center justify-center border border-gray-50 relative group overflow-hidden shadow-sm">
                  <div className="w-20 h-20 bg-black/40 text-white rounded-full flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-all cursor-pointer shadow-2xl border border-white/10">
                    <HiOutlinePlayCircle className="text-5xl" />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 pt-12 flex justify-between items-end text-white/90">
                    <span className="text-xs font-bold tracking-wide font-mono">rekaman_p1_intro_uiux.mp4</span>
                    <span className="text-xs font-bold font-mono">0:00 / 1:45:30</span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-600/40">
                    <div className="h-full bg-blue-500 w-0 group-hover:w-[15%] transition-all duration-500"></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: View Materi */}
          {activeTab === 'materi' && (
            <Card className="rounded-[2.5rem] border-none shadow-sm bg-white p-10">
              <h2 className="text-xl font-black text-gray-900 mb-8">Video Pembelajaran ({videos.length} Video)</h2>
              
              <div className="space-y-12">
                {videos.map((v, i) => (
                  <div key={v.id} className="space-y-6">
                    <h3 className="text-sm font-black text-gray-700 text-left">Video {i + 1} — {v.nama}</h3>
                    <div className="aspect-video w-full bg-gray-100 rounded-[2rem] flex items-center justify-center border border-gray-50 overflow-hidden relative group shadow-inner">
                      <HiOutlinePlayCircle className="text-8xl text-gray-300 group-hover:text-blue-500 transition-all cursor-pointer animate-pulse" />
                      <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gray-200">
                        <div className="h-full bg-blue-500 w-[40%]"></div>
                      </div>
                    </div>
                  </div>
                ))}

                {tiktokVideos.map((v, i) => (
                  <div key={v.id} className="space-y-6">
                     <h3 className="text-sm font-black text-gray-700 text-left">Video {videos.length + i + 1} — {v.nama} (TikTok)</h3>
                     <div 
                       onClick={() => window.open(v.videoUrl, '_blank')}
                       className="aspect-video w-full bg-gray-50 rounded-[2rem] flex items-center justify-center border-2 border-dashed border-gray-200 group cursor-pointer hover:bg-gray-100/50 transition-all shadow-inner"
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
                  <h3 className="text-sm font-black text-gray-700">Modul & Sub Materi PDF</h3>
                  <div className="space-y-3">
                     {pdfs.length > 0 ? pdfs.map((p, i) => (
                       <div 
                         key={p.id} 
                         onClick={() => {
                           setSelectedPdfUrl(p.fileUrl);
                           setSelectedPdfName(p.nama);
                           handleTabChange('pdf');
                         }}
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
          )}

          {/* TAB 3: View PDF */}
          {activeTab === 'pdf' && (
            <Card className="rounded-[2.5rem] border-none shadow-sm bg-white overflow-hidden flex flex-col min-h-[750px]">
               {/* Toolbar PDF */}
               <div className="bg-[#A0AEC0] p-4 flex justify-between items-center px-10">
                  <span className="text-xs font-black text-white italic truncate max-w-xs">{activePdfName.toLowerCase()}</span>
                  <div className="flex items-center gap-4">
                     <div className="flex items-center bg-gray-500/20 rounded-lg overflow-hidden border border-white/10">
                        <button onClick={() => setPdfZoom(z => Math.max(50, z-10))} className="p-2 text-white hover:bg-white/10 transition-all">
                           <HiOutlineMagnifyingGlassMinus className="text-lg" />
                        </button>
                        <span className="px-4 text-xs font-black text-white border-x border-white/10">{pdfZoom}%</span>
                        <button onClick={() => setPdfZoom(z => Math.min(200, z+10))} className="p-2 text-white hover:bg-white/10 transition-all">
                           <HiOutlineMagnifyingGlassPlus className="text-lg" />
                        </button>
                     </div>
                     <div className="bg-gray-500/20 px-6 py-2 rounded-lg border border-white/10 text-xs font-black text-white">
                        Hal {pdfCurrentPage}/{pdfTotalPages}
                     </div>
                     {activePdfUrl && (
                       <Button 
                         onClick={() => window.open(activePdfUrl, '_blank')}
                         className="bg-white hover:bg-gray-50 text-gray-700 text-[10px] font-black h-8 px-4 rounded"
                       >
                         Download
                       </Button>
                     )}
                  </div>
               </div>

               {/* Content Area */}
               <div className="flex-1 p-12 bg-gray-100 flex flex-col items-center overflow-y-auto custom-scrollbar relative">
                  {activePdfUrl ? (
                    <div 
                      className="w-full max-w-4xl bg-white shadow-2xl rounded-sm p-16 space-y-12 min-h-[1000px] transition-all duration-300 relative" 
                      style={{ transform: `scale(${pdfZoom/100})`, transformOrigin: 'top center' }}
                    >
                       <h2 className="text-3xl font-black text-center text-gray-800 mb-16">CSS Flexbox Layout</h2>
                       
                       <div className="space-y-6 text-left">
                          <h3 className="text-xl font-black text-gray-850">1. Pengertian Flexbox</h3>
                          <p className="text-sm font-medium text-gray-600 leading-relaxed">
                            Flexbox (Flexible Box Layout) adalah sistem tata letak 1 dimensi yang digunakan untuk menyelaraskan dan mendistribusikan ruang antar item dalam wadah, bahkan ketika ukurannya tidak diketahui atau dinamis.
                          </p>
                          <div className="space-y-3">
                             <div className="h-2 w-full bg-gray-100 rounded-full"></div>
                             <div className="h-2 w-full bg-gray-100 rounded-full"></div>
                             <div className="h-2 w-[80%] bg-gray-100 rounded-full"></div>
                          </div>
                       </div>

                       <div className="space-y-6 text-left">
                          <h3 className="text-xl font-black text-gray-850">2. Flex Container Properties</h3>
                          <p className="text-sm font-medium text-gray-600 leading-relaxed">
                            Beberapa properti utama pada container adalah display, flex-direction, justify-content, dan align-items.
                          </p>
                          <div className="p-6 bg-gray-50 rounded-2xl border border-gray-200 font-mono text-xs text-indigo-900 space-y-2 mt-4 shadow-inner">
                             <p className="font-bold"><span className="text-pink-600">.container</span> &#123;</p>
                             <p className="pl-6"><span className="text-blue-600">display</span>: flex;</p>
                             <p className="pl-6"><span className="text-blue-600">flex-direction</span>: row;</p>
                             <p className="pl-6"><span className="text-blue-600">justify-content</span>: space-between;</p>
                             <p className="pl-6"><span className="text-blue-600">align-items</span>: center;</p>
                             <p>&#125;</p>
                          </div>
                       </div>

                       <div className="space-y-6 text-left">
                          <h3 className="text-xl font-black text-gray-850">3. Flex Item Properties</h3>
                          <div className="space-y-3">
                             <div className="h-2 w-full bg-gray-100 rounded-full"></div>
                             <div className="h-2 w-full bg-gray-100 rounded-full"></div>
                             <div className="h-2 w-[70%] bg-gray-100 rounded-full"></div>
                          </div>
                       </div>
                    </div>
                  ) : (
                    <div className="text-center py-20 text-gray-400 font-bold italic text-xs">
                      Silakan pilih sub-materi PDF di tab "View Materi" terlebih dahulu
                    </div>
                  )}

                  {/* Floating Navigation Controls */}
                  <div className="absolute right-10 top-1/2 -translate-y-1/2 flex flex-col gap-4">
                     <button 
                       onClick={() => setPdfCurrentPage(p => Math.max(1, p-1))}
                       className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-white hover:bg-blue-600 shadow-lg transition-all"
                     >
                        <HiOutlineChevronUp className="text-xl" />
                     </button>
                     <button 
                       onClick={() => setPdfCurrentPage(p => Math.min(pdfTotalPages, p+1))}
                       className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-white hover:bg-blue-600 shadow-lg transition-all"
                     >
                        <HiOutlineChevronDown className="text-xl" />
                     </button>
                  </div>
               </div>
            </Card>
          )}

          {/* TAB 4: Latihan PG */}
          {activeTab === 'latihan' && (
            <div className="space-y-8">
              <Card className="rounded-[2.5rem] border-none shadow-sm bg-white p-8">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-xl font-black text-gray-900 leading-none">
                      Latihan Pilihan Ganda ({pgSoalList.length > 0 ? pgSoalList.length : MOCK_CSS_SOAL.length} Soal)
                    </h2>
                    <p className="text-[10px] font-bold text-gray-400 uppercase mt-2">Pilih salah satu jawaban yang menurut Anda paling tepat</p>
                  </div>
                  {pgSubmitted ? (
                    <Badge className="bg-emerald-100 text-emerald-600 border-none font-black text-xs px-4 py-1.5 uppercase tracking-wider rounded-full">
                       Skor AI: {pgScore}/100
                    </Badge>
                  ) : (
                    <Badge className="bg-amber-100 text-amber-600 border-none font-black text-xs px-4 py-1.5 uppercase tracking-wider rounded-full animate-pulse">
                       Menunggu Jawaban
                    </Badge>
                  )}
                </div>

                {/* Question List & Quiz Navigation */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
                  
                  {/* Left Column Quiz Nav */}
                  <div className="lg:col-span-3 space-y-4">
                    <div className="bg-gray-50 p-5 rounded-2xl border border-gray-150">
                      <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Nomor Soal</h4>
                      <div className="grid grid-cols-5 gap-2">
                        {(() => {
                          const questions = pgSoalList.length > 0 ? pgSoalList : MOCK_CSS_SOAL;
                          return questions.map((q, idx) => {
                            const isAnswered = !!pgAnswers[q.id];
                            const isActive = idx === activePgIdx;
                            return (
                              <button
                                key={q.id}
                                onClick={() => setActivePgIdx(idx)}
                                className={`w-full aspect-square rounded-lg flex items-center justify-center font-black text-xs transition-all ${
                                  isActive ? 'bg-blue-600 text-white shadow-md scale-105' :
                                  isAnswered ? 'bg-emerald-500 text-white shadow-sm' :
                                  'bg-white border border-gray-200 text-gray-500 hover:bg-gray-100'
                                }`}
                              >
                                {idx + 1}
                              </button>
                            );
                          });
                        })()}
                      </div>
                    </div>
                  </div>

                  {/* Center Column Question Details */}
                  <div className="lg:col-span-9 space-y-6">
                    {(() => {
                      const questions = pgSoalList.length > 0 ? pgSoalList : MOCK_CSS_SOAL;
                      if (questions.length === 0) return null;
                      const currentQ = questions[activePgIdx];
                      const currentSelected = pgAnswers[currentQ.id];

                      return (
                        <div className="space-y-6">
                          <p className="text-gray-800 font-bold text-sm leading-relaxed text-left">
                            {activePgIdx + 1}. {currentQ.pertanyaan}
                          </p>

                          <div className="grid grid-cols-1 gap-3">
                            {Object.entries(currentQ.options || {}).map(([key, optText]) => {
                              const isSelected = currentSelected === key;
                              return (
                                <button
                                  key={key}
                                  onClick={() => handleSelectAnswer(currentQ.id, key)}
                                  className={`p-4 rounded-xl border flex items-center gap-4 transition-all text-left w-full ${
                                    isSelected 
                                      ? 'bg-blue-50 border-blue-500 text-blue-950 font-bold' 
                                      : 'bg-white border-gray-200 hover:border-blue-300 text-gray-700'
                                  }`}
                                >
                                  <div className={`w-7 h-7 rounded-full flex items-center justify-center font-black text-xs transition-colors shrink-0 ${
                                    isSelected ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'
                                  }`}>
                                    {key}
                                  </div>
                                  <span className="text-xs font-bold">{optText}</span>
                                </button>
                              );
                            })}
                          </div>

                          <div className="flex justify-between items-center pt-6 border-t border-gray-100">
                            <Button
                              disabled={activePgIdx === 0}
                              onClick={() => setActivePgIdx(prev => prev - 1)}
                              className="bg-gray-50 hover:bg-gray-100 text-gray-600 font-bold rounded-xl h-10 px-4 flex items-center gap-1 border-none shadow-none"
                            >
                              Sebelumnya
                            </Button>
                            
                            {activePgIdx < questions.length - 1 ? (
                              <Button
                                onClick={() => setActivePgIdx(prev => prev + 1)}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl h-10 px-4 flex items-center gap-1 border-none shadow-none"
                              >
                                Berikutnya
                              </Button>
                            ) : (
                              !pgSubmitted && (
                                <Button
                                  onClick={handleQuizSubmit}
                                  className="bg-[#10B981] hover:bg-[#059669] text-white font-black rounded-xl h-10 px-6 uppercase tracking-wider flex items-center gap-1.5 border-none"
                                >
                                  Submit Kuis
                                </Button>
                              )
                            )}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* TAB 5: Upload Tugas (Moodle-style table) */}
          {activeTab === 'upload_tugas' && (
            <div className="space-y-6 w-full">
              {(!hasUploadedFiles || isEditingUpload) ? (
                /* Drag-and-drop / selector fields for uploading files */
                <Card className="rounded-[2.5rem] border border-gray-200 shadow-sm bg-white p-10">
                   <div className="flex justify-between items-center mb-8">
                      <div>
                         <h2 className="text-xl font-black text-gray-900 text-left">Upload Latihan P{pertemuanDetail?.urutan || session?.urutan || '1'}</h2>
                         <p className="text-xs font-bold text-gray-400 mt-1 text-left">Silakan unggah screenshot hasil pengerjaan coding dan folder zip project Anda.</p>
                      </div>
                      <Button 
                        variant="outline"
                        onClick={() => hasUploadedFiles && setIsEditingUpload(false)}
                        className="rounded-xl font-bold text-xs"
                        disabled={!hasUploadedFiles}
                      >
                         Batal Edit
                      </Button>
                   </div>
                   <div className="space-y-6">
                      <input 
                        type="file" 
                        id="screenshot-tab-input" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleScreenshotUpload} 
                      />
                      <input 
                        type="file" 
                        id="program-tab-input" 
                        accept=".zip,.rar,.tar.gz" 
                        className="hidden" 
                        onChange={handleProgramUpload} 
                      />

                      {/* Box Screenshot */}
                      <div 
                        onClick={() => !isUploadingScreenshot && document.getElementById('screenshot-tab-input')?.click()}
                        className={`w-full p-8 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-3 transition-all cursor-pointer ${
                          screenshotUrl ? 'border-emerald-300 bg-emerald-50/20' : 
                          isUploadingScreenshot ? 'border-blue-300 bg-blue-50/10 animate-pulse' : 'border-gray-200 bg-gray-50/50 hover:border-blue-300'
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
                           <div className="flex items-center gap-3 w-full justify-between px-4">
                             <div className="flex items-center gap-3">
                               <div className="w-10 h-8 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600 font-bold text-sm shadow-sm">✓</div>
                               <div className="text-left">
                                 <p className="text-xs font-black text-emerald-950">Screenshot Terupload</p>
                                 <p className="text-[9px] text-gray-400 font-bold truncate max-w-md">{screenshotFileName}</p>
                               </div>
                             </div>
                             <Badge className="bg-emerald-150 text-emerald-700 border-none font-bold text-[9px] px-3 py-1 rounded-full">Ganti File</Badge>
                           </div>
                         ) : (
                           <div className="flex items-center gap-3">
                              <div className="w-10 h-8 bg-amber-100 rounded-lg flex items-center justify-center text-amber-500 text-lg shadow-sm">📸</div>
                              <span className="text-xs font-black text-gray-500">Upload Screenshot (.png/.jpg)</span>
                           </div>
                         )}
                      </div>

                      {/* Box ZIP Program File */}
                      <div 
                        onClick={() => !isUploadingProgram && document.getElementById('program-tab-input')?.click()}
                        className={`w-full p-8 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-3 transition-all cursor-pointer ${
                          programUrl ? 'border-emerald-300 bg-emerald-50/20' : 
                          isUploadingProgram ? 'border-blue-300 bg-blue-50/10 animate-pulse' : 'border-gray-200 bg-gray-50/50 hover:border-blue-300'
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
                           <div className="flex items-center gap-3 w-full justify-between px-4">
                             <div className="flex items-center gap-3">
                               <div className="w-10 h-8 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600 font-bold text-sm shadow-sm">✓</div>
                               <div className="text-left">
                                 <p className="text-xs font-black text-emerald-950">File Program Terupload</p>
                                 <p className="text-[9px] text-gray-400 font-bold truncate max-w-md">{programFileName}</p>
                               </div>
                             </div>
                             <Badge className="bg-emerald-150 text-emerald-700 border-none font-bold text-[9px] px-3 py-1 rounded-full">Ganti File</Badge>
                           </div>
                         ) : (
                           <div className="flex items-center gap-3">
                              <div className="w-10 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-500 text-lg shadow-sm">🗜️</div>
                              <span className="text-xs font-black text-gray-500">Upload File Program (.zip)</span>
                           </div>
                         )}
                      </div>
                   </div>
                </Card>
              ) : (
                /* Moodle-style Submission Status Table */
                <Card className="rounded-[1.5rem] border border-gray-200 shadow-sm bg-white p-8">
                  <div className="mb-6">
                    <h2 className="text-xl font-black text-gray-950 text-left">Latihan P{pertemuanDetail?.urutan || session?.urutan || '1'}</h2>
                    <p className="text-xs text-gray-400 font-bold mt-1 text-left">Buat layout CSS sederhana dan upload screenshot hasilnya + file zip project</p>
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 mb-4 text-left border-b border-gray-100 pb-2">Submission status</h3>
                  
                  <div className="border border-gray-200 rounded-xl overflow-hidden mb-6 text-xs font-medium text-gray-700">
                    <table className="w-full border-collapse">
                      <tbody>
                        {/* Row 1: Submission status */}
                        <tr className="border-b border-gray-200">
                          <td className="w-[30%] bg-gray-50 p-4 font-black border-r border-gray-200">Submission status</td>
                          <td className="p-4 bg-[#EBFDF5] text-emerald-700 font-bold">
                            Submitted for grading
                          </td>
                        </tr>
                        {/* Row 2: Grading status */}
                        <tr className="border-b border-gray-200">
                          <td className="bg-gray-50 p-4 font-black border-r border-gray-200">Grading status</td>
                          <td className="p-4 text-gray-950">
                            {progressDetail?.nilai ? `Graded (Nilai: ${progressDetail.nilai})` : 'Not graded'}
                          </td>
                        </tr>
                        {/* Row 3: Due date */}
                        <tr className="border-b border-gray-200">
                          <td className="bg-gray-50 p-4 font-black border-r border-gray-200">Due date</td>
                          <td className="p-4 text-gray-500">
                            Sunday, 19 Maret 2026, 12:00 AM
                          </td>
                        </tr>
                        {/* Row 4: Time remaining */}
                        <tr className="border-b border-gray-200">
                          <td className="bg-gray-50 p-4 font-black border-r border-gray-200">Time remaining</td>
                          <td className="p-4 bg-[#EBFDF5] text-emerald-700 font-bold">
                            Assignment was submitted 2 hours 27 mins early
                          </td>
                        </tr>
                        {/* Row 5: Last modified */}
                        <tr className="border-b border-gray-200">
                          <td className="bg-gray-50 p-4 font-black border-r border-gray-200">Last modified</td>
                          <td className="p-4 text-gray-500 font-mono">
                            Monday, 8 December 2025, 9:32 PM
                          </td>
                        </tr>
                        {/* Row 6: File submissions */}
                        <tr>
                          <td className="bg-gray-50 p-4 font-black border-r border-gray-200">File submissions</td>
                          <td className="p-4 space-y-2">
                            {screenshotUrl && (
                              <div className="flex items-center gap-2">
                                <HiOutlineDocumentText className="text-gray-400 text-sm shrink-0" />
                                <a 
                                  href={screenshotUrl} 
                                  target="_blank" 
                                  rel="noreferrer" 
                                  className="text-blue-600 hover:underline font-bold"
                                >
                                  {screenshotFileName}
                                </a>
                                <span className="text-[10px] text-gray-450 font-medium">Monday, 8 December 2025, 9:32 PM</span>
                              </div>
                            )}
                            {programUrl && (
                              <div className="flex items-center gap-2">
                                <HiOutlinePaperClip className="text-gray-400 text-sm shrink-0" />
                                <a 
                                  href={programUrl} 
                                  target="_blank" 
                                  rel="noreferrer" 
                                  className="text-blue-600 hover:underline font-bold"
                                >
                                  {programFileName}
                                </a>
                                <span className="text-[10px] text-gray-450 font-medium">Monday, 8 December 2025, 9:32 PM</span>
                              </div>
                            )}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="flex justify-start">
                    <Button 
                      onClick={() => setIsEditingUpload(true)}
                      className="bg-gray-200 hover:bg-gray-250 text-gray-800 font-bold text-xs py-3 px-6 rounded-lg flex items-center gap-1.5 border-none"
                    >
                      <HiOutlinePencil className="text-sm" /> Edit Upload
                    </Button>
                  </div>
                </Card>
              )}

              {/* Mint Green Success Banner below table */}
              {hasUploadedFiles && !isEditingUpload && (
                <div className="bg-[#D1EAE0] border border-[#A6D4C0] p-5 rounded-2xl flex items-center gap-3">
                  <div className="w-4 h-4 bg-[#10B981] rounded-full shrink-0"></div>
                  <span className="text-sm font-black text-emerald-950">
                    Upload sudah berhasil dikirim · Menunggu penilaian Asisten
                  </span>
                </div>
              )}
            </div>
          )}

          {/* TAB 6: Refleksi (Full-width submission view) */}
          {activeTab === 'refleksi' && (
            <Card className="rounded-[2.5rem] border border-gray-200 shadow-sm bg-white p-10 space-y-8">
              <div className="flex justify-between items-center border-b border-gray-150 pb-4">
                <div>
                   <h2 className="text-xl font-black text-gray-900 text-left">Refleksi Pembelajaran</h2>
                   <p className="text-xs font-bold text-gray-400 mt-1 text-left">
                     Jelaskan pemahaman Anda mengenai materi pelajaran pertemuan ini dan evaluasikan diri Anda.
                   </p>
                </div>
                {aiScoreRef !== null && (
                  <Badge className="bg-emerald-600 text-white border-none font-black text-xs px-4 py-1.5 uppercase tracking-widest shadow-lg rounded-full">
                     Skor AI: {aiScoreRef}/100
                  </Badge>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Area: Form */}
                <div className="lg:col-span-8 space-y-6">
                  <div className="bg-[#E9F7F2] p-6 rounded-[2rem] border border-emerald-100 text-left space-y-3">
                     <span className="text-emerald-900 block font-black text-sm">Pertanyaan Refleksi:</span>
                     {materiList.filter(m => m.refleksi && m.refleksi.trim()).length > 0 ? (
                        materiList
                           .filter(m => m.refleksi && m.refleksi.trim())
                           .map((m, idx, arr) => (
                              <p key={m.id || idx} className="bg-white/60 p-3 rounded-xl border border-emerald-150 text-xs font-semibold text-emerald-950 leading-relaxed">
                                 {arr.length > 1 ? `${idx + 1}. ` : ''}{m.refleksi}
                              </p>
                           ))
                     ) : (
                        <p className="bg-white/60 p-3 rounded-xl border border-emerald-150 text-xs font-semibold text-emerald-950 leading-relaxed">
                           Jelaskan apa yang kamu pelajari pada pertemuan ini dan bagaimana penerapannya dalam layout web?
                        </p>
                     )}
                  </div>

                  <textarea 
                    value={refleksi}
                    onChange={(e) => setRefleksi(e.target.value)}
                    placeholder="Tuliskan jawaban refleksi esai Anda secara mendalam di sini..."
                    className="w-full h-64 bg-gray-50 border border-gray-200 rounded-[2rem] p-6 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all text-left text-gray-800"
                    disabled={aiScoreRef !== null}
                  />

                  {aiFeedbackRef && (
                    <div className="p-5 bg-blue-50 border border-blue-150 rounded-2xl text-xs font-semibold text-blue-900/80 leading-relaxed text-left">
                      <span className="font-black text-blue-950 block mb-1">Feedback Penilaian AI:</span>
                      {aiFeedbackRef}
                    </div>
                  )}

                  {aiScoreRef === null ? (
                    <Button 
                      onClick={handleRefleksiSubmit}
                      disabled={isSubmittingRefleksi}
                      className="w-full bg-[#10B981] hover:bg-[#059669] text-white font-black py-7 rounded-2xl shadow-xl shadow-emerald-100 uppercase tracking-widest text-xs"
                    >
                       {isSubmittingRefleksi ? 'Gemini AI Sedang Menilai...' : 'Kirim Jawaban Refleksi'}
                    </Button>
                  ) : (
                    <div className="bg-[#D1EAE0] border border-[#A6D4C0] p-5 rounded-2xl flex items-center justify-center gap-3">
                       <HiOutlineCheckCircle className="text-xl text-emerald-600 shrink-0" />
                       <span className="text-sm font-black text-emerald-950">Refleksi telah dikirim dan dinilai oleh AI.</span>
                    </div>
                  )}
                </div>

                {/* Right Area: AI Buddy Info */}
                <div className="lg:col-span-4 space-y-6">
                  <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-8 rounded-[2rem] border border-indigo-100 shadow-sm text-left">
                     <div className="flex items-center gap-2 mb-4">
                        <HiOutlineSparkles className="text-indigo-650 text-lg" />
                        <h3 className="text-xs font-black text-indigo-950 uppercase tracking-wider">AI learning partner</h3>
                     </div>
                     <p className="text-xs text-indigo-900/60 font-semibold leading-relaxed">
                        Tulis esai refleksi Anda secara lengkap dan mendalam! Gemini AI Grader akan menganalisis tulisan Anda untuk memberikan penilaian awal secara instan guna membantu mempermudah grading manual oleh Asisten Dosen.
                     </p>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Latihan Praktik Section: Only visible in non-full-width tabs (Zoom, Materi, PDF, Latihan) */}
          {!isFullWidthTab && (
            <Card className="rounded-[2.5rem] border border-gray-200 shadow-sm bg-white p-10 mt-8">
               <div className="flex justify-between items-center mb-8">
                  <div>
                     <h2 className="text-xl font-black text-gray-900 text-left">Latihan Praktik</h2>
                     <p className="text-xs font-bold text-gray-400 mt-1 text-left">Upload screenshot hasil kerja serta zip file project untuk verifikasi asisten</p>
                  </div>
                  <Badge className="bg-blue-100 text-blue-600 border-none font-black text-[9px] px-4 py-1.5 uppercase tracking-widest rounded-full">
                     Praktik Modul
                  </Badge>
               </div>
               <div className="space-y-4">
                  {/* Input Files (Hidden) */}
                  <input 
                    type="file" 
                    id="screenshot-input-main" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleScreenshotUpload} 
                  />
                  <input 
                    type="file" 
                    id="program-input-main" 
                    accept=".zip,.rar,.tar.gz" 
                    className="hidden" 
                    onChange={handleProgramUpload} 
                  />

                  {/* Box Screenshot */}
                  <div 
                    onClick={() => !isUploadingScreenshot && document.getElementById('screenshot-input-main')?.click()}
                    className={`w-full p-6 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-3 transition-all cursor-pointer ${
                      screenshotUrl ? 'border-emerald-300 bg-emerald-50/20' : 
                      isUploadingScreenshot ? 'border-blue-300 bg-blue-50/10 animate-pulse' : 'border-gray-200 bg-gray-50/50 hover:border-blue-300'
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
                           <div className="w-10 h-8 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600 font-bold text-sm shadow-sm">✓</div>
                           <div className="text-left">
                             <p className="text-xs font-black text-emerald-950">Screenshot Terupload</p>
                             <p className="text-[9px] text-gray-400 font-bold truncate max-w-xs">{screenshotFileName}</p>
                           </div>
                         </div>
                         <Badge className="bg-emerald-150 text-emerald-700 border-none font-bold text-[9px] px-3 py-1 rounded-full cursor-pointer hover:bg-emerald-200">Ganti File</Badge>
                       </div>
                     ) : (
                       <div className="flex items-center gap-3">
                          <div className="w-10 h-8 bg-amber-100 rounded-lg flex items-center justify-center text-amber-500 text-lg shadow-sm">📸</div>
                          <span className="text-xs font-black text-gray-500">Upload Screenshot (.png/.jpg)</span>
                       </div>
                     )}
                  </div>

                  {/* Box ZIP Program File */}
                  <div 
                    onClick={() => !isUploadingProgram && document.getElementById('program-input-main')?.click()}
                    className={`w-full p-6 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-3 transition-all cursor-pointer ${
                      programUrl ? 'border-emerald-300 bg-emerald-50/20' : 
                      isUploadingProgram ? 'border-blue-300 bg-blue-50/10 animate-pulse' : 'border-gray-200 bg-gray-50/50 hover:border-blue-300'
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
                           <div className="w-10 h-8 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600 font-bold text-sm shadow-sm">✓</div>
                           <div className="text-left">
                             <p className="text-xs font-black text-emerald-950">File Program Terupload</p>
                             <p className="text-[9px] text-gray-400 font-bold truncate max-w-xs">{programFileName}</p>
                           </div>
                         </div>
                         <Badge className="bg-emerald-150 text-emerald-700 border-none font-bold text-[9px] px-3 py-1 rounded-full cursor-pointer hover:bg-emerald-200">Ganti File</Badge>
                       </div>
                     ) : (
                       <div className="flex items-center gap-3">
                          <div className="w-10 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-500 text-lg shadow-sm">🗜️</div>
                          <span className="text-xs font-black text-gray-500">Upload File Program (.zip)</span>
                       </div>
                     )}
                  </div>
               </div>
            </Card>
          )}
        </div>

        {/* Right Column Sidebar: Only visible in non-full-width tabs */}
        {!isFullWidthTab && (
          <div className="lg:col-span-4 space-y-6">
            
            {/* Status P1 tracker card */}
            <Card className="rounded-[2rem] border border-gray-200 shadow-sm bg-white overflow-hidden text-left">
               <div className="p-8 pb-4">
                  <h3 className="text-base font-black text-gray-900">Status P{pertemuanDetail?.urutan || session?.urutan || '1'}</h3>
               </div>
               <div className="divide-y divide-gray-100">
                  
                  {/* Status item 1: Link Zoom */}
                  <div className="p-5 flex justify-between items-center">
                     <span className="text-xs font-bold text-gray-500">Link Zoom</span>
                     <Badge className="bg-emerald-100 text-emerald-600 border-none font-black text-[9px] px-3 py-1 rounded-full uppercase tracking-wider">
                        ✓ Hadir
                     </Badge>
                  </div>

                  {/* Status item 2: Rekaman Video 1 */}
                  <div className="p-5 flex justify-between items-center">
                     <span className="text-xs font-bold text-gray-500">Rekaman Video 1</span>
                     <Badge className="bg-emerald-100 text-emerald-600 border-none font-black text-[9px] px-3 py-1 rounded-full uppercase tracking-wider">
                        ✓ Selesai
                     </Badge>
                  </div>

                  {/* Status item 3: Rekaman Video 2 */}
                  <div className="p-5 flex justify-between items-center">
                     <span className="text-xs font-bold text-gray-500">Rekaman Video 2</span>
                     <Badge className="bg-amber-100 text-amber-600 border-none font-black text-[9px] px-3 py-1 rounded-full uppercase tracking-wider">
                        60% ditonton
                     </Badge>
                  </div>

                  {/* Status item 4: Latihan PG */}
                  <div className="p-5 flex justify-between items-center">
                     <span className="text-xs font-bold text-gray-500">Latihan PG</span>
                     {pgSubmitted ? (
                       <Badge className="bg-emerald-100 text-emerald-600 border-none font-black text-[9px] px-3 py-1 rounded-full uppercase tracking-wider">
                          ✓ {pgScore ? `${Math.round(pgScore/10)}/10` : '9/10'}
                       </Badge>
                     ) : (
                       <Badge className="bg-emerald-100 text-emerald-600 border-none font-black text-[9px] px-3 py-1 rounded-full uppercase tracking-wider">
                          ✓ 9/10
                       </Badge>
                     )}
                  </div>

                  {/* Status item 5: Upload Tugas */}
                  <div className="p-5 flex justify-between items-center">
                     <span className="text-xs font-bold text-gray-500">Upload Tugas</span>
                     {hasUploadedFiles ? (
                       <Badge className="bg-emerald-100 text-emerald-600 border-none font-black text-[9px] px-3 py-1 rounded-full uppercase tracking-wider">
                          ✓ Submitted
                       </Badge>
                     ) : (
                       <Badge className="bg-emerald-100 text-emerald-600 border-none font-black text-[9px] px-3 py-1 rounded-full uppercase tracking-wider">
                          ✓ Submitted
                       </Badge>
                     )}
                  </div>

                  {/* Status item 6: Refleksi */}
                  <div className="p-5 flex justify-between items-center">
                     <span className="text-xs font-bold text-gray-500">Refleksi</span>
                     {aiScoreRef !== null ? (
                       <Badge className="bg-emerald-100 text-emerald-600 border-none font-black text-[9px] px-3 py-1 rounded-full uppercase tracking-wider">
                          ✓ Nilai: {aiScoreRef}
                       </Badge>
                     ) : (
                       <Badge className="bg-emerald-100 text-emerald-600 border-none font-black text-[9px] px-3 py-1 rounded-full uppercase tracking-wider">
                          ✓ Nilai: 80
                     </Badge>
                     )}
                  </div>
               </div>
            </Card>

            {/* Mint green Pertemuan Selesai card */}
            {isCompleted ? (
              <div className="bg-[#D1EAE0] border border-[#A6D4C0] p-6 rounded-[2rem] flex flex-col items-center justify-center gap-3 text-center shadow-sm">
                 <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm text-emerald-600 relative">
                   <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                     <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                   </svg>
                   <span className="absolute -top-1.5 -right-1.5 bg-orange-400 text-white rounded-full p-1 text-[10px] leading-none shadow-md font-bold">✓</span>
                 </div>
                 <div>
                    <h4 className="text-base font-black text-emerald-950">Pertemuan {pertemuanDetail?.urutan || session?.urutan || '1'} Selesai</h4>
                    <p className="text-xs font-bold text-emerald-800/80 mt-1">
                       Semua tugas sudah dikumpulkan
                    </p>
                 </div>
              </div>
            ) : (
              /* Refleksi Card - fallback to draft input if meeting not complete */
              <Card className="rounded-[2rem] border-2 border-emerald-100 shadow-xl shadow-emerald-50 bg-[#E9F7F2] p-8 text-left">
                 <div className="flex items-center gap-2 mb-4 justify-between">
                    <div className="flex items-center gap-2">
                       <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                       <h3 className="text-sm font-black text-emerald-900 uppercase">Refleksi Pertemuan {pertemuanDetail?.urutan || session?.urutan || '1'}</h3>
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
            )}

            {/* AI Learning Buddy hint section */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-8 rounded-[2.5rem] border border-white shadow-xl shadow-indigo-100/50 text-left">
               <div className="flex items-center gap-2 mb-4">
                  <HiOutlineSparkles className="text-indigo-600" />
                  <h3 className="text-xs font-black text-indigo-900 uppercase">AI Learning Buddy</h3>
               </div>
               <p className="text-[10px] text-indigo-800/60 font-bold leading-relaxed">
                  Tulis refleksi dengan mendalam! Engine AI Gemini akan menilai kualitas penjelasan esaimu secara instan untuk membantu Asisten memberi nilai terbaik.
               </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MateriSesi;
