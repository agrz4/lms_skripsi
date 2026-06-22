import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  HiOutlineClock, 
  HiOutlineBookOpen, 
  HiOutlineUsers, 
  HiOutlineArrowRight, 
  HiOutlineCheckCircle, 
  HiOutlineSparkles,
  HiOutlineTrophy
} from 'react-icons/hi2';
import { useMataKuliahStore } from '../../store/useMataKuliahStore';
import { usePendaftaranStore } from '../../store/usePendaftaranStore';
import { useAuthStore } from '../../store/useAuthStore';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import api from '../../lib/api';

// Helper to format course release dates
const formatDate = (dateStr: string) => {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return 'Feb 2025';
  }
};

// Helper to format course prices and old crossed-out prices
const getPriceDisplay = (warnaVal: string | undefined | null) => {
  if (!warnaVal || warnaVal === '0' || warnaVal === 'Gratis' || warnaVal === 'blue') {
    return { current: 'Gratis', old: null };
  }
  const cleanStr = warnaVal.replace(/[^0-9]/g, '');
  if (!cleanStr) return { current: warnaVal, old: null };
  const num = parseInt(cleanStr, 10);
  if (isNaN(num) || num === 0) {
    return { current: 'Gratis', old: null };
  }
  const oldPrice = num + 100000;
  return {
    current: `Rp ${num.toLocaleString('id-ID')}`,
    old: `Rp ${oldPrice.toLocaleString('id-ID')}`
  };
};

// Helper for dynamic developer card images matching topics
const getCourseImageUrl = (kode: string) => {
  const k = (kode || '').toLowerCase();
  if (k.includes('wd-01') || k.includes('html') || k.includes('css')) {
    return 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=500&auto=format&fit=crop&q=60';
  }
  if (k.includes('wd-02') || k.includes('javascript') || k.includes('js')) {
    return 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=500&auto=format&fit=crop&q=60';
  }
  if (k.includes('wd-03') || k.includes('react')) {
    return 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=500&auto=format&fit=crop&q=60';
  }
  return 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=500&auto=format&fit=crop&q=60'; // Node/API/default
};

// Helper to resolve path prefix
const getPathPrefix = (pathName: string) => {
  const norm = pathName.toLowerCase();
  if (norm.includes('science')) return 'DS';
  if (norm.includes('security') || norm.includes('cyber')) return 'CS';
  if (norm.includes('ui') || norm.includes('ux') || norm.includes('design')) return 'UI';
  if (norm.includes('ai') || norm.includes('intelligence')) return 'AI';
  return 'WD';
};

