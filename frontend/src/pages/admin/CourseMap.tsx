import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMataKuliahStore, type MataKuliah } from '../../store/useMataKuliahStore';
import { 
  HiOutlineClock,
  HiOutlineTrophy
} from 'react-icons/hi2';

// Helper to format course prices
const formatHarga = (hargaStr: string | undefined | null) => {
  if (!hargaStr || hargaStr === '0' || hargaStr === 'Gratis' || hargaStr === 'blue') return 'Gratis';
  const cleanStr = hargaStr.replace(/[^0-9]/g, '');
  if (!cleanStr) return hargaStr; // fallback if already formatted
  const num = parseInt(cleanStr, 10);
  if (isNaN(num) || num === 0) return 'Gratis';
  if (num >= 1000) {
    return `RP.${num / 1000}K`;
  }
  return `RP.${num}`;
};

// Colors mapping matching the mockup screenshot
const getCourseCardStyles = (level: string, index: number) => {
  const lvl = level.toLowerCase();
  if (lvl === 'beginner') {
    const beginnerThemes = [
      {
        bg: 'bg-[#adcbe3]',
        border: 'border-[#5850ec]',
        titleColor: 'text-[#1e40af]',
        badgeBg: 'bg-[#bfdbfe]/80',
        badgeText: 'text-[#1e40af]'
      },
      {
        bg: 'bg-[#f5f7ff]',
        border: 'border-[#5850ec]/40',
        titleColor: 'text-[#6b21a8]',
        badgeBg: 'bg-[#f3e8ff]/80',
        badgeText: 'text-[#6b21a8]'
      }
    ];
    return beginnerThemes[index % beginnerThemes.length];
  } else if (lvl === 'intermediate') {
    const intermediateThemes = [
      {
        bg: 'bg-[#dce3a4]',
        border: 'border-yellow-500',
        titleColor: 'text-[#854d0e]',
        badgeBg: 'bg-[#fefce8]/80',
        badgeText: 'text-[#854d0e]'
      },
      {
        bg: 'bg-[#dcfce7]',
        border: 'border-[#16a34a]',
        titleColor: 'text-[#15803d]',
        badgeBg: 'bg-[#f0fdf4]/80',
        badgeText: 'text-[#166534]'
      },
      {
        bg: 'bg-[#ccfbf1]',
        border: 'border-[#0d9488]',
        titleColor: 'text-[#0f766e]',
        badgeBg: 'bg-[#f0fdfa]/80',
        badgeText: 'text-[#115e59]'
      }
    ];
    return intermediateThemes[index % intermediateThemes.length];
  } else {
    // Advanced
    return {
      bg: 'bg-[#d7d8dc]',
      border: 'border-gray-400',
      titleColor: 'text-[#475569]',
      badgeBg: 'bg-[#f8fafc]/80',
      badgeText: 'text-[#475569]'
    };
  }
};

