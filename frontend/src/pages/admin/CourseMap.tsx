import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useMataKuliahStore, type MataKuliah } from '../../store/useMataKuliahStore';
import { usePaketStore } from '../../store/usePaketStore';
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

// Mockup nodes helper removed to display only database entries

interface MapCourse extends Partial<MataKuliah> {
  exists: boolean;
  id: string;
  nama: string;
  kode: string;
  level: string;
  warna?: string;
  published: boolean;
  jumlahPertemuan?: number;
}

const CourseMap: React.FC = () => {
  const { mataKuliahList, isLoading, fetchMataKuliah, updateMataKuliah, addMataKuliah } = useMataKuliahStore();
  const { paketList, fetchPaket, addPaket, removePaket } = usePaketStore();
  const selectRef = useRef<HTMLSelectElement>(null);

  // Package selection state
  const [selectedPaketId, setSelectedPaketId] = useState<string>('');

  // Form states
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [newCourseName, setNewCourseName] = useState<string>('');
  const [newCourseCode, setNewCourseCode] = useState<string>('');
  const [selectedLevel, setSelectedLevel] = useState<string>('Beginner');
  const [harga, setHarga] = useState<string>('0');
  const [published, setPublished] = useState<boolean>(false);
  const [jumlahPertemuan, setJumlahPertemuan] = useState<number>(3);
  const [selectedPrerequisites, setSelectedPrerequisites] = useState<string[]>([]);

  // Sidebar dynamic control state
  const [activeSidebarForm, setActiveSidebarForm] = useState<'stats' | 'node' | 'bundling'>('stats');

  // Bundling form states
  const [namaPaket, setNamaPaket] = useState<string>('');
  const [deskripsiPaket, setDeskripsiPaket] = useState<string>('');
  const [selectedBundledCourses, setSelectedBundledCourses] = useState<string[]>([]);
  const [hargaPaket, setHargaPaket] = useState<string>('');

  useEffect(() => {
    fetchMataKuliah();
    fetchPaket();
  }, [fetchMataKuliah, fetchPaket]);

  // Set default package when package list is loaded
  useEffect(() => {
    if (paketList.length > 0 && !selectedPaketId) {
      setSelectedPaketId(paketList[0].id);
    }
  }, [paketList, selectedPaketId]);


  const handleCourseSelect = (id: string) => {
    setSelectedCourseId(id);
    const course = mataKuliahList.find(mk => mk.id === id);
    if (course) {
      setSelectedLevel(course.level || selectedLevel || 'Beginner');
      setHarga(course.warna || '0');
      setPublished(course.published);
      setJumlahPertemuan(course.jumlahPertemuan || 3);
      setSelectedPrerequisites(course.prerequisites?.map(p => typeof p === 'object' ? p.id : p) || []);
      setActiveSidebarForm('node'); // Open sidebar node form
    } else {
      setHarga('0');
      setPublished(false);
      setJumlahPertemuan(3);
      setSelectedPrerequisites([]);
    }
  };

  const handleSaveNode = async () => {
    if (!selectedCourseId) {
      // Trying to create a brand new course!
      if (!newCourseName.trim() || !newCourseCode.trim()) {
        alert('Untuk membuat kursus baru, silakan isi Nama Kursus Baru dan Kode Kursus Baru.');
        return;
      }

      try {
        const selectedPaket = paketList.find(p => p.id === selectedPaketId);
        const normPath = selectedPaket ? selectedPaket.nama.toLowerCase() : '';
        let kategori = 'Programming';
        if (normPath.includes('science')) kategori = 'Data Science';
        else if (normPath.includes('security') || normPath.includes('cyber')) kategori = 'Cyber Security';
        else if (normPath.includes('ui') || normPath.includes('ux') || normPath.includes('design')) kategori = 'Design';
        else if (normPath.includes('ai') || normPath.includes('intelligence')) kategori = 'AI';

        await addMataKuliah({
          nama: newCourseName.trim(),
          kode: newCourseCode.trim(),
          level: selectedLevel,
          warna: harga, // Storing price in warna field
          published,
          jumlahPertemuan,
          kategori,
          statusPendaftaran: 'Aktif',
          tipeKursus: 'ONLINE'
        });

        alert('Kursus baru berhasil dibuat dan ditambahkan ke map!');

        // Reset states
        setSelectedCourseId('');
        setNewCourseName('');
        setNewCourseCode('');
        setSelectedLevel('Beginner');
        setHarga('0');
        setPublished(false);
        setJumlahPertemuan(3);
        setSelectedPrerequisites([]);
        setActiveSidebarForm('stats');
        await fetchMataKuliah();
      } catch (error: unknown) {
        console.error('Error creating new course node:', error);
        let errorMsg = 'Gagal membuat kursus baru.';
        if (error instanceof Error) {
          errorMsg = error.message;
        }
        const responseData = (error as { response?: { data?: { message?: string } } })?.response?.data;
        if (responseData?.message) {
          errorMsg = responseData.message;
        }
        alert(`Gagal membuat kursus baru: ${errorMsg}`);
      }
      return;
    }

    try {
      const selectedPaket = paketList.find(p => p.id === selectedPaketId);
      const normPath = selectedPaket ? selectedPaket.nama.toLowerCase() : '';
      let kategori = 'Programming';
      if (normPath.includes('science')) kategori = 'Data Science';
      else if (normPath.includes('security') || normPath.includes('cyber')) kategori = 'Cyber Security';
      else if (normPath.includes('ui') || normPath.includes('ux') || normPath.includes('design')) kategori = 'Design';
      else if (normPath.includes('ai') || normPath.includes('intelligence')) kategori = 'AI';

      await updateMataKuliah(selectedCourseId, {
        level: selectedLevel,
        warna: harga, // Storing price in warna field
        published,
        jumlahPertemuan,
        prerequisites: selectedPrerequisites,
        kategori
      });

      alert('Node peta kursus berhasil disimpan!');
      // Reset form states
      setSelectedCourseId('');
      setNewCourseName('');
      setNewCourseCode('');
      setSelectedLevel('Beginner');
      setHarga('0');
      setPublished(false);
      setJumlahPertemuan(3);
      setSelectedPrerequisites([]);
      setActiveSidebarForm('stats'); // Close to stats
      await fetchMataKuliah();
    } catch (error: unknown) {
      console.error('Error saving course node:', error);
      let errorMsg = 'Gagal menyimpan konfigurasi node.';
      if (error instanceof Error) {
        errorMsg = error.message;
      }
      const responseData = (error as { response?: { data?: { message?: string } } })?.response?.data;
      if (responseData?.message) {
        errorMsg = responseData.message;
      }
      alert(`Gagal menyimpan konfigurasi node: ${errorMsg}`);
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
        setNewCourseName('');
        setNewCourseCode('');
        setSelectedLevel('Beginner');
        setHarga('0');
        setPublished(false);
        setJumlahPertemuan(3);
        setSelectedPrerequisites([]);
        setActiveSidebarForm('stats'); // Close to stats
        await fetchMataKuliah();
      } catch (error: unknown) {
        console.error('Error removing node:', error);
        let errorMsg = 'Gagal menghapus node.';
        if (error instanceof Error) {
          errorMsg = error.message;
        }
        const responseData = (error as { response?: { data?: { message?: string } } })?.response?.data;
        if (responseData?.message) {
          errorMsg = responseData.message;
        }
        alert(`Gagal menghapus node: ${errorMsg}`);
      }
    }
  };

  const handleCancel = () => {
    setSelectedCourseId('');
    setNewCourseName('');
    setNewCourseCode('');
    setSelectedLevel('Beginner');
    setHarga('0');
    setPublished(false);
    setJumlahPertemuan(3);
    setSelectedPrerequisites([]);
    setActiveSidebarForm('stats'); // Close to stats
  };

  const handleAddNodeClick = (level: string) => {
    setSelectedLevel(level);
    setSelectedCourseId('');
    setNewCourseName('');
    setNewCourseCode('');
    setHarga('0');
    setPublished(false);
    setJumlahPertemuan(3);
    setSelectedPrerequisites([]);
    setActiveSidebarForm('node'); // Open node form
    if (selectRef.current) {
      selectRef.current.focus();
    }
  };

  const handleSavePaket = async () => {
    if (!namaPaket) {
      alert('Nama Paket harus diisi.');
      return;
    }
    if (selectedBundledCourses.length === 0) {
      alert('Pilih setidaknya satu kursus untuk paket bundling.');
      return;
    }

    try {
      await addPaket({
        nama: namaPaket,
        deskripsi: deskripsiPaket,
        courses: selectedBundledCourses,
        hargaPaket: hargaPaket || '0',
        hargaAsli: hargaAsliPaket.toString()
      });

      alert('Paket Bundling berhasil disimpan!');

      // Reset states
      setNamaPaket('');
      setDeskripsiPaket('');
      setSelectedBundledCourses([]);
      setHargaPaket('');
      setActiveSidebarForm('stats');
    } catch (error) {
      console.error('Error saving package:', error);
      alert('Gagal menyimpan paket bundling. Pastikan skema database sudah disinkronisasi.');
    }
  };

  const handleCancelPaket = () => {
    setNamaPaket('');
    setDeskripsiPaket('');
    setSelectedBundledCourses([]);
    setHargaPaket('');
    setActiveSidebarForm('stats');
  };



  const selectedPaket = useMemo(() => {
    return paketList.find(p => p.id === selectedPaketId) || paketList[0];
  }, [paketList, selectedPaketId]);

  const displayCourses = useMemo((): MapCourse[] => {
    if (!selectedPaket || !selectedPaket.courses) return [];
    const courseIdsInPaket = new Set(selectedPaket.courses.map((c: any) => c.id));
    
    // Filter mataKuliahList to only include courses in this package
    const dbCourses = mataKuliahList.filter(c => courseIdsInPaket.has(c.id));
    
    return dbCourses.map(c => ({
      ...c,
      exists: true,
      level: c.level || 'Beginner'
    }));
  }, [mataKuliahList, selectedPaket]);

  // Group displayCourses by kategori and compute depth within each category
  const categoriesWithCourses = useMemo(() => {
    if (displayCourses.length === 0) return [];

    const courseMap = new Map(displayCourses.map(c => [c.id, c]));
    const depthMemo = new Map<string, number>();

    const getDepth = (courseId: string, visited: Set<string> = new Set()): number => {
      if (depthMemo.has(courseId)) return depthMemo.get(courseId)!;
      if (visited.has(courseId)) return 0; // Avoid circular dependencies
      
      const course = courseMap.get(courseId);
      if (!course) return 0;
      
      visited.add(courseId);
      
      let maxPrereqDepth = -1;
      const prereqs = course.prerequisites || [];
      for (const p of prereqs) {
        const prereqId = typeof p === 'object' ? p.id : p;
        if (courseMap.has(prereqId)) {
          maxPrereqDepth = Math.max(maxPrereqDepth, getDepth(prereqId, new Set(visited)));
        }
      }
      
      const depth = maxPrereqDepth + 1;
      depthMemo.set(courseId, depth);
      return depth;
    };

    // Annotate all courses with depth
    const coursesWithDepth = displayCourses.map(c => ({
      ...c,
      depth: getDepth(c.id)
    }));

    // Group by c.kategori
    const groups: { [key: string]: typeof coursesWithDepth } = {};
    coursesWithDepth.forEach(c => {
      const kat = c.kategori || 'Umum';
      if (!groups[kat]) {
        groups[kat] = [];
      }
      groups[kat].push(c);
    });

    // For each group, structure the courses by depth to draw horizontal flows
    return Object.keys(groups).map(kategoriName => {
      const categoryCourses = groups[kategoriName];
      
      // Group categoryCourses by depth
      const depthGroups: { [key: number]: typeof coursesWithDepth } = {};
      categoryCourses.forEach(c => {
        const d = c.depth || 0;
        if (!depthGroups[d]) {
          depthGroups[d] = [];
        }
        depthGroups[d].push(c);
      });

      // Sort the depths inside this category
      const sortedDepths = Object.keys(depthGroups).map(Number).sort((a, b) => a - b);
      
      const flowColumns = sortedDepths.map(depth => ({
        depth,
        courses: depthGroups[depth]
      }));

      return {
        kategoriName,
        flowColumns
      };
    });
  }, [displayCourses]);

  // Calculate Harga Asli of bundled courses directly during render
  let hargaAsliPaket = 0;
  selectedBundledCourses.forEach(id => {
    const course = mataKuliahList.find(c => c.id === id);
    if (course && course.warna) {
      const cleanStr = course.warna.replace(/[^0-9]/g, '');
      const num = parseInt(cleanStr, 10);
      if (!isNaN(num)) {
        hargaAsliPaket += num;
      }
    }
  });

  // Stats
  const totalCourses = displayCourses.length;
  const activeCount = displayCourses.filter(c => c.exists && c.published).length;
  const draftCount = displayCourses.filter(c => c.exists && !c.published).length;
  const lockedCount = displayCourses.filter(c => !c.exists).length;

  const renderCourseCard = (course: MapCourse, index: number) => {
    const isSelected = course.exists && selectedCourseId === course.id;
    const isPublished = course.exists && course.published;

    const formattedPrice = formatHarga(course.warna);
    
    // Bottom bar background color based on price/warna
    let footerBg = 'bg-[#76b900] text-white'; // NVIDIA Green style
    const cleanPrice = (course.warna || '').replace(/[^0-9]/g, '');
    const numPrice = parseInt(cleanPrice, 10);
    if (!isNaN(numPrice) && numPrice >= 500000 || (course.warna || '').toLowerCase().includes('500')) {
      footerBg = 'bg-[#7630a3] text-white'; // Purple style for expensive/adv
    }

    const meetingsText = `${course.jumlahPertemuan || 3} Sesi`;

    return (
      <div
        key={course.id}
        onClick={() => {
          if (!course.exists) {
            if (confirm(`Kursus "${course.nama}" (${course.kode}) belum dibuat di database. Apakah Anda ingin membuatnya sekarang?`)) {
              setSelectedLevel(course.level || 'Beginner');
              setSelectedCourseId('');
              setNewCourseName(course.nama);
              setNewCourseCode(course.kode);
              setHarga(course.warna || '0');
              setPublished(false);
              setJumlahPertemuan(course.jumlahPertemuan || 3);
              setSelectedPrerequisites([]);
              setActiveSidebarForm('node');
              if (selectRef.current) {
                selectRef.current.focus();
              }
            }
          } else {
            handleCourseSelect(course.id);
          }
        }}
        className={`cursor-pointer rounded-xl border border-gray-300 relative transition-all duration-200 hover:scale-[1.02] w-[215px] text-left flex flex-col justify-between overflow-hidden shadow-sm bg-white shrink-0 ${
          isSelected ? 'ring-4 ring-indigo-500/25 scale-[1.02] border-indigo-500' : ''
        } ${!course.exists ? 'opacity-70 hover:opacity-100 border-dashed' : ''}`}
      >
        {isPublished && course.exists && (
          <div className="absolute top-2 right-2 w-4 h-4 bg-[#0fc26a] text-white rounded-full flex items-center justify-center text-[9px] shadow-sm font-bold">✓</div>
        )}
        {!isPublished && course.exists && (
          <div className="absolute top-2 right-2 w-4 h-4 bg-[#eab308] text-white rounded-full flex items-center justify-center text-[9px] shadow-sm font-bold">⏳</div>
        )}
        {!course.exists && (
          <div className="absolute top-2 right-2 w-4 h-4 bg-gray-500 text-white rounded-full flex items-center justify-center text-[8px] shadow-sm font-bold">🔒</div>
        )}

        {/* Card Body - Content */}
        <div className="p-4 flex-1 flex flex-col justify-center min-h-[70px] bg-[#f3f4f6]">
          <p className="text-[9px] font-bold text-gray-400 mb-1 text-center tracking-wider">{course.kode}</p>
          <h3 className="text-[11px] font-black text-gray-800 leading-snug text-center line-clamp-2">
            {course.nama}
          </h3>
        </div>

        {/* Card Footer - Solid Color Bar */}
        <div className={`h-8 flex items-center justify-center font-extrabold text-[10px] tracking-wide ${footerBg}`}>
          {meetingsText} | {formattedPrice}
        </div>
      </div>
    );
  };

  return (
    <div className="p-8 bg-[#E5E7EB] min-h-screen pb-20">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-gray-900 mb-0.5">Course Map — {selectedPaket?.nama || 'Roadmap'}</h1>
            <select
              value={selectedPaketId}
              onChange={(e) => setSelectedPaketId(e.target.value)}
              className="bg-white border border-gray-300 text-gray-700 font-black text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-sm"
            >
              {paketList.map(paket => (
                <option key={paket.id} value={paket.id}>{paket.nama}</option>
              ))}
            </select>
          </div>
          <p className="text-xs text-gray-500 font-semibold">Track berdasarkan paket · Atur prasyarat & buat roadmap course</p>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="bg-[#e0e7ff] text-[#4338ca] px-4 py-1.5 rounded-full text-xs font-extrabold shadow-sm">
            {displayCourses.length} Kursus
          </div>
          <div className="bg-[#dcfce7] text-[#15803d] px-4 py-1.5 rounded-full text-xs font-extrabold shadow-sm">
            {paketList.length} Paket
          </div>
          <button
            onClick={() => {
              setActiveSidebarForm('bundling');
              // Clear bundling form inputs on open
              setNamaPaket('');
              setDeskripsiPaket('');
              setSelectedBundledCourses([]);
              setHargaPaket('');
            }}
            className="bg-[#0fc26a] hover:bg-[#0db05f] text-white font-extrabold rounded-full text-xs px-4 py-2.5 transition-all shadow-sm border-none cursor-pointer"
          >
            + Buat Paket
          </button>
          <button
            onClick={() => handleAddNodeClick('Beginner')}
            className="bg-[#5850ec] hover:bg-[#4f46e5] text-white font-extrabold rounded-full text-xs px-4 py-2.5 transition-all shadow-sm border-none cursor-pointer"
          >
            + Tambah Kursus
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Main Content - Flow Map */}
        <div className="xl:col-span-9 bg-white p-8 rounded-[2rem] shadow-sm border border-gray-200 flex flex-col gap-8">
          <div>
            <h2 className="text-sm font-black text-gray-900 mb-0.5">Alur Kurikulum — {selectedPaket?.nama || 'Roadmap'}</h2>
            <p className="text-[11px] text-gray-400 font-bold">Track berdasarkan prasyarat · jumlah pertemuan + harga · menuju sertifikat kelulusan</p>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-80">
              <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-4"></div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Memuat Peta Kurikulum...</p>
            </div>
          ) : (
            <div className="flex flex-col gap-12">
              {categoriesWithCourses.map((cat) => (
                <div key={cat.kategoriName} className="flex flex-col gap-4 border-b border-gray-100 pb-8 last:border-b-0 last:pb-0">
                  {/* Category Heading */}
                  <h3 className="text-sm font-black text-gray-800 tracking-wide uppercase">
                    {cat.kategoriName}
                  </h3>

                  {/* Wrapping Horizontal Flow Container (No Scroll) */}
                  <div className="flex flex-row flex-wrap py-6 gap-y-8 gap-x-6 w-full justify-center items-center">
                    {cat.flowColumns.map((column) => (
                      <React.Fragment key={column.depth}>
                        {/* Column containing courses at this depth (vertical stack if multiple) */}
                        <div className="flex flex-col gap-4 justify-center items-center min-w-[215px]">
                          {column.courses.map((course, idx) => renderCourseCard(course, idx))}
                        </div>
                      </React.Fragment>
                    ))}

                    <div
                      onClick={() => handleAddNodeClick('Beginner')}
                      className="w-[215px] h-[80px] rounded-xl border border-dashed border-gray-300 hover:border-indigo-500 hover:bg-[#5850ec]/5 cursor-pointer flex flex-col items-center justify-center gap-1 transition-all group shrink-0"
                    >
                      <span className="text-lg text-gray-400 group-hover:text-indigo-600 font-black">+</span>
                      <span className="text-[9px] font-black text-gray-400 group-hover:text-indigo-600 uppercase tracking-wider">Tambah Node</span>
                    </div>
                  </div>
                </div>
              ))}

              {categoriesWithCourses.length === 0 && (
                <div className="text-center py-16">
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Tidak ada kursus dalam paket ini</p>
                  <p className="text-xs text-gray-400 font-semibold mt-1">Silakan buat paket baru atau tambahkan kursus di database.</p>
                </div>
              )}

              {/* Bottom Milestone Badge Card */}
              {selectedPaket && categoriesWithCourses.length > 0 && (
                <div className="w-full max-w-[700px] mx-auto bg-[#c7d2fe]/30 text-[#4f46e5] border border-[#5850ec]/30 p-4 rounded-[1.5rem] flex items-center gap-4 shadow-sm hover:scale-[1.01] transition-transform mt-2">
                  <div className="w-12 h-12 bg-[#5850ec] rounded-full flex items-center justify-center text-white shadow-md shrink-0">
                    <HiOutlineTrophy className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-[#5850ec]">
                      Sertifikat Kelulusan: {selectedPaket.nama}
                    </h3>
                    <p className="text-[10px] text-indigo-500 font-bold mt-0.5">Milestone · diraih setelah semua kursus dalam paket diselesaikan</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Sidebar - Inputs & Stats */}
        <div className="xl:col-span-3 flex flex-col gap-6">
          {activeSidebarForm === 'node' && (
            /* Input Form Card */
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

                {selectedCourseId === "" && (
                  <div className="space-y-4 pt-2 border-t border-gray-100 mt-2 animate-in fade-in duration-300">
                    <div>
                      <label className="text-[11px] font-bold text-gray-500 block mb-1.5">Nama Kursus Baru</label>
                      <input
                        type="text"
                        value={newCourseName}
                        onChange={(e) => setNewCourseName(e.target.value)}
                        placeholder="Contoh: CSS Grid & Flexbox"
                        className="w-full px-3 h-10 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-gray-700 font-bold shadow-sm"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-gray-500 block mb-1.5">Kode Kursus Baru</label>
                      <input
                        type="text"
                        value={newCourseCode}
                        onChange={(e) => setNewCourseCode(e.target.value)}
                        placeholder="Contoh: WD-07"
                        className="w-full px-3 h-10 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-gray-700 font-bold shadow-sm"
                      />
                    </div>
                  </div>
                )}

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
          )}

          {activeSidebarForm === 'bundling' && (
            /* Buat Paket Bundling Card */
            <div className="bg-white p-6 rounded-[1.5rem] shadow-sm border border-gray-200">
              <h2 className="text-sm font-black text-gray-900 mb-5">Buat Paket Bundling</h2>

              <div className="space-y-4">
                <div>
                  <label className="text-[11px] font-bold text-gray-500 block mb-1.5">Nama Paket</label>
                  <input
                    type="text"
                    value={namaPaket}
                    onChange={(e) => setNamaPaket(e.target.value)}
                    placeholder="Nama Paket Bundling..."
                    className="w-full px-3 h-10 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-gray-700 font-bold shadow-sm"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-gray-500 block mb-1.5">Deskripsi Paket</label>
                  <textarea
                    value={deskripsiPaket}
                    onChange={(e) => setDeskripsiPaket(e.target.value)}
                    placeholder="Deskripsi singkat mengenai paket..."
                    rows={3}
                    className="w-full p-3 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-gray-700 font-bold shadow-sm resize-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-gray-500 block mb-1.5">Pilih Kursus</label>
                  <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-200 rounded-xl p-3 bg-gray-50 shadow-inner">
                    {mataKuliahList.length === 0 ? (
                      <span className="text-xs text-gray-400 italic font-semibold block py-1">
                        Belum ada kursus di database
                      </span>
                    ) : (
                      mataKuliahList.map(mk => {
                        const isChecked = selectedBundledCourses.includes(mk.id);
                        return (
                          <label key={mk.id} className="flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-600 hover:text-indigo-600 transition-colors">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {
                                if (isChecked) {
                                  setSelectedBundledCourses(selectedBundledCourses.filter(id => id !== mk.id));
                                } else {
                                  setSelectedBundledCourses([...selectedBundledCourses, mk.id]);
                                }
                              }}
                              className="w-4 h-4 rounded text-indigo-600 border-gray-300 focus:ring-indigo-500"
                            />
                            <span>{mk.kode} - {mk.nama}</span>
                          </label>
                        );
                      })
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-gray-500 block mb-1.5">Harga Paket</label>
                  <input
                    type="text"
                    value={hargaPaket}
                    onChange={(e) => setHargaPaket(e.target.value)}
                    placeholder="Contoh: 199000"
                    className="w-full px-3 h-10 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-gray-700 font-bold shadow-sm"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-gray-500 block mb-1.5">Harga Asli (Kalkulasi Otomatis)</label>
                  <input
                    type="text"
                    value={formatHarga(hargaAsliPaket.toString())}
                    disabled
                    className="w-full px-3 h-10 bg-gray-100 border border-gray-200 rounded-xl text-xs font-bold text-gray-500 shadow-sm cursor-not-allowed"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={handleSavePaket}
                    className="flex-1 h-10 bg-[#0fc26a] hover:bg-[#0db05f] text-white font-black rounded-xl text-[10px] shadow-sm border-none cursor-pointer transition-all"
                  >
                    Simpan Paket
                  </button>
                  <button
                    onClick={handleCancelPaket}
                    className="h-10 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl text-[10px] px-4 shadow-sm border-none cursor-pointer transition-all"
                  >
                    Batalkan
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeSidebarForm === 'stats' && (
            <>
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

              {/* Bundling List Card */}
              <div className="bg-white p-6 rounded-[1.5rem] shadow-sm border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-sm font-black text-gray-900">Daftar Paket Bundling</h2>
                  <span className="bg-[#dcfce7] text-[#15803d] px-2.5 py-0.5 rounded-full text-[9px] font-black">{paketList.length} Paket</span>
                </div>

                <div className="space-y-3.5 max-h-80 overflow-y-auto">
                  {paketList.map((paket) => (
                    <div key={paket.id} className="p-3 border border-gray-150 rounded-xl bg-gray-50 relative group">
                      <button
                        onClick={() => {
                          if (confirm(`Hapus paket bundling "${paket.nama}"?`)) {
                            removePaket(paket.id).catch(err => {
                              console.error(err);
                              alert('Gagal menghapus paket dari database.');
                            });
                          }
                        }}
                        className="absolute top-2 right-2 text-red-500 hover:text-red-700 text-[10px] font-black border-none bg-transparent cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Hapus Paket"
                      >
                        ✕
                      </button>
                      <h4 className="text-[11px] font-black text-gray-800 leading-snug">{paket.nama}</h4>
                      <p className="text-[9px] text-gray-400 font-bold mt-0.5 leading-snug">{paket.deskripsi}</p>

                      <div className="mt-2.5 flex items-center justify-between">
                        <span className="text-[10px] font-extrabold text-[#15803d] bg-[#dcfce7] px-2 py-0.5 rounded-md">
                          {formatHarga(paket.hargaPaket)}
                        </span>
                        <span className="text-[9px] font-bold text-gray-400 line-through">
                          {formatHarga(paket.hargaAsli)}
                        </span>
                      </div>
                    </div>
                  ))}
                  {paketList.length === 0 && (
                    <p className="text-xs text-gray-400 italic font-bold text-center py-4">Belum ada paket bundling</p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseMap;