// Helper matching mockup courses if database is empty
const getMockNodes = (path: string = 'Web Development') => {
  const normPath = path.toLowerCase();
  
  if (normPath.includes('science')) {
    // Data Science
    return [
      { id: 'mock-ds-1', kode: 'DS-01', nama: 'Python untuk Data Science', level: 'Beginner', published: true, warna: '0', jumlahPertemuan: 14, _count: { pendaftaran: 142 } },
      { id: 'mock-ds-2', kode: 'DS-02', nama: 'Statistika Deskriptif', level: 'Beginner', published: true, warna: '299000', jumlahPertemuan: 14, _count: { pendaftaran: 142 } },
      { id: 'mock-ds-3', kode: 'DS-03', nama: 'Data Wrangling & SQL', level: 'Intermediate', published: true, warna: '499000', jumlahPertemuan: 14, _count: { pendaftaran: 142 } },
      { id: 'mock-ds-4', kode: 'DS-04', nama: 'Analisis Data & Visualisasi', level: 'Intermediate', published: false, warna: '499000', jumlahPertemuan: 14, _count: { pendaftaran: 142 } },
      { id: 'mock-ds-5', kode: 'DS-05', nama: 'Pengantar Machine Learning', level: 'Intermediate', published: false, warna: '499000', jumlahPertemuan: 14, _count: { pendaftaran: 142 } },
      { id: 'mock-ds-6', kode: 'DS-06', nama: 'Capstone Data Science', level: 'Advanced', published: false, warna: '799000', jumlahPertemuan: 14, _count: { pendaftaran: 142 } }
    ];
  } else if (normPath.includes('security') || normPath.includes('cyber')) {
    // Cyber Security
    return [
      { id: 'mock-cs-1', kode: 'CS-01', nama: 'Keamanan Jaringan Komputer', level: 'Beginner', published: true, warna: '0', jumlahPertemuan: 14, _count: { pendaftaran: 98 } },
      { id: 'mock-cs-2', kode: 'CS-02', nama: 'Pengantar Kriptografi', level: 'Beginner', published: true, warna: '299000', jumlahPertemuan: 14, _count: { pendaftaran: 98 } },
      { id: 'mock-cs-3', kode: 'CS-03', nama: 'Ethical Hacking & Pentesting', level: 'Intermediate', published: true, warna: '499000', jumlahPertemuan: 14, _count: { pendaftaran: 98 } },
      { id: 'mock-cs-4', kode: 'CS-04', nama: 'Analisis Forensik Digital', level: 'Intermediate', published: false, warna: '499000', jumlahPertemuan: 14, _count: { pendaftaran: 98 } },
      { id: 'mock-cs-5', kode: 'CS-05', nama: 'Audit Keamanan Informasi', level: 'Intermediate', published: false, warna: '499000', jumlahPertemuan: 14, _count: { pendaftaran: 98 } },
      { id: 'mock-cs-6', kode: 'CS-06', nama: 'Cyber Defense Capstone', level: 'Advanced', published: false, warna: '799000', jumlahPertemuan: 14, _count: { pendaftaran: 98 } }
    ];
  } else if (normPath.includes('ui') || normPath.includes('ux') || normPath.includes('design')) {
    // UI/UX Design
    return [
      { id: 'mock-ui-1', kode: 'UI-01', nama: 'Fundamental Desain Grafis', level: 'Beginner', published: true, warna: '0', jumlahPertemuan: 14, _count: { pendaftaran: 215 } },
      { id: 'mock-ui-2', kode: 'UI-02', nama: 'Pengantar UI/UX & Figma', level: 'Beginner', published: true, warna: '299000', jumlahPertemuan: 14, _count: { pendaftaran: 215 } },
      { id: 'mock-ui-3', kode: 'UI-03', nama: 'Riset Pengguna & Persona', level: 'Intermediate', published: true, warna: '499000', jumlahPertemuan: 14, _count: { pendaftaran: 215 } },
      { id: 'mock-ui-4', kode: 'UI-04', nama: 'Wireframing & Prototyping', level: 'Intermediate', published: false, warna: '499000', jumlahPertemuan: 14, _count: { pendaftaran: 215 } },
      { id: 'mock-ui-5', kode: 'UI-05', nama: 'Usability Testing', level: 'Intermediate', published: false, warna: '499000', jumlahPertemuan: 14, _count: { pendaftaran: 215 } },
      { id: 'mock-ui-6', kode: 'UI-06', nama: 'UI/UX Capstone Portfolio', level: 'Advanced', published: false, warna: '799000', jumlahPertemuan: 14, _count: { pendaftaran: 215 } }
    ];
  } else if (normPath.includes('ai') || normPath.includes('intelligence')) {
    // AI Fundamentals
    return [
      { id: 'mock-ai-1', kode: 'AI-01', nama: 'Pengantar Kecerdasan Buatan', level: 'Beginner', published: true, warna: '0', jumlahPertemuan: 14, _count: { pendaftaran: 180 } },
      { id: 'mock-ai-2', kode: 'AI-02', nama: 'Aljabar Linier untuk AI', level: 'Beginner', published: true, warna: '299000', jumlahPertemuan: 14, _count: { pendaftaran: 180 } },
      { id: 'mock-ai-3', kode: 'AI-03', nama: 'Pemrograman Python & ML', level: 'Intermediate', published: true, warna: '499000', jumlahPertemuan: 14, _count: { pendaftaran: 180 } },
      { id: 'mock-ai-4', kode: 'AI-04', nama: 'Deep Learning Basics', level: 'Intermediate', published: false, warna: '499000', jumlahPertemuan: 14, _count: { pendaftaran: 180 } },
      { id: 'mock-ai-5', kode: 'AI-05', nama: 'Natural Language Processing', level: 'Intermediate', published: false, warna: '499000', jumlahPertemuan: 14, _count: { pendaftaran: 180 } },
      { id: 'mock-ai-6', kode: 'AI-06', nama: 'AI Capstone Project', level: 'Advanced', published: false, warna: '799000', jumlahPertemuan: 14, _count: { pendaftaran: 180 } }
    ];
  } else {
    // Default Web Development
    return [
      { id: 'mock-1', kode: 'WD-01', nama: 'HTML & CSS Dasar', level: 'Beginner', published: true, warna: '0', jumlahPertemuan: 14, _count: { pendaftaran: 248 } },
      { id: 'mock-2', kode: 'WD-02', nama: 'JavaScript Dasar', level: 'Beginner', published: true, warna: '299000', jumlahPertemuan: 14, _count: { pendaftaran: 248 } },
      { id: 'mock-3', kode: 'WD-03', nama: 'React JS Fundamental', level: 'Intermediate', published: true, warna: '499000', jumlahPertemuan: 14, _count: { pendaftaran: 248 } },
      { id: 'mock-4', kode: 'WD-04', nama: 'Node.js & API dev', level: 'Intermediate', published: false, warna: '499000', jumlahPertemuan: 14, _count: { pendaftaran: 248 } },
      { id: 'mock-5', kode: 'WD-05', nama: 'Database & ORM', level: 'Intermediate', published: false, warna: '499000', jumlahPertemuan: 14, _count: { pendaftaran: 248 } },
      { id: 'mock-6', kode: 'WD-06', nama: 'Full Stack Capstone', level: 'Advanced', published: false, warna: '799000', jumlahPertemuan: 14, _count: { pendaftaran: 248 } }
    ];
  }
};