const CourseMap: React.FC = () => {
  const navigate = useNavigate();
  const { mataKuliahList, isLoading, fetchMataKuliah, updateMataKuliah } = useMataKuliahStore();
  const selectRef = useRef<HTMLSelectElement>(null);

  // Form states
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [selectedLevel, setSelectedLevel] = useState<string>('Beginner');
  const [harga, setHarga] = useState<string>('0');
  const [published, setPublished] = useState<boolean>(false);
  const [jumlahPertemuan, setJumlahPertemuan] = useState<number>(14);
  const [selectedPrerequisites, setSelectedPrerequisites] = useState<string[]>([]);

  useEffect(() => {
    fetchMataKuliah();
  }, [fetchMataKuliah]);

  const handleCourseSelect = (id: string) => {
    setSelectedCourseId(id);
    const course = mataKuliahList.find(mk => mk.id === id);
    if (course) {
      setSelectedLevel(course.level || 'Beginner');
      setHarga(course.warna || '0');
      setPublished(course.published);
      setJumlahPertemuan(course.jumlahPertemuan || 14);
      setSelectedPrerequisites(course.prerequisites?.map(p => typeof p === 'object' ? p.id : p) || []);
    } else {
      setSelectedLevel('Beginner');
      setHarga('0');
      setPublished(false);
      setJumlahPertemuan(14);
      setSelectedPrerequisites([]);
    }
  };

  const handleSaveNode = async () => {
    if (!selectedCourseId) {
      alert('Pilih kursus yang ingin dikonfigurasi terlebih dahulu.');
      return;
    }

    try {
      await updateMataKuliah(selectedCourseId, {
        level: selectedLevel,
        warna: harga, // Storing price in warna field
        published,
        jumlahPertemuan,
        prerequisites: selectedPrerequisites
      });

      alert('Node peta kursus berhasil disimpan!');
      // Reset form states
      setSelectedCourseId('');
      setSelectedLevel('Beginner');
      setHarga('0');
      setPublished(false);
      setJumlahPertemuan(14);
      setSelectedPrerequisites([]);
      await fetchMataKuliah();
    } catch (error) {
      console.error('Error saving course node:', error);
      alert('Gagal menyimpan konfigurasi node.');
    }
  };

  const handleRemoveNode = async () => {
    if (!selectedCourseId) {
      alert('Pilih node kursus yang ingin dihapus terlebih dahulu.');
      return;
    }
    
    const course = mataKuliahList.find(mk => mk.id === selectedCourseId);
    if (!course) return;
    
    if (confirm(`Apakah Anda yakin ingin menghapus "${course.nama}" dari Course Map? (Data kursus tidak akan dihapus, hanya konfigurasinya di map yang direset)`)) {
      try {
        await updateMataKuliah(selectedCourseId, {
          level: '',
          warna: '',
          prerequisites: []
        });
        alert('Node berhasil dihapus dari map!');
        setSelectedCourseId('');
        setSelectedLevel('Beginner');
        setHarga('0');
        setPublished(false);
        setJumlahPertemuan(14);
        setSelectedPrerequisites([]);
        await fetchMataKuliah();
      } catch (error) {
        console.error('Error removing node:', error);
        alert('Gagal menghapus node.');
      }
    }
  };

  const handleCancel = () => {
    setSelectedCourseId('');
    setSelectedLevel('Beginner');
    setHarga('0');
    setPublished(false);
    setJumlahPertemuan(14);
    setSelectedPrerequisites([]);
  };

  const handleAddNodeClick = (level: string) => {
    setSelectedLevel(level);
    setSelectedCourseId('');
    setHarga('0');
    setPublished(false);
    setJumlahPertemuan(14);
    setSelectedPrerequisites([]);
    if (selectRef.current) {
      selectRef.current.focus();
    }
  };

  // Helper matching mockup courses if database is empty
  const getMockNodes = () => {
    return [
      {
        id: 'mock-1',
        kode: 'WD-01',
        nama: 'HTML & CSS Dasar',
        level: 'Beginner',
        published: true,
        warna: '0',
        jumlahPertemuan: 14,
        exists: false
      },
      {
        id: 'mock-2',
        kode: 'WD-02',
        nama: 'JavaScript Dasar',
        level: 'Beginner',
        published: true,
        warna: '299000',
        jumlahPertemuan: 14,
        exists: false
      },
      {
        id: 'mock-3',
        kode: 'WD-03',
        nama: 'React JS Fundamental',
        level: 'Intermediate',
        published: true,
        warna: '499000',
        jumlahPertemuan: 14,
        exists: false
      },
      {
        id: 'mock-4',
        kode: 'WD-04',
        nama: 'Node.js & API dev',
        level: 'Intermediate',
        published: false,
        warna: '499000',
        jumlahPertemuan: 14,
        exists: false
      },
      {
        id: 'mock-5',
        kode: 'WD-05',
        nama: 'Database & ORM',
        level: 'Intermediate',
        published: false,
        warna: '499000',
        jumlahPertemuan: 14,
        exists: false
      },
      {
        id: 'mock-6',
        kode: 'WD-05',
        nama: 'Full Stack Capstone',
        level: 'Advanced',
        published: false,
        warna: '799000',
        jumlahPertemuan: 14,
        exists: false
      }
    ];
  };

  // Logic to dynamically render DB courses if any are configured with levels,
  // or fall back to displaying the gorgeous mockup data if database is clean.
  const mappedCourses = mataKuliahList.filter(c => c.level);
  const displayCourses = mappedCourses.length > 0 ? mappedCourses : getMockNodes();
  const isMockData = mappedCourses.length === 0;

  // Filter groups
  const beginnerCourses = displayCourses.filter(c => c.level?.toLowerCase() === 'beginner');
  const intermediateCourses = displayCourses.filter(c => c.level?.toLowerCase() === 'intermediate');
  const advancedCourses = displayCourses.filter(c => c.level?.toLowerCase() === 'advanced' || c.level?.toLowerCase() === 'advance');

  // Stats
  const totalCourses = displayCourses.length;
  const activeCount = displayCourses.filter(c => c.published).length;
  const draftCount = displayCourses.filter(c => !c.published && (c.level?.toLowerCase() !== 'advanced' || c.published)).length;
  const lockedCount = displayCourses.filter(c => c.level?.toLowerCase() === 'advanced' && !c.published).length;

  const renderCourseCard = (course: any, index: number) => {
    const isSelected = selectedCourseId === course.id;
    const theme = getCourseCardStyles(course.level || 'Beginner', index);
    const isPublished = course.published;
    const isLocked = (course.level || '').toLowerCase() === 'advanced' && !isPublished;
    
    const formattedPrice = formatHarga(course.warna);
    const meetingsText = `${course.jumlahPertemuan || 14} Pertemuan`;

    return (
      <div 
        key={course.id}
        onClick={() => {
          if (isMockData) {
            alert(`Kursus "${course.nama}" (${course.kode}) belum dibuat di database. Silakan tambahkan terlebih dahulu di Menu Kursus.`);
          } else {
            handleCourseSelect(course.id);
          }
        }}
        className={`cursor-pointer rounded-[1.5rem] border-2 p-5 relative transition-all duration-200 hover:scale-[1.02] w-[280px] text-left flex flex-col justify-between min-h-[120px] ${theme.bg} ${theme.border} ${
          isSelected ? 'ring-4 ring-indigo-500/25 scale-[1.02]' : ''
        }`}
      >
        {isPublished && !isLocked && (
          <div className="absolute -top-2 -right-2 w-5 h-5 bg-[#0fc26a] text-white rounded-full flex items-center justify-center text-xs shadow-sm font-bold">✓</div>
        )}
        {!isPublished && !isLocked && (
          <div className="absolute -top-2 -right-2 w-5 h-5 bg-[#eab308] text-white rounded-full flex items-center justify-center text-xs shadow-sm font-bold">⏳</div>
        )}
        {isLocked && (
          <div className="absolute -top-2 -right-2 w-5 h-5 bg-gray-500 text-white rounded-full flex items-center justify-center text-[10px] shadow-sm font-bold">🔒</div>
        )}

        <div>
          <p className="text-[10px] font-bold text-gray-500 mb-0.5 tracking-wider">{course.kode}</p>
          <h3 className="text-xs font-black text-gray-900 mb-3.5 leading-snug">{course.nama}</h3>
        </div>

        <div className="flex flex-wrap gap-1.5 mt-auto">
          {/* Status Badge */}
          {isLocked ? (
            <span className="bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full text-[9px] font-bold">
              Terkunci
            </span>
          ) : isPublished ? (
            <span className={`${theme.badgeBg} ${theme.badgeText} px-2 py-0.5 rounded-full text-[9px] font-bold`}>
              Published
            </span>
          ) : (
            <span className="bg-[#feefe3] text-[#b06000] px-2 py-0.5 rounded-full text-[9px] font-bold">
              Draft
            </span>
          )}

          {/* Meetings Badge */}
          <span className={`${theme.badgeBg} ${theme.badgeText} px-2 py-0.5 rounded-full text-[9px] font-bold flex items-center gap-1`}>
            <HiOutlineClock className="w-3 h-3 shrink-0" />
            {meetingsText}
          </span>

          {/* Price Badge */}
          <span className={`${theme.badgeBg} ${theme.badgeText} px-2 py-0.5 rounded-full text-[9px] font-bold`}>
            {formattedPrice}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="p-8 bg-[#E5E7EB] min-h-screen pb-20">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-black text-gray-900 mb-0.5">Course Map — Web Development Path</h1>
        <p className="text-xs text-gray-500 font-semibold">Atur urutan dan alur kursus - Sambungkan kursus dari level ke level berikutnya</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Main Content - Flow Map */}
        <div className="xl:col-span-9 bg-white p-8 rounded-[2rem] shadow-sm border border-gray-200 flex flex-col gap-10">
          <div>
            <h2 className="text-sm font-black text-gray-900 mb-0.5">Alur Kurikulum — Web Development</h2>
            <p className="text-[11px] text-gray-400 font-bold">Track berdasarkan level · jumlah pertemuan + harga · menuju sertifikat full stack</p>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-80">
              <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-4"></div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Memuat Peta Kurikulum...</p>
            </div>
          ) : (
            <div className="flex flex-col gap-10">
              {/* Level 1 - Beginner */}
              <div className="flex flex-col gap-5">
                <div className="text-center">
                  <span className="text-[#5850ec] font-black tracking-widest text-xs uppercase">
                    LEVEL 1 — BEGINNER
                  </span>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-6">
                  {beginnerCourses.map((course, idx) => renderCourseCard(course, idx))}
                  
                  {/* Tambah Node Card */}
                  <div
                    onClick={() => handleAddNodeClick('Beginner')}
                    className="w-[280px] min-h-[120px] rounded-[1.5rem] border-2 border-dashed border-gray-300 hover:border-[#5850ec] hover:bg-indigo-50/20 cursor-pointer flex flex-col items-center justify-center gap-1.5 transition-all group"
                  >
                    <span className="text-2xl text-gray-400 group-hover:text-[#5850ec] font-semibold">+</span>
                    <span className="text-[11px] font-black text-gray-400 group-hover:text-[#5850ec]">Tambah Node</span>
                  </div>
                </div>

                {/* Prerequisite Flow Banner Level 1 */}
                <div className="bg-[#f3f4f6] border border-gray-200 rounded-xl px-4 py-2.5 flex items-center justify-between text-xs w-full max-w-[700px] mx-auto shadow-sm mt-2">
                  <span className="text-[10px] font-bold text-gray-500">Syarat naik ke Level 2 — Intermediate</span>
                  <div className="flex items-center gap-2">
                    <span className="bg-[#e6f4ea] text-[#137333] px-2.5 py-0.5 rounded-full text-[9px] font-black border border-[#c2e7cd]">
                      {beginnerCourses[0]?.kode || 'WD-01'} Lulus
                    </span>
                    <span className="text-gray-400">→</span>
                    <span className="bg-[#e6f4ea] text-[#137333] px-2.5 py-0.5 rounded-full text-[9px] font-black border border-[#c2e7cd]">
                      {beginnerCourses[1]?.kode || 'WD-02'} Lulus
                    </span>
                    <span className="text-gray-400">→</span>
                    <span className="bg-[#fef7e0] text-[#b06000] px-2.5 py-0.5 rounded-full text-[9px] font-black border border-[#fde293]">
                      Level 2 Terbuka
                    </span>
                  </div>
                </div>
              </div>

              {/* Level 2 - Intermediate */}
              <div className="flex flex-col gap-5">
                <div className="text-center">
                  <span className="text-[#ca8a04] font-black tracking-widest text-xs uppercase">
                    LEVEL 2 — INTERMEDIATE
                  </span>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-6">
                  {intermediateCourses.map((course, idx) => renderCourseCard(course, idx))}
                  
                  {/* Tambah Node Card */}
                  <div
                    onClick={() => handleAddNodeClick('Intermediate')}
                    className="w-[280px] min-h-[120px] rounded-[1.5rem] border-2 border-dashed border-gray-300 hover:border-[#ca8a04] hover:bg-yellow-50/20 cursor-pointer flex flex-col items-center justify-center gap-1.5 transition-all group"
                  >
                    <span className="text-2xl text-gray-400 group-hover:text-[#ca8a04] font-semibold">+</span>
                    <span className="text-[11px] font-black text-gray-400 group-hover:text-[#ca8a04]">Tambah Node</span>
                  </div>
                </div>

                {/* Prerequisite Flow Banner Level 2 */}
                <div className="bg-[#f3f4f6] border border-gray-200 rounded-xl px-4 py-2.5 flex items-center justify-between text-xs w-full max-w-[700px] mx-auto shadow-sm mt-2">
                  <span className="text-[10px] font-bold text-gray-500">Syarat naik ke Level 3 — Intermediate</span>
                  <div className="flex items-center gap-2">
                    <span className="bg-[#e6f4ea] text-[#137333] px-2.5 py-0.5 rounded-full text-[9px] font-black border border-[#c2e7cd]">
                      {intermediateCourses[0]?.kode || 'WD-03'} Lulus
                    </span>
                    <span className="text-gray-400">→</span>
                    <span className="bg-[#e6f4ea] text-[#137333] px-2.5 py-0.5 rounded-full text-[9px] font-black border border-[#c2e7cd]">
                      {intermediateCourses[1]?.kode || 'WD-04'} Lulus
                    </span>
                    <span className="text-gray-400">→</span>
                    <span className="bg-[#e6f4ea] text-[#137333] px-2.5 py-0.5 rounded-full text-[9px] font-black border border-[#c2e7cd]">
                      {intermediateCourses[2]?.kode || 'WD-05'} Lulus
                    </span>
                    <span className="text-gray-400">→</span>
                    <span className="bg-[#fde8e8] text-[#c53030] px-2.5 py-0.5 rounded-full text-[9px] font-black border border-[#f8b4b4]">
                      Level 3 Terbuka
                    </span>
                  </div>
                </div>
              </div>

              {/* Level 3 - Advanced */}
              <div className="flex flex-col gap-5">
                <div className="text-center">
                  <span className="text-gray-500 font-black tracking-widest text-xs uppercase">
                    LEVEL 3 — ADVANCED
                  </span>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-6">
                  {advancedCourses.map((course, idx) => (
                    <div key={course.id} className="flex flex-col items-center gap-2.5">
                      {renderCourseCard(course, idx)}
                      <span className="text-[10px] font-bold text-gray-400">
                        Syarat: Lulus semua
                      </span>
                    </div>
                  ))}
                  
                  {/* Tambah Node Card */}
                  <div
                    onClick={() => handleAddNodeClick('Advanced')}
                    className="w-[280px] min-h-[120px] rounded-[1.5rem] border-2 border-dashed border-gray-300 hover:border-gray-500 hover:bg-gray-50 cursor-pointer flex flex-col items-center justify-center gap-1.5 transition-all group"
                  >
                    <span className="text-2xl text-gray-400 group-hover:text-gray-500 font-semibold">+</span>
                    <span className="text-[11px] font-black text-gray-400 group-hover:text-gray-500">Tambah Node</span>
                  </div>
                </div>
              </div>

              {/* Bottom Milestone Badge Card */}
              <div className="w-full max-w-[700px] mx-auto bg-[#c7d2fe]/30 text-[#4f46e5] border-2 border-[#5850ec]/30 p-4 rounded-[1.5rem] flex items-center gap-4 shadow-sm hover:scale-[1.01] transition-transform mt-2">
                <div className="w-12 h-12 bg-[#5850ec] rounded-full flex items-center justify-center text-white shadow-md shrink-0">
                  <HiOutlineTrophy className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-[#5850ec]">WD-06 - Sertifikat full stack web developer</h3>
                  <p className="text-[10px] text-indigo-500 font-bold mt-0.5">Milestone · diraih setelah semua level selesai</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar - Inputs & Stats */}
        <div className="xl:col-span-3 flex flex-col gap-6">
          {/* Input Form Card */}
          <div className="bg-white p-6 rounded-[1.5rem] shadow-sm border border-gray-200">
            <h2 className="text-sm font-black text-gray-900 mb-5">Input Node Kursus</h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-[11px] font-bold text-gray-500 block mb-1.5">Nama Kursus</label>
                <select 
                  ref={selectRef}
                  value={selectedCourseId}
                  onChange={(e) => handleCourseSelect(e.target.value)}
                  className="w-full px-3 h-10 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-gray-700 font-bold shadow-sm"
                >
                  <option value="">Nama Kursus Baru....</option>
                  {mataKuliahList.map(mk => (
                    <option key={mk.id} value={mk.id}>{mk.kode} - {mk.nama}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-500 block mb-2">Level</label>
                <div className="flex flex-wrap gap-x-4 gap-y-2">
                  {['Beginner', 'Intermediate', 'Advanced'].map((lvl) => {
                    const isChecked = selectedLevel === lvl;
                    return (
                      <label key={lvl} className="flex items-center gap-1.5 cursor-pointer text-xs font-bold text-gray-600 hover:text-gray-900 transition-colors">
                        <input 
                          type="radio" 
                          name="level" 
                          value={lvl}
                          checked={isChecked}
                          onChange={() => setSelectedLevel(lvl)}
                          className="w-4 h-4 text-[#5850ec] focus:ring-[#5850ec] border-gray-300"
                        />
                        <span>{lvl}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-500 block mb-1.5">Status</label>
                <select 
                  value={published ? 'true' : 'false'}
                  onChange={(e) => setPublished(e.target.value === 'true')}
                  className="w-full px-3 h-10 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-gray-700 font-bold shadow-sm"
                >
                  <option value="true">Published</option>
                  <option value="false">Draft</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-500 block mb-1.5">Jumlah Pertemuan</label>
                <input 
                  type="number" 
                  value={jumlahPertemuan}
                  onChange={(e) => setJumlahPertemuan(parseInt(e.target.value) || 0)}
                  className="w-full px-3 h-10 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-gray-700 font-bold shadow-sm"
                  min="1"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-500 block mb-1.5">Harga(0=Gratis)</label>
                <input 
                  type="text" 
                  value={harga}
                  onChange={(e) => setHarga(e.target.value)}
                  placeholder="Contoh: 499000 atau 0"
                  className="w-full px-3 h-10 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-gray-700 font-bold shadow-sm"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-500 block mb-1.5">Prasyarat Kursus</label>
                <div className="space-y-2 max-h-36 overflow-y-auto border border-gray-200 rounded-xl p-3 bg-gray-50 shadow-inner">
                  {mataKuliahList
                    .filter(mk => mk.id !== selectedCourseId)
                    .map(mk => {
                      const isChecked = selectedPrerequisites.includes(mk.id);
                      return (
                        <label key={mk.id} className="flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-600 hover:text-indigo-600 transition-colors">
                          <input 
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              if (isChecked) {
                                setSelectedPrerequisites(selectedPrerequisites.filter(id => id !== mk.id));
                              } else {
                                setSelectedPrerequisites([...selectedPrerequisites, mk.id]);
                              }
                            }}
                            className="w-4 h-4 rounded text-indigo-600 border-gray-300 focus:ring-indigo-500"
                          />
                          <span>{mk.kode} - {mk.nama}</span>
                        </label>
                      );
                    })}
                  {mataKuliahList.filter(mk => mk.id !== selectedCourseId).length === 0 && (
                    <span className="text-xs text-gray-400 italic font-semibold block py-1">
                      Tidak ada kursus lain
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons Row */}
              <div className="flex gap-2 pt-2">
                <button 
                  onClick={handleSaveNode}
                  className="flex-1 h-10 bg-[#5850ec] hover:bg-[#4f46e5] text-white font-black rounded-xl text-[10px] shadow-sm transition-all border-none animate-pulse-subtle"
                >
                  Simpan Node
                </button>
                {selectedCourseId && (
                  <button 
                    onClick={handleRemoveNode}
                    className="h-10 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl text-[10px] px-3.5 shadow-sm transition-all border-none"
                  >
                    Hapus Node
                  </button>
                )}
                <button 
                  onClick={handleCancel}
                  className="h-10 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl text-[10px] px-3.5 shadow-sm transition-all border-none"
                >
                  Batal
                </button>
              </div>
            </div>
          </div>

          {/* Stats Card */}
          <div className="bg-white p-6 rounded-[1.5rem] shadow-sm border border-gray-200">
            <h2 className="text-sm font-black text-gray-900 mb-5">Statistik Course Map</h2>
            
            <div className="space-y-3">
              {[
                { label: 'Total Kursus di Map', value: totalCourses, color: 'text-gray-900' },
                { label: 'Sudah Aktif', value: activeCount, color: 'text-[#10b981]' },
                { label: 'Draft/Proses', value: draftCount, color: 'text-[#b06000]' },
                { label: 'Belum Dibuat', value: lockedCount, color: 'text-gray-500' },
              ].map((stat, i) => (
                <div key={i} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                  <span className="text-xs font-bold text-gray-500">{stat.label}</span>
                  <span className={`text-sm font-black ${stat.color}`}>{stat.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseMap;
