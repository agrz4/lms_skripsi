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

const KursusTersedia: React.FC = () => {
  const navigate = useNavigate();
  const { publishedMataKuliahList, fetchPublishedMataKuliah } = useMataKuliahStore();
  const { pendaftaranList, fetchMyPendaftaran, enrollKursus } = usePendaftaranStore();

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
    fetchMyPendaftaran();
    fetchProgress();
  }, [fetchPublishedMataKuliah, fetchMyPendaftaran]);

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

  // Dynamic mapping of top path steps using real database courses
  const getPathStepStatus = (keywords: string[], codePatterns: string[]) => {
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
  };

  const pathSteps = [
    { name: 'HTML & CSS', ...getPathStepStatus(['html', 'css', 'dasar'], ['wd-01', 'mk001']) },
    { name: 'JavaScript', ...getPathStepStatus(['javascript', 'js'], ['wd-02', 'mk002']) },
    { name: 'React JS', ...getPathStepStatus(['react'], ['wd-03', 'mk003']) },
    { name: 'Node.js & API', ...getPathStepStatus(['node', 'api', 'backend'], ['wd-04', 'mk004']) },
    { name: 'Full Stack Project', ...getPathStepStatus(['full stack', 'capstone', 'project'], ['wd-05', 'mk005']), trophy: true }
  ];

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
      <div className="mb-10">
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

  return (
    <div className="p-8 bg-[#E5E7EB] min-h-screen pb-20">
      {/* Title Header */}
      <div className="mb-6">
        <span className="text-xs text-blue-600 font-extrabold tracking-wider block mb-0.5">
          Web Development Path
        </span>
        <h1 className="text-3xl font-black text-gray-900 leading-none">Kursus Tersedia</h1>
      </div>

      {/* Top Navy Blue Web Dev Path Progress Container */}
      <div className="bg-[#0b2e44] p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4 mb-6 shadow-md border border-sky-950">
        <div className="flex items-center gap-2">
          <HiOutlineTrophy className="text-yellow-400 text-lg shrink-0" />
          <span className="text-xs font-black text-white uppercase tracking-wider">Web Dev Path:</span>
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

      {/* Grouped Course Lists */}
      <div className="flex flex-col gap-2">
        {renderLevelSection('LEVEL 1 — BEGINNER', beginnerCourses, 'text-emerald-600')}
        {renderLevelSection('LEVEL 2 — INTERMEDIATE', intermediateCourses, 'text-amber-600')}
        {renderLevelSection('LEVEL 3 — ADVANCED', advancedCourses, 'text-[#5850ec]')}
      </div>
      
      {filteredCourses.length === 0 && (
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