const KursusTersedia: React.FC = () => {
  const navigate = useNavigate();
  const { publishedMataKuliahList, fetchPublishedMataKuliah, mataKuliahList, fetchMataKuliah } = useMataKuliahStore();
  const { pendaftaranList, fetchMyPendaftaran, enrollKursus } = usePendaftaranStore();
  const { user } = useAuthStore();
  const activePath = user?.pelatihan || 'Web Development';

  const [activeFilter, setActiveFilter] = useState<'Semua' | 'Free' | 'Berbayar' | 'Course map'>('Semua');
  const [progressData, setProgressData] = useState<any[]>([]);

  const fetchProgress = async () => {
    try {
      const response = await api.get('/student/status/progres');
      setProgressData(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch student progress', error);
    }
  };

  useEffect(() => {
    fetchPublishedMataKuliah();
    fetchMataKuliah();
    fetchMyPendaftaran();
    fetchProgress();
  }, [fetchPublishedMataKuliah, fetchMataKuliah, fetchMyPendaftaran]);

  const handleEnroll = async (id: string) => {
    try {
      await enrollKursus(id);
      alert('Berhasil mendaftar kelas!');
      await fetchMyPendaftaran();
      await fetchProgress();
      navigate(`/user/detail-kursus?id=${id}`);
    } catch (err) {
      console.error('Failed to enroll:', err);
      alert('Gagal mendaftar kelas.');
    }
  };

  // Filter courses based on selected filter
  const filteredCourses = publishedMataKuliahList.filter(mk => {
    if (activeFilter === 'Semua') return true;
    const priceInfo = getPriceDisplay(mk.warna);
    if (activeFilter === 'Free') return priceInfo.current === 'Gratis';
    if (activeFilter === 'Berbayar') return priceInfo.current !== 'Gratis';
    if (activeFilter === 'Course map') return !!mk.level;
    return true;
  });

  // Group by level with fallback to Beginner for anything that is not intermediate or advanced
  const beginnerCourses = filteredCourses.filter(c => {
    const lvl = (c.level || '').toLowerCase();
    return lvl === 'beginner' || (lvl !== 'intermediate' && lvl !== 'advanced' && lvl !== 'advance');
  });
  const intermediateCourses = filteredCourses.filter(c => c.level?.toLowerCase() === 'intermediate');
  const advancedCourses = filteredCourses.filter(c => c.level?.toLowerCase() === 'advanced' || c.level?.toLowerCase() === 'advance');

  // Dynamic mapping of top path steps using real database courses or mock fallback
  const getPathStepStatus = (keywords: string[], codePatterns: string[], pathName: string) => {
    const prefix = getPathPrefix(pathName);
    const hasRealCourses = publishedMataKuliahList.some(c => c.kode?.toUpperCase().startsWith(prefix));

    if (hasRealCourses) {
      const course = publishedMataKuliahList.find(c => 
        codePatterns.some(pat => c.kode.toLowerCase().includes(pat.toLowerCase())) || 
        keywords.some(kw => c.nama.toLowerCase().includes(kw.toLowerCase())) ||
        (c.deskripsi && keywords.some(kw => c.deskripsi!.toLowerCase().includes(kw.toLowerCase())))
      );
      if (!course) return { exists: false, enrolled: false, active: false };
      
      const enrolled = pendaftaranList.some(p => p.mataKuliahId === course.id);
      
      // Active if enrolled or if prerequisites are met
      const prereqsMet = course.prerequisites?.every((pr: any) => 
        pendaftaranList.some(p => p.mataKuliahId === (typeof pr === 'object' ? pr.id : pr))
      ) ?? true;

      return { exists: true, enrolled, active: enrolled || prereqsMet, course };
    } else {
      // Mock fallback: search in getMockNodes
      const mocks = getMockNodes(pathName);
      const mockCourse = mocks.find(c => 
        codePatterns.some(pat => c.kode.toLowerCase().includes(pat.toLowerCase())) || 
        keywords.some(kw => c.nama.toLowerCase().includes(kw.toLowerCase()))
      );
      if (!mockCourse) return { exists: false, enrolled: false, active: false };

      // Simulate enrollment status: mock courses ending in 1, 2, 3 are enrolled, 4 is active
      const mockId = mockCourse.id;
      const isEnrolled = mockId.endsWith('1') || mockId.endsWith('2') || mockId.endsWith('3');
      const isActive = isEnrolled || mockId.endsWith('4');

      return { exists: true, enrolled: isEnrolled, active: isActive, course: mockCourse };
    }
  };

  const getDynamicPathSteps = (path: string) => {
    const norm = path.toLowerCase();
    if (norm.includes('science')) {
      return [
        { name: 'Python DS', ...getPathStepStatus(['python', 'science'], ['ds-01'], path) },
        { name: 'Statistika', ...getPathStepStatus(['statistika', 'deskriptif'], ['ds-02'], path) },
        { name: 'SQL & Wrangling', ...getPathStepStatus(['wrangling', 'sql'], ['ds-03'], path) },
        { name: 'Analysis & Viz', ...getPathStepStatus(['analisis', 'visualisasi'], ['ds-04'], path) },
        { name: 'Machine Learning', ...getPathStepStatus(['machine learning', 'ml'], ['ds-05'], path), trophy: true }
      ];
    }
    if (norm.includes('security') || norm.includes('cyber')) {
      return [
        { name: 'Network Sec', ...getPathStepStatus(['jaringan', 'keamanan'], ['cs-01'], path) },
        { name: 'Kriptografi', ...getPathStepStatus(['kriptografi'], ['cs-02'], path) },
        { name: 'Ethical Hacking', ...getPathStepStatus(['hacking', 'pentesting'], ['cs-03'], path) },
        { name: 'Forensics', ...getPathStepStatus(['forensik'], ['cs-04'], path) },
        { name: 'Security Audit', ...getPathStepStatus(['audit', 'keamanan'], ['cs-05'], path), trophy: true }
      ];
    }
    if (norm.includes('ui') || norm.includes('ux') || norm.includes('design')) {
      return [
        { name: 'Graphic Design', ...getPathStepStatus(['grafis', 'desain'], ['ui-01'], path) },
        { name: 'Figma Basics', ...getPathStepStatus(['figma', 'ui/ux'], ['ui-02'], path) },
        { name: 'User Research', ...getPathStepStatus(['riset', 'persona'], ['ui-03'], path) },
        { name: 'Wireframing', ...getPathStepStatus(['wireframing', 'prototyping'], ['ui-04'], path) },
        { name: 'Usability Testing', ...getPathStepStatus(['usability', 'testing'], ['ui-05'], path), trophy: true }
      ];
    }
    if (norm.includes('ai') || norm.includes('intelligence')) {
      return [
        { name: 'Intro to AI', ...getPathStepStatus(['artificial', 'kecerdasan'], ['ai-01'], path) },
        { name: 'Math for AI', ...getPathStepStatus(['aljabar', 'matematika'], ['ai-02'], path) },
        { name: 'Python ML', ...getPathStepStatus(['pemrograman', 'ml'], ['ai-03'], path) },
        { name: 'Deep Learning', ...getPathStepStatus(['deep learning'], ['ai-04'], path) },
        { name: 'NLP / GenAI', ...getPathStepStatus(['nlp', 'language'], ['ai-05'], path), trophy: true }
      ];
    }
    return [
      { name: 'HTML & CSS', ...getPathStepStatus(['html', 'css', 'dasar'], ['wd-01', 'mk001'], path) },
      { name: 'JavaScript', ...getPathStepStatus(['javascript', 'js'], ['wd-02', 'mk002'], path) },
      { name: 'React JS', ...getPathStepStatus(['react'], ['wd-03', 'mk003'], path) },
      { name: 'Node.js & API', ...getPathStepStatus(['node', 'api', 'backend'], ['wd-04', 'mk004'], path) },
      { name: 'Full Stack Project', ...getPathStepStatus(['full stack', 'capstone', 'project'], ['wd-05', 'mk005'], path), trophy: true }
    ];
  };

  const pathSteps = getDynamicPathSteps(activePath);

  const getCourseProgress = (courseId: string, totalPertemuan: number) => {
    const completedSessions = progressData.filter(
      (prog) => prog.pertemuan?.mataKuliahId === courseId && prog.isCompleted
    ).length;
    const total = totalPertemuan || 14;
    return total > 0 ? Math.min(Math.round((completedSessions / total) * 100), 100) : 0;
  };

  const renderCourseCard = (course: any) => {
    const isRegistered = pendaftaranList.some(p => p.mataKuliahId === course.id);

    // Prerequisite check: locked if any prereq is not registered
    const isPrereqsMet = course.prerequisites?.every((pr: any) => {
      const prereqId = typeof pr === 'object' ? pr.id : pr;
      return pendaftaranList.some(p => p.mataKuliahId === prereqId);
    }) ?? true;

    const isLocked = !isPrereqsMet;
    const priceInfo = getPriceDisplay(course.warna);
    const participantCount = Math.max(course._count?.pendaftaran || 0, isRegistered ? 1 : 0);

    // Format prerequisite display codes text
    const prereqListText = course.prerequisites && course.prerequisites.length > 0
      ? course.prerequisites.map((p: any) => p.kode || 'WD').join(' + ')
      : '';

    return (
      <Card 
        key={course.id}
        className={`rounded-[2.2rem] border border-gray-150 shadow-sm bg-white overflow-hidden group hover:shadow-xl transition-all duration-300 flex flex-col relative ${
          isLocked ? 'opacity-90' : ''
        }`}
        onClick={() => {
          if (!isLocked) {
            navigate(`/user/detail-kursus?id=${course.id}`);
          }
        }}
      >
        {/* Top Image Cover */}
        <div className="h-44 relative overflow-hidden shrink-0">
          <img 
            src={getCourseImageUrl(course.kode)}
            alt={course.nama}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-black/25"></div>

          {/* Badges Overlay */}
          <div className="absolute top-4 left-4 flex gap-2 items-center">
            <Badge className="bg-sky-500/20 backdrop-blur-md text-sky-200 border border-sky-400/20 font-black text-[9px] px-3.5 py-0.5 rounded-full uppercase tracking-wider">
              {course.level || 'Beginner'}
            </Badge>
            <Badge className="bg-gray-800/60 backdrop-blur-md text-gray-200 border border-gray-700/20 font-black text-[9px] px-3.5 py-0.5 rounded-full">
              {course.kode}
            </Badge>
          </div>

          {/* Special status like Segera */}
          {isLocked && (
            <Badge className="absolute top-4 right-4 bg-gray-500/80 text-white font-black text-[9px] px-3 py-0.5 rounded-full uppercase">
              Terkunci
            </Badge>
          )}

          {/* Date Badge Overlay */}
          <div className="absolute bottom-4 left-4 bg-black/40 backdrop-blur-md text-white text-[9px] font-bold px-3 py-1 rounded-full flex items-center gap-1">
            <HiOutlineClock className="w-3.5 h-3.5 text-white" />
            Rilis: {formatDate(course.createdAt)}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 flex-1 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-black text-gray-900 leading-snug mb-2 group-hover:text-indigo-600 transition-colors">
              {course.nama}
            </h3>
            <p className="text-[11px] font-bold text-gray-400 leading-relaxed mb-5">
              {course.deskripsi || 'Pelajari materi ini untuk meningkatkan keahlian Anda secara komprehensif.'}
            </p>
          </div>

          <div className="space-y-4">
            {/* Sesi & Peserta details */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase">
                <HiOutlineBookOpen className="text-sm shrink-0" />
                <span>{course.jumlahPertemuan || course._count?.pertemuan || 14} Sesi</span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase">
                <HiOutlineUsers className="text-sm shrink-0" />
                <span>{participantCount} Siswa</span>
              </div>
              {isRegistered && (
                <span className="text-[10px] font-black text-emerald-600 uppercase ml-auto">
                  Active
                </span>
              )}
            </div>

            {/* Registered Progress Bar */}
            {isRegistered && (
              <div className="pt-2 border-t border-gray-50">
                <div className="flex justify-between items-center text-[9px] font-black text-gray-400 uppercase mb-1">
                  <span>Progres belajar</span>
                  <span>{getCourseProgress(course.id, course.jumlahPertemuan || course._count?.pertemuan || 14)}%</span>
                </div>
                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#10b981] rounded-full transition-all duration-500" style={{ width: `${getCourseProgress(course.id, course.jumlahPertemuan || course._count?.pertemuan || 14)}%` }}></div>
                </div>
              </div>
            )}

            {/* Prerequisites Lock Warning Banner */}
            {!isRegistered && prereqListText && (
              <div className="bg-gray-100 rounded-xl px-3.5 py-2 flex items-center gap-1.5 text-[10px] font-bold text-gray-500 mt-2">
                <span className="text-xs">💡</span>
                <span>Lulus {prereqListText} ({course.prerequisites[0]?.nama || 'Sebelumnya'})</span>
              </div>
            )}

            {/* Card Footer Actions */}
            <div className="pt-4 border-t border-gray-100 flex items-center justify-between mt-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-indigo-50 border border-white shadow-sm flex items-center justify-center font-black text-[#5850ec] text-[9px] uppercase shrink-0">
                  {((course.pengajar?.nama || 'AS').split(' ').map((n: string) => n[0]).join('').substring(0, 2))}
                </div>
                <div>
                  <p className="text-[9px] font-black text-gray-900 leading-none">{course.pengajar?.nama || 'Ahmad Subarjo'}</p>
                  <p className="text-[7px] font-black text-gray-400 uppercase mt-0.5 tracking-wider leading-none">Pengajar</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Price Display */}
                <div className="text-right flex flex-col justify-center">
                  {priceInfo.old && (
                    <span className="text-[8px] font-black text-red-500 line-through leading-none block mb-0.5">
                      {priceInfo.old}
                    </span>
                  )}
                  <span className={`text-[10px] font-black leading-none block ${
                    priceInfo.current === 'Gratis' ? 'text-[#10b981]' : 'text-blue-600'
                  }`}>
                    {priceInfo.current}
                  </span>
                </div>

                {isRegistered ? (
                  <div className="flex items-center gap-1 text-[#10b981] font-black text-[9px] uppercase tracking-wider bg-emerald-50 px-3 py-2 rounded-xl">
                    <HiOutlineCheckCircle className="text-sm shrink-0" /> Active
                  </div>
                ) : isLocked ? (
                  <Button 
                    disabled
                    className="bg-gray-200 text-gray-400 font-black rounded-xl text-[9px] h-8 px-4 border-none shadow-none uppercase tracking-wider cursor-not-allowed"
                  >
                    Terkunci
                  </Button>
                ) : (
                  <Button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEnroll(course.id);
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl text-[9px] h-8 px-4 shadow-sm uppercase tracking-wider flex items-center gap-1"
                  >
                    Enroll <HiOutlineArrowRight className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>
    );
  };

  const renderLevelSection = (levelTitle: string, courses: any[], textColorClass: string) => {
    if (courses.length === 0) return null;
    return (
      <div className="mb-10 text-left">
        <div className="flex items-center gap-2 mb-6 border-b border-gray-200 pb-2">
          <HiOutlineSparkles className={`text-base shrink-0 ${textColorClass}`} />
          <h2 className={`text-xs font-black uppercase tracking-wider ${textColorClass}`}>
            {levelTitle}
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {courses.map(course => renderCourseCard(course))}
        </div>
      </div>
    );
  };

  // Mock nodes removed (defined in outer scope)

  const renderTimelineCard = (course: any) => {
    const isRegistered = course.id.startsWith('mock-') 
      ? (course.id.endsWith('1') || course.id.endsWith('2') || course.id.endsWith('3'))
      : pendaftaranList.some(p => p.mataKuliahId === course.id);

    const isPrereqsMet = course.prerequisites?.every((pr: any) => {
      const prereqId = typeof pr === 'object' ? pr.id : pr;
      return pendaftaranList.some(p => p.mataKuliahId === prereqId);
    }) ?? true;

    const isLocked = course.id.startsWith('mock-')
      ? (course.id.endsWith('4') || course.id.endsWith('5') || course.id.endsWith('6'))
      : (!isPrereqsMet || !course.published);

    const priceInfo = getPriceDisplay(course.warna);
    const participantCount = course._count?.pendaftaran || 0;

    const getLevelBadgeColor = (level: string) => {
      const lvl = (level || '').toLowerCase();
      if (lvl === 'beginner') return 'bg-blue-50 text-blue-600 border border-blue-200';
      if (lvl === 'intermediate') return 'bg-amber-50 text-amber-600 border border-amber-200';
      return 'bg-purple-50 text-purple-600 border border-purple-200';
    };

    return (
      <Card 
        className={`bg-white p-5 rounded-2xl border border-gray-200 shadow-sm w-[290px] flex flex-col justify-between min-h-[140px] cursor-pointer hover:shadow-md transition-all duration-300 ${
          isLocked ? 'opacity-90' : ''
        }`}
        onClick={() => {
          if (course.id.startsWith('mock-')) {
            alert(`Kursus mockup "${course.nama}" belum dibuat di database oleh Admin.`);
            return;
          }
          if (!isLocked) {
            navigate(`/user/detail-kursus?id=${course.id}`);
          }
        }}
      >
        {/* Top Header Row */}
        <div className="flex justify-between items-center mb-2">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            {course.kode}
          </span>
          <span className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${getLevelBadgeColor(course.level || 'Beginner')}`}>
            {course.level || 'Beginner'}
          </span>
        </div>

        {/* Middle Title & Details */}
        <div className="mb-4 text-left">
          <h4 className="text-xs font-black text-gray-900 leading-snug mb-1">
            {course.nama}
          </h4>
          <span className="text-[10px] font-bold text-gray-400">
            {course.jumlahPertemuan || 14} modul · {participantCount} siswa
          </span>
        </div>

        {/* Bottom Row */}
        <div className="flex justify-between items-center pt-3 border-t border-gray-100 mt-auto">
          {/* Price */}
          <span className={`text-[10px] font-black ${
            priceInfo.current === 'Gratis' ? 'text-[#10b981]' : 'text-blue-600'
          }`}>
            {priceInfo.current}
          </span>

          {/* Status Pill */}
          {isRegistered ? (
            <span className="bg-emerald-50 text-[#10b981] text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border border-emerald-200/50">
              Active
            </span>
          ) : (
            <span 
              onClick={async (e) => {
                e.stopPropagation();
                if (course.id.startsWith('mock-')) {
                  alert(`Kursus mockup "${course.nama}" belum dibuat di database oleh Admin.`);
                  return;
                }
                if (!isLocked) {
                  try {
                    await enrollKursus(course.id);
                    alert('Berhasil mendaftar kelas!');
                    await fetchMyPendaftaran();
                    await fetchProgress();
                    navigate(`/user/detail-kursus?id=${course.id}`);
                  } catch (err) {
                    console.error('Failed to enroll:', err);
                    alert('Gagal mendaftar kelas.');
                  }
                }
              }}
              className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                isLocked 
                  ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' 
                  : 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100 transition-colors cursor-pointer'
              }`}
            >
              {isLocked ? 'Terkunci' : 'Enroll'}
            </span>
          )}
        </div>
      </Card>
    );
  };

  const renderRoadmapTimeline = () => {
    const pathPrefix = getPathPrefix(activePath);
    const pathCourses = mataKuliahList.filter(c => {
      if (c.kode?.toUpperCase().startsWith(pathPrefix)) return true;
      if (c.kode?.toUpperCase().startsWith('MK')) {
        const norm = activePath.toLowerCase();
        if (norm.includes('science')) {
          return c.kategori?.toLowerCase().includes('science') || c.nama?.toLowerCase().includes('data science') || c.nama?.toLowerCase().includes('statistik');
        }
        if (norm.includes('security') || norm.includes('cyber')) {
          return c.kategori?.toLowerCase().includes('security') || c.kategori?.toLowerCase().includes('cyber') || c.nama?.toLowerCase().includes('keamanan') || c.nama?.toLowerCase().includes('cyber');
        }
        if (norm.includes('ui') || norm.includes('ux') || norm.includes('design')) {
          return c.kategori?.toLowerCase().includes('design') || c.kategori?.toLowerCase().includes('ui') || c.nama?.toLowerCase().includes('ui/ux') || c.nama?.toLowerCase().includes('desain');
        }
        if (norm.includes('ai') || norm.includes('intelligence')) {
          return c.kategori?.toLowerCase().includes('ai') || c.kategori?.toLowerCase().includes('intelligence') || c.nama?.toLowerCase().includes('kecerdasan') || c.nama?.toLowerCase().includes('artificial');
        }
        return c.kategori?.toLowerCase().includes('programming') || c.kategori?.toLowerCase().includes('web') || c.nama?.toLowerCase().includes('web') || c.nama?.toLowerCase().includes('pemrograman');
      }
      return false;
    });

    const beginner = pathCourses.filter(c => c.level?.toLowerCase() === 'beginner');
    const intermediate = pathCourses.filter(c => c.level?.toLowerCase() === 'intermediate');
    const advanced = pathCourses.filter(c => c.level?.toLowerCase() === 'advanced' || c.level?.toLowerCase() === 'advance');
    
    const displayList = (beginner.length > 0 || intermediate.length > 0 || advanced.length > 0)
      ? [...beginner, ...intermediate, ...advanced]
      : getMockNodes(activePath);

    const getPathDescription = (pathName: string) => {
      const norm = pathName.toLowerCase();
      if (norm.includes('science')) {
        return 'Jalur belajar terstruktur dari fundamental data hingga machine learning expert.';
      }
      if (norm.includes('security') || norm.includes('cyber')) {
        return 'Jalur belajar terstruktur untuk menjadi ahli keamanan siber dan informasi.';
      }
      if (norm.includes('ui') || norm.includes('ux') || norm.includes('design')) {
        return 'Jalur belajar terstruktur untuk menguasai riset pengguna, wireframing, hingga desain UI/UX modern.';
      }
      if (norm.includes('ai') || norm.includes('intelligence')) {
        return 'Jalur belajar terstruktur untuk menguasai dasar kecerdasan buatan dan generative AI.';
      }
      return 'Jalur belajar terstruktur dari fundamental hingga full-stack developer profesional.';
    };

    return (
      <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-200 mt-2">
        <div className="mb-10 text-left">
          <h2 className="text-xl font-black text-gray-900 mb-1">Learning Roadmap</h2>
          <p className="text-xs text-gray-500 font-bold">
            {getPathDescription(activePath)}
          </p>
        </div>

        {/* Vertical Timeline container */}
        <div className="relative flex flex-col items-center">
          {/* Central vertical line */}
          <div className="absolute left-1/2 -translate-x-1/2 top-10 bottom-10 w-[2px] bg-gray-300"></div>

          <div className="space-y-16 w-full max-w-[700px] relative">
            {displayList.map((course, idx) => {
              // Custom alternation matching your mockup:
              // Index: 0 -> Left, 1 -> Right, 2 -> Left, 3 -> Right, 4 -> Right, 5 -> Left
              const alignments = ['left', 'right', 'left', 'right', 'right', 'left'];
              const align = alignments[idx % alignments.length];
              const isLeft = align === 'left';

              const lvl = (course.level || '').toLowerCase();
              let dotColor = 'bg-sky-500 ring-sky-200';
              if (lvl === 'intermediate') {
                dotColor = 'bg-amber-500 ring-amber-200';
              } else if (lvl === 'advanced' || lvl === 'advance') {
                dotColor = 'bg-red-500 ring-red-200';
              }

              return (
                <div key={course.id} className="relative flex items-center w-full justify-between">
                  {/* Left Side Container */}
                  <div className={`w-[45%] flex justify-end ${isLeft ? '' : 'invisible pointer-events-none'}`}>
                    {renderTimelineCard(course)}
                  </div>

                  {/* Central Node Dot */}
                  <div className="absolute left-1/2 -translate-x-1/2 z-10">
                    <div className={`w-3.5 h-3.5 rounded-full ${dotColor} ring-4`}></div>
                  </div>

                  {/* Right Side Container */}
                  <div className={`w-[45%] flex justify-start ${!isLeft ? '' : 'invisible pointer-events-none'}`}>
                    {renderTimelineCard(course)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-16 bg-white py-3.5 px-6 rounded-2xl border border-gray-150 shadow-sm max-w-lg mx-auto flex items-center justify-center gap-6">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Keterangan:</span>
          <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-gray-700">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]"></span>
            <span>Kursus aktif</span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-gray-700">
            <span className="w-2.5 h-2.5 rounded-full bg-gray-450"></span>
            <span>Segera tersedia</span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-gray-700">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]"></span>
            <span>Gratis</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-8 bg-[#E5E7EB] min-h-screen pb-20">
      {/* Title Header */}
      <div className="mb-6 text-left">
        <span className="text-xs text-blue-600 font-extrabold tracking-wider block mb-0.5">
          {activePath} Path
        </span>
        <h1 className="text-3xl font-black text-gray-900 leading-none">Kursus Tersedia</h1>
      </div>

      {/* Top Navy Blue Path Progress Container */}
      <div className="bg-[#0b2e44] p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4 mb-6 shadow-md border border-sky-950">
        <div className="flex items-center gap-2">
          <HiOutlineTrophy className="text-yellow-400 text-lg shrink-0" />
          <span className="text-xs font-black text-white uppercase tracking-wider">{activePath} Path:</span>
        </div>

        <div className="flex flex-wrap gap-2.5 items-center">
          {pathSteps.map((step, idx) => {
            const showStep = step.exists;
            const isDone = step.enrolled;
            return (
              <div 
                key={idx}
                className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 text-[9px] font-black uppercase transition-all shadow-sm ${
                  isDone 
                    ? 'bg-white text-gray-900' 
                    : step.active 
                    ? 'bg-sky-500/20 text-sky-200 border border-sky-400/20' 
                    : 'bg-white/5 text-white/40'
                }`}
              >
                {isDone ? (
                  <span className="w-3.5 h-3.5 bg-emerald-500 text-white rounded-full flex items-center justify-center text-[8px] font-bold">✓</span>
                ) : step.trophy ? (
                  <span className="text-yellow-400">🏆</span>
                ) : (
                  <span className={`w-1.5 h-1.5 rounded-full ${step.active ? 'bg-sky-400' : 'bg-white/20'}`} />
                )}
                <span>{step.name}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap gap-2 mb-8">
        {(['Semua', 'Free', 'Berbayar', 'Course map'] as const).map((filterName) => (
          <button
            key={filterName}
            onClick={() => setActiveFilter(filterName)}
            className={`px-4 py-1.5 rounded-md text-[10px] font-black uppercase transition-all border shadow-sm ${
              activeFilter === filterName
                ? 'bg-black text-white border-black'
                : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
            }`}
          >
            {filterName}
          </button>
        ))}
        <button className="bg-white text-gray-400 border border-gray-200 hover:bg-gray-50 px-4 py-1.5 rounded-md text-[10px] font-black uppercase transition-all border shadow-sm">
          Referall
        </button>
      </div>

      {/* Grouped Course Lists or Course Map Roadmap */}
      {activeFilter === 'Course map' ? (
        renderRoadmapTimeline()
      ) : (
        <div className="flex flex-col gap-2">
          {renderLevelSection('LEVEL 1 — BEGINNER', beginnerCourses, 'text-emerald-600')}
          {renderLevelSection('LEVEL 2 — INTERMEDIATE', intermediateCourses, 'text-amber-600')}
          {renderLevelSection('LEVEL 3 — ADVANCED', advancedCourses, 'text-[#5850ec]')}
        </div>
      )}
      
      {activeFilter !== 'Course map' && filteredCourses.length === 0 && (
        <div className="text-center py-20 bg-white rounded-[2rem] border border-dashed border-gray-200 max-w-xl mx-auto shadow-sm">
          <HiOutlineBookOpen className="text-5xl text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900 mb-2">Tidak Ada Kursus</h3>
          <p className="text-gray-500 text-sm max-w-xs mx-auto">
            Tidak ada kelas aktif yang sesuai dengan kriteria penyaringan filter saat ini.
          </p>
        </div>
      )}
    </div>
  );
};

export default KursusTersedia;
