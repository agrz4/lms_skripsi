import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useMataKuliahStore, type MataKuliah } from '../../store/useMataKuliahStore';
import { usePaketStore } from '../../store/usePaketStore';
import {
  HiOutlineTrophy,
  HiOutlineTrash,
  HiOutlinePlus,
  HiOutlineMagnifyingGlass
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
  const {
    paketList,
    fetchPaket,
    addPaket,
    removePaket,
    addCourseToPaket,
    addCoursesToPaket,
    removeCourseFromPaket
  } = usePaketStore();
  const selectRef = useRef<HTMLSelectElement>(null);

  // Package selection state
  const [selectedPaketId, setSelectedPaketId] = useState<string>('');

  // Form states for node
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [newCourseName, setNewCourseName] = useState<string>('');
  const [newCourseCode, setNewCourseCode] = useState<string>('');
  const [selectedLevel, setSelectedLevel] = useState<string>('Dasar');
  const [harga, setHarga] = useState<string>('0');
  const [published, setPublished] = useState<boolean>(false);
  const [jumlahPertemuan, setJumlahPertemuan] = useState<number>(3);
  const [selectedPrerequisites, setSelectedPrerequisites] = useState<string[]>([]);

  // Sidebar dynamic control state
  const [activeSidebarForm, setActiveSidebarForm] = useState<'stats' | 'node' | 'bundling' | 'add_to_paket'>('stats');

  // Add course to package states
  const [addModeTab, setAddModeTab] = useState<'existing' | 'new'>('existing');
  const [selectedCoursesToAdd, setSelectedCoursesToAdd] = useState<string[]>([]);
  const [searchCourseQuery, setSearchCourseQuery] = useState<string>('');
  const [isActionLoading, setIsActionLoading] = useState<boolean>(false);

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

  const selectedPaket = useMemo(() => {
    return paketList.find(p => p.id === selectedPaketId) || paketList[0];
  }, [paketList, selectedPaketId]);

  // Existing course IDs currently in the selected package
  const existingCourseIdsInPaket = useMemo(() => {
    if (!selectedPaket || !selectedPaket.courses) return new Set<string>();
    return new Set<string>(selectedPaket.courses.map((c: any) => c.id));
  }, [selectedPaket]);

  // Courses available in DB that are not yet in this package
  const availableCoursesToAdd = useMemo(() => {
    return mataKuliahList.filter(mk => !existingCourseIdsInPaket.has(mk.id));
  }, [mataKuliahList, existingCourseIdsInPaket]);

  // Filtered available courses by search query
  const filteredAvailableCourses = useMemo(() => {
    if (!searchCourseQuery.trim()) return availableCoursesToAdd;
    const q = searchCourseQuery.toLowerCase();
    return availableCoursesToAdd.filter(
      mk => mk.nama.toLowerCase().includes(q) || mk.kode.toLowerCase().includes(q)
    );
  }, [availableCoursesToAdd, searchCourseQuery]);

  const handleCourseSelect = (id: string) => {
    setSelectedCourseId(id);
    const course = mataKuliahList.find(mk => mk.id === id);
    if (course) {
      setSelectedLevel(course.level || selectedLevel || 'Dasar');
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

  const handleOpenAddCourse = () => {
    setSelectedCourseId('');
    setNewCourseName('');
    setNewCourseCode('');
    setHarga('0');
    setPublished(false);
    setJumlahPertemuan(3);
    setSelectedPrerequisites([]);
    setSelectedCoursesToAdd([]);
    setSearchCourseQuery('');
    setAddModeTab(availableCoursesToAdd.length > 0 ? 'existing' : 'new');
    setActiveSidebarForm('add_to_paket');
  };

  // Add single existing course to current package
  const handleAddSingleCourse = async (courseId: string) => {
    if (!selectedPaket) {
      alert('Pilih paket terlebih dahulu.');
      return;
    }
    setIsActionLoading(true);
    try {
      await addCourseToPaket(selectedPaket.id, courseId);
      await fetchPaket();
    } catch (error: any) {
      console.error('Error adding course to paket:', error);
      alert(`Gagal menambahkan kursus ke paket: ${error?.response?.data?.message || error.message}`);
    } finally {
      setIsActionLoading(false);
    }
  };

  // Batch add selected courses to current package
  const handleBatchAddCourses = async () => {
    if (!selectedPaket) {
      alert('Pilih paket terlebih dahulu.');
      return;
    }
    if (selectedCoursesToAdd.length === 0) {
      alert('Pilih setidaknya satu kursus.');
      return;
    }
    setIsActionLoading(true);
    try {
      await addCoursesToPaket(selectedPaket.id, selectedCoursesToAdd);
      await fetchPaket();
      setSelectedCoursesToAdd([]);
      setActiveSidebarForm('stats');
    } catch (error: any) {
      console.error('Error batch adding courses to paket:', error);
      alert(`Gagal menambahkan kursus ke paket: ${error?.response?.data?.message || error.message}`);
    } finally {
      setIsActionLoading(false);
    }
  };

  // Remove a course from current package
  const handleRemoveCourseFromPaket = async (courseId: string, courseName?: string) => {
    if (!selectedPaket) return;
    const name = courseName || mataKuliahList.find(c => c.id === courseId)?.nama || 'Kursus';
    if (confirm(`Keluarkan kursus "${name}" dari paket "${selectedPaket.nama}"?\n\n(Kursus tetap tersimpan di sistem, hanya dikeluarkan dari paket ini)`)) {
      setIsActionLoading(true);
      try {
        await removeCourseFromPaket(selectedPaket.id, courseId);
        await fetchPaket();
        if (selectedCourseId === courseId) {
          handleCancel();
        }
      } catch (error: any) {
        console.error('Error removing course from paket:', error);
        alert(`Gagal mengeluarkan kursus dari paket: ${error?.response?.data?.message || error.message}`);
      } finally {
        setIsActionLoading(false);
      }
    }
  };

  const handleSaveNode = async () => {
    if (!selectedCourseId) {
      // Creating a brand new course and adding to current package
      if (!newCourseName.trim() || !newCourseCode.trim()) {
        alert('Untuk membuat kursus baru, silakan isi Nama Kursus Baru dan Kode Kursus Baru.');
        return;
      }

      setIsActionLoading(true);
      try {
        const newCourse = await addMataKuliah({
          nama: newCourseName.trim(),
          kode: newCourseCode.trim(),
          warna: harga, // Storing price in warna field
          published,
          jumlahPertemuan,
          statusPendaftaran: 'Aktif',
          tipeKursus: 'ONLINE'
        });

        // Link new course to the selected package
        if (selectedPaket && newCourse?.id) {
          await addCourseToPaket(selectedPaket.id, newCourse.id);
          await fetchPaket();
        }

        alert(`Kursus baru "${newCourseName}" berhasil dibuat dan ditambahkan ke paket "${selectedPaket?.nama || 'Roadmap'}"!`);

        // Reset states
        setSelectedCourseId('');
        setNewCourseName('');
        setNewCourseCode('');
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
      } finally {
        setIsActionLoading(false);
      }
      return;
    }

    // Updating existing course node
    setIsActionLoading(true);
    try {
      await updateMataKuliah(selectedCourseId, {
        warna: harga, // Storing price in warna field
        published,
        jumlahPertemuan,
        prerequisites: selectedPrerequisites
      });

      // If for any reason the course is not yet in the active package, connect it
      if (selectedPaket && !existingCourseIdsInPaket.has(selectedCourseId)) {
        await addCourseToPaket(selectedPaket.id, selectedCourseId);
        await fetchPaket();
      }

      alert('Node peta kursus berhasil disimpan!');
      // Reset states
      setSelectedCourseId('');
      setNewCourseName('');
      setNewCourseCode('');
      setSelectedLevel('Dasar');
      setHarga('0');
      setPublished(false);
      setJumlahPertemuan(3);
      setSelectedPrerequisites([]);
      setActiveSidebarForm('stats');
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
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleCancel = () => {
    setSelectedCourseId('');
    setNewCourseName('');
    setNewCourseCode('');
    setSelectedLevel('Dasar');
    setHarga('0');
    setPublished(false);
    setJumlahPertemuan(3);
    setSelectedPrerequisites([]);
    setActiveSidebarForm('stats');
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



  const displayCourses = useMemo((): MapCourse[] => {
    if (!selectedPaket || !selectedPaket.courses) return [];
    const courseIdsInPaket = new Set(selectedPaket.courses.map((c: any) => c.id));
    
    // Filter mataKuliahList to only include courses in this package
    const dbCourses = mataKuliahList.filter(c => courseIdsInPaket.has(c.id));
    
    return dbCourses.map(c => ({
      ...c,
      exists: true,
      level: c.level || 'Dasar'
    }));
  }, [mataKuliahList, selectedPaket]);

  // Compute flow columns directly based on prerequisite depth (no category or level separation)
  const flowColumns = useMemo(() => {
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

    // Group courses by depth
    const depthGroups: { [key: number]: typeof coursesWithDepth } = {};
    coursesWithDepth.forEach(c => {
      const d = c.depth || 0;
      if (!depthGroups[d]) {
        depthGroups[d] = [];
      }
      depthGroups[d].push(c);
    });

    // Sort the depths inside this map
    const sortedDepths = Object.keys(depthGroups).map(Number).sort((a, b) => a - b);
    
    return sortedDepths.map(depth => ({
      depth,
      courses: depthGroups[depth]
    }));
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

  const renderCourseCard = (course: MapCourse) => {
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
            handleOpenAddCourse();
          } else {
            handleCourseSelect(course.id);
          }
        }}
        className={`group cursor-pointer rounded-xl border border-gray-300 relative transition-all duration-200 hover:scale-[1.02] w-[215px] text-left flex flex-col justify-between overflow-hidden shadow-sm bg-white shrink-0 ${
          isSelected ? 'ring-4 ring-indigo-500/25 scale-[1.02] border-indigo-500' : ''
        } ${!course.exists ? 'opacity-70 hover:opacity-100 border-dashed' : ''}`}
      >
        {/* Remove from package quick button on card hover */}
        {selectedPaket && course.exists && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleRemoveCourseFromPaket(course.id, course.nama);
            }}
            className="absolute top-2 left-2 z-10 w-5 h-5 rounded-full bg-white/95 hover:bg-red-500 text-gray-400 hover:text-white flex items-center justify-center text-[10px] font-black shadow-sm transition-all duration-150 border border-gray-200 opacity-0 group-hover:opacity-100 hover:scale-110 cursor-pointer"
            title={`Keluarkan "${course.nama}" dari paket "${selectedPaket.nama}"`}
          >
            ✕
          </button>
        )}

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
            onClick={handleOpenAddCourse}
            className="bg-[#5850ec] hover:bg-[#4f46e5] text-white font-extrabold rounded-full text-xs px-4 py-2.5 transition-all shadow-sm border-none cursor-pointer flex items-center gap-1.5"
          >
            <HiOutlinePlus className="w-3.5 h-3.5" />
            <span>Tambah Kursus</span>
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
            <div className="flex flex-col gap-8">
              {flowColumns.length > 0 ? (
                <div className="flex flex-row flex-wrap py-6 gap-y-8 gap-x-6 w-full justify-center items-center">
                  {flowColumns.map((column) => (
                    <React.Fragment key={column.depth}>
                      {/* Column containing courses at this depth (vertical stack if multiple) */}
                      <div className="flex flex-col gap-4 justify-center items-center min-w-[215px]">
                        {column.courses.map((course) => renderCourseCard(course))}
                      </div>
                    </React.Fragment>
                  ))}

                  <div
                    onClick={handleOpenAddCourse}
                    className="w-[215px] h-[80px] rounded-xl border border-dashed border-gray-300 hover:border-indigo-500 hover:bg-[#5850ec]/5 cursor-pointer flex flex-col items-center justify-center gap-1 transition-all group shrink-0"
                  >
                    <span className="text-lg text-gray-400 group-hover:text-indigo-600 font-black">+</span>
                    <span className="text-[9px] font-black text-gray-400 group-hover:text-indigo-600 uppercase tracking-wider">Tambah Node</span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-16 flex flex-col items-center justify-center">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-2xl font-black mb-3">
                    📚
                  </div>
                  <p className="text-sm font-black text-gray-700 uppercase tracking-widest">Tidak ada kursus dalam paket ini</p>
                  <p className="text-xs text-gray-400 font-semibold mt-1 mb-5 max-w-sm">
                    Paket "{selectedPaket?.nama || ''}" belum memiliki kursus. Tambahkan kursus yang sudah ada atau buat kursus baru.
                  </p>
                  <button
                    onClick={handleOpenAddCourse}
                    className="bg-[#5850ec] hover:bg-[#4f46e5] text-white font-extrabold rounded-xl text-xs px-5 py-2.5 transition-all shadow-sm border-none cursor-pointer flex items-center gap-1.5"
                  >
                    <HiOutlinePlus className="w-4 h-4" />
                    <span>Tambah Kursus ke Paket</span>
                  </button>
                </div>
              )}

              {/* Bottom Milestone Badge Card */}
              {selectedPaket && flowColumns.length > 0 && (
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
          {activeSidebarForm === 'add_to_paket' && (
            /* Tambah Kursus ke Paket Card */
            <div className="bg-white p-6 rounded-[1.5rem] shadow-sm border border-gray-200 animate-in fade-in duration-200">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="text-sm font-black text-gray-900">Tambah Kursus ke Paket</h2>
                  <p className="text-[11px] font-bold text-indigo-600 mt-0.5 truncate max-w-[200px]">
                    {selectedPaket?.nama || 'Roadmap'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveSidebarForm('stats')}
                  className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-800 flex items-center justify-center text-xs font-bold border-none cursor-pointer transition-colors"
                  title="Tutup form"
                >
                  ✕
                </button>
              </div>

              {/* Mode Tabs */}
              <div className="flex bg-gray-100 p-1 rounded-xl mb-4 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setAddModeTab('existing')}
                  className={`flex-1 py-1.5 rounded-lg text-center transition-all border-none cursor-pointer text-[11px] ${
                    addModeTab === 'existing'
                      ? 'bg-white text-indigo-600 shadow-sm font-black'
                      : 'text-gray-500 hover:text-gray-700 bg-transparent'
                  }`}
                >
                  Pilih Kursus ({availableCoursesToAdd.length})
                </button>
                <button
                  type="button"
                  onClick={() => setAddModeTab('new')}
                  className={`flex-1 py-1.5 rounded-lg text-center transition-all border-none cursor-pointer text-[11px] ${
                    addModeTab === 'new'
                      ? 'bg-white text-indigo-600 shadow-sm font-black'
                      : 'text-gray-500 hover:text-gray-700 bg-transparent'
                  }`}
                >
                  + Buat Baru
                </button>
              </div>

              {addModeTab === 'existing' ? (
                <div className="space-y-3">
                  {/* Search bar */}
                  <div className="relative">
                    <input
                      type="text"
                      value={searchCourseQuery}
                      onChange={(e) => setSearchCourseQuery(e.target.value)}
                      placeholder="Cari nama atau kode kursus..."
                      className="w-full pl-8 pr-3 h-9 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-700 font-bold shadow-inner"
                    />
                    <HiOutlineMagnifyingGlass className="w-4 h-4 text-gray-400 absolute left-2.5 top-2.5" />
                  </div>

                  {/* Course List */}
                  <div className="space-y-2 max-h-60 overflow-y-auto border border-gray-200 rounded-xl p-2.5 bg-gray-50/50 shadow-inner">
                    {filteredAvailableCourses.length === 0 ? (
                      <div className="py-8 text-center text-gray-400 text-xs font-semibold">
                        {availableCoursesToAdd.length === 0 ? (
                          <>
                            <p className="font-bold text-gray-500">Semua kursus sudah dimasukkan!</p>
                            <p className="text-[10px] mt-1">Gunakan tab "+ Buat Baru" jika ingin menambah kursus lainnya.</p>
                          </>
                        ) : (
                          'Tidak ada kursus yang cocok dengan pencarian.'
                        )}
                      </div>
                    ) : (
                      filteredAvailableCourses.map((mk) => {
                        const isChecked = selectedCoursesToAdd.includes(mk.id);
                        return (
                          <div
                            key={mk.id}
                            className={`flex items-center justify-between p-2.5 rounded-xl border transition-all gap-2 ${
                              isChecked
                                ? 'bg-indigo-50/70 border-indigo-300'
                                : 'bg-white border-gray-200/80 hover:border-gray-300'
                            }`}
                          >
                            <label className="flex items-center gap-2.5 cursor-pointer flex-1 min-w-0 text-xs font-bold text-gray-700">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {
                                  if (isChecked) {
                                    setSelectedCoursesToAdd(selectedCoursesToAdd.filter(id => id !== mk.id));
                                  } else {
                                    setSelectedCoursesToAdd([...selectedCoursesToAdd, mk.id]);
                                  }
                                }}
                                className="w-4 h-4 rounded text-indigo-600 border-gray-300 focus:ring-indigo-500 shrink-0 cursor-pointer"
                              />
                              <div className="truncate">
                                <span className="text-[10px] font-black text-gray-400 mr-1.5">{mk.kode}</span>
                                <span className="font-bold text-gray-800">{mk.nama}</span>
                              </div>
                            </label>
                            <button
                              type="button"
                              disabled={isActionLoading}
                              onClick={() => handleAddSingleCourse(mk.id)}
                              className="shrink-0 text-[10px] font-black bg-[#e0e7ff] text-[#4338ca] hover:bg-[#5850ec] hover:text-white px-2.5 py-1 rounded-lg transition-colors border-none cursor-pointer disabled:opacity-50"
                              title={`Tambahkan "${mk.nama}" ke paket ini`}
                            >
                              + Tambah
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Actions */}
                  {selectedCoursesToAdd.length > 0 && (
                    <button
                      type="button"
                      disabled={isActionLoading}
                      onClick={handleBatchAddCourses}
                      className="w-full h-10 bg-[#5850ec] hover:bg-[#4f46e5] text-white font-black rounded-xl text-xs shadow-sm transition-all border-none cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
                    >
                      <HiOutlinePlus className="w-4 h-4" />
                      <span>Tambahkan {selectedCoursesToAdd.length} Kursus Terpilih</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setActiveSidebarForm('stats')}
                    className="w-full h-9 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold rounded-xl text-xs transition-all border-none cursor-pointer"
                  >
                    Tutup
                  </button>
                </div>
              ) : (
                /* Tab: Buat Kursus Baru & Tambahkan ke Paket */
                <div className="space-y-3.5">
                  <div>
                    <label className="text-[11px] font-bold text-gray-500 block mb-1">Nama Kursus Baru</label>
                    <input
                      type="text"
                      value={newCourseName}
                      onChange={(e) => setNewCourseName(e.target.value)}
                      placeholder="Contoh: CSS Grid & Flexbox"
                      className="w-full px-3 h-9 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-700 font-bold shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-gray-500 block mb-1">Kode Kursus Baru</label>
                    <input
                      type="text"
                      value={newCourseCode}
                      onChange={(e) => setNewCourseCode(e.target.value)}
                      placeholder="Contoh: WD-07"
                      className="w-full px-3 h-9 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-700 font-bold shadow-sm"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-bold text-gray-500 block mb-1">Status</label>
                      <select
                        value={published ? 'true' : 'false'}
                        onChange={(e) => setPublished(e.target.value === 'true')}
                        className="w-full px-2.5 h-9 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-700 font-bold shadow-sm"
                      >
                        <option value="true">Published</option>
                        <option value="false">Draft</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-gray-500 block mb-1">Pertemuan</label>
                      <input
                        type="number"
                        value={jumlahPertemuan}
                        onChange={(e) => setJumlahPertemuan(parseInt(e.target.value) || 0)}
                        className="w-full px-2.5 h-9 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-700 font-bold shadow-sm"
                        min="1"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-gray-500 block mb-1">Harga (0 = Gratis)</label>
                    <input
                      type="text"
                      value={harga}
                      onChange={(e) => setHarga(e.target.value)}
                      placeholder="Contoh: 499000 atau 0"
                      className="w-full px-3 h-9 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-700 font-bold shadow-sm"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      disabled={isActionLoading}
                      onClick={handleSaveNode}
                      className="flex-1 h-10 bg-[#0fc26a] hover:bg-[#0db05f] text-white font-black rounded-xl text-xs shadow-sm transition-all border-none cursor-pointer disabled:opacity-50"
                    >
                      Buat & Masukkan ke Paket
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveSidebarForm('stats')}
                      className="h-10 bg-gray-100 hover:bg-gray-200 text-gray-600 font-black rounded-xl text-xs px-3.5 border-none cursor-pointer"
                    >
                      Batal
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeSidebarForm === 'node' && (
            /* Input Form Card */
            <div className="bg-white p-6 rounded-[1.5rem] shadow-sm border border-gray-200 animate-in fade-in duration-200">
              <h2 className="text-sm font-black text-gray-900 mb-5">Edit Node Kursus</h2>

              <div className="space-y-4">
                <div>
                  <label className="text-[11px] font-bold text-gray-500 block mb-1.5">Nama Kursus</label>
                  <select
                    ref={selectRef}
                    value={selectedCourseId}
                    onChange={(e) => handleCourseSelect(e.target.value)}
                    className="w-full px-3 h-10 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-gray-700 font-bold shadow-sm"
                  >
                    <option value="">Pilih Kursus....</option>
                    {mataKuliahList.map(mk => (
                      <option key={mk.id} value={mk.id}>{mk.kode} - {mk.nama}</option>
                    ))}
                  </select>
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
                  <label className="text-[11px] font-bold text-gray-500 block mb-1.5">Harga (0=Gratis)</label>
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
                <div className="flex flex-col gap-2 pt-2">
                  <button
                    onClick={handleSaveNode}
                    disabled={isActionLoading}
                    className="w-full h-10 bg-[#5850ec] hover:bg-[#4f46e5] text-white font-black rounded-xl text-xs shadow-sm transition-all border-none cursor-pointer disabled:opacity-50"
                  >
                    Simpan Perubahan
                  </button>
                  <div className="flex gap-2">
                    {selectedCourseId && (
                      <button
                        type="button"
                        disabled={isActionLoading}
                        onClick={() => {
                          const c = mataKuliahList.find(m => m.id === selectedCourseId);
                          handleRemoveCourseFromPaket(selectedCourseId, c?.nama);
                        }}
                        className="flex-1 h-9 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl text-[11px] shadow-sm transition-all border-none cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1"
                        title="Keluarkan kursus ini dari paket"
                      >
                        <HiOutlineTrash className="w-3.5 h-3.5" />
                        <span>Keluarkan dari Paket</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="flex-1 h-9 bg-gray-200 hover:bg-gray-300 text-gray-700 font-black rounded-xl text-[11px] shadow-sm transition-all border-none cursor-pointer"
                    >
                      Batal
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSidebarForm === 'bundling' && (
            /* Buat Paket Bundling Card */
            <div className="bg-white p-6 rounded-[1.5rem] shadow-sm border border-gray-200 animate-in fade-in duration-200">
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
                  {paketList.map((paket) => {
                    const isCurrent = paket.id === selectedPaketId;
                    return (
                      <div
                        key={paket.id}
                        onClick={() => setSelectedPaketId(paket.id)}
                        className={`p-3 border rounded-xl relative group cursor-pointer transition-all ${
                          isCurrent
                            ? 'bg-indigo-50/50 border-indigo-300 ring-2 ring-indigo-500/20 shadow-sm'
                            : 'bg-gray-50 border-gray-150 hover:bg-gray-100/70 hover:border-gray-200'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
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
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <h4 className={`text-[11px] font-black leading-snug ${isCurrent ? 'text-indigo-700' : 'text-gray-800'}`}>
                            {paket.nama}
                          </h4>
                          {isCurrent && (
                            <span className="text-[9px] font-extrabold text-indigo-600 bg-white px-1.5 py-0.2 rounded border border-indigo-200">
                              Aktif
                            </span>
                          )}
                        </div>
                        <p className="text-[9px] text-gray-400 font-bold mt-0.5 leading-snug line-clamp-1">{paket.deskripsi || 'Tidak ada deskripsi'}</p>

                        <div className="mt-2.5 flex items-center justify-between">
                          <span className="text-[10px] font-extrabold text-[#15803d] bg-[#dcfce7] px-2 py-0.5 rounded-md">
                            {formatHarga(paket.hargaPaket)}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-bold text-gray-500">
                              {paket.courses?.length || 0} kursus
                            </span>
                            <span className="text-[9px] font-bold text-gray-400 line-through">
                              {formatHarga(paket.hargaAsli)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
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
